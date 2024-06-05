const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.telegram_bot_token, {
    telegram: { timeout: 180 },
});

module.exports = bot;
