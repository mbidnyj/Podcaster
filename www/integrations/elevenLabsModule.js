const { ElevenLabsClient } = require("elevenlabs");
const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.labs_api_key,
});

module.exports = elevenlabs;
