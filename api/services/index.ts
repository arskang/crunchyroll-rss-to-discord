import axios from 'axios';
import * as moment from 'moment';
import { parse } from 'rss-to-json';
import { In } from "typeorm"

import db from '../db';
import { CrunchyrollRSS, Item, FluffyEnclosure } from '../models/crunchyroll';
import { Discord, Embed } from '../models/discord';
import { Logs } from '../models/postgress';

import 'moment/locale/es-mx';
moment.locale('es-mx');

export const sleep = () => new Promise<boolean>(res => setTimeout(() => res(true), 30000));

async function* sendWebhook(discordMessages: Discord[]) {
  for(const message of discordMessages) {
    yield axios.post(process.env.DISCORD_WEBHOOK || '', message);
  } 
}

export async function getRSSItemsCrunchyroll() {
  if (!db.isInitialized) {
    throw new Error('DB has not initialized');
  }

  const resp = await parse('http://feeds.feedburner.com/crunchyroll/rss/anime?lang=esLA');
  const { items } = resp as CrunchyrollRSS;

  const ids = items.reduce<string[]>((acc, { id }) => [...acc, id], []);

  const logs = db.getRepository<Logs>('Logs');
  const logsDB = await logs.find({ where: { crunchyrollID: In(ids) }});
  const logsIDs = (logsDB || []).map(({ crunchyrollID }) => crunchyrollID);

  const itemsf: Item[] = items
    .filter(({ id }) => !logsIDs.includes(id))
    .reverse();

  let index = 0;
  let count = 1;
  const discordMessages: Discord[] = [];
  const newLogs: Logs[] = []
  itemsf.forEach((item) => {
    if (count === 11) {
      index++;
      count = 1;
    }

    let image: string | undefined;
    if (Array.isArray(item.enclosures)) {
      const enclosures = item.enclosures[0] as FluffyEnclosure;
      image = enclosures.url;
    }

    const embed: Embed = {
      title: item.title,
      url: item.link,
      color: 16020769, // #f47521
      description: moment.unix(item.published/1000).format('LLLL'),
      ...(image ? { image: { url: image } } : {}),
    }

    if (count === 1) {
      discordMessages.push({ embeds: [embed] });
    } else {
      discordMessages[index].embeds.push(embed);
    }

    const log = new Logs();
    log.crunchyrollID = item.id;
    log.createdAt = moment().toDate();
    newLogs.push(log);

    count++;
  });

  for await (const r of sendWebhook(discordMessages)) {
    console.log(r.data);
  }

  await db.createQueryBuilder()
    .insert()
    .into(Logs)
    .values(newLogs)
    .execute()

  return items;
}