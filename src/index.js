require('dotenv').config();

// const Discord = require('discord.js');
// const request = require('request');
// const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

// bot.once('ready', () => {
//     console.info(`Logged in as ${bot.user.tag}`);
//     console.info(`Active on ${bot.guilds.cache.size} servers`);
//     bot.guilds.cache.forEach(g => console.info(`  - ${g.name} (${g.memberCount})`));
// });

// bot.login(TOKEN);

const scraper = require('./scraper');

const aF = async () => {
    try {
        console.log(await scraper.getData());
    }
    catch (e) {
        console.error(e);
    }
}
aF();
