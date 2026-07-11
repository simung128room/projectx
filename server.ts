
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    isAdmin?: boolean;
      // @ts-ignore - Bypass Express ip property read-only clash
    ip?: string;
  }
}
var __defProp = Object.defineProperty;
var __name = (target: any, value: any) =>
  __defProp(target, "name", { value, configurable: true });
import express from "express";
import dotenv from "dotenv";
import { LRUCache } from "lru-cache";
import Redis from "ioredis";
dotenv.config({ override: true });
import path from "path";
import cors from "cors";
import axios from "axios";
import { z } from "zod";
import { encrypt, decrypt, getEncryptionKey } from "./src/services/encryption.service.js";
import { AppError } from "./src/lib/errors.js";
axios.defaults.timeout = 15e3;
import CircuitBreaker from "opossum";
import { CookieJar } from "tough-cookie";
import crypto from "node:crypto";
import util from "node:util";
import https from "node:https";
import { HttpsProxyAgent } from "https-proxy-agent";
import rateLimit from "express-rate-limit";
import multer from "multer";
import fs from "fs";
import readline from "readline";
import os from "os";
import zlib from "zlib";
import { promisify } from "util";
import { compressStock, decompressStock } from "./src/lib/stockUtils.js";
let freeProxies: string[] = [];
let lastFreeProxyFetch = 0;
async function fetchFreeProxies() {
  if (process.env.PROXY_URL && !freeProxies.includes(process.env.PROXY_URL)) {
    freeProxies = [process.env.PROXY_URL];
  }
}
__name(fetchFreeProxies, "fetchFreeProxies");
fetchFreeProxies();
setInterval(fetchFreeProxies, 15 * 60 * 1e3);
import { adminDb as admin, supabaseAdmin, initializeAdminDb } from "./src/lib/admindb.js";
const _dirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});
const communityUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
async function uploadToSupabaseStorage(buffer: any, originalName: any, mimeType: any) {
  const isSupabaseConfigured2 = !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_URL.startsWith("http") &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
  );
  if (!isSupabaseConfigured2) {
    throw new Error("Supabase is not configured");
  }
  const fileExt = "webp"; // Hardcoded to webp for security
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
  const bucketName = "uploads";
  const { data, error } = await supabaseAdmin.storage
    .from(bucketName)
    .upload(fileName, buffer, { contentType: mimeType, upsert: true });
  if (error) {
    if (error.message && error.message.includes("Bucket not found")) {
      console.log(`[Storage] Creating bucket "${bucketName}"...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(
        bucketName,
        { public: true, fileSizeLimit: 5242880 },
      );
      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`);
      }
      const { data: retryData, error: retryError } = await supabaseAdmin.storage
        .from(bucketName)
        .upload(fileName, buffer, { contentType: mimeType, upsert: true });
      if (retryError) {
        throw retryError;
      }
    } else {
      throw error;
    }
  }
  const { data: urlData } = supabaseAdmin.storage
    .from(bucketName)
    .getPublicUrl(fileName);
  if (!urlData || !urlData.publicUrl) {
    throw new Error("Failed to get public URL");
  }
  return urlData.publicUrl;
}
__name(uploadToSupabaseStorage, "uploadToSupabaseStorage");
import compression from "compression";
import helmet from "helmet";
import sharp from "sharp";
console.log("[Server] --- Supabase VERSION REBOOT ---");
const REQUIRED_SECRETS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
for (const key of REQUIRED_SECRETS) {
  if (!process.env[key] && !process.env["VITE_" + key]) {
    console.error("[Warning] Missing recommended secret: " + key);
  }
}
async function sendAlert(title: any, message: any, color = 16711680, requestId?: any) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    const desc = requestId
      ? message +
        `
**Request ID**: ${requestId}`
      : message;
    await axios.post(webhookUrl, {
      embeds: [
        {
          title,
          description: desc,
          color,
          timestamp: new Date().toISOString(),
        },
      ],
    });
  } catch (err: any) {
    console.error("Failed to send discord alert:", err.message);
  }
}
__name(sendAlert, "sendAlert");
async function writeAuditLog(action: any, actor: any, target: any, req: any, extraContext = {}) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      actor,
      target,
      ip: req.ip || "Unknown",
      requestId: req.id || "N/A",
      ...extraContext,
    };
    await admin.firestore().collection("sys_audit_logs").add(logEntry);
  } catch (err: any) {
    console.error("[Audit Log] Failed to write audit log:", err);
  }
}
__name(writeAuditLog, "writeAuditLog");
process.on("uncaughtException", (err) => {
  console.error(
    JSON.stringify({
      level: "fatal",
      event: "uncaughtException",
      message: err.message,
      stack: err.stack,
    }),
  );
  try {
    const logPath = path.join(process.cwd(), "crash.log");
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > 5 * 1024 * 1024) {
        if (fs.existsSync(logPath + ".old")) {
          fs.unlinkSync(logPath + ".old");
        }
        fs.renameSync(logPath, logPath + ".old");
      }
    }
    fs.appendFileSync(
      logPath,
      `${new Date().toISOString()} ${err.stack}
`,
    );
  } catch (e: any) {
    console.error("Caught error:", e);
  }
      // @ts-ignore
  sendAlert(
    "Uncaught Exception \u{1F525}",
    `**Error**: ${err.message}`,
    16711680,
  ).catch((e: any) => console.error(e));
});
process.on("unhandledRejection", (reason, promise) => {
  console.error(
    JSON.stringify({
      level: "error",
      event: "unhandledRejection",
      reason: String(reason),
    }),
  );
      // @ts-ignore
  sendAlert(
    "Unhandled Rejection \u26A0\uFE0F",
    `**Reason**: ${String(reason)}`,
    16711680,
  );
});
import client from "prom-client";
const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });
const httpRequestDurationMicroseconds = new client.Histogram({
  name: "http_request_duration_ms",
  help: "Duration of HTTP requests in ms",
  labelNames: ["method", "route", "code"],
  buckets: [10, 50, 100, 300, 500, 1e3, 3e3, 5e3],
});
const dbQueryDurationMicroseconds = new client.Histogram({
  name: "db_query_duration_ms",
  help: "Duration of Database queries in ms",
  labelNames: ["collection", "operation"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1e3],
});
app.use((req, res, next) => {
  const start = Date.now();
  req.id = crypto.randomUUID();
  res.setHeader("X-Request-ID", req.id);
  res.on("finish", () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    if (
      route.startsWith("/api/") ||
      route === "/metrics" ||
      route === "/ready"
    ) {
      httpRequestDurationMicroseconds
        .labels(req.method, route, res.statusCode.toString())
        .observe(duration);
    }
  });
  next();
});
app.get("/metrics", async (req, res) => {
  const metricsToken = process.env.METRICS_TOKEN;
  if (!metricsToken || req.headers["x-metrics-token"] !== metricsToken) {
    return res.status(401).send("Unauthorized");
  }
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString("base64");
  res.locals.cspNonce = nonce;
  const originalSend = res.send;
  res.send = function (body) {
    if (typeof body === "string" && body.includes("<html")) {
      const updatedBody = body.replace(
        /<script(?!\s+nonce\b)/gi,
        `<script nonce="${nonce}"`,
      );
      return originalSend.call(this, updatedBody);
    }
    return originalSend.call(this, body);
  };
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
      // @ts-ignore
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
          "https://www.youtube.com",
          "https://s.ytimg.com",
          "https://unpkg.com",
          "https://va.vercel-scripts.com",
        ],
        styleSrc: process.env.NODE_ENV === "production" ? ["'self'", "https://fonts.googleapis.com"] : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:"],
        mediaSrc: ["'self'", "https:"],
        connectSrc: [
          "'self'",
          "https://*.supabase.co",
          "https://api.ipify.org",
          "wss://*.supabase.co",
          ...(process.env.NODE_ENV === "production" ? [] : ["ws:", "wss:"]),
        ],
        frameSrc: [
          "'self'",
          "https://www.youtube.com",
          "https://discord.com",
          "https://www.youtube-nocookie.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(compression());
app.set("trust proxy", 1);
const PORT = 3e3;
import { pinoHttp } from "pino-http";
import pino from "pino";
import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { monitorEventLoopDelay } from "node:perf_hooks";
const asyncLocalStorage = new AsyncLocalStorage();
const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  formatters: {
    level: __name((label: any) => {
      return { level: label };
    }, "level"),
  },
  mixin() {
    const store = asyncLocalStorage.getStore();
      // @ts-ignore
    return { requestId: store?.get("requestId") };
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
const eldHistogram = monitorEventLoopDelay({ resolution: 20 });
eldHistogram.enable();
let currentConcurrentRequests = 0;
let dynamicMaxConcurrency = process.env.INITIAL_CONCURRENT_REQUESTS
  ? parseInt(process.env.INITIAL_CONCURRENT_REQUESTS)
  : 800;
const ABSOLUTE_MAX_CONCURRENCY = 2e3;
const MIN_CONCURRENCY = 50;
let shedCount = 0;
const activeRequests = new Map();
setInterval(() => {
  const lagMs = eldHistogram.mean / 1e6;
  if (lagMs > 100) {
    dynamicMaxConcurrency = Math.max(
      MIN_CONCURRENCY,
      Math.floor(dynamicMaxConcurrency * 0.8),
    );
  } else if (
    lagMs < 40 &&
    currentConcurrentRequests >= dynamicMaxConcurrency * 0.7
  ) {
    dynamicMaxConcurrency = Math.min(
      ABSOLUTE_MAX_CONCURRENCY,
      dynamicMaxConcurrency + 50,
    );
  }
  const mem = process.memoryUsage();
  logger.info(
    {
      eventLoopLagMaxMs: eldHistogram.max / 1e6,
      eventLoopLagMeanMs: Math.round(lagMs),
      dynamicMaxConcurrency,
      currentConcurrentRequests,
      shedCount,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      // @ts-ignore
      activeHandles: process._getActiveHandles().length,
    },
    "System Health & Adaptive Concurrency Tick",
  );
  shedCount = 0;
  eldHistogram.reset();
}, 1e4).unref();
setInterval(() => {
  const now = Date.now();
  for (const [id, reqData] of activeRequests.entries()) {
    const duration = now - reqData.start;
    if (duration > 5e3) {
      logger.warn(
        {
          requestId: id,
          url: reqData.url,
          method: reqData.method,
          durationMs: duration,
        },
        "Slow Request Watchdog \u26A0\uFE0F: Request hanging",
      );
    }
  }
}, 5e3).unref();
app.use((req, res, next) => {
  const isPriorityRoute =
    req.url?.includes("/health") ||
    req.url?.includes("/live") ||
    req.url?.includes("/ready") ||
    req.url?.includes("/api/stats");
  let requestPriority = 0;
  if (req.url?.includes("/api/purchases") || req.url?.includes("/api/topups")) {
    requestPriority = 2;
  } else if (req.url?.includes("/api/users") || req.url?.includes("/admin")) {
    requestPriority = 1;
  }
  let shouldShed = false;
  const capacityRatio = currentConcurrentRequests / dynamicMaxConcurrency;
  if (!isPriorityRoute) {
    if (capacityRatio >= 1 && requestPriority < 2) {
      shouldShed = true;
    } else if (capacityRatio >= 0.9 && requestPriority < 1) {
      shouldShed = true;
    } else if (capacityRatio >= 1.1) {
      shouldShed = true;
    }
  }
  if (shouldShed) {
    shedCount++;
    res.setHeader("Retry-After", "2");
    logger.warn(
      {
        currentConcurrentRequests,
        dynamicMaxConcurrency,
        priority: requestPriority,
        url: req.url,
      },
      "Load Shedding Active - Dropping Request",
    );
    return res.status(503).json({ error: "Service Unavailable (High Load)" });
  }
  currentConcurrentRequests++;
  const requestId =
    req.headers["x-request-id"] || req.headers["cf-ray"] || randomUUID();
  req.id = requestId;
  res.setHeader("X-Request-ID", requestId);
  activeRequests.set(requestId, {
    start: Date.now(),
    url: req.url || "unknown",
    method: req.method,
  });
  let decremented = false;
  const releaseConcurrency = __name(() => {
    if (!decremented) {
      currentConcurrentRequests--;
      decremented = true;
      activeRequests.delete(requestId);
    }
  }, "releaseConcurrency");
  res.once("finish", releaseConcurrency);
  res.once("close", releaseConcurrency);
  const store = new Map();
  store.set("requestId", requestId);
  asyncLocalStorage.run(store, () => {
    next();
  });
});
app.use(
  pinoHttp({
    logger,
    customProps: __name((req: any, res: any) => {
      return {};
    }, "customProps"),
    useLevel: "info",
    quietReqLogger: true,
    autoLogging: {
      ignore: __name((req: any) => {
        const url = req.url || "";
        return (
          url.includes("/health") ||
          url.includes("/live") ||
          url.includes("/ready") ||
          !url.startsWith("/api/")
        );
      }, "ignore"),
    },
  }),
);
app.get("/robots.txt", (req, res) => {
  const robotsPath = path.join(process.cwd(), "public", "robots.txt");
  if (fs.existsSync(robotsPath)) {
    res.type("text/plain");
    res.sendFile(robotsPath);
  } else {
    res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: https://www.sainamyuni.xyz/sitemap.xml");
  }
});

app.get("/sitemap.xml", (req, res) => {
  const sitemapPath = path.join(process.cwd(), "public", "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    res.type("application/xml");
    res.sendFile(sitemapPath);
  } else {
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.sainamyuni.xyz/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.sainamyuni.xyz/categories</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  }
});

app.get("/health", async (req, res) => {
  const used = process.memoryUsage();
  if (used.heapUsed / used.heapTotal > 0.9) {
      // @ts-ignore
    sendAlert(
      "High Memory Usage \u26A0\uFE0F",
      `Heap is at ${Math.round((used.heapUsed / used.heapTotal) * 100)}% (${Math.round(used.heapUsed / 1024 / 1024)}MB)`,
      16753920,
    ).catch((e: any) => console.error(e));
  }
  res.json({
    status: "ok",
    uptime: process.uptime(),
    memory: used,
    metrics: {
      concurrentRequests: currentConcurrentRequests,
      eventLoopLag: eldHistogram.mean / 1e6,
    },
  });
});
app.get("/live", (req, res) => res.json({ status: "alive" }));
app.get("/ready", async (req, res) => {
  try {
    const firestorePromise = admin
      .firestore()
      .collection("products")
      .limit(1)
      .get();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firestore Connection Timeout")), 15e3),
    );
    await Promise.race([firestorePromise, timeoutPromise]);
    res.json({
      status: "ready",
      uptime: process.uptime(),
      sheddingMetrics: { currentConcurrentRequests },
    });
  } catch (err: any) {
    logger.error(
      { err: err.message },
      "Readiness Probe Failed: Database disconnected or slow",
    );
    res.status(503).json({ status: "not ready", error: String(err) });
  }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: {
    error:
      "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22 \u0E04\u0E38\u0E13\u0E17\u0E33\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E1A\u0E48\u0E2D\u0E22\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48",
  },
  handler: __name((req: any, res: any, next: any, options: any) => {
    sendAlert(
      "Auth Rate Limit Triggered \u{1F6A8}",
      `**IP**: ${req.ip}
**User**: ${req.user?.uid || "guest"}
**Path**: ${req.originalUrl}
**Method**: ${req.method}`,
      16711680,
      req.id,
    );
    res
      .status(options.statusCode || 429)
      .json({ ...options.message, requestId: req.id });
  }, "handler"),
});
const mutationLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: {
    error:
      "\u0E04\u0E38\u0E13\u0E14\u0E33\u0E40\u0E19\u0E34\u0E19\u0E01\u0E32\u0E23\u0E1A\u0E32\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E40\u0E23\u0E47\u0E27\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48",
  },
  handler: __name((req: any, res: any, next: any, options: any) => {
    sendAlert(
      "Mutation Rate Limit Triggered \u26A0\uFE0F",
      `**IP**: ${req.ip}
**User**: ${req.user?.uid || "guest"}
**Path**: ${req.originalUrl}
**Method**: ${req.method}`,
      16753920,
      req.id,
    );
    res
      .status(options.statusCode || 429)
      .json({ ...options.message, requestId: req.id });
  }, "handler"),
});
const checkLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: {
    error:
      "\u0E02\u0E2D\u0E2D\u0E20\u0E31\u0E22 \u0E04\u0E38\u0E13\u0E2A\u0E48\u0E07\u0E04\u0E33\u0E23\u0E49\u0E2D\u0E07\u0E02\u0E2D\u0E40\u0E22\u0E2D\u0E30\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B (Anti-Bot Protection) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48",
  },
  handler: __name((req: any, res: any, next: any, options: any) => {
    res
      .status(options.statusCode || 429)
      .json({ ...options.message, requestId: req.id });
  }, "handler"),
});
const discordLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: "Too many requests to Discord integration." },
});
const safeCompare = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};
const uploadLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: "Too many uploads, please wait." },
});
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true },
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", globalLimiter);
const userTokenCache = new LRUCache({ max: 1e3, ttl: 6e4 });
const uidToTokens = new LRUCache<string, Set<string>>({ max: 5e3, ttl: 864e5 });
const invalidateUserTokenCache = __name((uid: any) => {
  const tokens = uidToTokens.get(uid);
  if (tokens) {
    for (const t of tokens) {
      userTokenCache.delete(t);
    }
    uidToTokens.delete(uid);
  }
  for (const [token, cached] of userTokenCache.entries()) {
      // @ts-ignore
    if (!(cached instanceof Promise) && cached.user?.id === uid) {
      userTokenCache.delete(token);
    }
  }
}, "invalidateUserTokenCache");
const injectUser = __name(async (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split("Bearer ")[1]?.trim();
    if (token && token !== "null" && token !== "undefined") {
      const now = Date.now();
      const cached = userTokenCache.get(token) as any;
      if (cached) {
        if (now - cached.timestamp < 6e4) {
          req.user = cached.user;
          req.isAdmin = cached.isAdmin;
          if (cached.user && cached.user.id) {
            const uidStr = cached.user.id;
            if (!uidToTokens.has(uidStr)) {
              uidToTokens.set(uidStr, new Set());
            }
            const userTokens = uidToTokens.get(uidStr);
            if (userTokens) userTokens.add(token);
          }
          return next();
        }
      }
      const resolveAuth = __name(async () => {
        let userObj: any = null;
        let isAdminObj = false;
        const {
          data: { user },
          error,
        } = await supabaseAdmin.auth.getUser(token);
        if (error) throw error;
        if (user) {
          userObj = user;
          userObj.uid = user.id;
          let adminEmails = [];
          if (process.env.ADMIN_EMAILS) {
            adminEmails = process.env.ADMIN_EMAILS.split(",").map((e: any) =>
              e.trim().toLowerCase(),
            );
          }
          if (adminEmails.includes((user.email || "").toLowerCase().trim())) {
            isAdminObj = true;
          } else {
            const adminDoc = await admin
              .firestore()
              .collection("admins")
              .doc(user.id)
              .get();
            isAdminObj = !!adminDoc.exists;
          }
        }
        return { user: userObj, isAdmin: isAdminObj, timestamp: Date.now() };
      }, "resolveAuth");

      if (!(global as any).userTokenPromiseCache) (global as any).userTokenPromiseCache = new Map();
      let authPromise = (global as any).userTokenPromiseCache.get(token);
      if (!authPromise) {
        authPromise = resolveAuth();
        (global as any).userTokenPromiseCache.set(token, authPromise);
      }

      try {
        const result = await authPromise;
        (global as any).userTokenPromiseCache.delete(token);
        userTokenCache.set(token, result);
        if (result.user) {
          req.user = result.user;
          req.isAdmin = result.isAdmin;
          if (result.user.id) {
            const uidStr = result.user.id;
            if (!uidToTokens.has(uidStr)) {
              uidToTokens.set(uidStr, new Set());
            }
            const userTokens = uidToTokens.get(uidStr);
            if (userTokens) userTokens.add(token);
          }
        }
      } catch (error: any) {
        (global as any).userTokenPromiseCache.delete(token);
        userTokenCache.delete(token);

        const status = error?.status;
        const code = error?.code;
        const msg = error?.message ? String(error.message).toLowerCase() : "";
        const codeStr = code ? String(code).toLowerCase() : "";

        // Check if it is a standard expired token error (robust matching on code and message)
        const isExpired = status === 401 && (codeStr.includes("expired") || msg.includes("expired"));

        // Keywords indicating authentication token issues
        const hasAuthKeywords =
          codeStr.includes("invalid") ||
          codeStr.includes("jwt") ||
          codeStr.includes("signature") ||
          codeStr.includes("session") ||
          msg.includes("invalid") ||
          msg.includes("jwt") ||
          msg.includes("signature") ||
          msg.includes("token") ||
          msg.includes("expired");

        // Check if it is an invalid client authentication error.
        // 401 is standard for invalid/expired credentials.
        // For status 400, we only treat it as an auth error if it contains clear token invalidation keywords
        // to prevent false positives (e.g. temporary malformed requests or other API issues).
        const isAuthError =
          status === 401 ||
          (status === 400 && hasAuthKeywords) ||
          (!status && hasAuthKeywords);

        if (isExpired) {
          return res.status(401).json({ error: "Token expired" });
        } else if (isAuthError) {
          console.error(
            "Error verifying ID token in injectUser:",
            error.message || error,
          );
          return res.status(401).json({ error: "Invalid token" });
        } else {
          console.error("Upstream or temporary error verifying ID token:", error.message || error);
          // Fail-soft: continue as guest for non-auth errors (and do not cache this fail-soft result)
        }
      }
    }
  }
  next();
}, "injectUser");
const requireAuth = __name(async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ error: "Unauthorized: Missing or invalid token" });
  }
  next();
}, "requireAuth");
const requireAdmin = __name(async (req: any, res: any, next: any) => {
  if (!req.user || !req.isAdmin) {
    console.error(
      `[AdminCheck] Access Denied for ${req.user?.email || "Unknown"}. isAdmin: ${req.isAdmin}`,
    );
    return res
      .status(403)
      .json({ error: "Forbidden: Admin access required. Please re-login." });
  }
  next();
}, "requireAdmin");
import healthRoute from "./src/routes/health.route.js";
app.use("/api", healthRoute);
const rawOrigins: string[] = [];
if (process.env.ALLOWED_ORIGINS) {
  const splitOrigins = process.env.ALLOWED_ORIGINS.split(",")
    .map((url) => url.trim())
    .filter(Boolean);
  splitOrigins.forEach((origin) => {
    if (!rawOrigins.includes(origin)) {
      rawOrigins.push(origin);
    }
  });
}
if (process.env.ALLOW_LOCALHOST === "true") {
  rawOrigins.push("http://localhost:3000");
}
let corsOrigins: boolean | string[] = rawOrigins;
if (rawOrigins.length === 0) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: ALLOWED_ORIGINS must be set in production.");
    process.exit(1);
  }
  corsOrigins = true;
}
const corsOptions = { origin: corsOrigins, credentials: true };
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    const publicGetRoutes = [
      "/api/products",
      "/api/categories",
      "/api/pages",
      "/api/stats",
      "/api/settings",
    ];
    if (req.method === "GET" && publicGetRoutes.includes(req.path)) {
    } else {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    }
  }
  next();
});
app.use(injectUser);
const isImageSafe = __name((buffer: any) => {
  if (buffer.length < 4) return false;
  const hex = buffer.toString("hex", 0, 4).toUpperCase();
  const isJpeg = hex.startsWith("FFD8FF");
  const isPng = hex.startsWith("89504E47");
  const isGif = hex.startsWith("47494638");
  const isWebp =
    hex.startsWith("52494646") &&
    buffer.toString("hex", 8, 12).toUpperCase() === "57454250";
  if (!(isJpeg || isPng || isGif || isWebp)) return false;
  const bufferString = buffer.toString(
    "utf8",
    0,
    Math.min(buffer.length, 8192),
  );
  const dangerousPatterns = [
    /<\?php/i,
    /<script/i,
    /<\/script/i,
    /<\s*html/i,
    /<\s*body/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /proc_open/i,
    /shell_exec/i,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(bufferString)) {
      return false;
    }
  }
  return true;
}, "isImageSafe");
const validateUploadFileMetadata = __name((file: any) => {
  if (!file) return false;
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return (
    allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)
  );
}, "validateUploadFileMetadata");
app.post(
  "/api/upload",
  requireAdmin,
  (req: any, res: any, next: any) => {
    upload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ error: "Upload failed: " + err.message });
      }
      next();
    });
  },
  async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (
      !validateUploadFileMetadata(req.file) ||
      !isImageSafe(req.file.buffer)
    ) {
      sendAlert(
        "Unsafe Upload Attempt (Admin) \u26A0\uFE0F",
        `**IP**: ${req.ip}
**User**: ${req.user?.uid || "guest"}`,
        16753920,
        req.id,
      );
      return res
        .status(400)
        .json({ error: "Invalid file type. Only secure images allowed." });
    }
    try {
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();
      const sanitizedBuffer = await image.webp({ quality: 80 }).toBuffer();
      const mimeType = "image/webp";
      if (sanitizedBuffer.length > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({
            error:
              "Output image size exceeds limit after re-encoding (Max 5MB)",
          });
      }
      let fileUrl;
      try {
        fileUrl = await uploadToSupabaseStorage(
          sanitizedBuffer,
          req.file.originalname,
          mimeType,
        );
        console.log("[Storage] Successfully uploaded to Supabase:", fileUrl);
      } catch (uploadErr: any) {
        console.warn(
          "[Storage] Supabase upload failed, falling back to base64:",
          uploadErr.message || uploadErr,
        );
        const base64Data = sanitizedBuffer.toString("base64");
        fileUrl = `data:${mimeType};base64,${base64Data}`;
      }
      res.json({ url: fileUrl });
    } catch (err: any) {
      console.error("Image processing failed:", err);
      res.status(500).json({ error: "Failed to process image" });
    }
  },
);
app.post(
  "/api/community/upload",
  uploadLimiter,
  requireAuth,
  (req: any, res: any, next: any) => {
    communityUpload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("Multer error:", err);
        return res.status(500).json({ error: "Upload failed: " + err.message });
      }
      next();
    });
  },
  async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    if (
      !validateUploadFileMetadata(req.file) ||
      !isImageSafe(req.file.buffer)
    ) {
      sendAlert(
        "Unsafe Upload Attempt (Community) \u26A0\uFE0F",
        `**IP**: ${req.ip}
**User**: ${req.user?.uid || "guest"}`,
        16753920,
        req.id,
      );
      return res
        .status(400)
        .json({ error: "Invalid file type. Only secure images allowed." });
    }
    try {
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();
      const sanitizedBuffer = await image.webp({ quality: 80 }).toBuffer();
      const mimeType = "image/webp";
      if (sanitizedBuffer.length > 5 * 1024 * 1024) {
        return res
          .status(400)
          .json({
            error:
              "Output image size exceeds limit after re-encoding (Max 5MB)",
          });
      }
      let fileUrl;
      try {
        fileUrl = await uploadToSupabaseStorage(
          sanitizedBuffer,
          req.file.originalname,
          mimeType,
        );
        console.log(
          "[Storage] Successfully uploaded community image to Supabase:",
          fileUrl,
        );
      } catch (uploadErr: any) {
        console.warn(
          "[Storage] Supabase upload failed, falling back to base64:",
          uploadErr.message || uploadErr,
        );
        const base64Data = sanitizedBuffer.toString("base64");
        fileUrl = `data:${mimeType};base64,${base64Data}`;
      }
      res.json({ url: fileUrl });
    } catch (err: any) {
      console.error("Image processing failed:", err);
      res.status(500).json({ error: "Failed to process image" });
    }
  },
);
let lastStatsFetch = 0;
let cachedStats: any = null;
const invalidateStatsCache = __name(() => {
  lastStatsFetch = 0;
  cachedStats = null;
  cacheRevisionCounter++;
}, "invalidateStatsCache");
let siteSettings: any = {
  site_name: process.env.SITE_NAME || "STORETH",
  truewallet_phone: process.env.TRUEWALLET_PHONE || "",
  contact_line: process.env.CONTACT_LINE || "",
  discord_link: "",
  facebook_link: "",
  instagram_link: "",
  contact_email: "support.apexstoreth@gmail.com",
  stats_users_offset: 0,
  stats_sales_offset: 0,
  popup_img_url:
    "https://img2.pic.in.th/Red-Black-White-Anime-Podcast-Discord-Logocc6d3bfe807340af.png",
  popup_enabled: true,
  popup_link: "",
  banners: ["https://img2.pic.in.th/-71_20260516210303.png"],
  spotify_url: "https://youtu.be/WczSfh3gJaU?si=PI1i4X0p0FGbdEfq",
  spotify_autoplay: true,
  proxies: process.env.DEFAULT_PROXY_URL ? [process.env.DEFAULT_PROXY_URL] : [],
  auto_proxy: true,
  bank_name: "",
  bank_account_number: "",
  bank_account_holder: "",
  bank_qr_image: "",
};
const isSupabaseConfigured = !!(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL.startsWith("http") &&
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)
);
if (isSupabaseConfigured) {
  const docName =
    process.env.NODE_ENV === "production" ? "sys_site" : "sys_site_dev";
  const loadSiteSettings = __name(async () => {
    try {
      const { data } = await supabaseAdmin
        .from("custom_pages")
        .select("*")
        .eq("slug", docName)
        .single();
      if (data && data.content) {
        let parsed = {};
        try {
          parsed = JSON.parse(data.content);
        } catch (e: any) {
          console.error("Caught error:", e);
        }
        siteSettings = { ...siteSettings, ...parsed };
      }
    } catch (err: any) {
      console.error("Caught error:", err);
    }
  }, "loadSiteSettings");
  try {
    await loadSiteSettings();
    console.log("Loaded initial site settings from DB", siteSettings);
    setInterval(loadSiteSettings, 1e4);
  } catch (err: any) {
    console.warn(
      "Could not load initial site settings from DB (might not exist yet).",
      (err as any).message || err,
    );
  }
} else {
  console.log(
    "Skipping site settings loading from Supabase: Supabase is not configured.",
  );
}
app.get("/api/settings", injectUser, (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  if (req.isAdmin) {
    return res.json(siteSettings);
  }
  const {
    truewallet_phone,
    proxies,
    auto_proxy,
    bank_account_number,
    bank_account_holder,
    bank_qr_image,
    ...publicSettings
  } = siteSettings || {};
  res.json(publicSettings);
});
app.post("/api/admin/migrate-encryption", requireAdmin, async (req, res, next) => {
  next();
});
app.post("/api/settings", requireAdmin, async (req, res) => {
  console.log("=== POST /api/settings REACHED ===", req.body);
  const beforeLogs: Record<string, any> = {
    stats_users_override: siteSettings.stats_users_override,
    stats_sales_override: siteSettings.stats_sales_override,
    stats_stock_override: siteSettings.stats_stock_override,
    stats_categories_override: siteSettings.stats_categories_override,
  };
  const {
    truewallet_phone,
    site_name,
    contact_line,
    stats_users_offset,
    stats_sales_offset,
    stats_categories_offset,
    stats_stock_offset,
    stats_users_override,
    stats_stock_override,
    stats_sales_override,
    stats_categories_override,
    stats_users_target,
    stats_users_type,
    stats_sales_target,
    stats_sales_type,
    stats_stock_target,
    stats_stock_type,
    popup_img_url,
    popup_enabled,
    popup_link,
    banners,
    proxies,
    auto_proxy,
    spotify_url,
    spotify_autoplay,
  } = req.body;
  if (truewallet_phone !== void 0)
    siteSettings.truewallet_phone = truewallet_phone;
  if (site_name !== void 0) siteSettings.site_name = site_name;
  if (contact_line !== void 0) siteSettings.contact_line = contact_line;
  let realUsersCount = (await getCachedCollection("users", 60000)).length;
  let realSales = 0;
  try {
    const { data: pData, error: pError } = await supabaseAdmin
      .from("purchases")
      .select("price");
    if (!pError && pData) {
      for (const p of pData) realSales += Number(p.price) || 0;
    } else {
      const purchases = await getCachedCollection("purchases", 6e4);
      purchases.forEach((p: any) => (realSales += Number(p.price) || 0));
    }
  } catch (e: any) {
    console.error("Caught error:", e);
  }
  let realStock = 0;
  try {
    const pData = await getCachedCollection("products", 3e5);
    pData.forEach((p: any) => {
      if (p.stock > 0 && p.stock < 999999) realStock += Number(p.stock);
    });
  } catch (e: any) {
    console.error("Caught error:", e);
  }
  if (stats_users_target !== void 0 && stats_users_type !== void 0) {
    const target = parseInt(stats_users_target) || 0;
    if (stats_users_type === "override") {
      siteSettings.stats_users_override = target;
      siteSettings.stats_users_offset = 0;
    } else {
      siteSettings.stats_users_override = null;
      siteSettings.stats_users_offset = Math.max(0, target - realUsersCount);
    }
  } else {
    if (stats_users_offset !== void 0)
      siteSettings.stats_users_offset = parseInt(stats_users_offset) || 0;
    if (stats_users_override !== void 0)
      siteSettings.stats_users_override =
        stats_users_override === null || isNaN(parseInt(stats_users_override))
          ? null
          : parseInt(stats_users_override);
  }
  if (stats_sales_target !== void 0 && stats_sales_type !== void 0) {
    const target = parseInt(stats_sales_target) || 0;
    if (stats_sales_type === "override") {
      siteSettings.stats_sales_override = target;
      siteSettings.stats_sales_offset = 0;
    } else {
      siteSettings.stats_sales_override = null;
      siteSettings.stats_sales_offset = Math.max(0, target - realSales);
    }
  } else {
    if (stats_sales_offset !== void 0)
      siteSettings.stats_sales_offset = parseInt(stats_sales_offset) || 0;
    if (stats_sales_override !== void 0)
      siteSettings.stats_sales_override =
        stats_sales_override === null || isNaN(parseInt(stats_sales_override))
          ? null
          : parseInt(stats_sales_override);
  }
  if (stats_stock_target !== void 0 && stats_stock_type !== void 0) {
    const target = parseInt(stats_stock_target) || 0;
    if (stats_stock_type === "override") {
      siteSettings.stats_stock_override = target;
      siteSettings.stats_stock_offset = 0;
    } else {
      siteSettings.stats_stock_override = null;
      siteSettings.stats_stock_offset = Math.max(0, target - realStock);
    }
  } else {
    if (stats_stock_offset !== void 0)
      siteSettings.stats_stock_offset = parseInt(stats_stock_offset) || 0;
    if (stats_stock_override !== void 0)
      siteSettings.stats_stock_override =
        stats_stock_override === null || isNaN(parseInt(stats_stock_override))
          ? null
          : parseInt(stats_stock_override);
  }
  if (stats_categories_offset !== void 0)
    siteSettings.stats_categories_offset =
      parseInt(stats_categories_offset) || 0;
  if (stats_categories_override !== void 0)
    siteSettings.stats_categories_override =
      stats_categories_override === null ||
      isNaN(parseInt(stats_categories_override))
        ? null
        : parseInt(stats_categories_override);
  if (popup_img_url !== void 0) siteSettings.popup_img_url = popup_img_url;
  if (popup_enabled !== void 0)
    siteSettings.popup_enabled =
      popup_enabled === "true" || popup_enabled === true;
  if (popup_link !== void 0) siteSettings.popup_link = popup_link;
  if (banners !== void 0) siteSettings.banners = banners;
  if (proxies !== void 0) siteSettings.proxies = proxies;
  if (auto_proxy !== void 0)
    siteSettings.auto_proxy = auto_proxy === "true" || auto_proxy === true;
  if (spotify_url !== void 0) siteSettings.spotify_url = spotify_url;
  if (spotify_autoplay !== void 0)
    siteSettings.spotify_autoplay =
      spotify_autoplay === "true" || spotify_autoplay === true;
  if (req.body.bank_name !== void 0)
    siteSettings.bank_name = req.body.bank_name;
  if (req.body.bank_account_number !== void 0)
    siteSettings.bank_account_number = req.body.bank_account_number;
  if (req.body.bank_account_holder !== void 0)
    siteSettings.bank_account_holder = req.body.bank_account_holder;
  if (req.body.bank_qr_image !== void 0)
    siteSettings.bank_qr_image = req.body.bank_qr_image;
  invalidateStatsCache();
  try {
    const docName =
      process.env.NODE_ENV === "production" ? "sys_site" : "sys_site_dev";
    console.log(`[Settings] Attempting to save to DB doc: ${docName}`);
    const payload = {
      slug: docName,
      title: "System Settings",
      content: JSON.stringify(siteSettings),
    };
    const { data: existing } = await supabaseAdmin
      .from("custom_pages")
      .select("id")
      .eq("slug", docName)
      .single();
    if (existing && existing.id) {
      await supabaseAdmin
        .from("custom_pages")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("custom_pages").insert([payload]);
    }
    console.log(`[Settings] Save Successful for ${docName}`);
  } catch (e: any) {
    console.error("[API/Settings] CRITICAL SAVE ERROR:", e);
    const errorDetail = (e as any)?.message || (e as any)?.details || JSON.stringify(e);
    return res
      .status(500)
      .json({
        error: "Failed to save settings to database",
        detail: errorDetail,
        doc:
          process.env.NODE_ENV === "production" ? "sys_site" : "sys_site_dev",
      });
  }
  const afterLogs: Record<string, any> = {
    stats_users_override: siteSettings.stats_users_override,
    stats_sales_override: siteSettings.stats_sales_override,
    stats_stock_override: siteSettings.stats_stock_override,
    stats_categories_override: siteSettings.stats_categories_override,
  };
  const changes: Record<string, any> = {};
  let hasChanges = false;
  for (const key of Object.keys(beforeLogs)) {
    if (beforeLogs[key] !== afterLogs[key]) {
      changes[key] = { before: beforeLogs[key], after: afterLogs[key] };
      hasChanges = true;
    }
  }
  if (hasChanges) {
    const actorId = req.user?.uid || req.user?.id || "unknown";
    const actorEmail = req.user?.email || "unknown";
    const auditLog = {
      type: "stats_override_changed",
      actorId,
      actorEmail,
      timestamp: new Date().toISOString(),
      changes,
    };
    logger.info(auditLog, `[Audit] Stats override changed by ${actorEmail}`);
    try {
      await admin.firestore().collection("audit_logs").add(auditLog);
    } catch (err: any) {
      logger.error(
        { err: err.message },
        "Failed to save audit log to Firestore",
      );
    }
  }
  const safeSettings = { ...siteSettings };
  if (safeSettings.proxies)
    safeSettings.proxies = safeSettings.proxies.map((p: any) =>
      p.replace(/\/\/.*@/, "//***:***@"),
    );
  console.log(`[Settings] Updated:`, safeSettings);
  writeAuditLog(
    "SITE_SETTINGS_UPDATE",
    req.user?.uid || "admin",
    "sys_settings",
    req,
  );
  return res.json({ success: true, settings: siteSettings });
});
const topupLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false },
});
app.post(
  "/api/topup/truemoney",
  topupLimiter,
  requireAuth,
  async (req, res, next) => {
    next();
  }
);
const turnstileCache = new Map();
app.post("/api/check", checkLimiter, requireAuth, async (req, res) => {
  return res
    .status(410)
    .json({
      success: false,
      error:
        "\u0E23\u0E30\u0E1A\u0E1A\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E19\u0E35\u0E49\u0E16\u0E39\u0E01\u0E1B\u0E34\u0E14\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E16\u0E32\u0E27\u0E23\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E1B\u0E25\u0E2D\u0E14\u0E20\u0E31\u0E22",
    });
});
let redis: any = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: __name((times: number) => {
        if (times > 5) {
          console.warn(
            "Redis reconnect exhausted, relying fully on memory cache.",
          );
          return null;
        }
        return Math.min(times * 100, 3e3);
      }, "retryStrategy"),
      commandTimeout: 2e3,
    });
    redis.on("connect", () => console.log("Redis connected successfully"));
    redis.on("error", (err: any) =>
      console.error("Redis connection error (falling back to memory):", err),
    );
  } catch (e: any) {
    console.error("Failed to initialize Redis:", e);
  }
}
const memoryCache = new LRUCache({
  max: 100,
  ttl: 1e3 * 60,
  updateAgeOnGet: false,
});
const inflightRequests = new Map();
let cacheRevisionCounter = 0;
      // @ts-ignore
