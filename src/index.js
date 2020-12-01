require('dotenv').config();

const Stats = require('./stats');
const tracker = require('./scraper').statTracker;

const Discord = require('discord.js');
const bot = new Discord.Client();

const TOKEN = process.env.TOKEN;

const cl = ['novice', 'bot', 'bots', 'general'];
var selectedChannel;

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
    if (process.env.NODE_ENV === 'production') {
        bot.guilds.cache.forEach(g => {
            getChannel(g)?.send(message).catch(err => {
                console.error(`Error on server "${g.name}" : ${err.message}`);
            });;
        });
    }
    else if (process.env.DEV_SERVER_ID) {
        const bts = bot.guilds.cache.get(process.env.DEV_SERVER_ID)
        getChannel(bts)?.send(message).catch(err => {
            console.error(`Error on server "${bts.name}" : ${err.message}`);
        });;
    }
}

/**
 * @param {Discord.Guild} guild
 * @param {Discord.GuildChannel} channel
 * @returns {Discord.GuildChannel}
 */
const getChannel = (guild) => {
    if (selectedChannel == null) {
        for (let i = 0; i < cl.length; ++i) {
            var fc = guild.channels.cache.find(t => t.type === 'text' && t.name === cl[i]);
            if (fc) {
                console.log(`Set channel to ${fc}`);
                return fc;
            }
        }
    } else {
        var fc = guild.channels.cache.find(t => t.type === 'text' && t.name === selectedChannel.toString());
        
        if (fc == undefined) console.log("Channel not found");
        else if(fc) {
            console.log(`Set channel to ${fc}`);
            return fc;
        }
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


bot.on('message', message => {
    
    const args = message.content.slice(prefix.length).trim().split(' ');
    const command = args.shift().toLowerCase();


    if (!message.content.startsWith(prefix) || message.author.bot) return;

    else if(command === 'channel') {
        if(!args.length) {
            return message.channel.send(`Please select a channel, ${message.author}!`);
        } else if (args.length > 1){
            return message.channel.send(`Please select only one channel ${message.author}`)
        }

        selectedChannel = args;
        console.log(selectedChannel);

        var channel = message.guild.channels.cache.find(t => t.type === 'text' && t.name === selectedChannel.toString());
        
        
        if (channel == undefined) {
            return message.channel.send("Invalid channel!");
        } else if(channel) {
            getChannel(message.guild)
            return message.channel.send(`Set channel to [${selectedChannel}]`);
        };
        
    }
})