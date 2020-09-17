require('dotenv').config();

const Stats = require('./stats');
const tracker = require('./scraper').statTracker;

const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

bot.once('ready', () => {
    console.info(`\nLogged in as ${bot.user.tag}`);
    console.info(`Active on ${bot.guilds.cache.size} servers`);
    bot.guilds.cache.forEach(g => console.info(`  - ${g.name} (${g.memberCount})`));
    console.info();
});

tracker.on('newData', (/** @type {Stats} */ stats) => {
    bot.guilds.cache.forEach(g => {
        if (g.id === '446234461244358657') {
            getChannel(g)?.send(buildEmbed(stats));
        }
    })
});

bot.login(TOKEN);


/**
 * @param {Discord.Guild} guild
 * @returns {Discord.GuildChannel}
 */
const getChannel = (guild) => {
    const cl = ['novice', 'bot', 'bots', 'general'];
    for (let i = 0; i < cl.length; ++i) {
        var fc = guild.channels.cache.find(t => t.type === 'text' && t.name === cl[i]);
        if (fc) return fc;
    }
    return guild.channels.cache.find(t => t.type === 'text');
}

/**
 * @param {Stats} stats
 * @returns {Discord.MessageEmbed}
 */
const buildEmbed = (stats) => {
    return new Discord.MessageEmbed()
        .setColor('#f44336')
        .setAuthor('NIJZ', 'https://enki.eu/sites/www.enki.eu/files/upload/images/partners/nijz-logo.png', 'https://www.nijz.si/sl/dnevno-spremljanje-okuzb-s-sars-cov-2-covid-19')
        .setThumbnail('https://enki.eu/sites/www.enki.eu/files/upload/images/partners/nijz-logo.png')
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Št. testiranih', value: stats.tested, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Št. pozitivnih', value: stats.positive, inline: true },
            { name: '\u200B', value: '\u200B' },
        )
        .setFooter('Stay safe :)')
        .setTimestamp();
}