const dbReadBreaker = new CircuitBreaker(async (action) => await action(), {
  timeout: 2e4,
  errorThresholdPercentage: 50,
  resetTimeout: 1e4,
});
dbReadBreaker.fallback(() => {
  throw new Error("Database read circuit breaker open or timeout");
});
async function findPurchaseByLicenseKey(key: any) {
  const cleanKey = key.trim();
  if (!cleanKey) return null;
  try {
    const adminDb = admin.firestore();
    const hash = crypto.createHash("sha256").update(cleanKey).digest("hex");
    const querySnapshot = await adminDb
      .collection("purchases")
      .where("licenseKeyHashes", "array-contains", hash)
      .get();
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      let secret = data.secretData || "";
      if (secret.startsWith("enc:") || secret.startsWith("enc2:")) {
        secret = await decrypt(secret);
      }
      return { id: doc.id, ...data, secretData: secret };
    }
  } catch (err: any) {
    console.error("Error finding purchase by license key (Discord):", err);
  }
  return null;
}
__name(findPurchaseByLicenseKey, "findPurchaseByLicenseKey");
async function findPurchaseByWebClaimKey(key: any) {
  const cleanKey = key.trim();
  if (!cleanKey) return null;
  try {
    const adminDb = admin.firestore();
    const hash = crypto.createHash("sha256").update(cleanKey).digest("hex");
    const querySnapshot = await adminDb
      .collection("purchases")
      .where("licenseKeyHashes", "array-contains", hash)
      .get();
    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.webClaimed) continue;
        let secret = data.secretData || "";
        if (secret.startsWith("enc:") || secret.startsWith("enc2:")) {
          secret = await decrypt(secret);
        }
        return { id: doc.id, ...data, secretData: secret };
      }
    }
  } catch (err: any) {
    console.error("Error finding purchase by claim key (Web):", err);
  }
  return null;
}
__name(findPurchaseByWebClaimKey, "findPurchaseByWebClaimKey");
const getCachedCollection = __name(
  async (collectionName: any, ttl = 2e4, res?: any, req?: any) => {
    const now = Date.now();
    let cacheHit = false;
    let cachedData: any = void 0;
    const redisKey = `cache:${collectionName}`;
    if (redis && redis.status === "ready") {
      try {
        const redisData = await redis.get(redisKey);
        if (redisData) {
          cachedData = JSON.parse(redisData);
          cacheHit = true;
        }
      } catch (err: any) {
        console.warn("Redis get error, falling back to memory layer", err);
      }
    }
    if (!cachedData) {
      cachedData = memoryCache.get(collectionName);
      if (cachedData && now - cachedData.timestamp < ttl) {
        cacheHit = true;
      } else {
        cachedData = void 0;
      }
    }
    if (!cachedData) {
      if (inflightRequests.has(collectionName)) {
        cacheHit = true;
        cachedData = await inflightRequests.get(collectionName);
      } else {
        const fetchRevisionBeforeStart = cacheRevisionCounter;
        const fetchPromise = (async () => {
          const fetchFromDB = __name(async () => {
            let query = admin.firestore().collection(collectionName);
            if (collectionName === "products") {
              query = query.select(
                "id",
                "name",
                "price",
                "originalPrice",
                "stock",
                "description",
                "image",
                "imageUrl",
                "category",
                "isHighlight",
                "isPopular",
                "soldCount",
                "tag",
                "customPageId",
                "created_at",
                "_version",
                "isDeleted",
                "isPreOrder",
              );
            }
            if (
              collectionName === "products" ||
              collectionName === "purchases" ||
              collectionName === "topups" ||
              collectionName === "license_keys" ||
              collectionName === "users"
            ) {
              query = query.limit(1e3);
            }
            const dbMetricStart = Date.now();
            const snapshot2 = await query.get();
            dbQueryDurationMicroseconds
              .labels(collectionName, "read")
              .observe(Date.now() - dbMetricStart);
            return snapshot2;
          }, "fetchFromDB");
          const snapshot = await dbReadBreaker.fire(fetchFromDB);
          let data = snapshot.docs.map((doc: any) => {
            const d = doc.data();
            return { id: doc.id, ...d };
          });
          data = data.filter((d: any) => !d.isDeleted && d.active !== false);
          if (collectionName === "products" && data.length === 0 && false) {
            try {
              const seedingRef = admin
                .firestore()
                .collection("system_metadata")
                .doc("seeding");
              const seedingDoc = await seedingRef.get();
              if (seedingDoc.exists && seedingDoc.data && (seedingDoc as any).data()?.has_seeded) {
                console.log(
                  "Products are empty, but seeding has already run before. Respecting empty collection.",
                );
              } else {
                console.log(
                  "Seeding default products because Firestore 'products' collection is empty and has_seeded is false...",
                );
                await seedingRef.set(
                  { has_seeded: true, seeded_at: new Date().toISOString() },
                  { merge: true },
                );
                const rovRef = admin
                  .firestore()
                  .collection("products")
                  .doc("rov_standard");
                const rovData = {
                  name: "\u0E44\u0E2D\u0E14\u0E35\u0E40\u0E01\u0E21 RoV \u0E23\u0E30\u0E14\u0E31\u0E1A\u0E1E\u0E23\u0E35\u0E40\u0E21\u0E35\u0E22\u0E21 (\u0E2A\u0E01\u0E34\u0E19\u0E2D\u0E25\u0E31\u0E07\u0E01\u0E32\u0E23 \u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E44\u0E15\u0E48\u0E41\u0E23\u0E07\u0E01\u0E4C)",
                  price: 390,
                  originalPrice: 450,
                  category:
                    "\u0E44\u0E2D\u0E14\u0E35\u0E40\u0E01\u0E21\u0E2A\u0E4C\u0E22\u0E2D\u0E14\u0E19\u0E34\u0E22\u0E21",
                  stock: 5,
                  soldCount: 142,
                  imageUrl:
                    "https://seeklogo.com/images/A/arena-of-valor-logo-1BDD4A191C-seeklogo.com.png",
                  description:
                    "\u0E1B\u0E23\u0E30\u0E27\u0E31\u0E15\u0E34\u0E02\u0E32\u0E27\u0E2A\u0E30\u0E2D\u0E32\u0E14 \u0E44\u0E21\u0E48\u0E40\u0E04\u0E22\u0E42\u0E14\u0E19\u0E41\u0E1A\u0E19 \u0E2E\u0E35\u0E42\u0E23\u0E48\u0E04\u0E23\u0E1A \u0E2A\u0E01\u0E34\u0E19\u0E40\u0E1E\u0E35\u0E22\u0E1A\u0E1E\u0E23\u0E49\u0E2D\u0E21\u0E23\u0E39\u0E19\u0E40\u0E25\u0E40\u0E27\u0E25 90 \u0E17\u0E38\u0E01\u0E2A\u0E32\u0E22",
                  isPopular: true,
                  isDeleted: false,
                  stockData: [
                    "rov_user1:rov_pass1",
                    "rov_user2:rov_pass2",
                    "rov_user3:rov_pass3",
                    "rov_user4:rov_pass4",
                    "rov_user5:rov_pass5",
                  ],
                  created_at: new Date().toISOString(),
                  _version: 1,
                };
                const rovCompressed = await compressStock(rovData.stockData);
                rovData.stockData = rovCompressed;
                await rovRef.set(rovData);
                const netflixRef = admin
                  .firestore()
                  .collection("products")
                  .doc("netflix_4k");
                const netflixData = {
                  name: "Netflix Premium Ultra HD 4K (30 วัน - จอส่วนตัว)",
                  price: 139,
                  originalPrice: 199,
                  category:
                    "แอปพรีเมียม / บันเทิง",
                  stock: 0,
                  soldCount: 945,
                  imageUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/f/ff/Netflix-new-icon.png",
                  description:
                    "ความละเอียด 4K HDR เสียงรอบทิศทาง ใช้งานส่วนตัว เสถียรสูง 100% ตลอดทั้งเดือน",
                  isPopular: true,
                  isDeleted: false,
                  stockData: [],
                  created_at: new Date().toISOString(),
                  _version: 1,
                };
                const netflixCompressed = await compressStock(
                  netflixData.stockData,
                );
                netflixData.stockData = netflixCompressed;
                await netflixRef.set(netflixData);
                const youtubeRef = admin
                  .firestore()
                  .collection("products")
                  .doc("youtube_premium");
                const youtubeData = {
                  name: "YouTube Premium 4K (30 วัน - บัญชีส่วนตัวความปลอดภัยสูง)",
                  price: 39,
                  originalPrice: 69,
                  category:
                    "แอปพรีเมียม / บันเทิง",
                  stock: 0,
                  soldCount: 1248,
                  imageUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg",
                  description:
                    "ไม่มีโฆษณาคั่นอย่างสมบูรณ์ เล่นขณะปิดหน้าจอได้ แถมบริการเสริม Youtube Music HQ",
                  isPopular: true,
                  isDeleted: false,
                  stockData: [],
                  created_at: new Date().toISOString(),
                  _version: 1,
                };
                const youtubeCompressed = await compressStock(
                  youtubeData.stockData,
                );
                youtubeData.stockData = youtubeCompressed;
                await youtubeRef.set(youtubeData);
                const discordRef = admin
                  .firestore()
                  .collection("products")
                  .doc("discord_nitro");
                const discordData = {
                  name: "Discord Nitro Premium Gift (1 เดือน - บัญชีแท้ 100%)",
                  price: 119,
                  originalPrice: 320,
                  category:
                    "แอปพรีเมียม / บันเทิง",
                  stock: 0,
                  soldCount: 231,
                  imageUrl:
                    "https://upload.wikimedia.org/wikipedia/commons/c/ca/Discord_Color_Logo.svg",
                  description:
                    "รับบูสเซิร์ฟเวอร์ฟรี x2 สติกเกอร์เคลื่อนไหว อีโมจิพิเศษทุกเซิร์ฟ และแชร์จอ 1080p 60fps",
                  isPopular: true,
                  isDeleted: false,
                  stockData: [],
                  created_at: new Date().toISOString(),
                  _version: 1,
                };
                const discordCompressed = await compressStock(
                  discordData.stockData,
                );
                discordData.stockData = discordCompressed;
                await discordRef.set(discordData);
                console.log(
                  "Successfully seeded default products into Firestore.",
                );
                const newSnapshot = await admin
                  .firestore()
                  .collection("products")
                  .get();
                data = newSnapshot.docs
                  .map((doc: any) => {
                    const d = doc.data();
                    return { id: doc.id, ...d };
                  })
                  .filter((d: any) => !d.isDeleted && d.active !== false);
              }
            } catch (seedErr) {
              console.error("Error seeding default products:", seedErr);
            }
          }
          if (fetchRevisionBeforeStart !== cacheRevisionCounter) {
            return {
              data,
              timestamp: Date.now(),
              revision: cacheRevisionCounter,
            };
          }
          const oldCache = memoryCache.get(collectionName);
      // @ts-ignore
          const currentRevision = oldCache?.revision || cacheRevisionCounter;
          const freshData = {
            data,
            timestamp: Date.now(),
            revision: currentRevision,
          };
          memoryCache.set(collectionName, freshData, { ttl });
          if (redis && redis.status === "ready") {
            try {
              await redis.set(redisKey, JSON.stringify(freshData), "PX", ttl);
            } catch (err: any) {
              console.warn("Redis set error", err);
            }
          }
          return freshData;
        })();
        inflightRequests.set(collectionName, fetchPromise);
        try {
          cachedData = await fetchPromise;
        } finally {
          inflightRequests.delete(collectionName);
        }
      }
    }
    if (!cachedData) throw new Error("Failed to retrieve cache data");
    if (res && req) {
      const etag = `W/"${collectionName}-v${cachedData.revision}"`;
      res.setHeader("ETag", etag);
      if (req.headers["if-none-match"] === etag) {
        res.setHeader("X-Cache", cacheHit ? "HIT" : "MISS");
        res.status(304).end();
        return null;
      }
      res.setHeader("X-Cache", cacheHit ? "HIT" : "MISS");
    } else if (res) {
      res.setHeader("X-Cache", cacheHit ? "HIT" : "MISS");
    }
    return cachedData.data;
  },
  "getCachedCollection",
);
const invalidateCache = __name(async (collectionName: any) => {
  cacheRevisionCounter++;
  memoryCache.delete(collectionName);
  inflightRequests.delete(collectionName);
  if (redis && redis.status === "ready") {
    try {
      await redis.del(`cache:${collectionName}`);
    } catch (err: any) {
      console.warn("Redis del error", err);
    }
  }
}, "invalidateCache");
const { createAuthRouter } = await import("./src/routes/auth.route.js");
app.use("/api", createAuthRouter({ authLimiter, invalidateCache, invalidateStatsCache }));

