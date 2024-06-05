const { OpenAI } = require("openai");

const perplexity = new OpenAI({
    apiKey: process.env.perplexity_ai_token,
    baseURL: "https://api.perplexity.ai/",
});

module.exports = perplexity;
