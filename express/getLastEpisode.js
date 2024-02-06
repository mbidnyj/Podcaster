const openai = require("../clients/openaiClient");

async function getLastEpisode (threadId){
    // Retrieve desired caption by messageId
    const messages = await openai.beta.threads.messages.list(
        threadId
    );

	return messages.body.data[0].content[0].text.value;
}

module.exports = getLastEpisode;