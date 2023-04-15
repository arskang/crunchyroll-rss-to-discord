"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRSSItemsCrunchyroll = void 0;
const moment = require("moment-timezone");
const rss_to_json_1 = require("rss-to-json");
const typeorm_1 = require("typeorm");
const discord_webhook_1 = require("@arskang/discord-webhook");
const db_1 = require("../db");
const entities_1 = require("../models/entities");
require("moment/locale/es-mx");
moment.locale('es-mx');
function getRSSItemsCrunchyroll() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db_1.default.isInitialized) {
            throw new Error('DB has not initialized');
        }
        const resp = yield (0, rss_to_json_1.parse)('http://feeds.feedburner.com/crunchyroll/rss/anime?lang=esLA');
        const { items } = resp;
        let lastMinutes = process.env.LAST_MINUTES || '60';
        if (Number.isNaN(lastMinutes))
            lastMinutes = '60';
        const lastItems = items.filter(({ published }) => (moment.unix(published / 1000)
            .tz("America/Mexico_City")
            .clone()
            .isBetween(moment().tz("America/Mexico_City").add(-1 * (Number(lastMinutes)), 'minutes'), moment().tz("America/Mexico_City"))));
        if (lastItems.length === 0)
            return lastItems;
        const ids = lastItems.reduce((acc, { id }) => [...acc, id], []);
        const logs = db_1.default.getRepository('Logs');
        const logsDB = yield logs.find({ where: { crunchyrollID: (0, typeorm_1.In)(ids) } });
        const logsIDs = (logsDB || []).map(({ crunchyrollID }) => crunchyrollID);
        const logsDelete = yield logs.find({ where: { crunchyrollID: (0, typeorm_1.Not)((0, typeorm_1.In)(ids)) } });
        const logsDeleteIDs = (logsDelete || []).map(({ crunchyrollID }) => crunchyrollID);
        if (logsDeleteIDs.length > 0) {
            yield db_1.default.createQueryBuilder()
                .delete()
                .from(entities_1.Logs)
                .where("crunchyrollID IN (:ids)", { ids: logsDeleteIDs })
                .printSql()
                .execute();
        }
        const itemsf = lastItems
            .filter(({ id }) => !logsIDs.includes(id))
            .reverse();
        if (itemsf.length === 0)
            return itemsf;
        let index = 0;
        let count = 1;
        const discordMessages = [];
        const newLogs = [];
        itemsf.forEach((item) => {
            if (count === 11) {
                index++;
                count = 1;
            }
            let image;
            if (Array.isArray(item.enclosures)) {
                const enclosures = item.enclosures[0];
                image = enclosures.url;
            }
            const embed = new discord_webhook_1.EmbedBuilder()
                .setTitle(item.title)
                .setUrl(item.link)
                .setColor('#f47521')
                .setDescription(moment.unix(item.published / 1000)
                .tz("America/Mexico_City")
                .format('LLLL'));
            if (image)
                embed.setImage(image);
            if (process.env.LOGGER === 'true') {
                console.log(embed.getJson());
            }
            if (count === 1) {
                const message = new discord_webhook_1.MessageBuilder()
                    .addEmbed(embed.build());
                discordMessages.push(message);
            }
            else {
                discordMessages[index].addEmbed(embed.build());
            }
            const log = new entities_1.Logs();
            log.crunchyrollID = item.id;
            log.createdAt = moment().tz("America/Mexico_City").toDate();
            newLogs.push(log);
            count++;
        });
        const hook = new discord_webhook_1.HookBuilder(process.env.DISCORD_WEBHOOK || '');
        discordMessages.forEach(message => {
            if (process.env.LOGGER === 'true') {
                console.log(message.getJson());
            }
            hook.addMessage(message.build());
        });
        try {
            yield hook.send();
        }
        catch (err) {
            console.error(err);
        }
        yield db_1.default.createQueryBuilder()
            .insert()
            .into(entities_1.Logs)
            .values(newLogs)
            .printSql()
            .execute();
        return itemsf;
    });
}
exports.getRSSItemsCrunchyroll = getRSSItemsCrunchyroll;
//# sourceMappingURL=index.js.map