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
const cron = require("node-cron");
const moment = require("moment");
const services_1 = require("../services");
class Server {
    constructor(provider) {
        this.provider = provider;
    }
    StartCron() {
        let minutes = process.env.MINUTES || '10';
        if (Number.isNaN(minutes))
            minutes = '10';
        cron.schedule(`*/${minutes} * * * *`, () => {
            (0, services_1.getRSSItemsCrunchyroll)()
                .then(() => {
                console.log("Cron ejecutado", moment().calendar());
            })
                .catch((err) => {
                console.log("Cron error", err);
            });
        });
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            // this.StartCron();
            yield this.provider.Start();
        });
    }
}
exports.default = Server;
//# sourceMappingURL=index.js.map