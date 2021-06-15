import { EnvSchema, EnvType, load } from 'ts-dotenv';

export type Env = EnvType<typeof schema>;

export const schema: EnvSchema = {
  NODE_ENV: String,
  TOKEN: String,
  DEV_SERVER_ID: {
    type: String,
    optional: true,
  },
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema);
}
