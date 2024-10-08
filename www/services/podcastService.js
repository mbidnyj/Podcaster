const { PassThrough } = require("stream");
const textToSpeech = require("../utils/textToSpeech");
const llm = require("../utils/llm");
const tags = require("../utils/tags");
const logManager = require("../utils/logManager");

const E = module.exports;

// if changing don't forget to update Player.js
E.STATUS = {
    ONLINE_RESEARCH: "online_research",
    ANALYZING: "analyzing",
    GENERATING_TEXT: "generating_text",
    TTS: "text_to_speech",
    READY: "ready",
    COMPLETED: "completed",
};

E.createPodcastForTopic = async (topic) => {
    const content = await getOnlineContent(topic.description, true);
    const podcastPrompt = createPodcastPrompt(topic.description, content, topic.tag);
    const rawPodcast = await llm.textCompletion(llm.MODELS.claude_3, podcastPrompt.instruction, podcastPrompt.prompt);
    const podcast = E.convertToObjects(rawPodcast);
    topic.podcast = rawPodcast;
    topic.save();

    const combinedStream = new PassThrough();

    for (let attribution of podcast) {
        const attributionStream = await textToSpeech(attribution.text, attribution.role);
        await new Promise((resolve, reject) => {
            attributionStream.on("readable", () => {
                attributionStream.read();
            });

            attributionStream.on("end", () => {
                console.log('"attributionStream" ended, restarting...');
                resolve();
            });
            attributionStream.on("error", (error) => {
                console.error("Error processing attribution stream:", error);
                reject(error);
            });

            attributionStream.pipe(combinedStream, { end: false });
        });
    }

    // End the combined stream after all episodes have been piped into it
    combinedStream.end();
    console.log("combineStream created, returning...");
    return combinedStream;
};

E.createPodcastForText = (text, statusCb, debug = false) => {
    const combinedStream = new PassThrough();
    createPodcastToStream(text, combinedStream, statusCb, debug);
    return combinedStream;
};

const getOnlineContent = async (text, useLargerModel) => {
    return await llm.textCompletion(
        useLargerModel ? llm.MODELS.perplexity_large : llm.MODELS.perplexity_small,
        "give several bullet points (labeled 1, 2, 3, ...) with latest news, concise facts and speculations about the topic",
        `give several bullet points with latest news, facts and speculations about the following topic: ${text}`
    );
};

const extractTagAndEmoji = async (text) => {
    let json = await llm.jsonCompletion(
        `analyse the provided info and extract a small json with single object with three fields: "title", "emoji" and "tag".
"title" - catching attention podcast title (4-10 words).
"emoji" - a single most relevant emoji.
"tag" - classify the information into one of the following tags: ${tags.getTagsString()} or "other".`,
        `${text}\n\n------\nSumarise info into json format with a single object {info: {title, emoji, tag}}`
    );
    if (json.info && json.info.emoji && json.info.title && json.info.tag) {
        return json.info;
    } else {
        return { title: text, emoji: "👽", tag: tags.getTagsList()[0] };
    }
};

async function createPodcastToStream(text, combinedStream, statusCb, debug) {
    // retrieve online content
    let onlineTextCompletionStart = performance.now();
    statusCb(E.STATUS.ONLINE_RESEARCH);
    const content = await getOnlineContent(text);

    statusCb(E.STATUS.ANALYZING);
    let { title, emoji, tag } = await extractTagAndEmoji(content);
    statusCb(E.STATUS.ANALYZING, { title, emoji, tag });

    let onlineTextCompletionEnd = performance.now();
    let onlineTextCompletionTime = ((onlineTextCompletionEnd - onlineTextCompletionStart) / 1000).toFixed(2);

    statusCb(E.STATUS.GENERATING_TEXT);
    // create podcast
    const podcastPrompt = createPodcastPrompt(text, content, tag);
    let retrieveAttributionStart = performance.now();
    const attributions = retrieveAttribution(podcastPrompt.instruction, podcastPrompt.prompt);

    let retrieveAttributionTime = 0;
    let textToSpeechTime = 0;

    // create audio for podcast
    for await (let attribution of attributions) {
        let retrieveAttributionEnd = performance.now();
        if (!retrieveAttributionTime) {
            retrieveAttributionTime = ((retrieveAttributionEnd - retrieveAttributionStart) / 1000).toFixed(2);
        }
        console.log("attribution:", attribution);
        if (!attribution) {
            logManager.logMessage("no attribution! \n\n" + podcastPrompt.instruction + "\n\n" + podcastPrompt.prompt);
            return;
        }
        if (textToSpeechTime === 0) {
            statusCb(E.STATUS.TTS);
        }

        if (debug) {
            // If "debug" parameter is present - pass "attribution" to the callback function and skip "textToSpeech" part
            statusCb(E.STATUS.READY, attribution);
            continue; // Skip the textToSpeech part
        }

        let textToSpeechStart = performance.now();
        const attributionStream = await textToSpeech(attribution.text, attribution.role);
        let textToSpeechEnd = performance.now();

        // measure the time only for the first iteration
        if (textToSpeechTime === 0) {
            statusCb(E.STATUS.READY);
            textToSpeechTime = ((textToSpeechEnd - textToSpeechStart) / 1000).toFixed(2);
        }

        await new Promise((resolve, reject) => {
            //attributionStream.on("readable", () => { attributionStream.read(); });

            attributionStream.on("end", () => {
                console.log('"attributionStream" ended, restarting...');
                resolve();
            });
            attributionStream.on("error", (error) => {
                console.error("Error processing attribution stream:", error);
                reject(error);
            });

            attributionStream.pipe(combinedStream, { end: false });
        });
    }

    const message = `Podcast: ${text} [${tag} ${emoji}]\nOnline completion: ${onlineTextCompletionTime}\nLLM completion: ${retrieveAttributionTime}\nTTS: ${textToSpeechTime}\nPerplexity completion: ${content}`;
    logManager.logMessage(message);
    console.log(message);
    // explicitly end the stream
    combinedStream.end();
    console.log("combineStream created, returning...");

    // Send a final callback indicating the process is completed
    statusCb(E.STATUS.COMPLETED);
}

