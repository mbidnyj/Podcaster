require("dotenv").config({ path: "../config/config.env" });
const openai = require("../integrations/openaiModule");
const elevenlabs = require("../integrations/elevenLabsModule");

async function textToSpeech(text, role, provider = "openai") {
    if (provider == "openai") {
        const voices = {
            Sceptic: "echo",
            Fan: "nova",
            Bob: "echo",
            Alice: "nova",
        };

        try {
            const ogg = await openai.audio.speech.create({
                model: "tts-1",
                voice: voices[role],
                input: text,
                response_format: "mp3",
            });

            return ogg.body;
        } catch (error) {
            console.error("Error creating speech file:", error);
        }
    } else if (provider == "elevenlabs") {
        const voices = {
            Sceptic: "Jeremy",
            Fan: "Matilda",
            Bob: "Jeremy",
            Alice: "Matilda",
        };

        const audioStream = await elevenlabs.generate({
            stream: true,
            voice: voices[role],
            text: text,
        });

        return audioStream;
    } else {
        throw new Error(`There is no TTS provider with a name: ${provider}`);
    }
}

module.exports = textToSpeech;
