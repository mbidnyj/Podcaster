const { Telegraf} = require('telegraf');

function getTelegraf (){
    const telegram_bot_token = process.env.telegram_bot_token;
    const bot = new Telegraf(telegram_bot_token);

    return bot;
}

module.exports = getTelegraf;