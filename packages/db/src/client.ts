import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema";

if (!process.env.POSTGRES_URL) {
  throw new Error("Missing POSTGRES_URL");
}

export const db = drizzle({
  connection: {
    connectionString: process.env.POSTGRES_URL,
  },
  schema,
  casing: "snake_case",
});
