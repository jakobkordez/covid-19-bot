import { GuardFunction } from '@typeit/discord';

export const IsAdmin: GuardFunction<'message'> = ([message], _, next) => {
  if (message.member.hasPermission('ADMINISTRATOR')) next();
};
