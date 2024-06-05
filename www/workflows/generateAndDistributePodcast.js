const { createPodcastForTopic } = require("../services/podcastService");
const logManager = require("../utils/logManager");
const uploadPodcastToSpaces = require("../utils/uploadPodcastToSpaces");

// generate podcast -> send to telegram -> upload to DO Spaces -> attach URL attribute to the topic
async function generateAndDistributePodcast(topic) {
    try {
        // generate podcast
        const podcastStream = await createPodcastForTopic(topic);

        // send to telegram
        const caption = `${topic.category} ${topic.emoji} ${topic.title}`;
        logManager.logAudio(podcastStream, caption);

        // upload to DO Spaces
        const podcastLocation = await uploadPodcastToSpaces(podcastStream, topic._id);

        // attach URL attribute to the topic
        topic.podcastCdnUrl = podcastLocation;
        await topic.save();

        return podcastLocation;
    } catch (e) {
        console.error(e);
        throw new Error(`LLM couldn't generate a podcast for the topic: ${topic.title}. Error: ${e}`);
    }
}

module.exports = generateAndDistributePodcast;
