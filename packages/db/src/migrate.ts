import { migrate } from "drizzle-orm/node-postgres/migrator";

import { getDb, getPool } from "./client";

async function run(): Promise<void> {
  await migrate(getDb(), {
    migrationsFolder: new URL("./migrations", import.meta.url).pathname,
  });
  await getPool().end();
}

run().catch((error) => {
  console.error("Ultra Commerce migration failed.", error);
  process.exitCode = 1;
});
