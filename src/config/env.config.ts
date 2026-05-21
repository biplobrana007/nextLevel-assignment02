import dotenv from "dotenv";
import { env } from "process";

dotenv.config({ quiet: true });

const config = {
  port: env.PORT,
  connection_string: env.CONNECTION_STRING,
  jwt_secret: env.JWT_SECRET
};

export default config;
