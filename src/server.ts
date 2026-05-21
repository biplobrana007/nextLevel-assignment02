import app from "./app";
import config from "./config/env.config";

const port = config.port;

const main = async () => {
  app.listen(port, () => {
    console.log(`The server is running on ${port}`);
  });
};

main();
