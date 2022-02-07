import {
  Client,
  Command,
  CommandMessage,
  Discord,
  Guard,
  On,
} from '@typeit/discord';
import { Guild, MessageEmbed, TextChannel } from 'discord.js';
import { configService } from './config.service';
import { env } from './env';
import { IsAdmin } from './guards/admin.guard';
import { IsNotBot } from './guards/notbot.guard';
import { Stats } from './interfaces/stats.interface';
import { statsService } from './stats.service';

const defaultChannels = ['novice', 'bot', 'bots', 'general'];

const logo = 'https://avatars1.githubusercontent.com/u/62409858';

@Discord('cv!')
export class AppDiscord {
  @Command('channel')
  @Guard(IsNotBot, IsAdmin)
  public setChannel(message: CommandMessage) {
    const channel: TextChannel = message.channel as TextChannel;
    const server: Guild = message.guild;

    configService.setChannel(server.id, channel.id);

    console.log(`Set to channel "${channel.name}" on server "${server.name}"`);
    channel.send(`Set channel to "${channel.name}"`);
  }

  @On('ready')
  public onReady(_, client: Client) {
    console.info(`\nLogged in as ${client.user.tag}`);
    console.info(`Active on ${client.guilds.cache.size} servers`);
    client.guilds.cache.forEach((g) => {
      console.info(`  - ${g.name} (${g.memberCount})`);
      console.info(`    - ${this.getChannel(g)?.name}`);
    });
    console.info();

    statsService.subscribe(this, (stats) => {
      this.broadcast(client, this.buildEmbed(stats));
    });

    statsService.start(10 * 60 * 1000); // 10 min
  }

  // Helpers //
  private broadcast(client: Client, message: MessageEmbed) {
    const send = async (guild: Guild) =>
      this.getChannel(guild)
        ?.send(message)
        .catch((err) => {
          console.error(`Error on server "${guild.name}" : ${err.message}`);
        });

    if (env.NODE_ENV === 'production') {
      client.guilds.cache.forEach((g) => send(g));
    } else if (env.NODE_ENV === 'development' && env.DEV_SERVER_ID) {
      const bts = client.guilds.cache.get(env.DEV_SERVER_ID);
      send(bts);
    }
  }

  private getChannel(guild: Guild): TextChannel {
    const customCh = configService.getServerChannel(guild.id);

    if (customCh) {
      const fc = guild.channels.cache.get(customCh);
      if (fc) return fc as TextChannel;
      configService.resetChannel(guild.id);
    }

    for (let i = 0; i < defaultChannels.length; ++i) {
      const fc = guild.channels.cache.find(
        (t) => t.type === 'text' && t.name === defaultChannels[i],
      );
      if (fc) return fc as TextChannel;
    }

    return guild.channels.cache.find((t) => t.type === 'text') as TextChannel;
  }

  private buildEmbed(stats: Stats): MessageEmbed {
    const percent = (stats.positiveTests / stats.performedTests) * 100;

    return new MessageEmbed()
      .setColor('#FFD922')
      .setAuthor('Sledilnik', logo, 'https://sledilnik.org')
      .setThumbnail(logo)
      .addFields(
        { name: '\u200B', value: '\u200B' },
        {
          name: 'Št. novih primerov',
          value: stats.cases.confirmedToday,
          inline: true,
        },
        { name: '\u200B', value: '\u200B', inline: true },
        {
          name: 'Št. hospitaliziranih',
          value: stats.statePerTreatment.inHospital,
          inline: true,
        },
        { name: '\u200B', value: '\u200B' },
      )
      .setFooter(`Stay safe :) ~ ${stats.day}.${stats.month}.${stats.year}`);
  }
}
