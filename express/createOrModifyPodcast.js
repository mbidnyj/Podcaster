const getThreadAndAssistants = require("./getThreadAndAssistants");
const Podcast = require("../schemas/podcast");

async function createOrModifyPodcast (podcast, userId, podcastId, topic){
    const threadAndAssistants = await getThreadAndAssistants();

    if (!podcast){
        // create completely new podcast object
        podcast = new Podcast({
            userId: userId,
            podcastId: podcastId,
            threadId: threadAndAssistants.threadId,
            adultAssistantId: threadAndAssistants.adultAssistantId,
            teenagerAssistantId: threadAndAssistants.teenagerAssistantId,
            currentAssistant: "adultAssistantId"
        });

        // create a new script
        podcast.isScriptCreated = false;
        podcast.createScript(topic)
            .then(() => {
                console.log("createOrModifyPodcast script created: ");
                return podcast.save();
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });
        console.log("initiated script creation for podcast");

        // save changes
        await podcast.save();
    } else if (podcast.podcastId != podcastId){
        // podcastId changed - create new thread and assistants
        podcast.podcastId = podcastId;
        podcast.threadId = threadAndAssistants.threadId;
        podcast.adultAssistantId = threadAndAssistants.adultAssistantId;
        podcast.teenagerAssistantId = threadAndAssistants.teenagerAssistantId;
        podcast.currentAssistant = "adultAssistantId";

        // create a new script
        podcast.isScriptCreated = false;
        podcast.createScript(topic)
            .then(() => {
                console.log("createOrModifyPodcast script created: ");
                return podcast.save();
            })
            .catch(error => {
                console.error('An error occurred:', error);
            });
        console.log("initiated script creation for podcast");

        // save changes
        await podcast.save();
    }

    podcast.trackEvent("Podcast episode created", {topic: topic});

    return podcast;
}

module.exports = createOrModifyPodcast;