async function* retrieveAttribution(instruction, prompt) {
    try {
        const stream = await llm.streamCompletion(llm.MODELS.claude_3, instruction, prompt);
        console.log("received instructions:", instruction);
        console.log("received prompt:", prompt);

        const decoder = new TextDecoder();
        let result = "";

        for await (const chunk of stream) {
            const decodedChunk = decoder.decode(chunk);
            result += decodedChunk;

            let attributions = E.convertToObjects(result);
            if (attributions.length == 2) {
                const attribution = attributions[0];
                yield attribution;
                result = convertToString(attributions.slice(1));
            }
        }

        // push the last attribution
        yield E.convertToObjects(result + "\n")[0];
    } catch (err) {
        console.error("Error in gpt stream: ", err);
    }
}

E.convertToObjects = (text) => {
    // Split the text into an array of strings, each representing a line
    const lines = text.split("\n");

    // Convert each line into an object
    const objects = lines.map((line, index) => {
        return { role: "Bob", text: line };
    });

    return objects;
};

function convertToString(array) {
    let result = "";
    array.forEach((item) => {
        result += `${item.role}: ${item.text}`;
    });
    return result;
}

let promptInstruction = `Task: write a transcript for a podcast episode with one host is engaging in a thoughtful monologue.
Host is curious and thoughtful with a nuanced perspective on the future, recognizes the tremendous opportunities technologies offer but also maintains a healthy skepticism about the challenges that lie ahead. His research on the current news story is comprehensive, blending insights from various sources with a keen awareness of the complexities involved. He is eager to share his findings in detail, using a blend of optimism and critical thinking to engage her audience. Host's speech style combines an intellectual rigor with a subtle sense of humor, making her discussions both enlightening and engaging.
Host's speech style reminds one of Eliezer Yudkowsky.
He is very authentic and casual, yet concise, focusing on truth even though he has very polarized opinions on this topic.
Make him sound very natural and real, with breathing and filler words like “hmm,” “you know,” “well,” "so", etc., so when narrated it sounds very natural. Don't add non-dialogue sound captions such as *sighs*, *shakes head*, etc.
Duration of phrases is varied, some phrases are just two words long, while others are much longer.
Each episode's content is tailored to the focus of the title. If the title points to recent news, host emphasizes the latest developments, integrating relevant information from the provided facts as necessary. Conversely, for titles that suggest a broader discussion, host explores well-known facts and theoretical implications, drawing more from the facts provided.
Don't repeat podcast title. Output only podcast transcript in the language of the title. Go straight to the topic, start immediately from very short greeting.`;

E.getPromptInstruction = () => promptInstruction;

E.setPromptInstruction = (newPromptInstruction) => {
    promptInstruction = newPromptInstruction;
};

function createPodcastPrompt(topic, content, tag) {
    const tagInstruction = {
        exciting:
            "Construct the podcast script to include dynamic storytelling and fast-paced segments. Integrate plot developments and dialogue that sustain high energy throughout the episode. Use cliffhangers and unexpected plot twists to maintain listener engagement and anticipation throughout each segment",
        tragedy:
            "Structure the podcast script to carefully delve into sensitive topics, providing thoughtful analysis and space for reflection. The script should focus on the depth of the stories, featuring comprehensive backgrounds that add context and gravity. It should also encourage empathy and understanding through careful storytelling",
        controversial:
            "Craft the podcast script to explore multiple perspectives on contentious issues, ensuring each view is represented fairly. The script should facilitate a balanced discussion, including arguments and counterarguments, and provide a thorough exploration of the topic to help listeners understand the complexities involved",
        humorous:
            "Develop the podcast script with comedic elements and light-hearted narratives. Include witty dialogue, humorous situations, and entertaining anecdotes to keep the atmosphere fun and engaging. The script should appeal to a broad audience with its humor and ensure a consistent delivery of laughs and smiles",
        shocking:
            "Design the podcast script to include revealing moments and unexpected turns. Structure the content to build up to these moments, creating suspense and leading to surprising reveals that captivate the audience. The script should maintain a pace that keeps listeners guessing what will happen next",
        heartwarming:
            "Compose the podcast script to highlight stories of human kindness and resilience. The narrative should focus on positive outcomes, inspiring acts, and personal growth. Include uplifting stories that leave the audience feeling hopeful and rejuvenated. The script should weave together these elements to consistently inspire and uplift",
    };
    const baseInstruction = `Write a transcript of a podcast with the following title "${topic}". Output only podcast transcript in the language of the title.`;
    const instruction =
        tag && tag !== "other"
            ? `${baseInstruction} Ensure the podcast maintains a ${tag} tone, ${tagInstruction[tag]}.`
            : baseInstruction;
    const prompt = `Read these facts: ${content} || ${promptInstruction}`;
    return { instruction, prompt };
}
