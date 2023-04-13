import { DataSource } from "typeorm"
import { Logs } from '../models/postgress';

const localDB = new DataSource({
  type: "postgres",
  url: process.env.LOCAL_DB,
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