const bot = require("../integrations/telegrafModule");
const { createPodcastForText, STATUS } = require("./podcastService");
const logManager = require("../utils/logManager");
const generateVideo = require("../services/generateVideo");

bot.command("start", (ctx) => {
    ctx.reply("Welcome!");
});

bot.command("audio", async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    generatePodcast(text);
    ctx.reply("Wait a few minutes, you generated podcast will be sent to Podcaster Analytics channel.");
});

bot.command("text", async (ctx) => {
    const text = ctx.message.text.split(" ").slice(1).join(" ");
    generateDebugPodcast([text]);
    ctx.reply("Wait a few minutes, you generated podcast will be sent to Podcaster Analytics channel.");
});

bot.command("debug", async (ctx) => {
    const topics = [
        "solar eclipse",
        "hype around the three body problem series",
        "MKBHD crashed Humane AI pin",
        "which rivers pollute the ocean with the most plastic?",
        "simulation theory",
        "who is paul graham?",
        "the invention of fire. consistent fire history",
        "who invented back propagation?",
        "things to do first time in new york",
        "photography invention impact on drawing art",
        "ireland england conflict history. why irish people mad on uk?",
        "bristol bridge",
    ];
    generateDebugPodcast(topics);
    ctx.reply("Podcast generation started. Wait 5 minutes and don't trigger command again.");
});

bot.command("video", async (ctx) => {
    const podcastText = ctx.message.text.substring(ctx.message.text.indexOf(" ") + 1);
    generateVideo(podcastText);
    ctx.reply("AI Video generation started. Wait 10 minutes and don't trigger command again.");
});

async function generatePodcast(text) {
    try {
        const podcastStream = createPodcastForText(text, () => {});
        if (podcastStream) {
            await logManager.logAudio(podcastStream, text);
        } else {
            await logManager.logMessage(`LLM couldn't generate a podcast for the text: ${text}`);
        }
    } catch (error) {
        console.error(error);
        await logManager.logMessage(`An error occurred while generating a podcast for the text: ${text}`);
    }
}

async function generateDebugPodcast(topics) {
    function generatePodcastText(text) {
        return new Promise((resolve) => {
            let rawPodcast = "";

            function statusCb(status, data) {
                if (status === STATUS.READY) {
                    rawPodcast += `${data.role}: ${data.text}\n`;
                } else if (status === STATUS.COMPLETED) {
                    resolve(rawPodcast);
                }
            }

            createPodcastForText(text, statusCb, true);
        });
    }

    for (const topic of topics) {
        try {
            const rawPodcast = await generatePodcastText(topic);
            if (rawPodcast) {
                const debugMessage = `Topic: ${topic}\n${rawPodcast}`;
                await logManager.logMessage(debugMessage);
            } else {
                await logManager.logMessage(`LLM couldn't generate a podcast for the topic: ${topic}.`);
            }
        } catch (error) {
            console.error(error);
            await logManager.logMessage(`An error occurred while generating a podcast for the topic: ${topic}.`);
        }
    }
}

module.exports = bot;
