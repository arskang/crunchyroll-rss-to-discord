import axios from 'axios';
import * as moment from 'moment';
import { parse } from 'rss-to-json';
import { In, Not } from "typeorm"

import db from '../db';
import { CrunchyrollRSS, Item, FluffyEnclosure } from '../models/crunchyroll';
import { Discord, Embed } from '../models/discord';
import { Logs } from '../models/entities';

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

  let lastMinutes = process.env.LAST_MINUTES || '60';
  if (Number.isNaN(lastMinutes)) lastMinutes = '60';

  const lastItems = items.filter(({ published }) => (
    moment.unix(published/1000)
      .clone()
      .isBetween(
        moment().add(-1*(Number(lastMinutes)), 'minutes'),
        moment(),
      )
  ));

  if (lastItems.length === 0) return lastItems;

  const ids = lastItems.reduce<string[]>((acc, { id }) => [...acc, id], []);

  const logs = db.getRepository<Logs>('Logs');

  const logsDB = await logs.find({ where: { crunchyrollID: In(ids) }});
  const logsIDs = (logsDB || []).map(({ crunchyrollID }) => crunchyrollID);

  const logsDelete = await logs.find({ where: { crunchyrollID: Not(In(ids)) }});
  const logsDeleteIDs = (logsDelete || []).map(({ crunchyrollID }) => crunchyrollID);

  if (logsDeleteIDs.length > 0) {
    await db.createQueryBuilder()
      .delete()
      .from(Logs)
      .where("crunchyrollID IN (:ids)", { ids: logsDeleteIDs })
      .printSql()
      .execute();
  }

  const itemsf: Item[] = lastItems
    .filter(({ id }) => !logsIDs.includes(id))
    .reverse();

  if (itemsf.length === 0) return itemsf;

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
    .printSql()
    .execute()

  return itemsf;
}