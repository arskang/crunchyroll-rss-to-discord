"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const entities_1 = require("../models/entities");
const localDB = new typeorm_1.DataSource({
    // type: "postgres",
    // url: process.env.LOCAL_DB,
    type: "sqlite",
    database: "mydb.sql",
    logger: "advanced-console",
    synchronize: true,
    entities: [entities_1.Logs],
});
localDB.initialize()
    .then(() => {
    console.log("Local Data Source has been initialized!");
})
    .catch((err) => {
    console.error("Error during Data Source initialization", err);
});
exports.default = localDB;
//# sourceMappingURL=index.js.map