import crypto from "node:crypto";
import util from "node:util";

const pbkdf2Async = util.promisify(crypto.pbkdf2);

export const getEncryptionKey = () => {
  const key = process.env.BACKEND_ENCRYPTION_KEY || 'default-store-secret-dev-encryption-key-32b';
  return key;
};

export async function encrypt(text: string) {
  if (!text) return "";
  try {
    const rawKey = getEncryptionKey();
    const salt = crypto.randomBytes(16);
    const key = (await pbkdf2Async(rawKey, salt, 1e5, 32, "sha256")) as Buffer;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, "utf8"),
      cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return `enc2:${salt.toString("hex")}:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (err) {
    console.error("Encryption error:", err);
    throw new Error("Encryption failed");
  }
}

export async function decrypt(cipherText: string) {
  if (!cipherText) return cipherText;
  if (cipherText.startsWith("enc2:")) {
    try {
      const parts = cipherText.substring(5).split(":");
      if (parts.length !== 4) return cipherText;
      const [saltHex, ivHex, tagHex, encryptedHex] = parts;
      const rawKey = getEncryptionKey();
      const salt = Buffer.from(saltHex, "hex");
      const key = (await pbkdf2Async(rawKey, salt, 1e5, 32, "sha256")) as Buffer;
      const iv = Buffer.from(ivHex, "hex");
      const tag = Buffer.from(tagHex, "hex");
      const encryptedText = Buffer.from(encryptedHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      const decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
      ]);
      return decrypted.toString("utf8");
    } catch (err) {
      console.error("Decryption error (enc2):", err);
      return cipherText;
    }
  }
  if (cipherText.startsWith("enc:")) {
    try {
      const parts = cipherText.substring(4).split(":");
      if (parts.length === 2) {
        const [ivHex, encryptedHex] = parts;
        const rawKey = getEncryptionKey();
        const key = crypto.createHash("sha256").update(String(rawKey)).digest();
        const iv = Buffer.from(ivHex, "hex");
        const encryptedText = Buffer.from(encryptedHex, "hex");
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
        const decrypted = Buffer.concat([
          decipher.update(encryptedText),
          decipher.final()
        ]);
        return decrypted.toString("utf8");
      }
    } catch (err) {
      console.error("Decryption error (enc):", err);
      return cipherText;
    }
  }
  return cipherText;
}
