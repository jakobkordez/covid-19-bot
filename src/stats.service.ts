import request = require('request');
import { configService } from './config.service';
import { env } from './env';
import { Stats } from './interfaces/stats.interface';

const apiUrl: string = 'https://api.sledilnik.org/api/stats';

export class StatsService {
  private subscribers: Map<object, (stats: Stats) => void> = new Map();
  private timer: NodeJS.Timeout;

  public start(interval: number): void {
    this.checkNew();
    this.timer = setInterval(() => this.checkNew(), interval);
  }

  public stop(): void {
    clearInterval(this.timer);
  }

  public subscribe(key: object, func: (stats: Stats) => void): void {
    this.subscribers.set(key, func);
  }

  public unsubscribe(key: object): void {
    this.subscribers.delete(key);
  }

  public async checkNew(): Promise<void> {
    try {
      const stats = await this.getData();

      const lastUpdate = configService.getLastUpdate();
      if (stats && stats.performedTests) {
        console.info(`New data for ${stats.day}.${stats.month}.${stats.year}`);
        lastUpdate.setDate(lastUpdate.getDate() + 1);
        configService.setLastUpdate(lastUpdate);
        this.subscribers.forEach((sub) => sub(stats));
      } else if (env.NODE_ENV === 'development') {
        console.info(
          '[INFO] No data for',
          lastUpdate.toISOString().slice(0, 10),
        );
        this.subscribers.forEach((sub) =>
          sub({
            dayFromStart: -1,
            day: configService.getLastUpdate().getDate(),
            month: configService.getLastUpdate().getMonth(),
            year: configService.getLastUpdate().getFullYear(),
            performedTests: 9,
            positiveTests: 4,
          }),
        );
      }
    } catch (e) {
      console.error(e);
    }
  }

  private getData(): Promise<Stats> {
    const dateString = configService.getLastUpdate().toISOString().slice(0, 10);

    return new Promise<Stats>((resolve, reject) => {
      request(`${apiUrl}?from=${dateString}`, (err, res, body) => {
        if (err) return reject(err);
        if (!res) return reject('Unknown error');

        if (res.statusCode !== 200) return reject(body);

        resolve(JSON.parse(res.body)[0] as Stats);
      });
    });
  }
}

export const statsService: StatsService = new StatsService();
