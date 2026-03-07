import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const HKDF_SALT = "ultra-commerce-vault-salt";
const HKDF_INFO = "ultra-vault-v1";

export type EncryptedSecret = {
  algorithm: string;
  ciphertext: string;
  iv: string;
  tag: string;
};

function deriveKey(secret: string): Buffer {
  return Buffer.from(
    hkdfSync("sha256", Buffer.from(secret), HKDF_SALT, HKDF_INFO, 32),
  );
}

export function encryptSecret(value: string, masterSecret: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, deriveKey(masterSecret), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    algorithm: ALGORITHM,
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}

export function decryptSecret(payload: EncryptedSecret, masterSecret: string): string {
  if (payload.algorithm !== ALGORITHM) {
    throw new Error(`Unsupported encryption algorithm: ${payload.algorithm}`);
  }

  const decipher = createDecipheriv(
    ALGORITHM,
    deriveKey(masterSecret),
    Buffer.from(payload.iv, "base64"),
  );
  (
    decipher as unknown as {
      setAuthTag: (tag: Buffer) => void;
    }
  ).setAuthTag(Buffer.from(payload.tag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

export function maskSecret(value: string): string {
  if (value.length < 6) {
    return "*".repeat(value.length);
  }

  if (value.length <= 8) {
    return `${"*".repeat(Math.max(value.length - 2, 0))}${value.slice(-2)}`;
  }

  return `${value.slice(0, 2)}${"*".repeat(Math.max(value.length - 6, 0))}${value.slice(-4)}`;
}
