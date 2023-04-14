import * as cron from 'node-cron';
import * as moment from 'moment';
import { getRSSItemsCrunchyroll } from '../services';

export interface ServerProvider { 
  Start(): Promise<void>;
}

export default class Server {
  private provider: ServerProvider;

  constructor(provider: ServerProvider) {
    this.provider = provider;
  }

  private StartCron() {
    let minutes = process.env.MINUTES || '30';
    if (Number.isNaN(minutes)) minutes = '30';
    cron.schedule(`*/${minutes} * * * *`, () => {
      getRSSItemsCrunchyroll()
        .then(() => {
          console.log("Cron ejecutado", moment().calendar())
        })
        .catch((err) => {
          console.log("Cron error", err);
        });
    });
    console.log('Cronjob has been initialized!');
  }

  public async Start() {
    if (process.env.CRONOFF !== 'true') {
      this.StartCron();
    }
    await this.provider.Start();
  }
}