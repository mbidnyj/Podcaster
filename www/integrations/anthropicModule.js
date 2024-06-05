const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
    apiKey: process.env.anthropic_ai_token,
});

module.exports = anthropic;
