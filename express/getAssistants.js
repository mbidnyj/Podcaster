const openai = require("../clients/openaiClient");

let assistantIds;

async function getAssistants(){
    if (assistantIds){
        return assistantIds;
    }

    // Parameters for adult assistant
    const adultAssistantParameters = {
        name: "Ashley",
        instructions: "Your name is Ashley. Co-host 'Podcaster' with Tony. Use casual, natural language."
    }

    // Parameters for teenager assistant
    const teenagerAssistantParameters = {
        name: "Tony",
        instructions: "Your name is Tony. Co-host 'Podcaster' podcast with Tony. Be an expert and provide detailed responses. Use casual, natural language."
    }

    // Create new adult assistant
    console.time("assistants.create time");
    const adultAssistant = await openai.beta.assistants.create({
        name: adultAssistantParameters.name,
        instructions: adultAssistantParameters.instructions,
        model: "gpt-3.5-turbo-1106"
    });

    // Create new adult assistant
    const teenagerAssistant = await openai.beta.assistants.create({
        name: teenagerAssistantParameters.name,
        instructions: teenagerAssistantParameters.instructions,
        model: "gpt-3.5-turbo-1106"
    });
    console.timeEnd("assistants.create time");

    assistantIds = {
        adultAssistantId : adultAssistant.id,
        teenagerAssistantId : teenagerAssistant.id
    }

    return assistantIds;
}

module.exports=getAssistants;