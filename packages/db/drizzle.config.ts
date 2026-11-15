import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: "../../.env" });

const schema = fs.existsSync("./dist/schema/index.js")
  ? "./dist/schema/index.js"
  : "./src/schema/index.ts";

export default defineConfig({
  dialect: "postgresql",
  schema,
  out: "./src/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/neuraldesk_dev",
  },
  strict: true,
  verbose: true,
});
