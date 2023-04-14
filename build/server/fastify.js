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
const cors_1 = require("@fastify/cors");
const fastify_1 = require("fastify");
class FastifyProvider {
    constructor(port, routes, logger) {
        this.port = port;
        this.routes = routes;
        this.logger = logger;
        this.server = (0, fastify_1.default)({ logger: this.logger });
    }
    setUrl(url, childUrl) {
        return `${url}${childUrl && childUrl !== '' ? `/${childUrl}` : ''}`;
    }
    setRoutes() {
        if (this.routes.length > 0) {
            this.routes.forEach((route) => {
                const { childs, url } = route;
                if (childs.length > 0) {
                    childs.forEach((child) => {
                        this.server.route(Object.assign(Object.assign({}, child), { url: this.setUrl(url, child.url) }));
                    });
                }
            });
        }
    }
    Cors() {
        this.server.register(cors_1.default, {
            origin: "*",
        });
    }
    setConfigurations() {
        return __awaiter(this, void 0, void 0, function* () {
            this.Cors();
            this.setRoutes();
        });
    }
    Start() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.setConfigurations();
            this.server.listen({
                port: this.port,
                host: "0.0.0.0",
            }, (err, address) => {
                if (err) {
                    console.error(err);
                    process.exit(0);
                }
                console.log(`Server listening on ${address}`);
            });
        });
    }
}
exports.default = FastifyProvider;
//# sourceMappingURL=fastify.js.map