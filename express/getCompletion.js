const openai = require("../clients/openaiClient");
const waitForRunCompletion = require("./waitForRunCompletion");


async function getCompletion (threadId, question, assistantId){

    // Attaching a message to thread
    // TODO: remove creating object that has not been used
    const message = await openai.beta.threads.messages.create(
        threadId,
        {
        role: "user",
        content: question
        }
    );

    // Running the assistant on thread
    const run = await openai.beta.threads.runs.create(
        threadId,
        { assistant_id: assistantId }
    );

    // Waiting until the status will be completed
    try {
        const finished_run = await waitForRunCompletion(threadId, run.id);
        console.log('Run finished with status:', finished_run.status);
    } catch (error) {
        console.error('Error waiting for run completion:', error);
    }

    // Retrieve the responce message
    const messages = await openai.beta.threads.messages.list(
        threadId
    );

    // Extract the completion
    const completion = messages.body.data[0].content[0].text.value;

    return completion;
}

module.exports = getCompletion;