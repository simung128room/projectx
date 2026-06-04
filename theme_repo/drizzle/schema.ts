import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==================== CHECK SESSIONS ====================
export const checkSessions = mysqlTable("check_sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionName: varchar("sessionName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "cancelled"]).default("pending").notNull(),
  totalAccounts: int("totalAccounts").default(0).notNull(),
  checkedAccounts: int("checkedAccounts").default(0).notNull(),
  validAccounts: int("validAccounts").default(0).notNull(),
  invalidAccounts: int("invalidAccounts").default(0).notNull(),
  errorAccounts: int("errorAccounts").default(0).notNull(),
  totalBalance: float("totalBalance").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckSession = typeof checkSessions.$inferSelect;
export type InsertCheckSession = typeof checkSessions.$inferInsert;

// ==================== CHECKED ACCOUNTS ====================
export const checkedAccounts = mysqlTable("checked_accounts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["valid", "invalid", "locked", "blocked", "timeout", "error", "pending"]).default("pending").notNull(),
  balance: float("balance").default(0),
  verified: boolean("verified").default(false),
  country: varchar("country", { length: 64 }).default("N/A"),
  message: text("message"),
  proxyUsed: varchar("proxyUsed", { length: 128 }),
  checkedAt: timestamp("checkedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CheckedAccount = typeof checkedAccounts.$inferSelect;
export type InsertCheckedAccount = typeof checkedAccounts.$inferInsert;

// ==================== PROXY STATS ====================
export const proxyStats = mysqlTable("proxy_stats", {
  id: int("id").autoincrement().primaryKey(),
  proxyAddress: varchar("proxyAddress", { length: 128 }).notNull().unique(),
  successCount: int("successCount").default(0).notNull(),
  failCount: int("failCount").default(0).notNull(),
  lastUsed: timestamp("lastUsed"),
  lastStatus: mysqlEnum("lastStatus", ["active", "failed", "unknown"]).default("unknown").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProxyStat = typeof proxyStats.$inferSelect;
export type InsertProxyStat = typeof proxyStats.$inferInsert;
