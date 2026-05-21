import app from "./app";
import config from "./config/env.config";
import { initDB } from "./db";

const port = config.port;

const main = async () => {
  initDB();
  app.listen(port, () => {
    console.log(`The server is running on ${port}`);
  });
};

main();
