import * as moment from 'moment-timezone';
import { parse } from 'rss-to-json';
import { In, Not } from "typeorm"
import { EmbedBuilder, MessageBuilder, HookBuilder } from '@arskang/discord-webhook';

import db from '../db';
import { CrunchyrollRSS, Item, FluffyEnclosure } from '../models/crunchyroll';
import { Logs } from '../models/entities';

import 'moment/locale/es-mx';
moment.locale('es-mx');

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
      .tz("America/Mexico_City")
      .clone()
      .isBetween(
        moment().tz("America/Mexico_City").add(-1*(Number(lastMinutes)), 'minutes'),
        moment().tz("America/Mexico_City"),
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
  const discordMessages: MessageBuilder[] = [];
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

    const embed = new EmbedBuilder()
      .setTitle(item.title)
      .setUrl(item.link)
      .setColor('#f47521')
      .setDescription(
        moment.unix(item.published/1000)
          .tz("America/Mexico_City")
          .format('LLLL')
      );

    if (image) embed.setImage(image);

    if (process.env.LOGGER === 'true') {
      console.log(embed.getJson());
    }

    if (count === 1) {
      const message = new MessageBuilder()
        .addEmbed(embed.build());
      discordMessages.push(message);
    } else {
      discordMessages[index].addEmbed(embed.build());
    }

    const log = new Logs();
    log.crunchyrollID = item.id;
    log.createdAt = moment().tz("America/Mexico_City").toDate();
    newLogs.push(log);

    count++;
  });

  const hook = new HookBuilder(process.env.DISCORD_WEBHOOK || '');
  discordMessages.forEach(message => {
    if (process.env.LOGGER === 'true') {
      console.log(message.getJson());
    }
    hook.addMessage(message.build());
  });

  try {
    await hook.send();
  } catch(err) {
    console.error(err);
  }

  await db.createQueryBuilder()
    .insert()
    .into(Logs)
    .values(newLogs)
    .printSql()
    .execute()

  return itemsf;
}