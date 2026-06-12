import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, checkSessions, checkedAccounts, proxyStats, InsertCheckSession, InsertCheckedAccount } from "../drizzle/schema";
import { ENV } from './_core/env';
import crypto from "node:crypto";

const CHECKER_ENCRYPTION_KEY = ENV.cookieSecret || "theme_repo_default_secret_fallback_key";

function encryptPassword(text: string): string {
  if (!text) return "";
  try {
    const key = crypto.createHash("sha256").update(CHECKER_ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (err: any) {
    console.error("Encryption error:", err);
    return text;
  }
}

function decryptPassword(cipherText: string): string {
  if (!cipherText || !cipherText.startsWith("enc:")) return cipherText;
  try {
    const parts = cipherText.substring(4).split(":");
    if (parts.length !== 3) return cipherText;
    const [ivHex, tagHex, encryptedHex] = parts;
    const key = crypto.createHash("sha256").update(CHECKER_ENCRYPTION_KEY).digest();
    const iv = Buffer.from(ivHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err: any) {
    console.error("Decryption error:", err);
    return cipherText;
  }
}

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (ENV.ownerOpenId && user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== CHECK SESSIONS ====================
export async function createCheckSession(data: InsertCheckSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(checkSessions).values(data);
  return result[0];
}

export async function getCheckSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select().from(checkSessions).where(eq(checkSessions.id, id)).limit(1);
  return result[0] ?? null;
}

export async function listCheckSessions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(checkSessions).orderBy(desc(checkSessions.createdAt)).limit(50);
}

export async function updateCheckSession(id: number, data: Partial<typeof checkSessions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(checkSessions).set(data).where(eq(checkSessions.id, id));
}

export async function deleteCheckSession(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(checkedAccounts).where(eq(checkedAccounts.sessionId, id));
  await db.delete(checkSessions).where(eq(checkSessions.id, id));
}

// ==================== CHECKED ACCOUNTS ====================
export async function bulkInsertAccounts(accounts: InsertCheckedAccount[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (accounts.length === 0) return;
  const processedAccounts = accounts.map(a => ({
    ...a,
    password: a.password ? encryptPassword(a.password) : ""
  }));
  await db.insert(checkedAccounts).values(processedAccounts);
}

export async function updateCheckedAccount(id: number, data: Partial<typeof checkedAccounts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const processedData = { ...data };
  if (processedData.password) {
    processedData.password = encryptPassword(processedData.password);
  }
  await db.update(checkedAccounts).set(processedData).where(eq(checkedAccounts.id, id));
}

export async function getAccountsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(checkedAccounts).where(eq(checkedAccounts.sessionId, sessionId)).orderBy(desc(checkedAccounts.checkedAt));
  return results.map(row => ({
    ...row,
    password: decryptPassword(row.password)
  }));
}

export async function getValidAccountsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db.select().from(checkedAccounts)
    .where(and(eq(checkedAccounts.sessionId, sessionId), eq(checkedAccounts.status, "valid")))
    .orderBy(desc(checkedAccounts.balance));
  return results.map(row => ({
    ...row,
    password: decryptPassword(row.password)
  }));
}

export async function getRecentResults(sessionId: number, afterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gt } = await import("drizzle-orm");
  const results = await db.select().from(checkedAccounts)
    .where(and(eq(checkedAccounts.sessionId, sessionId), gt(checkedAccounts.id, afterId)))
    .orderBy(checkedAccounts.id)
    .limit(50);
  return results.map(row => ({
    ...row,
    password: decryptPassword(row.password)
  }));
}

// ==================== PROXY STATS ====================
export async function upsertProxyStat(proxyAddress: string, success: boolean) {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  try {
    await db.insert(proxyStats).values({
      proxyAddress,
      successCount: success ? 1 : 0,
      failCount: success ? 0 : 1,
      lastUsed: now,
      lastStatus: success ? "active" : "failed",
    }).onDuplicateKeyUpdate({
      set: {
        successCount: success ? sql`${proxyStats.successCount} + 1` : sql`${proxyStats.successCount}`,
        failCount: success ? sql`${proxyStats.failCount}` : sql`${proxyStats.failCount} + 1`,
        lastUsed: now,
        lastStatus: success ? "active" : "failed",
      }
    });
  } catch (e) {
    console.warn("[DB] upsertProxyStat error:", e);
  }
}

export async function getProxyStats() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(proxyStats).orderBy(desc(proxyStats.lastUsed)).limit(100);
}

// ==================== GLOBAL STATS ====================
export async function getGlobalStats() {
  const db = await getDb();
  if (!db) return { totalSessions: 0, totalChecked: 0, totalValid: 0, totalBalance: 0 };
  const result = await db.select({
    totalSessions: sql<number>`COUNT(*)`,
    totalChecked: sql<number>`SUM(${checkSessions.checkedAccounts})`,
    totalValid: sql<number>`SUM(${checkSessions.validAccounts})`,
    totalBalance: sql<number>`SUM(${checkSessions.totalBalance})`,
  }).from(checkSessions);
  return result[0] ?? { totalSessions: 0, totalChecked: 0, totalValid: 0, totalBalance: 0 };
}
