import { getPool } from "./client";

async function run(): Promise<void> {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("select 1");
    console.log("Ultra Commerce seed bootstrap is ready. Add SQL seeds as needed.");
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((error) => {
  console.error("Ultra Commerce seed failed.", error);
  process.exitCode = 1;
});
