const openai = require("../clients/openaiClient");
const getAssistants = require("./getAssistants");


async function getThreadAndAssistants (){
    // Create new thread
	const thread = await openai.beta.threads.create();

	// Get assistants
	const assistantIds = await getAssistants();

	const threadAndAssistants = {
		threadId: thread.id,
		adultAssistantId: assistantIds.adultAssistantId,
		teenagerAssistantId: assistantIds.teenagerAssistantId,
	};

	return threadAndAssistants;
}

module.exports = getThreadAndAssistants;