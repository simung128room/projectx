import { eq, desc, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, checkSessions, checkedAccounts, proxyStats, InsertCheckSession, InsertCheckedAccount } from "../drizzle/schema";
import { ENV } from './_core/env';

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
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
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
  await db.insert(checkedAccounts).values(accounts);
}

export async function updateCheckedAccount(id: number, data: Partial<typeof checkedAccounts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(checkedAccounts).set(data).where(eq(checkedAccounts.id, id));
}

export async function getAccountsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(checkedAccounts).where(eq(checkedAccounts.sessionId, sessionId)).orderBy(desc(checkedAccounts.checkedAt));
}

export async function getValidAccountsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(checkedAccounts)
    .where(and(eq(checkedAccounts.sessionId, sessionId), eq(checkedAccounts.status, "valid")))
    .orderBy(desc(checkedAccounts.balance));
}

export async function getRecentResults(sessionId: number, afterId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { gt } = await import("drizzle-orm");
  return db.select().from(checkedAccounts)
    .where(and(eq(checkedAccounts.sessionId, sessionId), gt(checkedAccounts.id, afterId)))
    .orderBy(checkedAccounts.id)
    .limit(50);
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
