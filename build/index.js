"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./environments");
const server_1 = require("./server");
const fastify_1 = require("./server/fastify");
const routes_1 = require("./routes");
require("./db");
const serverProvider = new fastify_1.default(Number(process.env.PORT), routes_1.default, process.env.LOGGER === 'true');
const server = new server_1.default(serverProvider);
server.Start();
//# sourceMappingURL=index.js.map