require('dotenv').config({ path: '../config/config.env' });

const OpenAI = require('openai').default;
const open_ai_token = process.env.open_ai_token;
const openai = new OpenAI({ apiKey : open_ai_token});

module.exports = openai;