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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRSSItemsCrunchyroll = exports.sleep = void 0;
const axios_1 = require("axios");
const moment = require("moment");
const rss_to_json_1 = require("rss-to-json");
const typeorm_1 = require("typeorm");
const db_1 = require("../db");
const entities_1 = require("../models/entities");
require("moment/locale/es-mx");
moment.locale('es-mx');
const sleep = () => new Promise(res => setTimeout(() => res(true), 30000));
exports.sleep = sleep;
function sendWebhook(discordMessages) {
    return __asyncGenerator(this, arguments, function* sendWebhook_1() {
        for (const message of discordMessages) {
            yield yield __await(axios_1.default.post(process.env.DISCORD_WEBHOOK || '', message));
        }
    });
}
function getRSSItemsCrunchyroll() {
    var e_1, _a;
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
            .clone()
            .isBetween(moment().add(-1 * (Number(lastMinutes)), 'minutes'), moment())));
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
            const embed = Object.assign({ title: item.title, url: item.link, color: 16020769, description: moment.unix(item.published / 1000).format('LLLL') }, (image ? { image: { url: image } } : {}));
            if (count === 1) {
                discordMessages.push({ embeds: [embed] });
            }
            else {
                discordMessages[index].embeds.push(embed);
            }
            const log = new entities_1.Logs();
            log.crunchyrollID = item.id;
            log.createdAt = moment().toDate();
            newLogs.push(log);
            count++;
        });
        try {
            for (var _b = __asyncValues(sendWebhook(discordMessages)), _c; _c = yield _b.next(), !_c.done;) {
                const r = _c.value;
                console.log(r.data);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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