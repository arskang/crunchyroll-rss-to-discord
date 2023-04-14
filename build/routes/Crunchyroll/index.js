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
const services_1 = require("../../services");
const route = {
    url: '/crunchyroll',
    childs: [
        {
            url: 'news',
            method: 'GET',
            handler: (_, reply) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    const items = yield (0, services_1.getRSSItemsCrunchyroll)();
                    return reply
                        .code(200)
                        .send(items);
                }
                catch (err) {
                    let message = 'Unknown Error';
                    if (err instanceof Error)
                        message = err.message;
                    return reply
                        .code(400)
                        .send(message);
                }
            }),
        },
    ],
};
exports.default = route;
//# sourceMappingURL=index.js.map