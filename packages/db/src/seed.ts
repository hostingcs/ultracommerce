import { promisify } from "node:util";
import { randomBytes, scrypt } from "node:crypto";

import { eq } from "drizzle-orm";

import { getDb } from "./client";
import { users } from "./schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

const DEFAULT_EMAIL = "admin@ultra.local";
const DEFAULT_PASSWORD = "ultra123";

async function run(): Promise<void> {
  const db = getDb();

  const existing = await db.select().from(users).where(eq(users.email, DEFAULT_EMAIL)).limit(1);

  if (existing.length > 0) {
    console.log(`Admin user "${DEFAULT_EMAIL}" already exists, skipping seed.`);
    return;
  }

  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  await db.insert(users).values({
    email: DEFAULT_EMAIL,
    firstName: "Ultra",
    lastName: "Admin",
    role: "admin",
    status: "active",
    passwordHash,
  });

  console.log("✓ Admin user created");
  console.log(`  Email:    ${DEFAULT_EMAIL}`);
  console.log(`  Password: ${DEFAULT_PASSWORD}`);
  console.log("  Change your password after first login.");
}

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
