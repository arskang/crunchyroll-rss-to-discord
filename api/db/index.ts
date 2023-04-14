import { DataSource } from "typeorm"
import { Logs } from '../models/entities';

const localDB = new DataSource({
  type: "sqlite",
  database: "mydb.sql",
  logger: "advanced-console",
  synchronize: true,
  entities: [Logs],
});

localDB.initialize()
    .then(() => {
      console.log("Local Data Source has been initialized!")
    })
    .catch((err) => {
      console.error("Error during Data Source initialization", err)
    })

export default localDB;