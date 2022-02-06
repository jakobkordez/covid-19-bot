import { readFileSync, writeFileSync } from 'fs';
import { Config } from './interfaces/config.interface';

const configFile: string = 'config.json';

export class ConfigService {
  private config: Config;

  constructor() {
    try {
      const data = readFileSync(configFile, { encoding: 'utf8' });
      const parsedData: Config = JSON.parse(data);
      const today = new Date(Date.now());
      this.config = {
        channels: new Map(parsedData.channels),
        lastUpdate: new Date(
          parsedData.lastUpdate ??
            Date.UTC(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() - 1,
            ),
        ),
      };
    } catch (e) {
      const today = new Date(Date.now());
      this.config = {
        channels: new Map(),
        lastUpdate: new Date(
          Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        ),
      };

      this.save();
    }
  }

  public getServerChannel(serverId: string): string {
    return this.config.channels.get(serverId);
  }

  public getLastUpdate(): Date {
    return this.config.lastUpdate;
  }

  public setLastUpdate(date: Date): void {
    this.config.lastUpdate = date;
    this.save();
  }

  public setChannel(serverId: string, channelId: string): void {
    this.config.channels.set(serverId, channelId);
    this.save();
  }

  public resetChannel(serverId: string): void {
    if (!this.config.channels.has(serverId)) return;
    this.config.channels.delete(serverId);
    this.save();
  }

  private save(): void {
    writeFileSync(
      configFile,
      JSON.stringify(this.config, (key, value) => {
        if (key === 'channels') return Array.from(value);

        return value;
      }),
    );
  }
}

export const configService: ConfigService = new ConfigService();
