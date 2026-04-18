import crypto from "crypto";

const RAW_KEY = process.env.ENCRYPTION_KEY || "fallback_encryption_key_change_me";
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest();
const IV_LENGTH = 16;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decrypt(text: string) {
  const [ivPart, encryptedPart] = text.split(":");
  if (!ivPart || !encryptedPart) {
    throw new Error("Invalid encrypted payload");
  }
  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(encryptedPart, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}
