import axios from 'axios';
import * as moment from 'moment';
import { parse } from 'rss-to-json';
// import { Between } from "typeorm"

import db from '../db';
import { CrunchyrollRSS, Item } from '../models/crunchyroll';
import { Discord } from '../models/discord';
import { Logs } from '../models/postgress';

import 'moment/locale/es-mx';
moment.locale('es-mx');

export const sleep = () => new Promise<boolean>(res => setTimeout(() => res(true), 30000));

async function* sendWebhook(items: Item[]) {
  if (!db.isInitialized) {
    throw new Error('DB has not initialized');
  }

  for(let i = 0; i < items.length; i++) {
    const discordMessage: Discord = {
      embeds: [
        {
          title: items[i].title,
          url: items[i].link,
          color: 16020769, // #f47521
          description: moment.unix(items[i].published/1000).format('LLLL'),
          image: { url: items[i].description.replace(/(.+src=\")(.+)(\".+)/, "$2") } ,
        },
      ],
    }

    // if (i > 0) yield sleep();
    yield axios.post(process.env.DISCORD_WEBHOOK || '', discordMessage);
  
    yield db.createQueryBuilder()
      .insert()
      .into(Logs)
      .values({
        crunchyrollID: items[i].id,
        createdAt: moment().toDate()
      })
      .execute()
  } 
}

export async function getRSSItemsCrunchyroll() {
  if (!db.isInitialized) {
    throw new Error('DB has not initialized');
  }

  const resp = await parse('http://feeds.feedburner.com/crunchyroll/rss/anime?lang=esLA');
  const { items } = resp as CrunchyrollRSS;

  const logs = db.getRepository<Logs>('Logs');
  const logsDB = await logs.find({ take: 100 });
  const logsDBf = (logsDB || []).map(({ crunchyrollID }) => crunchyrollID);

  const itemsf: Item[] = items
    .reduce<Item[]>((acc, item, i) => (i < 30 ? [...acc, item] : acc), [])
    .filter(({ id }) => !logsDBf.includes(id))
    .reduce<Item[]>((acc, item, i) => (i < 10 ? [...acc, item] : acc), [])
    .reverse();

  for await (const r of sendWebhook(itemsf)) {}

  return items;
}