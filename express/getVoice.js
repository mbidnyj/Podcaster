require('dotenv').config({ path: '../config/config.env' });
const openai = require("../clients/openaiClient");

async function getVoice(text, role) {
    const voices = {
        adultAssistantId: "nova",
        teenagerAssistantId: "fable"
    }
  
    try {
        const ogg = await openai.audio.speech.create({
        model: "tts-1",
        voice: voices[role],
        input: text,
        response_format: "mp3"
        });

        return await ogg.body;

    } catch (error) {
        console.error("Error creating speech file:", error);
    }
}

module.exports = getVoice;