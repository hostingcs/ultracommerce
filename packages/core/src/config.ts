import { z } from "zod";

const KNOWN_PLACEHOLDER_SECRETS = new Set([
  "ultra-development-secret",
  "replace-with-a-long-random-secret",
  "replace-with-a-long-random-master-key",
  "replace-with-a-webhook-secret",
]);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z
    .string()
    .min(16)
    .refine(
      (val) =>
        process.env.NODE_ENV !== "production" ||
        !KNOWN_PLACEHOLDER_SECRETS.has(val),
      "SESSION_SECRET must not use a placeholder value in production",
    ),
  APP_ENCRYPTION_KEY: z
    .string()
    .min(16)
    .refine(
      (val) =>
        process.env.NODE_ENV !== "production" ||
        !KNOWN_PLACEHOLDER_SECRETS.has(val),
      "APP_ENCRYPTION_KEY must not use a placeholder value in production",
    )
    .optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  META_CONVERSIONS_API_TOKEN: z.string().optional(),
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
});

export type UltraConfig = z.infer<typeof envSchema>;

export function getUltraConfig(source: NodeJS.ProcessEnv = process.env): UltraConfig {
  return envSchema.parse(source);
}
