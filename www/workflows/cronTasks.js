const cron = require("node-cron");
const { jsonCompletion, textCompletion, MODELS } = require("../utils/llm");
const logManager = require("../utils/logManager");
const Topic = require("../schemas/topic");
const categories = require("../utils/categories");
const tags = require("../utils/tags");
const generateAndDistributePodcast = require("./generateAndDistributePodcast");

async function getTrendingTopics(prompt) {
    console.time("getting online topics");
    const instruction = "Provide 10 most discussed and popular news stories from today for the specified topic";
    let info = await textCompletion(MODELS.perplexity_large, instruction, prompt);
    console.timeEnd("getting online topics");
    console.time("converting topics to json");
    let json = await jsonCompletion(
        `convert list of topics to json format with four fields for each topic: "title", "description", "emoji" and "tag".
"title" - catching attention podcast title (4-10 words).
"description" - keep full description same as it was in the source.
"emoji" - a single most relevant emoji.
"tag" - classify the news to one of the following tags: ${tags.getTagsString()} or "other".`,
        `${info}\n\nConvert topics to json format {topics: [{title, description, emoji, tag}, ...]}`,
        true
    );
    console.timeEnd("converting topics to json");
    if (!json.topics) {
        console.error("invalid reply", json);
        throw "invalid reply";
    }
    return json.topics;
}

async function init() {
    // Schedule tasks to run at 7:00 UK time every day. The '0 7 * * *' cron expression means
    // at minute 0 past hour 7.
    cron.schedule("0 7 * * *", taskRunner);
}

async function taskRunner() {
    console.log("Running a task every 24 hours");
    for (let key in categories) {
        let { title, prompt } = categories[key];
        let result = "";
        try {
            let topics = await getTrendingTopics(prompt);
            const topicsToInsert = topics.map((topic) => ({
                title: topic.title,
                description: topic.description,
                emoji: topic.emoji,
                tag: topic.tag,
                category: key,
            }));
            const insertedDocs = await Topic.insertMany(topicsToInsert);
            result = `${title}:\n\n` + topics.map((t) => `${t.emoji} ${t.title} [${t.tag}]`).join("\n");
            logManager.logMessage(result);

            // Sequentially generate and distribute podcasts for each document
            // Stop after processing two documents from insertedDocs
            let counter = 0;
            for (const doc of insertedDocs) {
                if (counter >= 2) break;
                try {
                    await generateAndDistributePodcast(doc);
                    counter++;
                } catch (error) {
                    const errorMessage = `Error generating and distributing podcast for ${doc.title}: ${error}`;
                    console.error(errorMessage);
                    logManager.logMessage(errorMessage);
                }
            }
        } catch (e) {
            result = `Oops! An error occurred while processing topics for ${title}: ${e}`;
            logManager.logMessage(result);
        }
    }
}

module.exports = init;
