import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import {
  createCheckSession,
  getCheckSession,
  listCheckSessions,
  deleteCheckSession,
  getAccountsBySession,
  getValidAccountsBySession,
  getRecentResults,
  getProxyStats,
  getGlobalStats,
} from "./db";
import {
  parseAccountsFromText,
  runCheckSession,
  cancelSession,
  getSessionProgress,
  PROXY_LIST,
} from "./checker";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== CHECKER ====================
  checker: router({
    // Parse accounts from text content
    parseAccounts: protectedProcedure
      .input(z.object({ content: z.string().max(5_000_000) }))
      .mutation(({ input }) => {
        const accounts = parseAccountsFromText(input.content);
        return { accounts: accounts.slice(0, 10000), total: accounts.length };
      }),

    // Create a new check session and start checking
    startSession: adminProcedure
      .input(z.object({
        sessionName: z.string().min(1).max(255),
        accounts: z.array(z.object({ email: z.string(), password: z.string() })).min(1).max(10000),
        concurrency: z.number().min(1).max(50).default(10),
      }))
      .mutation(async ({ input }) => {
        const result = await createCheckSession({
          sessionName: input.sessionName,
          status: "pending",
          totalAccounts: input.accounts.length,
          checkedAccounts: 0,
          validAccounts: 0,
          invalidAccounts: 0,
          errorAccounts: 0,
          totalBalance: 0,
        });
        const insertId = (result as unknown as { insertId: number }).insertId;

        // Start checking in background (non-blocking)
        runCheckSession(insertId, input.accounts, input.concurrency).catch(err => {
          console.error("[Checker] Session error:", err);
        });

        return { sessionId: insertId };
      }),

    // Get session progress (for polling)
    getProgress: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const inMemory = getSessionProgress(input.sessionId);
        const dbSession = await getCheckSession(input.sessionId);

        if (inMemory) {
          return {
            sessionId: input.sessionId,
            status: inMemory.status,
            total: inMemory.total,
            checked: inMemory.checked,
            valid: inMemory.valid,
            invalid: inMemory.invalid,
            errors: inMemory.errors,
            totalBalance: inMemory.totalBalance,
            recentResults: inMemory.recentResults.slice(0, 20),
            activeProxyCount: inMemory.activeProxies.size,
            failedProxyCount: inMemory.failedProxies.size,
            elapsedMs: Date.now() - inMemory.startedAt,
          };
        }

        if (dbSession) {
          return {
            sessionId: dbSession.id,
            status: dbSession.status,
            total: dbSession.totalAccounts,
            checked: dbSession.checkedAccounts,
            valid: dbSession.validAccounts,
            invalid: dbSession.invalidAccounts,
            errors: dbSession.errorAccounts,
            totalBalance: dbSession.totalBalance,
            recentResults: [],
            activeProxyCount: 0,
            failedProxyCount: 0,
            elapsedMs: dbSession.completedAt && dbSession.startedAt
              ? dbSession.completedAt.getTime() - dbSession.startedAt.getTime()
              : 0,
          };
        }

        return null;
      }),

    // Cancel a running session
    cancelSession: adminProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(({ input }) => {
        cancelSession(input.sessionId);
        return { success: true };
      }),

    // List all sessions
    listSessions: protectedProcedure.query(async () => {
      return listCheckSessions();
    }),

    // Get session details
    getSession: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getCheckSession(input.sessionId);
      }),

    // Delete a session
    deleteSession: adminProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCheckSession(input.sessionId);
        return { success: true };
      }),

    // Get accounts for a session (paginated)
    getAccounts: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getAccountsBySession(input.sessionId);
      }),

    // Get valid accounts for a session
    getValidAccounts: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return getValidAccountsBySession(input.sessionId);
      }),

    // Get recent results for live feed (polling)
    getRecentResults: protectedProcedure
      .input(z.object({ sessionId: z.number(), afterId: z.number().default(0) }))
      .query(async ({ input }) => {
        return getRecentResults(input.sessionId, input.afterId);
      }),

    // Export valid accounts as text
    exportValidAccounts: adminProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const accounts = await getValidAccountsBySession(input.sessionId);
        const lines = accounts.map(a =>
          `${a.email}:${a.password} | Balance: $${(a.balance ?? 0).toFixed(2)} | Verified: ${a.verified ? "YES" : "NO"} | Country: ${a.country ?? "N/A"}`
        );
        return { content: lines.join("\n"), count: accounts.length };
      }),
  }),

  // ==================== PROXY ====================
  proxy: router({
    getStats: protectedProcedure.query(async () => {
      const stats = await getProxyStats();
      return {
        stats,
        totalProxies: PROXY_LIST.length,
        activeCount: stats.filter(p => p.lastStatus === "active").length,
        failedCount: stats.filter(p => p.lastStatus === "failed").length,
      };
    }),

    getList: protectedProcedure.query(() => {
      return { proxies: PROXY_LIST, total: PROXY_LIST.length };
    }),
  }),

  // ==================== STATS ====================
  stats: router({
    getGlobal: protectedProcedure.query(async () => {
      return getGlobalStats();
    }),
  }),
});

export type AppRouter = typeof appRouter;
