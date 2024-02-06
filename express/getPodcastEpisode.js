const createOrModifyPodcast = require("./createOrModifyPodcast");
const getLastEpisode = require("./getLastEpisode");
const getCompletion = require("./getCompletion");
const getVoice = require("./getVoice");
// implementing ODM with mongoose
const Podcast = require("../schemas/podcast");


async function getPodcastEpisode (userId, podcastId, topic = null){
    let podcast = await Podcast.findOne({userId: userId});

    // create podcast if it doesn't exist or the podcastId was changed
    podcast = await createOrModifyPodcast(podcast, userId, podcastId, topic);

    // ask users question or take the last episode from the current thread
    let question = topic || await getLastEpisode(podcast.threadId);
    // console.log("initial question to ask: ", question);

    // if Tony(teenagerAssistantId) is a current assisant - add new scturcture to his prompt
    if (podcast.currentAssistant == "teenagerAssistantId"){
        // shift the 1st element from the script
        const scriptInfoObject = podcast.script.shift();

        // save modified script
        await podcast.save();

        console.log("question without formating: ", question);
        // update question
        if (scriptInfoObject){
            question = `<co-host response> ${question} </co-host response>, <topic to introduce > ${scriptInfoObject.subtopic} </topic to introduce>, <content to discuss> ${scriptInfoObject.content} </content to discuss>`
        }
        console.log("question to ask: ", question);
    }

    // get completion with the current assistant
    console.time("getCompletion time");
    const completion = await getCompletion(podcast.threadId, question, podcast[podcast.currentAssistant]);
    console.timeEnd("getCompletion time");

    // save number of words from completion
    podcast.totalWords += completion.split(' ').length;
    await podcast.save();

    // retrieve a voice stream of the completion
    console.time("getVoice time");
    const voiceStream = await getVoice(completion, podcast.currentAssistant);
    console.timeEnd("getVoice time");

    // change current assistant to an opposite one
    const roles = {
        adultAssistantId: "teenagerAssistantId",
        teenagerAssistantId: "adultAssistantId"
    };
    podcast.currentAssistant = roles[podcast.currentAssistant];
    await podcast.save();

    return voiceStream;
}

module.exports = getPodcastEpisode;