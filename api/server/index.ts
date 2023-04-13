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
    let minutes = process.env.MINUTES || '10';
    if (Number.isNaN(minutes)) minutes = '10';
    cron.schedule(`*/${minutes} * * * *`, () => {
      getRSSItemsCrunchyroll()
        .then(() => {
          console.log("Cron ejecutado", moment().calendar())
        })
        .catch((err) => {
          console.log("Cron error", err);
        });
    });
  }

  public async Start() {
    this.StartCron();
    await this.provider.Start();
  }
}