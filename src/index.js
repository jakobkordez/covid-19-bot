require('dotenv').config();

const fs = require('fs');

const Stats = require('./stats');
const tracker = require('./scraper').statTracker;

const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

const channelFiles = '.channels';

const defaultChannels = ['novice', 'bot', 'bots', 'general'];
const selectedChannels = readFile();

const prefix = 'cv!';

bot.once('ready', () => {
    console.info(`\nLogged in as ${bot.user.tag}`);
    console.info(`Active on ${bot.guilds.cache.size} servers`);
    bot.guilds.cache.forEach(g => {
        console.info(`  - ${g.name} (${g.memberCount})`);
        console.info(`    - ${getChannel(g)?.name}`);
    });
    console.info();
});

tracker.on('newData', (/** @type {Stats} */ stats) => {
    console.info('New data for date: ', stats.date.toDateString())
    broadcast(buildEmbed(stats));
});


bot.login(TOKEN);


/**
 * @param {*} message 
 */
const broadcast = (message) => {
    const send = (guild) => getChannel(guild)?.send(message).catch(err => {
        console.error(`Error on server "${guild.name}" : ${err.message}`);
    });

    if (process.env.NODE_ENV === 'production') {
        bot.guilds.cache.forEach(g => send(g));
    }
    else if (process.env.DEV_SERVER_ID) {
        const bts = bot.guilds.cache.get(process.env.DEV_SERVER_ID);
        send(bts);
    }
}

/**
 * @param {Discord.Guild} guild
 * @returns {Discord.GuildChannel}
 */
const getChannel = (guild) => {
    const customCh = selectedChannels[guild.id];

    if (customCh) {
        const fc = guild.channels.cache.find(t => t.type === 'text' && t.id === customCh);
        if (fc) return fc;
        delete selectedChannels[guild.id];
        writeToFile(selectedChannels);
    }

    for (let i = 0; i < defaultChannels.length; ++i) {
        const fc = guild.channels.cache.find(t => t.type === 'text' && t.name === defaultChannels[i]);
        if (fc) return fc;
    }

    return guild.channels.cache.find(t => t.type === 'text');
}

/**
 * @param {Stats} stats
 * @returns {Discord.MessageEmbed}
 */
const buildEmbed = (stats) => {
    const percent = stats.positive / stats.tested * 100;

    return new Discord.MessageEmbed()
        .setColor('#f44336')
        .setAuthor('NIJZ', nijzLogo, 'https://www.nijz.si/sl/dnevno-spremljanje-okuzb-s-sars-cov-2-covid-19')
        .setThumbnail(nijzLogo)
        .addFields(
            { name: '\u200B', value: '\u200B' },
            { name: 'Št. testiranih', value: stats.tested, inline: true },
            { name: '\u200B', value: '\u200B', inline: true },
            { name: 'Št. pozitivnih', value: `${stats.positive} (${percent.toFixed(1)}%)`, inline: true },
            { name: '\u200B', value: '\u200B' },
        )
        .setFooter('Stay safe :)')
        .setTimestamp();
}

const nijzLogo = 'https://enki.eu/sites/www.enki.eu/files/upload/images/partners/nijz-logo.png';


bot.on('message', async message => {

    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();

    if (!message.content.startsWith(prefix) || message.author.bot) return;
    if (command === 'channel') {
        try {
            const member = message.guild.members.cache.find(m => m.id === message.author.id);
            if (!member) return;
            if (!member.hasPermission('ADMINISTRATOR')) {
                return await message.channel.send(`You cannot do that, ${message.author}`);
            }
            
            if (!args.length) {
                return await message.channel.send(`Please select a channel, ${message.author}`);
            } else if (args.length > 1) {
                return await message.channel.send(`Please select only one channel, ${message.author}`)
            }
    
            const selectedChannel = args[0];
            var channel = message.guild.channels.cache.find(t => t.type === 'text' && t.name === selectedChannel);
    
            if (!channel) {
                return await message.channel.send('Invalid channel!');
            } else {
                selectedChannels[message.guild.id] = channel.id;
                writeToFile(selectedChannels);
                return await message.channel.send(`Set channel to [${selectedChannel}]`);
            };
        }
        catch (e) {
            console.error(`Error on server "${message.guild.name}" : ${e.message}`);
            return;
        }
    }
});

/**
 * Async write to file
 * @param {*} data
 */
function writeToFile(data) {
    fs.writeFile(channelFiles, JSON.stringify(data), () => { });
}

/**
 * Sync read from file
 */
function readFile() {
    if (!fs.existsSync(channelFiles)) return {};
    const data = fs.readFileSync(channelFiles);
    if (data == '') return {};
    return JSON.parse(data);
}