app.get("/api/debug-products", requireAdmin, async (req, res) => {
  try {
    const snap = await admin.firestore().collection("products").get();
    const docs = snap.docs.map((d: any) => d.data()).filter((p: any) => p.stock > 0);
    res.json({
      count: docs.length,
      products: docs.map((p: any) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        stockDataLen: Array.isArray(p.stockData)
          ? p.stockData.length
          : typeof p.stockData,
        compressedCheck:
          p.stockData && Array.isArray(p.stockData) && p.stockData[0]
            ? Object.keys(p.stockData[0])
            : null,
      })),
    });
  } catch (e: any) {
    res.status(500).json({ error: (e as any)?.message });
  }
});
const { createProductsRouter } = await import("./src/routes/products.route.js");
app.use(
  "/api",
  createProductsRouter({
    requireAdmin,
    getCachedCollection,
    writeAuditLog,
    invalidateCache,
    invalidateStatsCache,
  }),
);
const twApi: any = null;
const { createPaymentsRouter } = await import("./src/routes/payments.route.js");
app.use(
  "/api",
  createPaymentsRouter({
    requireAuth,
    requireAdmin,
    mutationLimiter,
    topupLimiter,
    getSiteSettings: () => siteSettings,
    getRedis: () => redis,
    getTwApi: () => twApi,
    writeAuditLog,
    sendAlert,
    invalidateCache,
    invalidateStatsCache,
    getCommunityData: () => communityData,
    saveCommunity: () => saveCommunity(),
  }),
);
const { createUsersRouter } = await import("./src/routes/users.route.js");
app.use(
  "/api",
  createUsersRouter({
    uploadLimiter,
    requireAuth,
    requireAdmin,
    mutationLimiter,
    communityUpload,
    uploadToSupabaseStorage,
    getCommunityData: () => communityData,
    invalidateUserTokenCache,
    invalidateCache,
    invalidateStatsCache,
    sendAlert,
  }),
);
const { createAdminRouter } = await import("./src/routes/admin.route.js");
app.use(
  "/api",
  createAdminRouter({
    requireAdmin,
    writeAuditLog,
    sendAlert,
    invalidateUserTokenCache,
    invalidateCache,
    invalidateStatsCache,
    getCommunityData: () => communityData,
    saveCommunity: () => saveCommunity(),
  }),
);
app.get("/api/test_stats", async (req, res) => {
  res.json({ ok: 1 });
});
app.get("/api/stats", async (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  try {
    const now = Date.now();
    const sendCachedStats = __name(() => {
      const etag = `W/"stats-v${cacheRevisionCounter}"`;
      res.setHeader("ETag", etag);
      if (req.headers["if-none-match"] === etag) {
        return res.status(304).end();
      }
      res.json(cachedStats);
    }, "sendCachedStats");
    if (cachedStats && now - lastStatsFetch < 1e4) {
      return sendCachedStats();
    }
    const redisKey = "cache:stats_compiled";
    if (redis && redis.status === "ready") {
      try {
        const redisData = await redis.get(redisKey);
        if (redisData) {
          cachedStats = JSON.parse(redisData);
          lastStatsFetch = now;
          return sendCachedStats();
        }
      } catch (e: any) {
        console.error("Caught error:", e);
      }
    }
    const adminDb = admin.firestore();
    let totalStock = 0;
    try {
      const data = await getCachedCollection("products", 3e5);
      data.forEach((p: any) => {
        if (p.stock > 0 && p.stock < 999999) totalStock += Number(p.stock);
      });
    } catch (e: any) {
      console.error("Caught error:", e);
    }
    let totalSales = 0;
    let totalPurchaseOrders = 0;
    let totalTopupsAmount = 0;
    let totalUsersCount = 0;
    await Promise.all([
      (async () => {
        const purchases = await getCachedCollection("purchases", 60000);
        purchases.forEach((p: any) => {
          totalSales += Number(p.price) || 0;
          totalPurchaseOrders++;
        });
      })(),
      (async () => {
        const topups = await getCachedCollection("topups", 60000);
        topups.forEach((t: any) => {
          totalTopupsAmount += Number(t.amount) || 0;
        });
      })(),
      (async () => {
        const users = await getCachedCollection("users", 60000);
        totalUsersCount = users.length;
      })(),
    ]);
    cachedStats = {
      users: totalUsersCount,
      sales: totalSales,
      stock: totalStock,
      totalOrders: totalPurchaseOrders,
      totalTopupsAmount,
    };
    if (
      totalUsersCount > 0 ||
      totalPurchaseOrders > 0 ||
      totalStock > 0 ||
      totalTopupsAmount > 0
    ) {
      lastStatsFetch = now;
      if (redis && redis.status === "ready") {
        try {
          await redis.set(redisKey, JSON.stringify(cachedStats), "PX", 1e4);
        } catch (e: any) {
          console.error("Caught error:", e);
        }
      }
    }
    sendCachedStats();
  } catch (err: any) {
    console.error("STATS ERROR:", err);
    res.json(
      cachedStats || {
        users: siteSettings.stats_users_offset || 0,
        sales: siteSettings.stats_sales_offset || 0,
        stock: 0,
        totalOrders: 0,
        totalTopupsAmount: 0,
      },
    );
  }
});
function sanitizePublicProductName(name: string): string {
  if (!name) return "สินค้าทั่วไป";
  let clean = name.trim();
  
  // Mask emails completely
  clean = clean.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g, "******@***.com");
  
  // If we detect username:password or any delimiter that implies raw accounts/credentials
  if (clean.includes(":") || clean.includes("|") || clean.includes("/")) {
    if (clean.match(/user|pass|id|รหัส|ไอดี|พาส/i)) {
      return "ไอดีบริการพรีเมียม (ได้รับการคุ้มครองข้อมูล)";
    }
  }
  
  // Mask account strings or credentials indicators
  const sensitiveWords = ["user:", "pass:", "username", "password", "ไอดี:", "พาส:", "รหัสผ่าน:", "รหัส:", "id:", "key:"];
  for (const word of sensitiveWords) {
    if (clean.toLowerCase().includes(word)) {
      return "ไอดีพรีเมียม (ผ่านการจัดส่งแล้ว)";
    }
  }
  
  return clean;
}

