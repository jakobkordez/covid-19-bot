import { Client } from '@typeit/discord';
import { AppDiscord } from './app.discord';
import { env, loadEnv } from './env';

loadEnv();

async function start() {
  const client = new Client({
    classes: [AppDiscord],
    silent: false,
    variablesChar: ':',
  });

  await client.login(env.TOKEN);
}

start();
