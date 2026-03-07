import { z } from "zod";

import type {
  SecretDefinition,
  SecretVaultResponse,
  StoredSecretStatus,
  UpsertSecretRequest,
} from "@ultra/api-contracts";
import {
  secretVaultResponseSchema,
  storedSecretStatusSchema,
  upsertSecretRequestSchema,
} from "@ultra/api-contracts";
import { getDb, settings } from "@ultra/db";
import { decryptSecret, encryptSecret, getUltraConfig, maskSecret } from "@ultra/core";
import { eq } from "drizzle-orm";

const encryptedPayloadSchema = z.object({
  algorithm: z.string(),
  ciphertext: z.string(),
  iv: z.string(),
  tag: z.string(),
});

const secretDefinitions: SecretDefinition[] = [
  {
    key: "resend_api_key",
    label: "Resend API Key",
    provider: "resend",
    description: "Used for transactional and bulk email delivery via Resend.",
    requiredFor: ["bulk email", "transactional email"],
  },
  {
    key: "resend_webhook_secret",
    label: "Resend Webhook Secret",
    provider: "resend",
    description: "Used to verify inbound email and Resend event webhooks.",
    requiredFor: ["inbound email", "delivery webhooks"],
  },
  {
    key: "meta_conversions_api_token",
    label: "Meta Conversions API Token",
    provider: "meta",
    description: "Used for server-side Meta conversion forwarding and deduplication.",
    requiredFor: ["meta conversions api"],
  },
  {
    key: "payment_webhook_secret",
    label: "Payment Webhook Secret",
    provider: "payments",
    description: "Used to verify external payment provider webhook requests.",
    requiredFor: ["payment webhooks"],
  },
];

const validSecretKeys = new Set(secretDefinitions.map((d) => d.key));

const envFallbackMap: Record<string, keyof ReturnType<typeof getUltraConfig>> = {
  resend_api_key: "RESEND_API_KEY",
  resend_webhook_secret: "RESEND_WEBHOOK_SECRET",
  meta_conversions_api_token: "META_CONVERSIONS_API_TOKEN",
  payment_webhook_secret: "PAYMENT_WEBHOOK_SECRET",
};

export function getSecretDefinitions(): SecretDefinition[] {
  return [...secretDefinitions];
}

function getMasterEncryptionKey(): string {
  const config = getUltraConfig();

  if (!config.APP_ENCRYPTION_KEY) {
    throw new Error("APP_ENCRYPTION_KEY is required for the in-app secret vault.");
  }

  return config.APP_ENCRYPTION_KEY;
}

async function getStoredSecretRecord(key: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(settings)
    .where(eq(settings.key, `secret.${key}`))
    .limit(1);

  return rows[0];
}

export async function resolveSecretValue(key: string): Promise<string | null> {
  try {
    const record = await getStoredSecretRecord(key);

    if (record) {
      const parsed = encryptedPayloadSchema.safeParse(record.value);

      if (parsed.success) {
        return decryptSecret(parsed.data, getMasterEncryptionKey());
      }

      console.error(`Corrupt encrypted record for secret "${key}", falling through to env`);
    }
  } catch (error) {
    console.error(`Database lookup failed for secret "${key}":`, error);
  }

  const config = getUltraConfig();
  const envKey = envFallbackMap[key];
  const envValue = envKey ? config[envKey] : undefined;

  return typeof envValue === "string" && envValue.length > 0 ? envValue : null;
}

function buildMissingStatus(key: string): StoredSecretStatus {
  return storedSecretStatusSchema.parse({
    key,
    configured: false,
    updatedAt: null,
    maskedPreview: null,
    source: "missing",
  });
}

export async function listSecretStatuses(): Promise<SecretVaultResponse> {
  const statuses: StoredSecretStatus[] = [];

  for (const definition of secretDefinitions) {
    try {
      const record = await getStoredSecretRecord(definition.key).catch(() => undefined);

      if (record) {
        const parsed = encryptedPayloadSchema.safeParse(record.value);

        if (parsed.success) {
          const decrypted = decryptSecret(parsed.data, getMasterEncryptionKey());

          statuses.push(
            storedSecretStatusSchema.parse({
              key: definition.key,
              configured: true,
              updatedAt: record.updatedAt.toISOString(),
              maskedPreview: maskSecret(decrypted),
              source: "database",
            }),
          );
          continue;
        }

        console.error(`Corrupt encrypted record for secret "${definition.key}"`);
      }

      const envValue = await resolveSecretValue(definition.key);

      if (envValue) {
        statuses.push(
          storedSecretStatusSchema.parse({
            key: definition.key,
            configured: true,
            updatedAt: null,
            maskedPreview: maskSecret(envValue),
            source: "environment",
          }),
        );
        continue;
      }

      statuses.push(buildMissingStatus(definition.key));
    } catch (error) {
      console.error(`Failed to read secret "${definition.key}":`, error);
      statuses.push(buildMissingStatus(definition.key));
    }
  }

  return secretVaultResponseSchema.parse({
    definitions: getSecretDefinitions(),
    statuses,
  });
}

export async function upsertSecret(input: UpsertSecretRequest): Promise<StoredSecretStatus> {
  const payload = upsertSecretRequestSchema.parse(input);

  if (!validSecretKeys.has(payload.key)) {
    throw new Error(`Unknown secret key: ${payload.key}`);
  }

  const db = getDb();
  const encrypted = encryptSecret(payload.value, getMasterEncryptionKey());
  const now = new Date();

  await db
    .insert(settings)
    .values({
      key: `secret.${payload.key}`,
      value: encrypted as unknown as Record<string, unknown>,
      isSecret: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: encrypted as unknown as Record<string, unknown>,
        updatedAt: now,
      },
    });

  return storedSecretStatusSchema.parse({
    key: payload.key,
    configured: true,
    updatedAt: now.toISOString(),
    maskedPreview: maskSecret(payload.value),
    source: "database",
  });
}
