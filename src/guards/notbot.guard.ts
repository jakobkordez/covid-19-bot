import { GuardFunction } from '@typeit/discord';

export const IsNotBot: GuardFunction<'message'> = ([message], _, next) => {
  if (!message.author.bot) next();
};