app.get("/api/latest-purchases", async (req, res) => {
  try {
    const adminDb = admin.firestore();
    const limit = 10;
    const q = adminDb
      .collection("purchases")
      .orderBy("date", "desc")
      .limit(limit);
    const snap = await q.get();
    const data = snap.docs.map((doc: any) => {
      const d = doc.data();
      let qty = d.quantity;
      if (!qty) {
        const match = d.productName ? d.productName.match(/\(x(\d+)\)/) : null;
        qty = match ? parseInt(match[1]) : 1;
      }
      return {
        dbId: doc.id,
        productName: sanitizePublicProductName(d.productName || d.product_name || "Unknown Product"),
        quantity: qty,
        price: d.price,
        date: d.date,
      };
    });
    return res.json(data);
  } catch (err: any) {
    console.error("Error fetching latest purchases:", (err as any).message || err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.get("/api/purchases", requireAuth, async (req, res) => {
  try {
    const adminDb = admin.firestore();
      // @ts-ignore
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const afterDocId = req.query.after;
    let q = adminDb
      .collection("purchases")
      .orderBy("date", "desc")
      .limit(limit);
    if (afterDocId) {
      const cursorDoc = await adminDb
        .collection("purchases")
      // @ts-ignore
        .doc(afterDocId)
        .get();
      if (cursorDoc.exists) {
      // @ts-ignore
        q = q.startAfter(cursorDoc);
      }
    }
    if (!req.isAdmin) {
      q = adminDb
        .collection("purchases")
        .where("userId", "==", req.user.uid)
        .orderBy("date", "desc")
        .limit(limit);
      if (afterDocId) {
        const cursorDoc = await adminDb
          .collection("purchases")
      // @ts-ignore
          .doc(afterDocId)
          .get();
        if (cursorDoc.exists) {
      // @ts-ignore
          q = q.startAfter(cursorDoc);
        }
      }
    }
    const snap = await q.get();
    const data = await Promise.all(
      snap.docs.map(async (doc: any) => {
        const item = doc.data();
        if (item.secretData && (item.secretData.startsWith("enc:") || item.secretData.startsWith("enc2:"))) {
          item.secretData = await decrypt(item.secretData);
        }
        return { dbId: doc.id, ...item };
      })
    );
    const nextCursor =
      snap.docs.length === limit ? snap.docs[snap.docs.length - 1].id : null;
    return res.json({ data, nextCursor });
  } catch (err: any) {
    console.error("Error fetching purchases:", (err as any).message || err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/purchases", requireAdmin, async (req, res) => {
  if (!admin.firestore())
    return res.status(500).json({ error: "DB not connected" });
  try {
    const data = req.body;
    if (data.secretData !== void 0) {
      const rawSecret = data.secretData || "";
      const keysList = rawSecret
        .split("\n")
        .map((k: any) => k.trim())
        .filter(Boolean);
      data.licenseKeyHashes = keysList.map((k: any) =>
        crypto.createHash("sha256").update(k).digest("hex"),
      );
      data.secretData = await encrypt(data.secretData);
    }
    const docRef = await admin.firestore().collection("purchases").add(data);
    res.json({
      id: docRef.id,
      dbId: docRef.id,
      ...data,
      secretData: req.body.secretData,
    });
  } catch (err: any) {
    console.error("Internal server error creating purchase:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.put("/api/purchases/:id", requireAdmin, async (req, res) => {
  if (!admin.firestore())
    return res.status(500).json({ error: "DB not connected" });
  try {
    const { id } = req.params;
    const { secretData, preOrderStatus } = req.body;
    const docRef = admin.firestore().collection("purchases").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Order not found" });
    }
    const payload = {};
    if (secretData !== void 0) {
      // @ts-ignore
      payload.secretData = await encrypt(secretData);
      const rawSecret = secretData || "";
      const keysList = rawSecret
        .split("\n")
        .map((k: any) => k.trim())
        .filter(Boolean);
      // @ts-ignore
      payload.licenseKeyHashes = keysList.map((k) =>
        crypto.createHash("sha256").update(k).digest("hex"),
      );
    }
      // @ts-ignore
    if (preOrderStatus !== void 0) payload.preOrderStatus = preOrderStatus;
    await docRef.update(payload);
    res.json({ success: true, id, ...payload, secretData });
  } catch (err: any) {
    console.error("Error updating purchase:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});
app.post("/api/discord-rekey", discordLimiter, async (req, res) => {
  const { key, secret, plan } = req.body;
  if (!key || typeof key !== "string" || key.length < 16) { return res.status(400).json({ error: "Key must be at least 16 characters for security" }); }
  const expectedSecret = process.env.DISCORD_BOT_SECRET;
  if (!expectedSecret) {
    return res
      .status(500)
      .json({ error: "DISCORD_BOT_SECRET is not configured" });
  }
  if (!safeCompare(secret, expectedSecret)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const newDoc = {
      key,
      plan: (plan && ["premium", "basic", "pro"].includes(plan)) ? plan : "premium",
      status: "active",
      created_at: new Date().toISOString(),
    };
    await admin.firestore().collection("license_keys").add(newDoc);
    res.json({
      success: true,
      message: `\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E04\u0E35\u0E22\u0E4C ${key} \u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08!`,
      plan: newDoc.plan,
    });
  } catch (error: any) {
    res.status(500).json({ error: "Internal server error while adding key" });
  }
});
app.post("/api/discord-redeem", discordLimiter, async (req, res) => {
  const { key, secret } = req.body;
  const expectedSecret = process.env.DISCORD_BOT_SECRET;
  if (!expectedSecret) {
    return res
      .status(500)
      .json({ error: "DISCORD_BOT_SECRET is not configured" });
  }
  if (!safeCompare(secret, expectedSecret)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!key || typeof key !== "string" || key.trim().length < 8) {
    return res
      .status(400)
      .json({
        error:
          "\u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E30\u0E1A\u0E38\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (\u0E04\u0E27\u0E32\u0E21\u0E22\u0E32\u0E27\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 8 \u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23)",
      });
  }
  try {
    const licenseSnapshot = await admin
      .firestore()
      .collection("license_keys")
      .where("key", "==", key)
      .where("status", "==", "active")
      .get();
    if (!licenseSnapshot.empty) {
      const docId = licenseSnapshot.docs[0].id;
      const docRef = admin.firestore().collection("license_keys").doc(docId);
      await docRef.update({ status: "used" });
      await admin
        .firestore()
        .collection("used_keys")
        .add({
          key,
          used_by_discord: true,
          uid: req.body.uid || null,
          used_at: new Date().toISOString(),
        });
      return res.json({
        success: true,
        message:
          "\u0E23\u0E31\u0E1A\u0E22\u0E28\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08!",
      });
    }
    let foundDoc = await findPurchaseByLicenseKey(key);
    if (!foundDoc) {
      return res
        .status(404)
        .json({
          error:
            "\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E19\u0E35\u0E49\u0E43\u0E19\u0E23\u0E30\u0E1A\u0E1A \u0E2B\u0E23\u0E37\u0E2D\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07",
        });
    }
    if (foundDoc.discordClaimed) {
      return res
        .status(400)
        .json({
          error:
            "\u0E04\u0E35\u0E22\u0E4C\u0E19\u0E35\u0E49\u0E16\u0E39\u0E01\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E23\u0E31\u0E1A\u0E22\u0E28\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27",
        });
    }
    await admin
      .firestore()
      .collection("purchases")
      .doc(foundDoc.id)
      .update({ ...foundDoc, discordClaimed: true });
    res.json({
      success: true,
      message:
        "\u0E23\u0E31\u0E1A\u0E22\u0E28\u0E2A\u0E33\u0E40\u0E23\u0E47\u0E08!",
    });
    writeAuditLog(
      "DISCORD_ROLE_CLAIM",
      req.user?.uid || "system",
      "discord_role",
      req,
      { key: req.body.key },
    );
  } catch (e: any) {
    console.error(e);
    res
      .status(500)
      .json({ error: (e as any)?.details || (e as any)?.message || "Internal server error" });
  }
});
const productLocks = new Set();
async function acquireMutex(key: any, timeoutMs = 15e3) {
  const start = Date.now();
  while (productLocks.has(key)) {
    if (Date.now() - start > timeoutMs) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  productLocks.add(key);
  return true;
}
__name(acquireMutex, "acquireMutex");
function releaseMutex(key: any) {
  productLocks.delete(key);
}
__name(releaseMutex, "releaseMutex");
async function acquireRedisLock(lockKey: any, ttlMs = 15e3) {
  if (!redis || redis.status !== "ready") return true;
  try {
    const result = await redis.set(lockKey, "locked", "PX", ttlMs, "NX");
    return result === "OK";
  } catch (err: any) {
    return true;
  }
}
__name(acquireRedisLock, "acquireRedisLock");
async function releaseRedisLock(lockKey: any) {
  if (!redis) return;
  try {
    await redis.del(lockKey);
  } catch (err) {
    console.warn("Failed to release redis lock", err);
  }
}
__name(releaseRedisLock, "releaseRedisLock");
app.post("/api/buy", mutationLimiter, requireAuth, async (req, res, next) => {
  next();
});
app.get("/api/topups", requireAuth, async (req, res, next) => {
  next();
});
app.post("/api/topups", requireAdmin, async (req, res, next) => {
  next();
});
app.get("/api/pages", async (req, res) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  try {
    const data = await getCachedCollection("custom_pages", 1e4, res, req);
    if (data) res.json(data);
  } catch (err: any) {
    console.error("Internal server error fetching pages:", (err as any).message || err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/pages", requireAdmin, async (req, res) => {
  if (!admin.firestore())
    return res.status(500).json({ error: "DB not connected" });
  try {
    const pageData = req.body;
    const { id, ...dataToSave } = pageData;
    const docRef = await admin
      .firestore()
      .collection("custom_pages")
      .add({ ...dataToSave, created_at: new Date().toISOString() });
    invalidateCache("custom_pages");
    res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
  } catch (err: any) {
    console.error("Internal server error creating page:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.put("/api/pages/:id", requireAdmin, async (req, res) => {
  if (!admin.firestore())
    return res.status(500).json({ error: "DB not connected" });
  try {
    const pageData = req.body;
    const { id, ...dataToSave } = pageData;
    const docRef = admin
      .firestore()
      .collection("custom_pages")
      .doc(req.params.id);
    await docRef.update(dataToSave);
    invalidateCache("custom_pages");
    res.json({ id: req.params.id, ...dataToSave });
  } catch (err: any) {
    console.error("Internal server error updating page:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.delete("/api/pages/:id", requireAdmin, async (req, res) => {
  if (!admin.firestore())
    return res.status(500).json({ error: "DB not connected" });
  try {
    await admin
      .firestore()
      .collection("custom_pages")
      .doc(req.params.id)
      .delete();
    invalidateCache("custom_pages");
    res.json({ success: true });
  } catch (err: any) {
    console.error("Internal server error deleting page:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
let memoryLogSystemData = { categories: [], items: [] };
app.get("/api/logs-system", injectUser, async (req, res) => {
  try {
    let dbData;
    try {
      const doc = await admin
        .firestore()
        .collection("settings")
        .doc("log_system_data")
        .get();
      if (doc.exists) {
        const d = doc.data();
        dbData = d?.data;
      }
    } catch (e: any) {
      console.error("Caught error:", e);
    }
    let payload = dbData || memoryLogSystemData;
    if (!payload || !payload.categories)
      payload = { categories: [], items: [] };
    let isVip = false;
    if (req.isAdmin) {
      isVip = true;
    } else if (req.user) {
      try {
        const userDoc = await admin
          .firestore()
          .collection("users")
          .doc(req.user.uid)
          .get();
        if (userDoc.exists) {
          const u = userDoc.data();
          if (u && u.isPremium === true) isVip = true;
          const adminDoc = await admin
            .firestore()
            .collection("admins")
            .doc(req.user.uid)
            .get();
          if (adminDoc.exists) isVip = true;
        }
      } catch (e: any) {
        console.error("Caught error:", e);
      }
    }
    if (!isVip) {
      if (Array.isArray(payload.items)) {
        payload.items = payload.items.map((item: any) => {
          if (item.type === "premium") {
            return { ...item, attachments: [] };
          }
          return item;
        });
      }
    }
    res.json({ ...payload, isVip });
  } catch (err: any) {
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/logs-system", requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    memoryLogSystemData = data;
    try {
      if (admin.firestore()) {
        await admin
          .firestore()
          .collection("settings")
          .doc("log_system_data")
          .set({ data }, { merge: false });
      }
    } catch (e: any) {
      console.warn(
        "Failed to save log system data to DB, keeping in memory:",
        (e as any)?.message,
      );
    }
    res.json({ success: true });
  } catch (err: any) {
    console.error("Internal server error saving log system data:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.get("/api/license_keys", requireAdmin, async (req, res) => {
  try {
      // @ts-ignore
    const page = Math.max(1, parseInt(req.query.page) || 1);
      // @ts-ignore
    const limit = Math.min(500, parseInt(req.query.limit) || 100);
    const offset = (page - 1) * limit;
    let q = admin
      .firestore()
      .collection("license_keys")
      .limit(limit)
      .offset(offset);
    const snapshot = await q.get();
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    await new Promise((r) => setTimeout(r, 0));
    data.sort(
      (a: any, b: any) =>
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime(),
    );
    res.json(data);
  } catch (err: any) {
    console.error(
      "Internal server error fetching license_keys:",
      (err as any).message || err,
    );
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/license_keys", requireAdmin, async (req, res) => {
  try {
    const { key, plan, status } = req.body;
    const newDoc = { key, plan, status, created_at: new Date().toISOString() };
    const docRef = await admin
      .firestore()
      .collection("license_keys")
      .add(newDoc);
    res.json({ id: docRef.id, dbId: docRef.id, ...newDoc });
  } catch (err: any) {
    console.error("Internal server error inserting license_key:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.delete("/api/license_keys/:id", requireAdmin, async (req, res) => {
  try {
    await admin
      .firestore()
      .collection("license_keys")
      .doc(req.params.id)
      .delete();
    res.json({ success: true });
  } catch (err: any) {
    console.error("Internal server error deleting license_key:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/license_keys/bulk_delete", requireAdmin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids))
      return res.status(400).json({ error: "ids must be an array" });
    await Promise.all(
      ids.map((id) =>
        admin.firestore().collection("license_keys").doc(id).delete(),
      ),
    );
    res.json({ success: true, deletedCount: ids.length });
  } catch (err: any) {
    console.error("Internal server error bulk deleting license_keys:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.patch("/api/license_keys/:id", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const docRef = admin
      .firestore()
      .collection("license_keys")
      .doc(req.params.id);
    await docRef.update({ status });
    res.json({ id: req.params.id, status });
  } catch (err: any) {
    console.error("Internal server error updating license_key:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/license_keys/bulk", requireAdmin, async (req, res) => {
  try {
    const { keys } = req.body;
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ error: "keys must be a non-empty array" });
    }
    if (keys.length > 500) {
      return res
        .status(400)
        .json({ error: "Maximum 500 keys per bulk insert" });
    }
    const results = await Promise.all(
      keys.map(async (k: any) => {
        const docRef = await admin
          .firestore()
          .collection("license_keys")
          .add({ ...k, created_at: new Date().toISOString() });
        return { id: docRef.id, ...k };
      }),
    );
    res.json(results);
  } catch (err: any) {
    console.error("Internal server error bulk inserting license_keys:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.get("/api/validate_key/:key", requireAuth, checkLimiter, async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("license_keys")
      .where("key", "==", req.params.key)
      .limit(1)
      .get();
    if (!snapshot || !snapshot.docs || snapshot.docs.length === 0) {
      return res.status(404).json({ valid: false, error: "Key not found" });
    }
    res.json({ valid: true });
  } catch (err: any) {
    console.error("Internal server error validating key:", err);
    res.status(500).json({ valid: false, error: "Internal error" });
  }
});
app.get("/api/used_keys", requireAuth, async (req, res, next) => {
  next();
});
app.post("/api/used_keys", requireAdmin, async (req, res, next) => {
  next();
});
app.get("/api/blocked_ips", requireAdmin, async (req, res) => {
  try {
    const snapshot = await admin
      .firestore()
      .collection("blocked_ips")
      .limit(500)
      .get();
    const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    data.sort(
      (a: any, b: any) =>
        new Date(b.blocked_at || 0).getTime() -
        new Date(a.blocked_at || 0).getTime(),
    );
    res.json(data);
  } catch (err: any) {
    console.error(
      "Internal server error fetching blocked_ips:",
      (err as any).message || err,
    );
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.post("/api/blocked_ips", requireAdmin, async (req, res) => {
  try {
    const { ip, reason } = req.body;
    const newDoc = { ip, reason, blocked_at: new Date().toISOString() };
    const docRef = admin.firestore().collection("blocked_ips").doc(ip);
    await docRef.set(newDoc);
    res.json({ id: ip, ...newDoc });
  } catch (err: any) {
    console.error("Internal server error upserting blocked_ip:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.delete("/api/blocked_ips/:ip", requireAdmin, async (req, res) => {
  try {
    await admin
      .firestore()
      .collection("blocked_ips")
      .doc(req.params.ip)
      .delete();
    res.json({ success: true });
  } catch (err: any) {
    console.error("Internal server error deleting blocked_ip:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.get("/api/check_ip/:ip", requireAdmin, async (req, res) => {
  try {
    const doc = await admin
      .firestore()
      .collection("blocked_ips")
      .doc(req.params.ip)
      .get();
    res.json({ blocked: !!doc.exists });
  } catch (err: any) {
    console.error("Internal server error checking IP:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
app.get("/api/api_keys", requireAdmin, async (req, res, next) => {
  next();
});
app.post("/api/api_keys", requireAdmin, async (req, res, next) => {
  next();
});
app.delete("/api/api_keys/:key", requireAdmin, async (req, res, next) => {
  next();
});
app.patch("/api/api_keys/:key", requireAdmin, async (req, res, next) => {
  next();
});
app.post("/api/admins", requireAdmin, async (req, res) => {
  try {
    const { username, role } = req.body;
    const newDoc = { username, role, granted_at: new Date().toISOString() };
    const docRef = admin.firestore().collection("admins").doc(username);
    await docRef.set(newDoc);
    invalidateUserTokenCache(username);
    res.json({ id: username, ...newDoc });
  } catch (err: any) {
    console.error("Internal server error upserting admin:", err);
    res
      .status(500)
      .json({ error: "Internal server error" });
  }
});
let communityData: any = {
  categories: [],
  channels: [],
  messages: [],
  userRanks: {},
};
(async () => {
  try {
    const communityDoc = await admin
      .firestore()
      .collection("settings")
      .doc("community_data")
      .get();
    if (communityDoc.exists) {
      const stored = communityDoc.data()?.data;
      if (stored && stored.categories) {
        communityData = stored;
        if (!communityData.userRanks) communityData.userRanks = {};
      }
    }
  } catch (e: any) {
    console.warn("Could not load communityData from Firestore:", e);
  }
})();
const saveCommunity = __name(async () => {
  try {
    await admin
      .firestore()
      .collection("settings")
      .doc("community_data")
      .set({ data: communityData }, { merge: false });
  } catch (e: any) {
    console.warn("Could not save communityData to Firestore:", e);
  }
}, "saveCommunity");
if (communityData.categories.length === 0) {
  const catId = "cat-" + Date.now();
  communityData.categories.push({ id: catId, name: "INFORMATION", order: 0 });
  communityData.channels.push({
    id: "ch-claim",
    categoryId: catId,
    name: "\u0E23\u0E31\u0E1A\u0E22\u0E28-basic",
    type: "role_claim",
    order: 0,
  });
  communityData.channels.push({
    id: "ch-gen",
    categoryId: catId,
    name: "\u0E1B\u0E23\u0E30\u0E01\u0E32\u0E28\u0E17\u0E31\u0E48\u0E27\u0E44\u0E1B",
    type: "text",
    order: 1,
  });
  saveCommunity();
}
app.post("/api/redeem", mutationLimiter, requireAuth, async (req, res, next) => {
  next();
});
app.get("/api/users/:uid", requireAuth, async (req, res, next) => {
  next();
});
app.post("/api/users/:uid", requireAuth, async (req, res, next) => {
  next();
});
app.post("/api/users/:uid/password", requireAdmin, async (req, res, next) => {
  next();
});
app.delete("/api/users/:uid", requireAuth, async (req, res, next) => {
  next();
});
app.get("/api/users", requireAdmin, async (req, res, next) => {
  next();
});
const logLimiter = rateLimit({
  windowMs: 1 * 60 * 1e3,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, trustProxy: false },
});
app.post("/api/log_error", logLimiter, (req, res) => {
  try {
    const safeBody =
      typeof req.body === "object"
        ? JSON.stringify({
            type: req.body.type,
            message: req.body.message,
            stack: req.body.stack,
            componentStack: req.body.componentStack,
          }).substring(0, 1e3)
        : String(req.body).substring(0, 200);
    console.error("CLIENT ERROR:", safeBody);
  } catch (e: any) {
    console.error("Caught error:", e);
  }
  res.json({ received: true });
});
app.post("/api/log_vitals", logLimiter, (req, res) => {
  try {
    const { metric } = req.body;
    if (metric && metric.name && metric.value) {
      console.log(
        JSON.stringify({
          level: "info",
          type: "web_vital",
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          id: metric.id,
        }),
      );
    }
  } catch (e: any) {
    console.error("Caught error:", e);
  }
  res.status(204).end();
});
app.get("/bot-code", requireAdmin, (req, res) => {
  return res
    .status(403)
    .json({
      error:
        "This feature has been permanently deactivated for security reasons.",
    });
});
app.post("/api/bot/save", requireAdmin, (req, res) => {
  return res
    .status(403)
    .json({
      error:
        "This feature has been permanently deactivated for security reasons.",
    });
});
app.get("/api/bot/config", requireAdmin, (req, res) => {
  return res.json({
    config:
      "# This feature has been permanently deactivated for security reasons.",
  });
});
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code
    });
  }

  console.error('[UnhandledError]', {
    message: err && err.message ? err.message : String(err),
    stack: err && err.stack ? err.stack : undefined,
    path: req.path
  });

  res.status(500).json({
    error: 'Internal server error'
  });
});
if (true) {
  (async () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite middleware (async)...");
      try {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
        console.log("Vite middleware attached.");
      } catch (err: any) {
        console.error("Failed to initialize Vite middleware:", err);
      }
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(
        express.static(distPath, {
          maxAge: "1y",
          setHeaders: __name((res: any, path2: any) => {
            if (path2.endsWith(".html")) {
              res.setHeader("Cache-Control", "no-cache");
            } else {
              res.setHeader(
                "Cache-Control",
                "public, max-age=31536000, immutable",
              );
              res.setHeader("Cloudflare-CDN-Cache-Control", "max-age=31536000");
              res.setHeader("CDN-Cache-Control", "max-age=31536000");
            }
          }, "setHeaders"),
        }),
      );
      app.get("*", (req, res) => {
        try {
          const htmlPath = path.join(distPath, "index.html");
          if (fs.existsSync(htmlPath)) {
            const html = fs.readFileSync(htmlPath, "utf8");
            res.send(html);
          } else {
            res.status(404).send("Not Found");
          }
        } catch (e: any) {
          console.error("Error reading index.html:", e);
          res.status(500).send("Internal Server Error");
        }
      });
    }
    try {
      await initializeAdminDb();
    } catch (e: any) {
      console.error("Failed to initialize missing columns on startup:", e);
    }
    const server = app.listen(3e3, "0.0.0.0", () => {
      logger.info(`[Server] Listening on http://0.0.0.0:3000`);
    });
    const gracefulShutdown = __name((signal: any) => {
      logger.info(`[Server] Received ${signal}. Shutting down immediately...`);
      process.exit(0);
    }, "gracefulShutdown");
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })();
}
var server_default = app;
export { dbQueryDurationMicroseconds, server_default as default };

//# sourceMappingURL=data:application/json;base64,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QVMsSUFBSyxRQUFTLEtBQU0sS0FBTSxnQkFBaUIsTUFBTyxNQUFPLE1BQU8sS0FBTSxRQUFTLGtCQUFtQixPQUFRLE1BQU8sU0FBVSxNQUFPLFFBQVMsTUFBTyxPQUFRLElBQUssT0FBUSxJQUFLLE1BQU8sTUFBTyxPQUFRLEVBQUcsT0FBUSxJQUFLLE9BQVEsS0FBTSxRQUFTLEdBQUksTUFBTyxNQUFPLEtBQU0sTUFBTyxNQUFPLE1BQU8sS0FBTSxRQUFTLEtBQU0sS0FBTSxRQUFTLElBQUssUUFBUyxLQUFNLEtBQU0sS0FBTSxTQUFVLEtBQU0sU0FBVSxLQUFNLFVBQVcsS0FBTSxVQUFXLE1BQU8sUUFBUyxNQUFPLE1BQU8sRUFBRyxRQUFTLEtBQU0sUUFBUyxLQUFNLFFBQVMsTUFBTyxRQUFTLE1BQU8sUUFBUyxNQUFPLFNBQVUsTUFBTyxVQUFXLE1BQU8sU0FBVSxNQUFPLFVBQVcsTUFBTyxVQUFXLE1BQU8sV0FBWSxNQUFPLEtBQU0sTUFBTyxNQUFPLEdBQUksS0FBTSxNQUFPLFNBQVUsRUFBRyxTQUFVLE1BQU8sU0FBVSxNQUFPLE1BQU8sY0FBZSxNQUFPLEtBQU0sTUFBTywyQkFBNEIsTUFBTyxpR0FBa0csTUFBTyxNQUFPLE1BQU8sTUFBTyxNQUFPLE1BQU8sTUFBTyxNQUFPLE1BQU8sVUFBVyxNQUFPLFdBQVksUUFBUyxNQUFPLE9BQVEsV0FBWSxTQUFVLEtBQU0sTUFBTyxXQUFZLFFBQVMsTUFBTyxPQUFRLFFBQVMsU0FBVSxNQUFPLE9BQVEsV0FBWSxTQUFVLEtBQU0sTUFBTyxHQUFJLFFBQVMsTUFBTyxNQUFPLFdBQVksUUFBUyxNQUFPLFFBQVMsUUFBUyxVQUFXLE1BQU8sUUFBUyxXQUFZLFVBQVcsTUFBTyxPQUFRLFFBQVMsU0FBVSxNQUFPLE9BQVEsTUFBTyxNQUFPLEdBQUksUUFBUyxNQUFPLE1BQU8sV0FBWSxRQUFTLEtBQU0sTUFBTyxXQUFZLFFBQVMsS0FBTSxNQUFPLFFBQVMsUUFBUyxNQUFPLE9BQVEsR0FBSSxTQUFVLE1BQU8sTUFBTyxRQUFTLFFBQVMsTUFBTyxNQUFP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LENBQUMsRUFDNUMsSUFBSSxPQUFPLEdBQUcsRUFBRSxLQUFLLHVCQUF1QixDQUM5QyxDQUNGLENBQUMsQ0FDSCxDQUVBLE1BQU0sT0FBUyxJQUFJLE9BQU8sSUFBTSxVQUFXLElBQU0sQ0FDL0MsT0FBTyxLQUFLLDJDQUEyQyxDQUN6RCxDQUFDLEVBR0QsTUFBTSxpQkFBbUIsT0FBQyxRQUFtQixDQUMzQyxPQUFPLEtBQUsscUJBQXFCLE1BQU0sZ0NBQWdDLEVBQ3ZFLFFBQVEsS0FBSyxDQUFDLENBQ2hCLEVBSHlCLG9CQUt6QixRQUFRLEdBQUcsVUFBVyxJQUFNLGlCQUFpQixTQUFTLENBQUMsRUFDdkQsUUFBUSxHQUFHLFNBQVUsSUFBTSxpQkFBaUIsUUFBUSxDQUFDLENBQ3ZELEdBQUcsQ0FDTCxDQUVBLElBQU8sZUFBUSIsIm5hbWVzIjpbImlzU3VwYWJhc2VDb25maWd1cmVkIiwiY2xpZW50Iiwic25hcHNob3QiLCJwYXRoIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VzIjpbIi9hcHAvYXBwbGV0L3NlcnZlci50cyJdLCJzb3VyY2VzQ29udGVudCI6W251bGxdfQ==
