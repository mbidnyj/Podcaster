const { OpenAI } = require("openai");

const openai = new OpenAI({
    apiKey: process.env.open_ai_token,
});

module.exports = openai;
