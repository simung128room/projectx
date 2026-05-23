import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import path from 'path';
import cors from 'cors';
import axios from 'axios';
axios.defaults.timeout = 15000; // 15 seconds global timeout
import CircuitBreaker from 'opossum';
import { CookieJar } from 'tough-cookie';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import https from 'node:https';
import tls from 'node:tls';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { spawn, ChildProcess } from 'child_process';
import WebSocket from 'ws';

import rateLimit from 'express-rate-limit';
import multer from 'multer';
import fs from 'fs';
import os from 'os';
import zlib from 'zlib';
import cloudscraper from 'cloudscraper';

import { promisify } from 'util';
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

const compressStock = async (stockData: any) => {
  if (!Array.isArray(stockData)) return stockData;
  
  if (stockData.length >= 250) {
    const buffer = await gzipAsync(JSON.stringify(stockData));
    return [{ __compressed: buffer.toString('base64') }];
  }

  const str = JSON.stringify(stockData);
  if (str.length > 50000) {
    const buffer = await gzipAsync(str);
    return [{ __compressed: buffer.toString('base64') }];
  }

  return stockData;
};

const decompressStock = async (data: any) => {
  let compData = data;
  if (Array.isArray(data) && data.length === 1 && data[0] && typeof data[0] === 'object' && data[0].__compressed) {
    compData = data[0];
  }
  if (compData && typeof compData === 'object' && compData.__compressed) {
    try {
      const buffer = await gunzipAsync(Buffer.from(compData.__compressed, 'base64'));
      return JSON.parse(buffer.toString('utf-8'));
    } catch(e) { 
        console.error("decompressStock error:", e);
        return []; 
    }
  }
  return data;
};

// Automatic Free Proxy fetcher
let freeProxies: string[] = [];
let lastFreeProxyFetch = 0;

async function fetchFreeProxies() {
  const now = Date.now();
  // Fetch every 15 minutes to avoid rate limits
  if (now - lastFreeProxyFetch < 15 * 60 * 1000 && freeProxies.length > 0) return;
  lastFreeProxyFetch = now;
  try {
    const res = await axios.get('https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt', { timeout: 10000 });
    if (typeof res.data === 'string') {
      const proxies = res.data.split('\n').map(p => p.trim()).filter(p => p.length > 5);
      if (proxies.length > 0) {
        freeProxies = proxies.map(p => p.startsWith('http') ? p : `http://${p}`);
        console.log(`[Proxy] Fetched ${freeProxies.length} free proxies automatically.`);
      }
    }
  } catch (err: any) {
    console.error('[Proxy] Failed to fetch free proxies:', err.message);
  }
}

// Initial fetch
fetchFreeProxies();
setInterval(fetchFreeProxies, 15 * 60 * 1000);

import { adminDb as admin, supabaseAdmin } from './src/lib/admindb.js';

const _dirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit
const communityUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit


import compression from 'compression';
import helmet from 'helmet';
import sharp from 'sharp';

console.log('[Server] --- Supabase VERSION REBOOT ---');

// Validate Critical Secrets before starting
const REQUIRED_SECRETS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of REQUIRED_SECRETS) {
  if (!process.env[key]) {
    console.error(`[Fatal Error] Missing required secret: ${key}`);
    process.exit(1);
  }
}

async function sendAlert(title: string, message: string, color: number = 16711680, requestId?: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;
  try {
    const desc = requestId ? message + `\n**Request ID**: ${requestId}` : message;
    await axios.post(webhookUrl, {
      embeds: [{
        title,
        description: desc,
        color,
        timestamp: new Date().toISOString()
      }]
    });
  } catch (err: any) {
    console.error('Failed to send discord alert:', err.message);
  }
}

// Immutable Audit Logging
async function writeAuditLog(action: string, actor: string, target: string, req: express.Request | any, extraContext: any = {}) {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      actor,
      target,
      ip: req.ip || 'Unknown',
      requestId: req.id || 'N/A',
      ...extraContext
    };
    // Disabled DB writing due to missing table
    // await admin.firestore().collection('sys_audit_logs').add(logEntry);
  } catch (err) {
    console.error('[Audit Log] Failed to write audit log:', err);
  }
}

// Global Error Boundaries
process.on('uncaughtException', (err) => {
  console.error(JSON.stringify({ level: 'fatal', event: 'uncaughtException', message: err.message, stack: err.stack }));
  
  // Synchronous trace for sure crash logging
  try {
    fs.appendFileSync('crash.log', `${new Date().toISOString()} ${err.stack}\n`);
  } catch(e) {}

  sendAlert('Uncaught Exception 🔥', `**Error**: ${err.message}`, 16711680)
    .catch(() => {})
    .finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(JSON.stringify({ level: 'error', event: 'unhandledRejection', reason: String(reason) }));
  sendAlert('Unhandled Rejection ⚠️', `**Reason**: ${String(reason)}`, 16711680);
});

import client from 'prom-client';

const app = express();


// Initialize Prometheus Metrics
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [10, 50, 100, 300, 500, 1000, 3000, 5000] // Buckets for response time
});

export const dbQueryDurationMicroseconds = new client.Histogram({
  name: 'db_query_duration_ms',
  help: 'Duration of Database queries in ms',
  labelNames: ['collection', 'operation'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000]
});

app.use((req: any, res: any, next: any) => {
  const start = Date.now();
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    // Don't track static assets to avoid cardinality explosion
    if (route.startsWith('/api/') || route === '/metrics' || route === '/ready') {
      httpRequestDurationMicroseconds.labels(req.method, route, res.statusCode.toString()).observe(duration);
    }
  });
  
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.youtube.com", "https://s.ytimg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"], // Allow external images (avatars, product images)
      mediaSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "https://api.ipify.org", "wss://*.supabase.co"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://discord.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.set('trust proxy', 1);
  const PORT = 3000;
  
  import { pinoHttp } from 'pino-http';
  import pino from 'pino';
  import { AsyncLocalStorage } from 'node:async_hooks';
  import { randomUUID } from 'node:crypto';
  import { monitorEventLoopDelay } from 'node:perf_hooks';

  const asyncLocalStorage = new AsyncLocalStorage<Map<string, string>>();

  const logger = pino({
    level: process.env.LOG_LEVEL || 'info', 
    formatters: {
      level: (label) => { return { level: label }; },
    },
    mixin() {
      const store = asyncLocalStorage.getStore();
      return {
        requestId: store?.get('requestId')
      };
    },
    timestamp: pino.stdTimeFunctions.isoTime
  });

  // System Metrics & Adaptive Concurrency
  const eldHistogram = monitorEventLoopDelay({ resolution: 20 });
  eldHistogram.enable();
  
  let currentConcurrentRequests = 0;
  let dynamicMaxConcurrency = process.env.INITIAL_CONCURRENT_REQUESTS ? parseInt(process.env.INITIAL_CONCURRENT_REQUESTS) : 800;
  const ABSOLUTE_MAX_CONCURRENCY = 2000;
  const MIN_CONCURRENCY = 50;
  let shedCount = 0;

  const activeRequests = new Map<string, { start: number, url: string, method: string }>();

  // Adaptive Capacity Tuner & Metrics logger
  setInterval(() => {
    const lagMs = eldHistogram.mean / 1e6;
    
    if (lagMs > 100) {
      // Event loop lagging, reduce concurrency limit (Multiplicative Decrease)
      dynamicMaxConcurrency = Math.max(MIN_CONCURRENCY, Math.floor(dynamicMaxConcurrency * 0.8));
    } else if (lagMs < 40 && currentConcurrentRequests >= dynamicMaxConcurrency * 0.7) {
      // Event loop healthy and we are utilizing capacity, increase limit (Additive Increase)
      dynamicMaxConcurrency = Math.min(ABSOLUTE_MAX_CONCURRENCY, dynamicMaxConcurrency + 50);
    }

    const mem = process.memoryUsage();
    logger.info({
      eventLoopLagMaxMs: eldHistogram.max / 1e6,
      eventLoopLagMeanMs: Math.round(lagMs),
      dynamicMaxConcurrency,
      currentConcurrentRequests,
      shedCount,
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      activeHandles: (process as any)._getActiveHandles().length,
    }, 'System Health & Adaptive Concurrency Tick');
    
    shedCount = 0; // reset counter
    eldHistogram.reset();
  }, 10000).unref(); // 10 second interval for faster adaptive response
  
  // Watchdog for slow requests
  setInterval(() => {
    const now = Date.now();
    for (const [id, reqData] of activeRequests.entries()) {
      const duration = now - reqData.start;
      if (duration > 5000) { // 5s timeout warning
        logger.warn({
          requestId: id,
          url: reqData.url,
          method: reqData.method,
          durationMs: duration
        }, 'Slow Request Watchdog ⚠️: Request hanging');
      }
    }
  }, 5000).unref();

  app.use((req, res, next) => {
    // Health checks and metrics bypass shedding completely
    const isPriorityRoute = req.url?.includes('/health') || req.url?.includes('/live') || req.url?.includes('/ready') || req.url?.includes('/api/stats');
    
    // Priority Tiering
    // 2 (CRITICAL): Payment, Auth
    // 1 (HIGH): User data, Admin
    // 0 (NORMAL): Products, General
    let requestPriority = 0; 
    if (req.url?.includes('/api/purchases') || req.url?.includes('/api/topups')) {
       requestPriority = 2;
    } else if (req.url?.includes('/api/users') || req.url?.includes('/admin')) {
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
         // Panic state, shed everything except bypass routes
         shouldShed = true;
      }
    }
    
    if (shouldShed) {
      shedCount++;
      res.setHeader('Retry-After', '2');
      logger.warn({ currentConcurrentRequests, dynamicMaxConcurrency, priority: requestPriority, url: req.url }, 'Load Shedding Active - Dropping Request');
      return res.status(503).json({ error: 'Service Unavailable (High Load)' });
    }

    currentConcurrentRequests++;
    
    const requestId = (req.headers['x-request-id'] as string) || (req.headers['cf-ray'] as string) || randomUUID();
    (req as any).id = requestId;
    res.setHeader('X-Request-ID', requestId);
    
    activeRequests.set(requestId, { start: Date.now(), url: req.url || 'unknown', method: req.method });
    
    let decremented = false;
    const releaseConcurrency = () => {
      if (!decremented) {
        currentConcurrentRequests--;
        decremented = true;
        activeRequests.delete(requestId);
      }
    };
    
    res.once('finish', releaseConcurrency);
    res.once('close', releaseConcurrency);
    
    const store = new Map<string, string>();
    store.set('requestId', requestId);
    
    asyncLocalStorage.run(store, () => {
      next();
    });
  });

  app.use(pinoHttp({
    logger,
    customProps: (req, res) => {
      return {
        userId: (req as any).user?.uid || 'guest'
      }
    },
    useLevel: 'info',
    quietReqLogger: true,
    autoLogging: {
      ignore: (req) => {
        const url = req.url || '';
        return url.includes('/health') || 
               url.includes('/live') || 
               url.includes('/ready') || 
               !url.startsWith('/api/');
      }
    }
  }));

  // Export root logger for use in other places
  // We remove global console.log override to prevent library timing issues.
  // (req as any).log can be used but let's stick to simple
  
  // Health and Liveness Probes
  app.get('/health', async (req, res) => {
    const used = process.memoryUsage();
    // Memory threshold alert
    if (used.heapUsed / used.heapTotal > 0.90) {
      sendAlert('High Memory Usage ⚠️', `Heap is at ${Math.round((used.heapUsed/used.heapTotal)*100)}% (${Math.round(used.heapUsed/1024/1024)}MB)`, 16753920).catch(() => {});
    }
    
    res.json({ 
      status: 'ok', 
      uptime: process.uptime(), 
      memory: used,
      metrics: {
        concurrentRequests: currentConcurrentRequests,
        eventLoopLag: eldHistogram.mean / 1e6
      }
    });
  });
  
  // Liveness Probe: Just verifies process is running & event loop is ticking
  app.get('/live', (req, res) => res.json({ status: 'alive' }));
  
  // Readiness Probe: Verifies process is capable of downstream operations
  app.get('/ready', async (req, res) => {
    try {
      // Validate Database Connectivity with a fast fail CircuitBreaker-like timeout pattern
      // To ensure readiness checks do not hang indefinitely and fool the orchestrator
      const firestorePromise = admin.firestore().collection('products').limit(1).get();
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore Connection Timeout')), 4500));
      
      await Promise.race([firestorePromise, timeoutPromise]);
      
      res.json({ 
        status: 'ready', 
        uptime: process.uptime(),
        sheddingMetrics: { currentConcurrentRequests } 
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Readiness Probe Failed: Database disconnected or slow');
      res.status(503).json({ status: 'not ready', error: String(err) });
    }
  });

  // Key generator that considers IP + UID (if authenticated)
  const userRateLimitKeyGenerator = (req: any, res: any) => {
    const ip = req.rateLimit?.keyGenerator ? req.rateLimit.keyGenerator(req, res) : req['ip'];
    return `${ip}:${(req as any).user?.uid || 'guest'}`;
  };

  // Add RateLimiting to prevent bot attacks
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userRateLimitKeyGenerator,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'ขออภัย คุณทำรายการบ่อยเกินไป กรุณารอสักครู่' },
    handler: (req: any, res: any, next: any, options: any) => {
      sendAlert('Auth Rate Limit Triggered 🚨', `**IP**: ${req.ip}\n**User**: ${(req as any).user?.uid || 'guest'}\n**Path**: ${req.originalUrl}\n**Method**: ${req.method}`, 16711680, req.id);
      res.status(options.statusCode || 429).json({ ...options.message, requestId: req.id });
    }
  });

  const mutationLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30, // 30 requests per minute
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: userRateLimitKeyGenerator,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'คุณดำเนินการบางอย่างเร็วเกินไป กรุณารอสักครู่' },
    handler: (req: any, res: any, next: any, options: any) => {
      sendAlert('Mutation Rate Limit Triggered ⚠️', `**IP**: ${req.ip}\n**User**: ${(req as any).user?.uid || 'guest'}\n**Path**: ${req.originalUrl}\n**Method**: ${req.method}`, 16753920, req.id);
      res.status(options.statusCode || 429).json({ ...options.message, requestId: req.id });
    }
  });

  const checkLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100, 
    standardHeaders: true, 
    legacyHeaders: false, 
    keyGenerator: userRateLimitKeyGenerator,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'ขออภัย คุณส่งคำร้องขอเยอะเกินไป (Anti-Bot Protection) กรุณารอสักครู่' },
    handler: (req: any, res: any, next: any, options: any) => {
      res.status(options.statusCode || 429).json({ ...options.message, requestId: req.id });
    }
  });

  const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 200, 
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'Too many requests, please try again later.' }
  });

  app.use('/api/', globalLimiter);

const userTokenCache = new Map<string, { user: any, isAdmin: boolean, timestamp: number } | Promise<{ user: any, isAdmin: boolean, timestamp: number }>>();

const cleanupTokenCache = () => {
  if (userTokenCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of userTokenCache.entries()) {
      if (!(value instanceof Promise) && now - value.timestamp > 60000) {
        userTokenCache.delete(key);
      }
    }
    // If still too large after expiry sweep, remove oldest
    if (userTokenCache.size > 1000) {
      const keysToDelete = Array.from(userTokenCache.keys()).slice(0, userTokenCache.size - 1000);
      for (const key of keysToDelete) {
        userTokenCache.delete(key);
      }
    }
  }
};

  const injectUser = async (req: any, res: any, next: any) => {
    cleanupTokenCache();
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1]?.trim();
      if (token && token !== 'null' && token !== 'undefined') {
        const now = Date.now();
        const cached = userTokenCache.get(token);
        
        if (cached) {
          if (cached instanceof Promise) {
            try {
              const result = await cached;
              req.user = result.user;
              req.isAdmin = result.isAdmin;
              return next();
            } catch (e) {
              // fall through and try again
            }
          } else if (now - cached.timestamp < 60000) {
            req.user = cached.user;
            req.isAdmin = cached.isAdmin;
            return next();
          }
        }

        const resolveAuth = async () => {
          let userObj = null;
          let isAdminObj = false;
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          if (error) throw error;
          if (user) {
            userObj = user;
            (userObj as any).uid = user.id; // Map Supabase user.id to Firebase user.uid
            const adminEmails = [
              'abopboa.b@gmail.com',
              'admin_apex@apex-studio.com',
              'admin@apex-studio.com',
              'admin@admin.com',
              'apex@apex.com'
            ];
            if (adminEmails.includes(user.email || '')) {
              isAdminObj = true;
            } else {
              const userDoc = await admin.firestore().collection('users').doc(user.id).get();
              if (userDoc.exists) {
                const userData = typeof userDoc.data === 'function' ? userDoc.data() : null;
                isAdminObj = userData && typeof userData.role === 'string' && (userData.role.toLowerCase() === 'admin' || userData.role.toLowerCase() === 'owner');
              } else {
                isAdminObj = false;
              }
            }
          }
          return { user: userObj, isAdmin: isAdminObj, timestamp: Date.now() };
        };

        const authPromise = resolveAuth();
        userTokenCache.set(token, authPromise);

        try {
          const result = await authPromise;
          userTokenCache.set(token, result);
          if (result.user) {
            req.user = result.user;
            req.isAdmin = result.isAdmin;
          }
        } catch (error: any) {
          userTokenCache.delete(token);
          if (error && error.message && error.message.includes('expired')) {
            // Ignore expired token
          } else {
            console.error('Error verifying ID token in injectUser:', error.message || error);
          }
        }
      }
    }
    next();
  };

  const requireAuth = async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    next();
  };

  const requireAdmin = async (req: any, res: any, next: any) => {
    if (!req.user || !req.isAdmin) {
      console.error(`[AdminCheck] Access Denied for ${(req as any).user?.email || 'Unknown'}. isAdmin: ${req.isAdmin}`);
      return res.status(403).json({ error: 'Forbidden: Admin access required. Please re-login.' });
    }
    next();
  };

  // API health check immediately
  app.get('/api/health', async (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
    // Muted for performance
    
    // Check if blocked bypassed for performance
    let isBlocked = false;
    
    res.json({ 
      status: 'ok', 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
      clientIp: clientIp,
      blocked: isBlocked
    });
  });

  app.use(cors());
  app.options('*', cors());
  app.use(express.json({ limit: '50mb' }));
  
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
       // Define purely public GET APIs
       const publicGetRoutes = ['/api/products', '/api/categories', '/api/pages', '/api/stats', '/api/settings'];
       
       if (req.method === 'GET' && publicGetRoutes.includes(req.path)) {
           // Allow these to handle their own cache policies
       } else {
           res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
           res.setHeader('Pragma', 'no-cache');
           res.setHeader('Expires', '0');
       }
    }
    next();
  });
  
  app.use(injectUser);

  // Helper to check magic bytes
  const isImageSafe = (buffer: Buffer) => {
    if (buffer.length < 4) return false;
    const hex = buffer.toString('hex', 0, 4).toUpperCase();
    const isJpeg = hex.startsWith('FFD8FF');
    const isPng = hex.startsWith('89504E47');
    const isGif = hex.startsWith('47494638'); // GIF8
    const isWebp = hex.startsWith('52494646') && buffer.toString('hex', 8, 12).toUpperCase() === '57454250'; // RIFF...WEBP
    return isJpeg || isPng || isGif || isWebp;
  };

  app.post('/api/upload', requireAdmin, (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
      next();
    });
  }, async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!isImageSafe(req.file.buffer)) {
      sendAlert('Unsafe Upload Attempt (Admin) ⚠️', `**IP**: ${req.ip}\n**User**: ${(req as any).user?.uid || 'guest'}`, 16753920, req.id);
      return res.status(400).json({ error: 'Invalid file type. Only secure images allowed.' });
    }
    
    try {
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();
      
      const sanitizedBuffer = await image.webp({ quality: 80 }).toBuffer();
      const mimeType = 'image/webp';
      
      // Limit to 5MB after process
      if (sanitizedBuffer.length > 5 * 1024 * 1024) {
         throw new Error('Output image size exceeds limit after re-encoding');
      }

      const base64Data = sanitizedBuffer.toString('base64');
      res.json({ url: `data:${mimeType};base64,${base64Data}` });
    } catch (err: any) {
      console.error('Image processing failed:', err);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  app.post('/api/community/upload', requireAuth, (req: any, res: any, next: any) => {
    communityUpload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
      next();
    });
  }, async (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!isImageSafe(req.file.buffer)) {
      sendAlert('Unsafe Upload Attempt (Community) ⚠️', `**IP**: ${req.ip}\n**User**: ${(req as any).user?.uid || 'guest'}`, 16753920, req.id);
      return res.status(400).json({ error: 'Invalid file type. Only secure images allowed.' });
    }
    
    try {
      const image = sharp(req.file.buffer);
      const metadata = await image.metadata();
      
      const sanitizedBuffer = await image.webp({ quality: 80 }).toBuffer();
      const mimeType = 'image/webp';
      
      // Limit to 5MB after process
      if (sanitizedBuffer.length > 5 * 1024 * 1024) {
         throw new Error('Output image size exceeds limit after re-encoding');
      }

      const base64Data = sanitizedBuffer.toString('base64');
      res.json({ url: `data:${mimeType};base64,${base64Data}` });
    } catch (err: any) {
      console.error('Image processing failed:', err);
      res.status(500).json({ error: 'Failed to process image' });
    }
  });

  

  // Structured Logging Middleware removed as pinoHttp handles this

  // Remove duplicate health check below
  // app.get('/api/health', (req, res) => { ... })
  
  // Site Settings State
  let lastStatsFetch = 0;
  let cachedStats: any = null;
  const invalidateStatsCache = () => { lastStatsFetch = 0; cachedStats = null; };
  let siteSettings: any = {
    site_name: process.env.VITE_SITE_NAME || 'STORETH',
    truewallet_phone: process.env.TRUEWALLET_PHONE || '',
    contact_line: process.env.CONTACT_LINE || '',
    discord_link: '',
    facebook_link: '',
    instagram_link: '',
    contact_email: 'support.apexstoreth@gmail.com',
    stats_users_offset: 892,
    stats_sales_offset: 4432,
    popup_img_url: 'https://img2.pic.in.th/Red-Black-White-Anime-Podcast-Discord-Logocc6d3bfe807340af.png',
    popup_enabled: true,
    popup_link: '',
    banners: ["https://img2.pic.in.th/-71_20260516210303.png"],
    spotify_url: 'https://youtu.be/WczSfh3gJaU?si=PI1i4X0p0FGbdEfq',
    spotify_autoplay: true,
    proxies: ['http://e7221fa7-20b7-43a7-9f76-c69fbc35cdef@lv3.gen5.netmld.shop:8080'],
    auto_proxy: true
  };

  // Load from DB
  (async () => {
    try {
      const docName = process.env.NODE_ENV === 'production' ? 'sys_site' : 'sys_site_dev';
      const { data } = await supabaseAdmin.from('custom_pages').select('*').eq('slug', docName).single();
      if (data && data.content) {
        let parsed = {};
        try { parsed = JSON.parse(data.content); } catch(e) {}
        siteSettings = { ...siteSettings, ...parsed };
        console.log("Loaded initial site settings from DB");
      }
    } catch (err: any) {
      console.warn("Could not load initial site settings from DB (might not exist yet).", err.message || err);
    }
  })();

  app.get('/api/settings', (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400');
    res.json(siteSettings);
  });

  app.post('/api/reset-password', authLimiter, async (req, res) => {
    const { username, email, newPassword } = req.body;
    try {
      const generatedEmail = `${username.toLowerCase().replace(/\s+/g, '')}@apex-studio.com`;
      const usersSnapshot = await admin.firestore().collection('users')
        .where('email', '==', generatedEmail)
        .where('recoveryEmail', '==', email)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้ หรือข้อมูลไม่ถูกต้อง' });
      }

      const userId = usersSnapshot.docs[0].id;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal error' });
    }
  });

  app.post('/api/signup', authLimiter, async (req, res) => {
    const { email, password, recoveryEmail } = req.body;
    try {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (error) {
         return res.status(400).json({ error: error.message });
      }
      
      try {
        await admin.firestore().collection('users').doc(data.user.id).set({
          email,
          recoveryEmail: recoveryEmail || null,
          username: email.split('@')[0],
          balance: 0,
          role: 'user',
          status: 'active',
          updatedAt: new Date().toISOString()

        }, { merge: true });
      } catch (err: any) {
        console.error('Failed to create user doc:', err.message || err);
        if (err.details) console.error('Error Details:', err.details);
      }

      return res.json({ success: true, user: data.user });
    } catch (e: any) {
      return res.status(500).json({ error: String(e) });
    }
  });

  app.post('/api/settings', requireAdmin, async (req, res) => {
    console.log("=== POST /api/settings REACHED ===", req.body);
    const { truewallet_phone, site_name, contact_line, stats_users_offset, stats_sales_offset, stats_categories_offset, stats_stock_offset, stats_users_override, stats_stock_override, stats_sales_override, stats_categories_override, popup_img_url, popup_enabled, popup_link, banners, proxies, auto_proxy, spotify_url, spotify_autoplay } = req.body;
    if (truewallet_phone !== undefined) siteSettings.truewallet_phone = truewallet_phone;
    if (site_name !== undefined) siteSettings.site_name = site_name;
    if (contact_line !== undefined) siteSettings.contact_line = contact_line;
    if (stats_users_offset !== undefined) siteSettings.stats_users_offset = parseInt(stats_users_offset) || 0;
    if (stats_sales_offset !== undefined) siteSettings.stats_sales_offset = parseInt(stats_sales_offset) || 0;
    if (stats_categories_offset !== undefined) siteSettings.stats_categories_offset = parseInt(stats_categories_offset) || 0;
    if (stats_stock_offset !== undefined) siteSettings.stats_stock_offset = parseInt(stats_stock_offset) || 0;
    if (stats_users_override !== undefined) siteSettings.stats_users_override = stats_users_override === null || isNaN(parseInt(stats_users_override)) ? null : parseInt(stats_users_override);
    if (stats_stock_override !== undefined) siteSettings.stats_stock_override = stats_stock_override === null || isNaN(parseInt(stats_stock_override)) ? null : parseInt(stats_stock_override);
    if (stats_sales_override !== undefined) siteSettings.stats_sales_override = stats_sales_override === null || isNaN(parseInt(stats_sales_override)) ? null : parseInt(stats_sales_override);
    if (stats_categories_override !== undefined) siteSettings.stats_categories_override = stats_categories_override === null || isNaN(parseInt(stats_categories_override)) ? null : parseInt(stats_categories_override);
    if (popup_img_url !== undefined) siteSettings.popup_img_url = popup_img_url;
    if (popup_enabled !== undefined) siteSettings.popup_enabled = popup_enabled === true || popup_enabled === 'true';
    if (popup_link !== undefined) siteSettings.popup_link = popup_link;
    if (spotify_url !== undefined) siteSettings.spotify_url = spotify_url;
    if (spotify_autoplay !== undefined) siteSettings.spotify_autoplay = spotify_autoplay === true || spotify_autoplay === 'true';
    if (banners !== undefined && Array.isArray(banners)) siteSettings.banners = banners;
    if (proxies !== undefined && Array.isArray(proxies)) siteSettings.proxies = proxies;
    if (auto_proxy !== undefined) siteSettings.auto_proxy = auto_proxy === true || auto_proxy === 'true';
    
    // Clear cached stats so they refresh next time someone calls /api/stats
    lastStatsFetch = 0;
    
    try {
      const docName = process.env.NODE_ENV === 'production' ? 'sys_site' : 'sys_site_dev';
      console.log(`[Settings] Attempting to save to DB doc: ${docName}`);
      const payload = { slug: docName, title: 'System Settings', content: JSON.stringify(siteSettings) };
      const { data: existing } = await supabaseAdmin.from('custom_pages').select('id').eq('slug', docName).single();
      if (existing && existing.id) {
         await supabaseAdmin.from('custom_pages').update(payload).eq('id', existing.id);
      } else {
         await supabaseAdmin.from('custom_pages').insert([payload]);
      }
      console.log(`[Settings] Save Successful for ${docName}`);
    } catch(e: any) {
      console.error('[API/Settings] CRITICAL SAVE ERROR:', e);
      const errorDetail = e.message || e.details || JSON.stringify(e);
      return res.status(500).json({ 
        error: 'Failed to save settings to database',
        detail: errorDetail,
        doc: process.env.NODE_ENV === 'production' ? 'sys_site' : 'sys_site_dev'
      });
    }
    
    console.log(`[Settings] Updated:`, siteSettings);
    writeAuditLog('SITE_SETTINGS_UPDATE', (req as any).user?.uid || 'admin', 'sys_settings', req);
    return res.json({ success: true, settings: siteSettings });
  });

  app.post('/api/topup/truemoney', mutationLimiter, requireAuth, async (req: any, res: any) => {
    try {
      const { voucherCode } = req.body;
      const uid = (req as any).user.uid;
      const phone = siteSettings.truewallet_phone;
      
      if (!voucherCode) {
        return res.status(400).json({ success: false, error: 'กรุณากรอกลิงก์ซองของขวัญ' });
      }

      // Extract voucher hash from URL or use as is
      let voucherHash = voucherCode.trim();
      
      // If it's a full URL, extract from ?v= or &v=
      const urlMatch = voucherHash.match(/[?&]v=([^&#\s]+)/);
      if (urlMatch) {
        voucherHash = urlMatch[1];
      } else if (voucherHash.includes('truemoney.com')) {
        // Fallback for some links that might skip the 'v=' but contain hash in some way
        const parts = voucherHash.split('/');
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length >= 10) {
          voucherHash = lastPart;
        }
      }
      
      // Final cleanup: just in case there's whitespace or extra chars
      voucherHash = voucherHash.replace(/[^a-zA-Z0-9]/g, '');

      console.log(`[TrueWallet] Attempting to redeem via XPLUEM: "${voucherHash}" for phone: ${phone}`);

      // Using the new API: https://api.xpluem.com/:link/:phone
      const fetchTopup = async (vHash: string, pPhone: string) => {
        return await axios.get(`https://api.xpluem.com/${vHash}/${pPhone}`, {
            timeout: 15000,
            validateStatus: (status) => status < 500
        });
      };

      const topupBreaker = new CircuitBreaker(fetchTopup, {
        timeout: 15000,
        errorThresholdPercentage: 50,
        resetTimeout: 30000 
      });

      let response: any;
      try {
        response = await topupBreaker.fire(voucherHash, phone);
      } catch (err: any) {
        console.error(`[TrueWallet] XPLUEM Circuit Breaker Error:`, err.message);
        return res.status(503).json({ error: 'ระบบเติมเงินขัดข้อง (Circuit Breaker Open) กรุณาลองใหม่ภายหลัง', isProxyError: true });
      }

      const result = response.data;
      console.log(`[TrueWallet] XPLUEM Response:`, JSON.stringify(result));

      if (result.success === true) {
          const amount = parseFloat(result.data?.amount || 0);
          console.log(`[TrueWallet] Successfully redeemed ฿${amount}`);

          if (uid) {
            try {
              const userRef = admin.firestore().collection('users').doc(uid);
              const userDoc = await userRef.get();
              if (userDoc.exists) {
                const currentBalance = userDoc.data().balance || 0;
                await userRef.update({ balance: currentBalance + amount });
                console.log(`[TrueWallet] Updated balance for user ${uid} (+฿${amount})`);
                
                // Add to topups history
                await admin.firestore().collection('topups').add({
                  id: Math.random().toString(36).substring(7),
                  userId: userDoc.data().username || 'Unknown',
                  uid: uid,
                  amount: amount,
                  date: new Date().toISOString(),
                  type: 'truewallet',
                  money: amount,
                  title: 'เติมเงินสำเร็จ',
                  image: 'https://img1.pic.in.th/images/IMG_6162.png'
                });
              }
            } catch (syncErr) {
              console.error(`[TrueWallet] Balance sync error:`, syncErr);
            }
          }

          return res.json({ 
            success: true, 
            amount,
            message: result.message || 'รับเงินสำเร็จ'
          });
      } else {
          const errorMsg = result.message || 'ไม่สามารถรับเงินได้ (สถานะไม่สำเร็จ)';
          console.warn(`[TrueWallet] Failed: ${errorMsg}`);
          return res.json({ success: false, error: errorMsg });
      }
    } catch (error: any) {
        console.error("[TrueWallet] Gateway Error:", error.message);
        if (error.response) {
            const result = error.response.data;
            return res.json({ success: false, error: result?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ API' });
        }
        return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
    }
  });

  const usedSlips = new Set<string>();

  app.post('/api/topup/slip', mutationLimiter, requireAuth, async (req: any, res: any) => {
    try {
      const { imageBase64 } = req.body;
      const uid = (req as any).user.uid;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
      }

      const imageBuffer = Buffer.from(imageBase64, 'base64');
      
      // Limit file size to ~5MB
      if (imageBuffer.length > 5 * 1024 * 1024) {
         console.warn(`[Security] User ${uid} attempted to upload a file too large (${imageBuffer.length} bytes).`);
         return res.status(400).json({ success: false, error: 'ขนาดไฟล์ใหญ่เกินไป (ห้ามเกิน 5MB)' });
      }

      // Detect magic bytes 
      const hex = imageBuffer.toString('hex', 0, 4).toUpperCase();
      const isJpeg = hex.startsWith('FFD8FF');
      const isPng = hex.startsWith('89504E47');
      
      if (!isJpeg && !isPng) {
         console.warn(`[Security] User ${uid} uploaded invalid file type (magic bytes: ${hex}).`);
         return res.status(400).json({ success: false, error: 'รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG หรือ PNG เท่านั้น' });
      }

      const blob = new Blob([imageBuffer], { type: isJpeg ? 'image/jpeg' : 'image/png' });
      const form = new FormData();
      form.append('files', blob, isJpeg ? 'slip.jpg' : 'slip.png');

      const response = await axios.post(
        'https://api.slipok.com/api/line/apikey/65331',
        form,
        {
          headers: {
            'x-authorization': 'SLIPOKA9ZEE71'
          }
        }
      );

      // Checking response format from SlipOK
      if (response.data.success === true || response.data.code === '0000' || response.data.data?.amount !== undefined) {
        const amount = response.data.data?.amount;
        const transRef = response.data.data?.transRef;
        const receiverProxy = response.data.data?.receiver?.proxy?.value || '';
        const receiverName = response.data.data?.receiver?.displayName || response.data.data?.receiver?.name || '';
        
        const EXPECTED_SHOP_NAME_1 = "ด.ช. กรวิชญ์ มาตขาว";
        const EXPECTED_SHOP_NAME_2 = "Master Korawit Makthaw";
        
        // ตรวจสอบชื่อบัญชีร้าน
        const isMatch = receiverName.includes(EXPECTED_SHOP_NAME_1) || 
                        receiverName.toUpperCase().includes(EXPECTED_SHOP_NAME_2.toUpperCase()) ||
                        receiverName.includes("กรวิชญ์");
        
        if (!isMatch) {
            return res.json({ 
              success: false, 
              error: `ชื่อบัญชีผู้รับเงินไม่สมบูรณ์ (สลิปโอนไปที่: ${receiverName || 'ไม่ระบุ'}) ไม่ตรงกับชื่อบัญชีของทางร้าน กรุณาติดต่อแอดมิน` 
            });
        }
        
        if (transRef) {
          // Check if used in DB
          try {
             const existingRef = await admin.firestore().collection('slips').doc(transRef).get();
             if (existingRef.exists) {
                return res.json({ success: false, error: 'สลิปนี้ถูกใช้งานไปแล้ว (ตรวจสอบจากระบบ)' });
             }
             await admin.firestore().collection('slips').doc(transRef).set({
               uid,
               amount,
               used_at: new Date().toISOString()
             });
          } catch(e) {
             // Fallback to local memory if DB fails
             if (usedSlips.has(transRef)) {
               return res.json({ success: false, error: 'สลิปนี้ถูกใช้งานไปแล้ว (local)' });
             }
             usedSlips.add(transRef);
          }
        }

        if (uid) {
          try {
            const userRef = admin.firestore().collection('users').doc(uid);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
              const currentBalance = userDoc.data().balance || 0;
              await userRef.update({ balance: currentBalance + amount });
              console.log(`[Slip] Updated balance for user ${uid} (+฿${amount})`);
              
              // Add to topups history
              await admin.firestore().collection('topups').add({
                id: Math.random().toString(36).substring(7),
                userId: userDoc.data().username || 'Unknown',
                uid: uid,
                amount: amount,
                date: new Date().toISOString(),
                type: 'slip',
                money: amount,
                title: 'เติมเงินสำเร็จ',
                image: 'https://img2.pic.in.th/IMG_6166.png'
              });
            }
          } catch (syncErr) {
            console.error(`[Slip] Balance sync error:`, syncErr);
          }
        }

        return res.json({ success: true, amount });
      } else {
        const errorMsg = response.data.data?.message || response.data.message;
        return res.json({ success: false, error: errorMsg || 'ไม่สามารถรับเงินได้' });
      }
    } catch (error: any) {
        if (error.response) {
            const errorMsg = error.response.data?.message;
            return res.json({ success: false, error: errorMsg || 'สลิปไม่ถูกต้อง หรือถูกใช้งานไปแล้ว' });
        } else {
            console.error("SlipOK API Error:", error.message);
            return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
        }
    }
  });

  app.post('/api/verify_turnstile', async (req, res) => {
    try {
      const { token } = req.body;
      const secretKey = process.env.TURNSTILE_SECRET_KEY || '';

      if (!secretKey) {
          return res.json({ success: true, message: "Bypassed missing Turnstile Secret Key." });
      }

      console.log('Verify Turnstile called with token:', token);
      
      if (!token) {
        return res.status(400).json({ success: false, error: 'Token missing' });
      }

      const params = new URLSearchParams();
      params.append('secret', secretKey);
      params.append('response', token);

      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          validateStatus: () => true
        }
      );

      console.log('Turnstile Response:', response.data);
      
      if (!response.data.success) {
        return res.status(403).json(response.data);
      }
      return res.json(response.data);
    } catch (error: any) {
      console.error('Turnstile verification error:', error.message || error);
      return res.status(500).json({ success: false, error: 'Internal server error', detail: error.message });
    }
  });

    // --- Precise Garena Checking Logic using node:crypto ---
  
  const getMD5 = (text: string) => {
    let raw = text;
    try {
      if (text.includes('%')) {
        raw = decodeURIComponent(text);
      }
    } catch (e) {}
    return crypto.createHash('md5').update(raw).digest('hex');
  };

  const encryptPassword = (password: string, v1: string, v2: string) => {
    const passMd5 = getMD5(password);
    const innerHash = crypto.createHash('sha256').update(passMd5 + v1).digest('hex');
    const outerHash = crypto.createHash('sha256').update(innerHash + v2).digest('hex');
    const key = Buffer.from(outerHash, 'hex');
    const plaintext = Buffer.from(passMd5, 'hex');
    const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
    cipher.setAutoPadding(false);
    let encrypted = cipher.update(plaintext);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex').substring(0, 32);
  };

  const getCodmInfo = async (client: any) => {
    try {
      const random_id = Date.now().toString();
      const token_url = "https://auth.garena.com/oauth/token/grant";
      const token_data = `client_id=100082&response_type=token&redirect_uri=https%3A%2F%2Fauth.codm.garena.com%2Fauth%2Fauth%2Fcallback_n%3Fsite%3Dhttps%3A%2F%2Fapi-delete-request.codm.garena.co.id%2Foauth%2Fcallback%2F&format=json&id=${random_id}`;
      
      const token_res = await client.post(token_url, token_data, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 11; RMX2195) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://auth.garena.com/universal/oauth?all_platforms=1&response_type=token&locale=en-SG&client_id=100082&redirect_uri=https://auth.codm.garena.com/auth/auth/callback_n?site=https://api-delete-request.codm.garena.co.id/oauth/callback/"
        }
      });
      
      const access_token = token_res.data?.access_token;
      if (!access_token) return null;

      // Callback to CODM
      const codm_callback_url = `https://auth.codm.garena.com/auth/auth/callback_n?site=https://api-delete-request.codm.garena.co.id/oauth/callback/&access_token=${access_token}`;
      await client.get(codm_callback_url, { 
        maxRedirects: 0, 
        validateStatus: (s: number) => s < 400,
        headers: {
            "authority": "auth.codm.garena.com",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "referer": "https://auth.garena.com/",
            "sec-ch-ua": "\"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-site",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Linux; Android 11; RMX2195) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36"
        }
      });

      // API callback
      const api_callback_url = `https://api-delete-request.codm.garena.co.id/oauth/callback/?access_token=${access_token}`;
      const api_callback_res = await client.get(api_callback_url, { 
        maxRedirects: 0, 
        validateStatus: (s: number) => s < 400,
        headers: {
            "authority": "api-delete-request.codm.garena.co.id",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "referer": "https://auth.garena.com/",
            "sec-ch-ua": "\"Chromium\";v=\"107\", \"Not=A?Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": "\"Android\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "cross-site",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "user-agent": "Mozilla/5.0 (Linux; Android 11; RMX2195) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36"
        }
      });
      
      const location = api_callback_res.headers['location'] || '';

      if (location.includes("err=3")) return null;
      if (location.includes("token=")) {
        const token = location.split("token=")[1].split('&')[0];
        const check_login_url = "https://api-delete-request.codm.garena.co.id/oauth/check_login/";
        const check_res = await client.get(check_login_url, {
          headers: {
            "authority": "api-delete-request.codm.garena.co.id",
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "accept-encoding": "gzip, deflate, br, zstd",
            "cache-control": "no-cache",
            "codm-delete-token": token,
            "origin": "https://delete-request.codm.garena.co.id",
            "pragma": "no-cache",
            "referer": "https://delete-request.codm.garena.co.id/",
            "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v=\"24"',
            "sec-ch-ua-mobile": "?1",
            "sec-ch-ua-platform": '"Android"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "user-agent": "Mozilla/5.0 (Linux; Android 11; RMX2195) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36",
            "x-requested-with": "XMLHttpRequest"
          }
        });
        
        const user_data = check_res.data?.user;
        if (user_data) {
          const region_code = user_data.region || "N/A";
          // Basic CODM Region mappings from python code
          const codm_regions: any = {
            'PH': { 'name': 'Philippines', 'flag': '🇵🇭' },
            'ID': { 'name': 'Indonesia', 'flag': '🇮🇩' },
            'HK': { 'name': 'Hong Kong', 'flag': '🇭🇰' },
            'MY': { 'name': 'Malaysia', 'flag': '🇲🇾' },
            'TW': { 'name': 'Taiwan', 'flag': '🇹🇼' },
            'TH': { 'name': 'Thailand', 'flag': '🇹🇭' },
            'SG': { 'name': 'Singapore', 'flag': '🇸🇬' },
          };
          const rinfo = codm_regions[region_code] || {};
          
          return {
            nickname: user_data.codm_nickname || 'N/A',
            level: user_data.codm_level || 'Unknown',
            region: region_code,
            region_name: rinfo.name || 'Unknown',
            region_flag: rinfo.flag || '🏳️',
            uid: user_data.uid || 'N/A',
            open_id: user_data.open_id || 'N/A',
            t_open_id: user_data.t_open_id || 'N/A'
          };
        }
      }
    } catch (e) {
      // console.error("CODM Info Fetch Error:", e.message);
    }
    return null;
  };

  const getGameConnections = async (client: any) => {
    const game_info: string[] = [];
    const valid_regions = ['sg', 'ph', 'my', 'tw', 'th', 'id', 'in', 'vn'];
    
    const game_mappings: any = {
      'tw': {
          "100082": "CODM",
          "100067": "FREE FIRE",
          "100070": "SPEED DRIFTERS",
          "100130": "BLACK CLOVER M",
          "100105": "GARENA UNDAWN",
          "100050": "ROV",
          "100151": "DELTA FORCE",
          "100147": "FAST THRILL",
          "100107": "MOONLIGHT BLADE"
      },
      'th': {
          "100067": "FREEFIRE",
          "100055": "ROV",
          "100082": "CODM",
          "100151": "DELTA FORCE",
          "100105": "GARENA UNDAWN",
          "100130": "BLACK CLOVER M",
          "100070": "SPEED DRIFTERS",
          "32836": "FC ONLINE",
          "100071": "FC ONLINE M",
          "100124": "MOONLIGHT BLADE"
      },
      'vn': {
          "32837": "FC ONLINE",
          "100072": "FC ONLINE M",
          "100054": "ROV",
          "100137": "THE WORLD OF WAR"
      },
      'default': {
          "100082": "CODM",
          "100067": "FREEFIRE",
          "100151": "DELTA FORCE",
          "100105": "GARENA UNDAWN",
          "100057": "AOV",
          "100070": "SPEED DRIFTERS",
          "100130": "BLACK CLOVER M",
          "100055": "ROV"
      }
    };

    try {
      const token_url = "https://authgop.garena.com/oauth/token/grant";
      const token_data = `client_id=10017&response_type=token&redirect_uri=https%3A%2F%2Fshop.garena.sg%2F%3Fapp%3D100082&format=json&id=${Date.now()}`;
      const token_res = await client.post(token_url, token_data, {
        headers: { 
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded" 
        }
      });
      const access_token = token_res.data.access_token;
      if (!access_token) return [];

      const inspect_url = "https://shop.garena.sg/api/auth/inspect_token";
      const inspect_res = await client.post(inspect_url, { token: access_token }, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
              "Content-Type": "application/json"
          }
      });

      const session_key_roles = inspect_res.headers['set-cookie']?.find((c: string) => c.startsWith('session_key='))?.split(';')[0]?.split('=')[1] || inspect_res.cookies?.session_key;
      
      const uac = (inspect_res.data.uac || "ph").toLowerCase();
      const region = valid_regions.includes(uac) ? uac : 'ph';
      
      let base_domain = `shop.garena.${region}`;
      if (region === 'th' || region === 'in') base_domain = "termgame.com";
      else if (region === 'id') base_domain = "kiosgamer.co.id";
      else if (region === 'vn') base_domain = "napthe.vn";

      const applicable_games = game_mappings[region] || game_mappings['default'];
      for (const [app_id, game_name] of Object.entries(applicable_games)) {
        try {
          const roles_res = await client.get(`https://${base_domain}/api/shop/apps/roles`, {
            params: { app_id },
            headers: {
                'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
                'Accept': "application/json, text/plain, */*",
                'Accept-Language': "en-US,en;q=0.5",
                'Connection': "keep-alive",
                'Referer': `https://${base_domain}/?app=${app_id}`,
                'Sec-Fetch-Dest': "empty",
                'Sec-Fetch-Mode': "cors",
                'Sec-Fetch-Site': "same-origin",
                'Cookie': session_key_roles ? `session_key=${session_key_roles}` : ''
            }
          });
          const roles_data = roles_res.data;
          let role = null;
          if (Array.isArray(roles_data.role) && roles_data.role.length > 0) role = roles_data.role[0];
          else if (roles_data[app_id] && Array.isArray(roles_data[app_id]) && roles_data[app_id].length > 0) role = roles_data[app_id][0].role;

          if (role) game_info.push(`[${region.toUpperCase()} - ${game_name} - ${role}]`);
        } catch (e) {}
      }
      
      if (game_info.length === 0) {
          game_info.push(`[${region.toUpperCase()} - No Game Detected]`);
      }
    } catch (e) {}
    return game_info;
  };

  // Cache for Turnstile tokens (since they are single-use against Cloudflare, but we need them for a bulk loop)
  const turnstileCache = new Map<string, number>();

  app.post('/api/check', checkLimiter, async (req, res) => {
    const account = req.body.account?.toString().trim();
    const password = req.body.password?.toString().trim();
    const turnstileToken = req.body.turnstileToken; // Optional turnstile token
    const apiKey = req.headers['x-api-key']?.toString().trim() || req.body.apiKey?.toString().trim();

    if (!account || !password) return res.status(400).json({ error: 'Missing credentials' });

    let isApiKeyValid = false;
    if (apiKey) {
      if (!admin.firestore()) {
        return res.status(500).json({ error: 'Database connection error' });
      }
      try {
        const apiKeyDoc = await admin.firestore().collection('api_keys').doc(apiKey).get();
        if (apiKeyDoc.exists) {
          const data = apiKeyDoc.data();
          if (data?.status === 'active') {
            if (data?.expires_at && new Date(data.expires_at) < new Date()) {
               await admin.firestore().collection('api_keys').doc(apiKey).update({ status: 'expired' }).catch(() => {});
               return res.status(401).json({ error: 'API Key has expired' });
            }
            isApiKeyValid = true;
            // Fire and forget updating last_used
            admin.firestore().collection('api_keys').doc(apiKey).update({ last_used: new Date().toISOString() }).catch(() => {});
          } else {
             return res.status(401).json({ error: 'API Key is disabled or expired' });
          }
        } else {
          return res.status(401).json({ error: 'Invalid API Key' });
        }
      } catch (err) {
        console.error('Error verifying API Key:', err);
        return res.status(500).json({ error: 'Error verifying API Key' });
      }
    }

    if (!isApiKeyValid) {
      // Verify Turnstile Token
      if (!turnstileToken) {
         return res.status(403).json({ error: 'Missing Captcha token. Please refresh the page and verify you are human. (Or provide valid API Key)' });
      }

      // Since a batch check loop uses the same token, we cache verified tokens for 5 minutes
      const now = Date.now();
      const cachedTime = turnstileCache.get(turnstileToken);
      
      if (cachedTime && (now - cachedTime < 5 * 60 * 1000)) {
         // Token is already verified and within 5 minute window
         // console.log("Used cached Turnstile token bypass");
      } else {
         const secretKey = process.env.TURNSTILE_SECRET_KEY || '';
         
         if (!secretKey) {
             turnstileCache.set(turnstileToken, now);
         } else {
             try {
               const params = new URLSearchParams();
               params.append('secret', secretKey);
               params.append('response', turnstileToken);
  
           const turnstileResponse = await axios.post(
             'https://challenges.cloudflare.com/turnstile/v0/siteverify',
             params,
             {
               headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
               }
             }
           );
  
           if (!turnstileResponse.data.success) {
             console.error('Turnstile verification failed:', turnstileResponse.data);
             return res.status(403).json({ error: 'Turnstile verification failed. Please refresh the page and try again.' });
           }
  
           // Cache the successfully verified token
           turnstileCache.set(turnstileToken, now);
           
           // Clean up old entries from cache every once in a while
           if (turnstileCache.size > 1000) {
             for (const [key, time] of turnstileCache.entries()) {
               if (now - time > 5 * 60 * 1000) {
                 turnstileCache.delete(key);
               }
             }
           }
         } catch (error) {
           console.error('Error verifying Turnstile token:', error);
           return res.status(500).json({ error: 'Internal server error during captcha verification.' });
         }
         }
      }
    }

    
    const jar = new CookieJar();
    
    // User-Agent Pool for basic rotation
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
    ];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const isEdge = randomUserAgent.includes('Edg/');
    const isMac = randomUserAgent.includes('Mac OS');
    const chromeVer = randomUserAgent.match(/Chrome\/(\d+)\./)?.[1] || '130';
    
    let secChUa = isEdge 
      ? `"Chromium";v="${chromeVer}", "Microsoft Edge";v="${chromeVer}", "Not?A_Brand";v="99"`
      : `"Chromium";v="${chromeVer}", "Google Chrome";v="${chromeVer}", "Not?A_Brand";v="99"`;
    let secChPlatform = isMac ? '"macOS"' : '"Windows"';

    // Wait for proxies
    if (freeProxies.length === 0) {
      await fetchFreeProxies();
    }

    let proxyUrl = '';
    const availableProxies = [];
    if (siteSettings.proxies && Array.isArray(siteSettings.proxies) && siteSettings.proxies.length > 0) {
      availableProxies.push(...siteSettings.proxies);
    }
    
    if (siteSettings.auto_proxy !== false && freeProxies.length > 0) {
      availableProxies.push(...freeProxies);
    } else if (!siteSettings.proxies || siteSettings.proxies.length === 0) {
      availableProxies.push(...freeProxies);
    }
    
    if (availableProxies.length > 0) {
      proxyUrl = availableProxies[Math.floor(Math.random() * availableProxies.length)];
    }
    
    let agent;
    try {
      if (proxyUrl) {
        agent = new HttpsProxyAgent(proxyUrl, { timeout: 10000, rejectUnauthorized: false } as any);
      } else {
        agent = new https.Agent({ rejectUnauthorized: false });
      }
    } catch (err) {
      agent = new https.Agent({ rejectUnauthorized: false });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); 

    res.on('finish', () => clearTimeout(timeoutId));
    res.on('close', () => clearTimeout(timeoutId));

    const axiosConfig: any = { 
      headers: {
        'User-Agent': randomUserAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://sso.garena.com/'
      },
      httpsAgent: agent,
      httpAgent: agent,
      proxy: false,
      timeout: 10000,
      signal: controller.signal,
      validateStatus: (status: number) => status < 500
    };
    
    const { wrapper } = await import('axios-cookiejar-support');
    let client = wrapper(axios.create(axiosConfig));
    client.defaults.jar = jar;

    const setupFallbackClient = () => {
       const directAgent = new https.Agent({ rejectUnauthorized: false });
       const fbClient = wrapper(axios.create({ ...axiosConfig, httpsAgent: directAgent, httpAgent: directAgent }));
       fbClient.defaults.jar = jar;
       return fbClient;
    };

    try {
      const getDatadomeCookie = async (httpClient: any) => {
        const url = 'https://dd.garena.com/js/';
        const headers = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'https://account.garena.com',
            'pragma': 'no-cache',
            'referer': 'https://account.garena.com/',
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': secChPlatform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': randomUserAgent
        };

        const jsDataPayload = {
            "ttst": 76.70000004768372, "ifov": false, "hc": 4, "br_oh": 824, "br_ow": 1536, "ua": randomUserAgent, "wbd": false, "dp0": true, "tagpu": 5.738121195951787, "wdif": false, "wdifrm": false, "npmtm": false, "br_h": 738, "br_w": 260, "isf": false, "nddc": 1, "rs_h": 864, "rs_w": 1536, "rs_cd": 24, "phe": false, "nm": false, "jsf": false, "lg": "en-US", "pr": 1.25, "ars_h": 824, "ars_w": 1536, "tz": -480, "str_ss": true, "str_ls": true, "str_idb": true, "str_odb": false, "plgod": false, "plg": 5, "plgne": true, "plgre": true, "plgof": false, "plggt": false, "pltod": false, "hcovdr": false, "hcovdr2": false, "plovdr": false, "plovdr2": false, "ftsovdr": false, "ftsovdr2": false, "lb": false, "eva": 33, "lo": false, "ts_mtp": 0, "ts_tec": false, "ts_tsa": false, "vnd": "Google Inc.", "bid": "NA", "mmt": "application/pdf,text/pdf", "plu": "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF", "hdn": false, "awe": false, "geb": false, "dat": false, "med": "defined", "aco": "probably", "acots": false, "acmp": "probably", "acmpts": true, "acw": "probably", "acwts": false, "acma": "maybe", "acmats": false, "acaa": "probably", "acaats": true, "ac3": "", "ac3ts": false, "acf": "probably", "acfts": false, "acmp4": "maybe", "acmp4ts": false, "acmp3": "probably", "acmp3ts": false, "acwm": "maybe", "acwmts": false, "ocpt": false, "vco": "", "vcots": false, "vch": "probably", "vchts": true, "vcw": "probably", "vcwts": true, "vc3": "maybe", "vc3ts": false, "vcmp": "", "vcmpts": false, "vcq": "maybe", "vcqts": false, "vc1": "probably", "vc1ts": true, "dvm": 8, "sqt": false, "so": "landscape-primary", "bda": false, "wdw": true, "prm": true, "tzp": true, "cvs": true, "usb": true, "cap": true, "tbf": false, "lgs": true, "tpd": true
        };

        const payload = {
            'jsData': JSON.stringify(jsDataPayload),
            'eventCounters': '[]',
            'jsType': 'ch',
            'cid': 'KOWn3t9QNk3dJJJEkpZJpspfb2HPZIVs0KSR7RYTscx5iO7o84cw95j40zFFG7mpfbKxmfhAOs~bM8Lr8cHia2JZ3Cq2LAn5k6XAKkONfSSad99Wu36EhKYyODGCZwae',
            'ddk': 'AE3F04AD3F0D3A462481A337485081',
            'Referer': 'https://account.garena.com/',
            'request': '/',
            'responsePage': 'origin',
            'ddv': '4.35.4'
        };

        const dataParams = new URLSearchParams();
        for (const key in payload) {
            dataParams.append(key, payload[key as keyof typeof payload]);
        }

        const ddRes = await httpClient.post(url, dataParams.toString(), { headers, timeout: 10000 });
        if (ddRes.data && typeof ddRes.data === 'string') {
          try {
             return JSON.parse(ddRes.data);
          } catch(e){}
        }
        return ddRes.data;
      };

      let ddJson = await getDatadomeCookie(client);
      let activeClient = client;

      if (!ddJson || !ddJson.cookie || ddJson.status === 403) {
        console.log(`Proxy failed DataDome. Using direct connection for DataDome...`);
        activeClient = setupFallbackClient();
        ddJson = await getDatadomeCookie(activeClient);
      }

      if (ddJson && ddJson.cookie) {
        const datadomeValue = ddJson.cookie.split(';')[0];
        await jar.setCookie(datadomeValue, 'https://sso.garena.com');
      }

      const preloginHeaders = {
            'accept': 'application/json, text/plain, */*',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9',
            'connection': 'keep-alive',
            'host': 'sso.garena.com',
            'referer': `https://sso.garena.com/universal/login?app_id=10100&redirect_uri=https%3A%2F%2Faccount.garena.com%2F&locale=en-SG&account=${account}`,
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': secChPlatform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': randomUserAgent
      };

      let preloginRes = await activeClient.get('https://sso.garena.com/api/prelogin', {
          params: { 'app_id': '10100', 'account': account, 'format': 'json', 'id': Date.now().toString() },
          headers: preloginHeaders
      });

      if (preloginRes.status === 403 && activeClient === client) {
         console.log(`Proxy blocked at Prelogin. Switching to Direct...`);
         activeClient = setupFallbackClient();
         ddJson = await getDatadomeCookie(activeClient);
         if (ddJson && ddJson.cookie) {
           await jar.setCookie(ddJson.cookie.split(';')[0], 'https://sso.garena.com');
         }
         preloginRes = await activeClient.get('https://sso.garena.com/api/prelogin', {
            params: { 'app_id': '10100', 'account': account, 'format': 'json', 'id': Date.now().toString() },
            headers: preloginHeaders
         });
      }

      if (preloginRes.status === 403) {
         return res.json({ success: false, error: 'ระบบโดนจำกัดการเข้าถึง (403 Forbidden)' });
      }

      const preData = preloginRes.data;
      if (preData.error) {
         return res.json({ success: false, error: `Prelogin: ${preData.error}` });
      }
      if (!preData.v1 || !preData.v2) {
         return res.json({ success: false, error: 'ระบบตรวจพบโปรแกรมอัตโนมัติ (DataDome / Captcha).' });
      }

      const hashed_password = encryptPassword(password, preData.v1, preData.v2);
      const loginParams = {
          'app_id': '10100',
          'account': account,
          'password': hashed_password,
          'redirect_uri': 'https://account.garena.com/',
          'format': 'json',
          'id': Date.now().toString()
      };

      const loginRes = await activeClient.get('https://sso.garena.com/api/login', {
         params: loginParams,
         headers: {
            'accept': 'application/json, text/plain, */*',
            'referer': 'https://account.garena.com/',
            'user-agent': randomUserAgent
         }
      });

      const loginData = loginRes.data;
      if (loginData.error) {
        const errorMsg = loginData.error === 'error_auth' ? 'รหัสผ่านผิด' : 
                         loginData.error.includes('captcha') ? 'ต้องแก้ Captcha (Garena Login)' :
                         loginData.error === 'error_not_exist' ? 'ไม่พบไอดีนี้' : 
                         loginData.error;
        return res.json({ success: false, error: errorMsg });
      }

      // Fetch Account Details
      const initRes = await activeClient.get('https://account.garena.com/api/account/init', {
        headers: { 
          'accept': '*/*',
          'referer': 'https://account.garena.com/',
          'user-agent': randomUserAgent
        }
      });
      
      const resData = initRes.data || {};
      const userData = resData.user_info || resData || {};
      
      let fbLinked = false;
      let fbUsername = 'N/A';
      let fbUid = 'N/A';
      
      const fbAccount = userData.fb_account;
      if (fbAccount) {
         if (typeof fbAccount === 'object') {
             fbUsername = fbAccount.name || 'N/A';
             fbUid = fbAccount.id || 'N/A';
         } else if (typeof fbAccount === 'string' && fbAccount !== 'Not Set') {
             try {
                const parsed = JSON.parse(fbAccount);
                fbUsername = parsed.name || parsed.fb_username || 'N/A';
                fbUid = parsed.id || parsed.fb_uid || 'N/A';
             } catch(e) {
                fbUsername = fbAccount;
             }
         }
         fbLinked = true;
      }
      if (userData.is_fbconnect_enabled) fbLinked = true;

      const binds = [];
      if (userData.email && userData.email !== 'N/A' && !userData.email.startsWith('***') && userData.email.includes('@')) binds.push('Email');
      if (userData.mobile_no && userData.mobile_no !== 'N/A' && String(userData.mobile_no).trim()) binds.push('Phone');
      if (fbLinked) binds.push('Facebook');
      if (userData.idcard && userData.idcard !== 'N/A' && String(userData.idcard).trim()) binds.push('ID Card');
      
      const isClean = binds.length === 0;

      const [codmInfo, gameConnections] = await Promise.all([
        getCodmInfo(activeClient).catch(() => null),
        getGameConnections(activeClient).catch(() => [])
      ]);

      const rovGames = (gameConnections || []).filter((g: string) => g.toUpperCase().includes('ROV'));
      const hasRov = rovGames.length > 0;
      let rovCharacter = 'N/A';
      if (hasRov) {
        try {
          const cleanName = rovGames[0].replace('[', '').replace(']', '');
          const parts = cleanName.split('-');
          if (parts.length > 2) rovCharacter = parts[2].trim();
        } catch(e) {}
      }
      const phoneBound = !!(userData.mobile_no && userData.mobile_no !== 'N/A');
      const emailVerified = !!userData.email_v;
      const rovClean = hasRov && !emailVerified && !phoneBound;
      const hasCodm = codmInfo != null && codmInfo.level !== 'Unknown';

      // Ensure last login handles timestamps correctly
      let lastLoginDateFormatted = 'N/A';
      const lastHist = resData.login_history?.[0];
      if (lastHist?.timestamp) {
         lastLoginDateFormatted = new Date(lastHist.timestamp * 1000).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      } else if (userData.last_login?.time) {
         lastLoginDateFormatted = new Date(userData.last_login.time * 1000).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }

      let avatarUrl = 'N/A';
      if (userData.avatar && userData.avatar !== 'N/A') {
          avatarUrl = userData.avatar.startsWith('http') ? userData.avatar : `https://account.garena.com/static/${userData.avatar}`;
      }

      return res.json({
        success: true,
        data: {
          account, password, uid: userData.uid || 'N/A',
          shells: userData.shell || 0,
          level: codmInfo?.level || 0, 
          rank: 'Success', 
          isClean,
          phoneBound,
          emailVerified,
          fbLinked,
          region: userData.acc_country || 'TH',
          otherGames: gameConnections || [],
          codmNickname: codmInfo?.nickname || 'N/A',
          codmUid: codmInfo?.uid || 'N/A',
          codmOpenId: codmInfo?.open_id || 'N/A',
          codmTOpenId: codmInfo?.t_open_id || 'N/A',
          codmRegion: codmInfo?.region || 'N/A',
          codmRegionName: codmInfo?.region_name || 'Unknown',
          codmRegionFlag: codmInfo?.region_flag || '🏳️',
          idCardBound: !!(userData.idcard && userData.idcard !== 'N/A'),
          hasRov,
          rovCharacter,
          rovClean,
          hasCodm,
          avatarUrl,
          mobileNumber: userData.mobile_no || 'N/A',
          emailAddress: userData.email || 'N/A',
          fbUsername,
          twoFaEnabled: !!userData.two_step_verify_enable,
          authenticatorEnabled: !!userData.authenticator_enable,
          lastLoginDate: lastLoginDateFormatted,
          lastLoginIp: lastHist?.ip || userData.last_login?.ip || 'N/A',
          lastLoginCountry: lastHist?.country || userData.last_login?.country || 'N/A',
          lastLoginSource: lastHist?.source || userData.last_login?.source || 'Unknown'
        }
      });

    } catch (err: any) {
      const errMsg = err?.message || '';
      console.error("Garena API Error:", errMsg || err);
      let errorMsg = 'Network Error: ' + (errMsg || 'Unknown Error');
      
      if (err?.code === 'ECONNABORTED' || errMsg.includes('timeout') || err?.code === 'ETIMEDOUT') {
        errorMsg = 'การเชื่อมต่อถูกยกเลิก (ใช้เวลาเกิน). Proxy ช้าเกินไป หรือค้าง';
      } else if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || errMsg === 'canceled') {
        errorMsg = 'การเชื่อมต่อถูกยกเลิก (ใช้เวลาเกิน). Proxy ช้าเกินไป หรือค้าง';
      } else if (err?.code === 'ECONNRESET') {
        errorMsg = 'การเชื่อมต่อถูกตัด (ECONNRESET)';
      } else if (errMsg.includes('disconnected') || errMsg.includes('TLS')) {
        errorMsg = 'เชื่อมต่อไม่ปลอดภัย (TLS Error/Blocked)';
      } else if (err?.code === 'ECONNREFUSED' || errMsg.includes('ECONNREFUSED')) {
        errorMsg = 'เซิร์ฟเวอร์ Proxy ออฟไลน์';
      } else if (errMsg.includes('CONNECT response')) {
        errorMsg = 'Proxy หมดอายุหรือถูกแบน';
      }
      
      return res.json({ success: false, error: errorMsg, isProxyError: true });
    }
  });

  // --- Supabase Proxy Routes ---
  // --- Products Endpoints ---

import Redis from 'ioredis';

let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => {
        if (times > 5) {
          console.warn('Redis reconnect exhausted, relying fully on memory cache.');
          return null; // Stop reconnecting after 5 times
        }
        return Math.min(times * 100, 3000); // Backoff
      },
      commandTimeout: 2000 // Fails fast
    });
    redis.on('connect', () => console.log('Redis connected successfully'));
    redis.on('error', (err) => console.error('Redis connection error (falling back to memory):', err));
  } catch (e) {
    console.error('Failed to initialize Redis:', e);
  }
}

import { LRUCache } from 'lru-cache';

  const memoryCache = new LRUCache<string, { data: any, timestamp: number, revision: number }>({
    max: 100, // Safe bound to prevent OOM
    ttl: 1000 * 60, // 1 min default
    updateAgeOnGet: false,
  });
  
  const inflightRequests = new Map<string, Promise<{ data: any, timestamp: number, revision: number }>>();
  let cacheRevisionCounter = 0; // Increment to bust ETag when data changes
  
  const dbReadBreaker = new CircuitBreaker(async (action: any) => await action(), {
    timeout: 7000, 
    errorThresholdPercentage: 50, 
    resetTimeout: 10000 
  });
  dbReadBreaker.fallback(() => { throw new Error('Database read circuit breaker open or timeout'); });

  const getCachedCollection = async (collectionName: string, ttl: number = 20000, res?: any, req?: any) => {
    const now = Date.now();
    let cacheHit = false;
    let cachedData: { data: any, timestamp: number, revision: number } | undefined = undefined;
    const redisKey = `cache:${collectionName}`;

    if (redis && redis.status === 'ready') {
      try {
        const redisData = await redis.get(redisKey);
        if (redisData) {
          cachedData = JSON.parse(redisData);
          cacheHit = true;
        }
      } catch (err) {
        console.warn('Redis get error, falling back to memory layer', err);
      }
    }

    if (!cachedData) {
      cachedData = memoryCache.get(collectionName);
      if (cachedData && now - cachedData.timestamp < ttl) {
        cacheHit = true;
      } else {
        cachedData = undefined;
      }
    }

    if (!cachedData) {
      if (inflightRequests.has(collectionName)) {
        // Coalesce requests (Thundering Herd Protection)
        cacheHit = true; // Technically a wait, but saves DB call
        cachedData = await inflightRequests.get(collectionName);
      } else {
        const fetchRevisionBeforeStart = cacheRevisionCounter;
        const fetchPromise = (async () => {
          const fetchFromDB = async () => {
            let query: any = admin.firestore().collection(collectionName);
            if (collectionName === 'products') {
              query = query.limit(100);
            }
            const dbMetricStart = Date.now();
            const snapshot = await query.get();
            dbQueryDurationMicroseconds.labels(collectionName, 'read').observe(Date.now() - dbMetricStart);
            return snapshot;
          };

          const snapshot: any = await dbReadBreaker.fire(fetchFromDB);
          
          let data = snapshot.docs.map((doc: any) => {
            const d = doc.data();
            return { id: doc.id, ...d };
          });
          data = data.filter((d: any) => !d.isDeleted);
          
          // Check if cache was invalidated while we were fetching
          if (fetchRevisionBeforeStart !== cacheRevisionCounter) {
             // Do not cache this stale data
             return { data, timestamp: Date.now(), revision: cacheRevisionCounter };
          }
          
          const oldCache = memoryCache.get(collectionName);
          const currentRevision = oldCache?.revision || cacheRevisionCounter;
          const freshData = { data, timestamp: Date.now(), revision: currentRevision };
          
          memoryCache.set(collectionName, freshData, { ttl });
          
          if (redis && redis.status === 'ready') {
            try {
              await redis.set(redisKey, JSON.stringify(freshData), 'PX', ttl);
            } catch (err) {
              console.warn('Redis set error', err);
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
      res.setHeader('ETag', etag);
      
      if (req.headers['if-none-match'] === etag) {
        res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
        res.status(304).end();
        return null;
      }
      res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    } else if (res) {
      res.setHeader('X-Cache', cacheHit ? 'HIT' : 'MISS');
    }

    return cachedData.data;
  };
  
  const invalidateCache = async (collectionName: string) => {
    cacheRevisionCounter++;
    memoryCache.delete(collectionName);
    if (redis && redis.status === 'ready') {
      try {
        await redis.del(`cache:${collectionName}`);
      } catch (err) {
        console.warn('Redis del error', err);
      }
    }
  };

  app.get('/api/products', async (req: any, res: any) => {
    res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=59');
    try {
      // Opt-in for public caching of products (Server-side firestoreCache only)
      const data = await getCachedCollection('products', 20000, res, req);
      if (data) {
        const processedData = data.map((item: any) => {
          // ALWAYS strip stockData to prevent RAM blowout (both for admin and public)
          const { stockData, ...publicItem } = item;
          return publicItem;
        });
        res.json(processedData);
      }
    } catch (err: any) {
      console.error('PROD ERR OBJ:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/products/:id', requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const doc: any = await admin.firestore().collection('products').doc(req.params.id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Product not found' });
      const data = doc.data();
      const { stockData, ...safeProductData } = data;
      const responseData = { id: doc.id, ...safeProductData };
      res.json(responseData);
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/products/:id/stock', requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const docRef = admin.firestore().collection('products').doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      let stockData = doc.data()?.stockData || [];
      if (stockData) {
        stockData = await decompressStock(stockData);
      }
      if (!Array.isArray(stockData)) stockData = [];

      // Also get from chunks
      const chunksSnapshot = await admin.firestore().collection('product_stock_chunks').where('productId', '==', req.params.id).get();
      for (const chunkDoc of chunksSnapshot.docs) {
         const chunkItems = chunkDoc.data().items;
         if (chunkItems) {
            const dec = await decompressStock(chunkItems);
            if (Array.isArray(dec)) stockData = stockData.concat(dec);
         }
      }

      res.json({ stockData });
    } catch (err: any) {
      console.error('Error fetching stock data:', err);
      res.status(500).json({ error: String(err.message || err) });
    }
  });

  app.post('/api/products', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const product = req.body;
      const allowedFields = ['name', 'description', 'price', 'originalPrice', 'stock', 'categoryId', 'stockData', 'image', 'imageUrl', 'category', 'isHighlight', 'customPageId', 'youtubeUrl', 'type', 'isPopular', 'soldCount', 'tag', '_version'];
      const sanitizedProduct = Object.fromEntries(
        Object.entries(product).filter(([k]) => allowedFields.includes(k))
      );
      
      sanitizedProduct._version = 1;

      const { id, ...dataToSaveRaw } = sanitizedProduct as any;
      if (dataToSaveRaw.stockData) {
        dataToSaveRaw.stockData = await compressStock(dataToSaveRaw.stockData);
      }
      // Deep strip undefined values to please Firestore
      const dataToSave = JSON.parse(JSON.stringify(dataToSaveRaw));
      const docRef = await admin.firestore().collection('products').add(dataToSave);
      invalidateCache('products');
      invalidateStatsCache();
      
      const { stockData, ...safeData } = dataToSave;
      const responseData = { id: docRef.id, dbId: docRef.id, ...safeData };
      res.json(responseData);
    } catch (err: any) {
      console.error('Internal server error creating product:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });

  app.post('/api/products/:id/stock', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const { newItems } = req.body;
      if (!Array.isArray(newItems) || newItems.length === 0) {
        return res.json({ success: true });
      }

      const docRef = admin.firestore().collection('products').doc(req.params.id);
      let finalProductData: any = {};
      
      await admin.firestore().runTransaction(async (t) => {
        const doc = await t.get(docRef);
        if (!doc.exists) {
          throw new Error('NOT_FOUND');
        }
        
        let existingStock = doc.data()?.stockData || [];
        if (existingStock) {
           existingStock = await decompressStock(existingStock);
        }
        if (!Array.isArray(existingStock)) { existingStock = []; }

        existingStock = existingStock.concat(newItems);

        const previousStock = doc.data()?.stock || 0;
        const newStockCount = previousStock + newItems.length;
        
        t.update(docRef, { stock: newStockCount, stockData: await compressStock(existingStock) });
        const { stockData, ...safeData } = doc.data()!;
        finalProductData = { ...safeData, stock: newStockCount };
      });
      
      invalidateCache('products');
      invalidateStatsCache();
      
      res.json({ success: true, added: newItems.length, product: finalProductData });
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
         return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Internal server error appending stock:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const docRef = admin.firestore().collection('products').doc(req.params.id);
      const productUpdates = req.body;
      
      const allowedFields = ['name', 'description', 'price', 'originalPrice', 'stock', 'categoryId', 'stockData', 'image', 'imageUrl', 'category', 'isHighlight', 'customPageId', 'youtubeUrl', 'type', 'isPopular', 'soldCount', 'tag', '_version'];
      const sanitizedUpdates = Object.fromEntries(
        Object.entries(productUpdates).filter(([k]) => allowedFields.includes(k) && k !== 'id')
      );

      let finalData: any;
      let deltaBefore: any = {};
      let deltaAfter: any = {};

      await admin.firestore().runTransaction(async (t) => {
        const currentDoc = await t.get(docRef);
        if (!currentDoc.exists) {
          throw new Error('NOT_FOUND');
        }
        
        const existingData = currentDoc.data()!;
        
        // Optimistic Concurrency Control (OCC)
        if (typeof sanitizedUpdates._version === 'number') {
          const currentVersion = existingData._version || 0;
          if (sanitizedUpdates._version !== currentVersion) {
            throw new Error('VERSION_CONFLICT');
          }
        }
        
        // Calculate Delta for Audit Log and only update what changed
        Object.keys(sanitizedUpdates).forEach(k => {
          if (k !== '_version' && sanitizedUpdates[k] !== existingData[k]) {
            deltaBefore[k] = existingData[k];
            deltaAfter[k] = sanitizedUpdates[k];
          }
        });
        
        // Compress stockData if needed
        if (deltaAfter.stockData && !deltaAfter.stockData[0]?.__compressed) {
          deltaAfter.stockData = await compressStock(deltaAfter.stockData);
        }

        const dataToSave = JSON.parse(JSON.stringify(deltaAfter));
        dataToSave._version = (existingData._version || 0) + 1;
        
        t.update(docRef, dataToSave);
        finalData = { ...existingData, ...dataToSave, id: req.params.id };
      });
      
      invalidateCache('products');
      invalidateStatsCache();
      
      if (Object.keys(deltaAfter).length > 0) {
        writeAuditLog('PRODUCT_UPDATE', (req as any).user?.uid || 'admin', req.params.id, req, {
          changes: {
            before: deltaBefore,
            after: deltaAfter
          }
        });
      }
      
      const { stockData, ...safeFinalData } = finalData;
      res.json(safeFinalData);

    } catch (err: any) {
      if (err.message === 'VERSION_CONFLICT') {
        return res.status(409).json({ error: 'Conflict: Product was updated by another admin. Please refresh and try again.' });
      }
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Internal server error updating product:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });

  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const docRef = admin.firestore().collection('products').doc(req.params.id);
      
      let existingData: any;
      await admin.firestore().runTransaction(async (t) => {
        const doc = await t.get(docRef);
        if (!doc.exists) {
          throw new Error('NOT_FOUND');
        }
        existingData = doc.data()!;
        t.update(docRef, { 
          isDeleted: true, 
          deletedAt: new Date().toISOString(),
          _version: (existingData._version || 0) + 1
        });
      });
      
      invalidateCache('products');
      invalidateStatsCache();
      
      writeAuditLog('PRODUCT_DELETE', (req as any).user?.uid || 'admin', req.params.id, req, {
        changes: { 
          before: existingData,
          after: { isDeleted: true }
        }
      });
      
      res.json({ success: true, softDeleted: true });
    } catch (err: any) {
      if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Product not found' });
      }
      console.error('Internal server error deleting product:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/test_stats', async (req, res) => {
    res.json({ ok: 1 });
  });

  app.get('/api/stats', async (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=59');
    try {
      const now = Date.now();
      
      const sendCachedStats = () => {
        // Use global revision counter instead of timestamp to stay synchronized with cache updates
        const etag = `W/"stats-v${cacheRevisionCounter}"`;
        res.setHeader('ETag', etag);
        if (req.headers['if-none-match'] === etag) {
          return res.status(304).end();
        }
        res.json(cachedStats);
      };

      if (cachedStats && now - lastStatsFetch < 600000) {
        return sendCachedStats();
      }

      const adminDb = admin.firestore();
      
      let totalStock = 0;
      try {
        const data = await getCachedCollection('products', 20000);
        data.forEach((p: any) => {
          if (p.stock > 0 && p.stock < 999999) totalStock += Number(p.stock);
        });
      } catch (e) {}

      let totalSales = 0;
      let totalPurchaseOrders = 0;
      try {
        const { data, count, error } = await supabaseAdmin.from('purchases').select('price', { count: 'exact' });
        if (!error && data) {
           totalPurchaseOrders = count || data.length;
           data.forEach((p: any) => totalSales += (p.price || 0));
        } else {
           const purchases = await getCachedCollection('purchases', 60000);
           purchases.forEach((p: any) => {
             totalSales += (Number(p.price) || 0);
             totalPurchaseOrders++;
           });
        }
      } catch(e) {}

      let totalTopupsAmount = 0;
      try {
        const { data, error } = await supabaseAdmin.from('topups').select('amount');
        if (!error && data) {
           data.forEach((t: any) => totalTopupsAmount += (t.amount || 0));
        } else {
           const topups = await getCachedCollection('topups', 60000);
           topups.forEach((t: any) => totalTopupsAmount += (Number(t.amount) || 0));
        }
      } catch(e) {}

      let totalUsersCount = 0;
      try {
        const { count, error } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
        if (!error && count !== null) {
           totalUsersCount = count;
        } else {
           const users = await getCachedCollection('users', 60000);
           totalUsersCount = users.length;
        }
      } catch(e) {}

      cachedStats = {
        users: siteSettings.stats_users_override !== undefined && siteSettings.stats_users_override !== null && !isNaN(siteSettings.stats_users_override) ? siteSettings.stats_users_override : totalUsersCount + (siteSettings.stats_users_offset || 0),
        sales: siteSettings.stats_sales_override !== undefined && siteSettings.stats_sales_override !== null && !isNaN(siteSettings.stats_sales_override) ? siteSettings.stats_sales_override : totalSales + (siteSettings.stats_sales_offset || 0),
        stock: siteSettings.stats_stock_override !== undefined && siteSettings.stats_stock_override !== null && !isNaN(siteSettings.stats_stock_override) ? siteSettings.stats_stock_override : totalStock + (siteSettings.stats_stock_offset || 0),
        totalOrders: totalPurchaseOrders,
        totalTopupsAmount
      };
      
      if (totalUsersCount > 0 || totalPurchaseOrders > 0 || totalStock > 0 || totalTopupsAmount > 0) {
         lastStatsFetch = now;
      }
      
      sendCachedStats();
    } catch (err: any) {
      console.error('STATS ERROR:', err);
      // Fallback
      res.json(cachedStats || {
        users: siteSettings.stats_users_offset || 0,
        sales: siteSettings.stats_sales_offset || 0,
        stock: 0,
        totalOrders: 0,
        totalTopupsAmount: 0
      });
    }
  });

  // --- Purchases Endpoints ---
  app.get('/api/purchases', async (req: any, res: any) => {
    try {
      const adminDb = admin.firestore();
      let q: any = adminDb.collection('purchases');
      
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, parseInt(req.query.limit) || 20);
      const offset = (page - 1) * limit;

      if (req.isAdmin) {
        let snapshot = q.orderBy('date', 'desc').limit(limit);
        if (snapshot.offset) {
          snapshot = snapshot.offset(offset);
        }
        const snap = await snapshot.get();
        let data = snap.docs.map((doc: any) => ({ dbId: doc.id, ...doc.data() }));
        return res.json(data);
      } else if (req.user) {
        let snapshot = q.where('userId', '==', (req as any).user.uid).orderBy('date', 'desc').limit(limit);
        if (snapshot.offset) {
           snapshot = snapshot.offset(offset);
        }
        const snap = await snapshot.get();
        let data = snap.docs.map((doc: any) => ({ dbId: doc.id, ...doc.data() }));
        return res.json(data);
      } else {
        return res.json([]);
      }
    } catch (err: any) {
      console.error('Error fetching purchases:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/purchases', requireAdmin, async (req, res) => {
    // Legacy endpoint, we can leave it to avoid breaking changes, or just require admin.
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const data = req.body;
      const docRef = await admin.firestore().collection('purchases').add(data);
      res.json({ id: docRef.id, dbId: docRef.id, ...data });
    } catch (err) {
      console.error('Internal server error creating purchase:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // Mutex for purchase locking
  const purchaseLocks: Record<string, Promise<any>> = {};

  app.post('/api/discord-rekey', async (req: any, res: any) => {
    const { key, secret, plan } = req.body;
    const expectedSecret = process.env.DISCORD_BOT_SECRET || 'MY_SECRET_DISCORD_TOKEN_1234';
    if (secret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
      const newDoc = { key, plan: plan || 'premium', status: 'active', created_at: new Date().toISOString() };
      await admin.firestore().collection('license_keys').add(newDoc);
      res.json({ success: true, message: `เพิ่มคีย์ ${key} สำเร็จ!`, plan: newDoc.plan });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error while adding key' });
    }
  });

  app.post('/api/discord-redeem', async (req: any, res: any) => {
    const { key, secret } = req.body;
    // ตั้งค่ารหัสลับให้ตรงกันระหว่างเว็บกับบอท
    const expectedSecret = process.env.DISCORD_BOT_SECRET || 'MY_SECRET_DISCORD_TOKEN_1234';
    if (secret !== expectedSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!key) {
      return res.status(400).json({ error: 'กรุณาระบุคีย์' });
    }

    try {
      // 1. ลองหา key ใน license_keys
      const licenseSnapshot = await admin.firestore().collection('license_keys').where('key', '==', key).where('status', '==', 'active').get();
      if (!licenseSnapshot.empty) {
        const docId = licenseSnapshot.docs[0].id;
        const docRef = admin.firestore().collection('license_keys').doc(docId);
        await docRef.update({ status: 'used' });
        // บันทึกประวัติ
        await admin.firestore().collection('used_keys').add({
            key,
            used_by_discord: true,
            uid: req.body.uid || null,
            used_at: new Date().toISOString()
        });
        return res.json({ success: true, message: 'รับยศสำเร็จ!' });
      }

      // 2. ถ้าไม่เจอ ลองหาในประวัติการสั่งซื้อ (purchases)
      let foundDoc = null;
      try {
        const cachedPurchases = await getCachedCollection('purchases', 60000);
        for (const p of cachedPurchases) {
          if (p.secretData) {
            const keysInPurchase = p.secretData.split('\n').map((k: string) => k.trim());
            if (keysInPurchase.includes(key.trim())) {
              foundDoc = { id: p.id, ...p };
              break;
            }
          }
        }
      } catch(e) {}

      if (!foundDoc) {
        return res.status(404).json({ error: 'ไม่พบคีย์นี้ในระบบ หรือคีย์ไม่ถูกต้อง' });
      }

      if (foundDoc.discordClaimed) {
        return res.status(400).json({ error: 'คีย์นี้ถูกใช้งานเพื่อรับยศไปแล้ว' });
      }

      // Mark as claimed
      await admin.firestore().collection('purchases').doc(foundDoc.id).update({ ...foundDoc, discordClaimed: true });

      res.json({ success: true, message: 'รับยศสำเร็จ!' });
      writeAuditLog('DISCORD_ROLE_CLAIM', (req as any).user?.uid || 'system', 'discord_role', req, { key: req.body.key });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e?.details || e?.message || 'Internal server error' });
    }
  });

  app.post('/api/buy', mutationLimiter, requireAuth, async (req: any, res: any) => {
    let { productId, quantity } = req.body;
    quantity = Number(quantity);
    if (!productId || isNaN(quantity) || quantity < 1) {
      console.warn(`[Buy] Invalid request. productId: ${productId}, quantity: ${quantity}`);
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const userId = (req as any).user.uid;
    const lockKey = userId + '_' + productId;
    
    // Memory lock as an extra precaution before entering transaction
    while (purchaseLocks[lockKey]) { await purchaseLocks[lockKey]; }
    let releaseLock: () => void;
    purchaseLocks[lockKey] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const productRef = admin.firestore().collection('products').doc(productId);
      const purchasesRef = admin.firestore().collection('purchases').doc(); // Auto-gen transaction docref
      
      console.log('buy request for user', userId, 'product', productId, 'qty', quantity);

      const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

      const result = await admin.firestore().runTransaction(async (t) => {
        let idempRef: any;
        if (idempotencyKey) {
           idempRef = admin.firestore().collection('idempotency_keys').doc(idempotencyKey);
           const idempDoc = await t.get(idempRef);
           if (idempDoc.exists) {
              return { isCachedIdempotency: true, payload: idempDoc.data()?.response };
           }
        }

        const userDoc = await t.get(userRef);
        const productDoc = await t.get(productRef);

        if (!userDoc.exists) { throw new Error('User not found'); }
        if (!productDoc.exists) { throw new Error('Product not found'); }

        const userData = userDoc.data() || {};
        const productData = productDoc.data() || {};

        const price = Number(productData.price) || 0;
        const totalCost = price * quantity;

        if ((Number(userData.balance) || 0) < totalCost) {
          throw new Error('ยอดเงินไม่เพียงพอ');
        }

        // --- Start of Stock Extraction ---
        let availableItems: string[] = [];
        let existingStock = productData.stockData;
        if (existingStock) {
           existingStock = await decompressStock(existingStock);
        }
        if (!Array.isArray(existingStock)) { existingStock = []; }

        availableItems = availableItems.concat(existingStock);
        
        if (availableItems.length < quantity) { 
           throw new Error('สินค้าในสต๊อกไม่เพียงพอ'); 
        }

        const claimedItems = availableItems.splice(0, quantity);
        const remainingBuffer = availableItems; // Keep the rest in the product doc
        
        // --- End of Stock Extraction ---

        const newBalance = (Number(userData.balance) || 0) - totalCost;

        const newHistoryItem = {
          id: purchasesRef.id,
          userId: userId,
          username: userData.username || (req.user && (req as any).user.email ? (req as any).user.email.split('@')[0] : 'Unknown'),
          productId: productId,
          productName: `${productData.name || 'Unknown Product'} (x${quantity})`,
          price: totalCost,
          secretData: claimedItems.join('\n'),
          date: new Date().toISOString(),
          billNumber: 'B-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
          is_special: false
        };

        const userUpdatePayload = JSON.parse(JSON.stringify({ balance: newBalance }));
        const productUpdatePayload = JSON.parse(JSON.stringify({ 
          ...productData,
          stock: (productData.stock || 0) - quantity, 
          stockData: await compressStock(remainingBuffer.filter(v => v !== undefined && v !== null)), 
          soldCount: (Number(productData.soldCount) || 0) + quantity 
        }));
        const historyPayload = JSON.parse(JSON.stringify(newHistoryItem));

        t.update(userRef, userUpdatePayload);
        t.update(productRef, productUpdatePayload);
        t.set(purchasesRef, historyPayload);

        const { stockData: _omittedStock, ...safeProductData } = productData;
        const resultPayload = {
          purchase: newHistoryItem,
          updatedUser: { ...userData, balance: newBalance },
          updatedProduct: { id: productId, ...safeProductData, stock: (productData.stock || 0) - quantity, soldCount: (productData.soldCount || 0) + quantity },
        };

        if (idempRef) {
           t.set(idempRef, { response: resultPayload, timestamp: new Date().toISOString() });
        }

        return resultPayload;
      });

      // Handle Idempotency Return
      if (result.isCachedIdempotency) {
         return res.json({
           success: true,
           ...result.payload
         });
      }

      // Transaction succeeded
      invalidateCache('products');
      invalidateCache('purchases');
      invalidateStatsCache();
      
      writeAuditLog('PRODUCT_PURCHASE', userId, productId, req, {
        quantity,
        totalCost: result.purchase.price,
        billNumber: result.purchase.billNumber
      });

      res.json({
        success: true,
        purchase: result.purchase,
        updatedUser: result.updatedUser,
        updatedProduct: result.updatedProduct,
      });

    } catch (err: any) {
      console.error('------- BUY ERROR TRACE -------', err);
      const msg = err.message || '';
      if (msg === 'ยอดเงินไม่เพียงพอ' || msg === 'สินค้าในสต๊อกไม่เพียงพอ' || msg === 'User not found' || msg === 'Product not found') {
         res.status(400).json({ error: msg });
      } else {
         sendAlert('Transaction Failed / Rollback ❌', `**User**: ${userId}\n**Product**: ${productId}\n**Error**: ${msg}`, 16711680, req.id);
         res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
    } finally {
      if (releaseLock) releaseLock();
      delete purchaseLocks[lockKey];
    }
  });

  // --- Topups Endpoints ---
  app.get('/api/topups', async (req: any, res: any) => {
    try {
      const adminDb = admin.firestore();
      let q: any = adminDb.collection('topups');
      if (req.isAdmin) {
        // Omitting orderBy to prevent Postgres statement timeout
        const snapshot = await q.limit(100).get();
        let data = snapshot.docs.map((doc: any) => ({ dbId: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        return res.json(data);
      } else if (req.user) {
        let snapshot;
        try {
           snapshot = await q.where('uid', '==', (req as any).user.uid).limit(100).get();
        } catch (e: any) {
           // Fallback in case 'uid' was not indexed properly or older data doesn't have it
           snapshot = await q.where('userId', '==', (req as any).user.uid).limit(100).get();
        }
        let data = snapshot.docs.map((doc: any) => ({ dbId: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA;
        });
        return res.json(data.slice(0, 100));
      } else {
        return res.json([]);
      }
    } catch (err: any) {
      console.error('Internal server error fetching topups:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/topups', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const data = req.body;
      const docRef = await admin.firestore().collection('topups').add(data);
      res.json({ id: docRef.id, dbId: docRef.id, ...data });
    } catch (err) {
      console.error('Internal server error creating topup:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- Categories Endpoints ---
  app.get('/api/categories', async (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=86400');
    try {
      const data = await getCachedCollection('categories', 60000, res, req);
      if (data) res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching categories:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/categories', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const data = req.body;
      const { id, ...dataToSave } = data;
      const docRef = await admin.firestore().collection('categories').add(dataToSave);
      invalidateCache('categories');
      res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error creating category:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.put('/api/categories/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const data = req.body;
      const { id, ...dataToSave } = data;
      const docRef = admin.firestore().collection('categories').doc(req.params.id);
      await docRef.update(dataToSave);
      invalidateCache('categories');
      res.json({ id: req.params.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error updating category:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      await admin.firestore().collection('categories').doc(req.params.id).delete();
      invalidateCache('categories');
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting category:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- Custom Pages Endpoints ---
  app.get('/api/pages', async (req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=86400');
    try {
      const data = await getCachedCollection('custom_pages', 60000, res, req);
      if (data) res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching pages:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/pages', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const pageData = req.body;
      const { id, ...dataToSave } = pageData;
      const docRef = await admin.firestore().collection('custom_pages').add({ ...dataToSave, created_at: new Date().toISOString() });
      invalidateCache('custom_pages');
      res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error creating page:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.put('/api/pages/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const pageData = req.body;
      const { id, ...dataToSave } = pageData;
      const docRef = admin.firestore().collection('custom_pages').doc(req.params.id);
      await docRef.update(dataToSave);
      invalidateCache('custom_pages');
      res.json({ id: req.params.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error updating page:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/pages/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      await admin.firestore().collection('custom_pages').doc(req.params.id).delete();
      invalidateCache('custom_pages');
      res.json({ success: true });
    } catch (err: any) {
      console.error('Internal server error deleting page:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- Log Categories System Endpoints (Stored as JSON in settings for dynamic schema) ---
  let memoryLogSystemData = { categories: [], items: [] };

  app.get('/api/logs-system', injectUser, async (req: any, res: any) => {
    try {
      let dbData;
      try {
        const doc = await admin.firestore().collection('settings').doc('log_system_data').get();
        if (doc.exists) {
           const d = doc.data();
           dbData = d?.data; 
        }
      } catch (e) {}

      let payload = dbData || memoryLogSystemData;
      if (!payload || !payload.categories) payload = { categories: [], items: [] };
      
      // Auto-filter based on user VIP status
      let isVip = false;
      if (req.isAdmin) {
         isVip = true;
      } else if (req.user) {
         try {
           const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
           if (userDoc.exists) {
              const u = userDoc.data();
              if (u && u.isPremium === true) isVip = true;
              if (u && (u.role === 'admin' || u.role === 'Admin')) isVip = true;
           }
         } catch(e) {}
      }

      // Hide content if user is not VIP and item type is premium or belongs to a premium category maybe?
      if (!isVip) {
         if (Array.isArray(payload.items)) {
             payload.items = payload.items.map((item: any) => {
                 if (item.type === 'premium') {
                    return { ...item, attachments: [] }; // strip files
                 }
                 return item;
             });
         }
      }

      res.json({ ...payload, isVip });
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/logs-system', requireAdmin, async (req, res) => {
    try {
      const data = req.body;
      memoryLogSystemData = data;
      try {
        if (admin.firestore()) {
          await admin.firestore().collection('settings').doc('log_system_data').set({ data }, { merge: false });
        }
      } catch (e: any) {
        console.warn('Failed to save log system data to DB, keeping in memory:', e.message);
      }
      res.json({ success: true });
    } catch (err: any) {
      console.error('Internal server error saving log system data:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/license_keys', requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('license_keys').limit(500).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching license_keys:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/license_keys', requireAdmin, async (req, res) => {
    try {
      const { key, plan, status } = req.body;
      const newDoc = { key, plan, status, created_at: new Date().toISOString() };
      const docRef = await admin.firestore().collection('license_keys').add(newDoc);
      res.json({ id: docRef.id, dbId: docRef.id, ...newDoc });
    } catch (err) {
      console.error('Internal server error inserting license_key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/license_keys/:id', requireAdmin, async (req, res) => {
    try {
      await admin.firestore().collection('license_keys').doc(req.params.id).delete();
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting license_key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/license_keys/bulk_delete', requireAdmin, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
      await Promise.all(ids.map(id => admin.firestore().collection('license_keys').doc(id).delete()));
      res.json({ success: true, deletedCount: ids.length });
    } catch (err) {
      console.error('Internal server error bulk deleting license_keys:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.patch('/api/license_keys/:id', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const docRef = admin.firestore().collection('license_keys').doc(req.params.id);
      await docRef.update({ status });
      res.json({ id: req.params.id, status });
    } catch (err) {
      console.error('Internal server error updating license_key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/license_keys/bulk', requireAdmin, async (req, res) => {
    try {
      const { keys } = req.body; // Array of { key, type, status, created_at }
      const results = [];
      for (const k of keys) {
         const docRef = await admin.firestore().collection('license_keys').add({ ...k, created_at: new Date().toISOString() });
         results.push({ id: docRef.id, ...k });
      }
      res.json(results);
    } catch (err) {
      console.error('Internal server error bulk inserting license_keys:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/validate_key/:key', async (req, res) => {
    try {
      const snapshot = await admin.firestore().collection('license_keys').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).find((d: any) => d.key === req.params.key);
      if (!data) return res.status(404).json({ error: 'Key not found' });
      res.json(data);
    } catch (err) {
      console.error('Internal server error validating key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/used_keys', async (req: any, res: any) => {
    try {
      const db = admin.firestore();
      let q = db.collection('used_keys');
      
      const targetUID = req.query.uid;
      
      let needsSortInMemory = false;
      
      if (req.isAdmin) {
        if (targetUID) {
          q = q.where('uid', '==', targetUID) as any;
          needsSortInMemory = true;
          q = q.limit(100);
        } else {
          // Omitting orderBy because lack of Postgres INDEX causes timeouts
          q = q.limit(100);
          needsSortInMemory = true;
        }
      } else if (req.user) {
        // User requesting their own history
        q = q.where('uid', '==', (req as any).user.uid).limit(100) as any;
        needsSortInMemory = true;
      } else {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const snapshot = await q.get();
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (needsSortInMemory) {
        data.sort((a: any, b: any) => {
          const dateA = new Date(a.used_at || 0).getTime();
          const dateB = new Date(b.used_at || 0).getTime();
          return dateB - dateA;
        });
        data = data.slice(0, 100); // Limit to 100 results per request
      }
      res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching used_keys:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/used_keys', requireAdmin, async (req, res) => {
    try {
      const { key, ip, details, uid } = req.body;
      const newDoc = { key, ip, details, uid: uid || null, used_at: new Date().toISOString() };
      const docRef = await admin.firestore().collection('used_keys').add(newDoc);
      res.json({ id: docRef.id, dbId: docRef.id, ...newDoc });
    } catch (err) {
      console.error('Internal server error inserting used_key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/blocked_ips', requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('blocked_ips').limit(500).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => new Date(b.blocked_at || 0).getTime() - new Date(a.blocked_at || 0).getTime());
      res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching blocked_ips:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/blocked_ips', requireAdmin, async (req, res) => {
    try {
      const { ip, reason } = req.body;
      const newDoc = { ip, reason, blocked_at: new Date().toISOString() };
      // Note: simplistic upsert simulation using ip as doc ID
      const docRef = admin.firestore().collection('blocked_ips').doc(ip);
      await docRef.set(newDoc);
      res.json({ id: ip, ...newDoc });
    } catch (err) {
      console.error('Internal server error upserting blocked_ip:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/blocked_ips/:ip', requireAdmin, async (req, res) => {
    try {
      await admin.firestore().collection('blocked_ips').doc(req.params.ip).delete();
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting blocked_ip:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/check_ip/:ip', async (req, res) => {
    try {
      const snapshot = await admin.firestore().collection('blocked_ips').get();
      const data = snapshot.docs.map(doc => doc.data()).find((d: any) => d.ip === req.params.ip);
      res.json({ blocked: !!data });
    } catch (err) {
      console.error('Internal server error checking IP:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- API Keys Endpoints ---
  app.get('/api/api_keys', requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('api_keys').limit(500).get();
      const keys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      keys.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      res.json(keys);
    } catch (err: any) {
      console.error('API Keys fetch error:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/api_keys', requireAdmin, async (req: any, res: any) => {
    try {
      const { name, is_lifetime, expire_days } = req.body;
      const keyString = 'apx_' + crypto.randomBytes(16).toString('hex');
      const now = new Date();
      let expires_at = null;
      if (!is_lifetime && expire_days) {
         now.setDate(now.getDate() + parseInt(expire_days));
         expires_at = now.toISOString();
      }
      const newKey = {
         key: keyString,
         name: name || 'Unnamed Key',
         status: 'active',
         created_at: new Date().toISOString(),
         expires_at,
         last_used: null
      };
      await admin.firestore().collection('api_keys').doc(keyString).set(newKey);
      res.json(newKey);
    } catch (err: any) {
       res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/api_keys/:key', requireAdmin, async (req: any, res: any) => {
    try {
      await admin.firestore().collection('api_keys').doc(req.params.key).delete();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.patch('/api/api_keys/:key', requireAdmin, async (req: any, res: any) => {
    try {
      const { status } = req.body;
      await admin.firestore().collection('api_keys').doc(req.params.key).update({ status });
      res.json({ success: true, status });
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/admins', requireAdmin, async (req: any, res: any) => {
    try {
      const { username, role } = req.body;
      const newDoc = { username, role, granted_at: new Date().toISOString() };
      const docRef = admin.firestore().collection('admins').doc(username);
      await docRef.set(newDoc);
      res.json({ id: username, ...newDoc });
    } catch (err) {
      console.error('Internal server error upserting admin:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- Community Endpoints ---
  const communityFile = path.resolve(os.tmpdir(), 'community_data.json');
  let communityData: { categories: any[], channels: any[], messages: any[], userRanks: Record<string, string> } = { categories: [], channels: [], messages: [], userRanks: {} };
  if (fs.existsSync(communityFile)) {
    try {
      communityData = JSON.parse(fs.readFileSync(communityFile, 'utf-8'));
      if (!communityData.userRanks) communityData.userRanks = {};
    } catch(e) {}
  }
  const saveCommunity = () => {
    try {
      fs.writeFileSync(communityFile, JSON.stringify(communityData));
    } catch(e) {
      console.warn("Could not write communityData JSON to file system. Proceeding in-memory only.");
    }
  };

  // Initialize defaults
  if (communityData.categories.length === 0) {
     const catId = 'cat-' + Date.now();
     communityData.categories.push({ id: catId, name: 'INFORMATION', order: 0 });
     communityData.channels.push({ id: 'ch-claim', categoryId: catId, name: 'รับยศ-basic', type: 'role_claim', order: 0 });
     communityData.channels.push({ id: 'ch-gen', categoryId: catId, name: 'ประกาศทั่วไป', type: 'text', order: 1 });
     saveCommunity();
  }

  // Community endpoints removed

  // Mutex for key redemption
  const redeemLocks: Record<string, Promise<any>> = {};

  app.post('/api/redeem', mutationLimiter, requireAuth, async (req: any, res: any) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    // Acquire lock for this key
    while (redeemLocks[key]) {
      await redeemLocks[key];
    }
    
    let releaseLock: () => void;
    redeemLocks[key] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const uid = (req as any).user.uid;
      
      let keyData: any = null;
      let keyDocRef: any = null;
      let isProductKey = false;

      // 1. ลองหาคีย์ใน license_keys (ระบบคีย์ระดับ Premium/VIP แบบเก่า)
      const snapshot = await admin.firestore().collection('license_keys').where('key', '==', key).where('status', '==', 'active').get();
      if (!snapshot.docs || snapshot.docs.length === 0) {
        
        // 2. ถ้าไม่เจอ ลองหาในประวัติการสั่งซื้อ (เผื่อเป็นคีย์แรนด้อม/คีย์สินค้าที่ซื้อไป)
        let foundDoc = null;
        try {
          const cachedPurchases = await getCachedCollection('purchases', 60000);
          for (const p of cachedPurchases) {
            if (p.secretData && !p.webClaimed) {
               const keysInPurchase = p.secretData.split('\n').map((k: string) => k.trim());
               if (keysInPurchase.includes(key.trim())) {
                 foundDoc = { id: p.id, ...p };
                 keyDocRef = admin.firestore().collection('purchases').doc(p.id);
                 break;
               }
            }
          }
        } catch(e) {}

        if (!foundDoc) {
           return res.status(400).json({ error: 'ไม่พบคีย์ในระบบ หรือคีย์นี้ถูกใช้งานไปแล้ว' });
        }

        isProductKey = true;
        keyData = foundDoc;

      } else {
        keyData = snapshot.docs[0].data();
        keyDocRef = admin.firestore().collection('license_keys').doc(snapshot.docs[0].id);
      }
      
      let rankToGive = 'premium';
      let expireDate = new Date();

      if (isProductKey) {
        // อัปเดตคีย์สั่งซื้อว่าถูกใช้รับยศในเว็บแล้ว
        await keyDocRef.update({ ...keyData, webClaimed: true });
        
        // ให้ยศเป็นชื่อของสินค้า (หรือถ้าอยากให้เป็น premium ก็ใส่ premium)
        rankToGive = keyData.productName?.replace(/ \(.+\)/g, '') || 'VIP';
        
        // เพิ่มลงในประวัติ (optional)
        await admin.firestore().collection('used_keys').add({
          key: key,
          ip: req.ip,
          uid: uid,
          details: `Redeemed product rank ${rankToGive}`,
          used_at: new Date().toISOString()
        });

        // คีย์สินค้ารับยศได้ ให้เป็นตลอดชีพ
        expireDate.setDate(expireDate.getDate() + 9999);

      } else {
        // ระบบคีย์จาก license_keys เดิม
        await keyDocRef.update({ status: 'used' });
        await admin.firestore().collection('used_keys').add({
          key: key,
          ip: req.ip,
          uid: uid,
          details: `Redeemed rank ${keyData.type}`,
          used_at: new Date().toISOString()
        });
        
        let days = 1;
        if (keyData.type === 'Week') days = 7;
        if (keyData.type === 'Month') days = 30;
        if (keyData.type === '3Month') days = 90;
        if (keyData.type === 'Year') days = 365;
        if (keyData.type === 'Lifetime') days = 9999;
        expireDate.setDate(expireDate.getDate() + days);
      }
      
      communityData.userRanks = communityData.userRanks || {};
      communityData.userRanks[uid] = rankToGive;
      saveCommunity();

      await admin.firestore().collection('users').doc(uid).set({
        isPremium: true,
        rank: rankToGive,
        premiumExpireDate: expireDate.toISOString()
      }, { merge: true });
      
      res.json({ success: true, rank: rankToGive, type: isProductKey ? 'Product Rank' : keyData.type });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    } finally {
      releaseLock!();
      delete redeemLocks[key];
    }
  });

  // --- User Profiles Endpoints ---
  app.get('/api/users/:uid', requireAuth, async (req: any, res: any) => {
    if ((req as any).user.uid !== req.params.uid && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const docRef = admin.firestore().collection('users').doc(req.params.uid);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const data = snapshot.data();
        data.rank = communityData.userRanks?.[req.params.uid] || data.rank || 'user';
        res.json(data);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/users/:uid', requireAuth, async (req: any, res: any) => {
    if ((req as any).user.uid !== req.params.uid && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const { uid } = req.params;
      const data = req.body;
      
      // Prevent privilege escalation and balance spoofing via whitelisting for non-admin
      let dataToUpdate = data;
      if (!req.isAdmin) {
        const allowedFields = ['avatar', 'displayName', 'bio', 'username', 'fullName', 'email', 'registeredAt']; 
        dataToUpdate = Object.fromEntries(
          Object.entries(data).filter(([k]) => allowedFields.includes(k))
        );
      }
      
      const docRef = admin.firestore().collection('users').doc(uid);
      await docRef.set({ ...dataToUpdate, updatedAt: new Date().toISOString() }, { merge: true });
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error saving user:', err.message || JSON.stringify(err));
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/users/:uid/password', requireAdmin, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      const { password } = req.body;
      if (!password) return res.status(400).json({ error: 'Missing password' });
      await supabaseAdmin.auth.admin.updateUserById(uid, { password });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/users/:uid', requireAdmin, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      await supabaseAdmin.auth.admin.deleteUser(uid).catch(() => {});
      await admin.firestore().collection('users').doc(uid).delete();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/users', requireAdmin, async (req: any, res: any) => {
    try {
      
      const snapshot = await admin.firestore().collection('users').limit(200).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching all users:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/log_error', (req, res) => {
    try {
      const safeBody = typeof req.body === 'object' ? JSON.stringify({ type: req.body.type, message: req.body.message, stack: req.body.stack, componentStack: req.body.componentStack }) : String(req.body).substring(0, 200);
      console.error('CLIENT ERROR:', safeBody);
    } catch(e) {}
    res.json({ received: true });
  });

  // Collect Core Web Vitals from frontend
  app.post('/api/log_vitals', (req, res) => {
    try {
      const { metric } = req.body;
      if (metric && metric.name && metric.value) {
        // Logging directly to stdout so it gets picked up by standard log aggregators (e.g. Cloud Logging / ELK)
        console.log(JSON.stringify({ 
          level: 'info', 
          type: 'web_vital', 
          name: metric.name, 
          value: metric.value, 
          rating: metric.rating, 
          id: metric.id 
        }));
      }
    } catch(e) {}
    res.status(204).end(); // No content to send back, keep it fast
  });


  // /api/bot/status and globalBot variables removed

  app.get('/bot-code', (req, res) => {
    try {
        const cfgPath = path.join(process.cwd(), 'twer_temp', 'bot.py');
        if (fs.existsSync(cfgPath)) {
            const content = fs.readFileSync(cfgPath, 'utf8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="bot.py"');
            res.send(content);
        } else {
            res.status(404).send('Bot code not found');
        }
    } catch (err) {
        res.status(500).send('Error reading bot code');
    }
  });

  app.post('/api/bot/save', requireAdmin, (req, res) => {
    // Save config first if provided
    if (req.body.config) {
        fs.writeFileSync(path.join(process.cwd(), 'twer_temp', 'bot.py'), req.body.config);
    }
    res.json({ success: true, message: 'Bot config saved' });
  });

  app.get('/api/bot/config', requireAdmin, (req, res) => {
    try {
        const cfgPath = path.join(process.cwd(), 'twer_temp', 'bot.py');
        if (fs.existsSync(cfgPath)) {
            const content = fs.readFileSync(cfgPath, 'utf8');
            res.json({ config: content });
        } else {
            res.json({ config: '# bot.py not found on server' });
        }
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
  });


  // --- Telegram Gift Catcher Service ---
  let TelegramClient: any;
  let StringSession: any;
  let NewMessage: any;
  let twApi: any;

  class TopupSystem {
      phoneNumber: string;
      constructor(phoneNumber: string) {
          this.phoneNumber = phoneNumber;
      }

      async redeemVoucher(giftLink: string) {
          try {
              const voucherCode = giftLink.split('v=')[1]?.split('&')[0];
              if (!voucherCode) return { success: false, message: 'INVALID_CODE' };

              const response: any = await (cloudscraper as any).post(
                  `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`,
                  {
                      json: { mobile: this.phoneNumber, voucher_hash: voucherCode },
                      headers: {
                          'Referer': `https://gift.truemoney.com/campaign/?v=${voucherCode}`,
                          'Origin': 'https://gift.truemoney.com'
                      }
                  }
              );

              if (response?.status?.code === 'SUCCESS') {
                  return {
                      success: true,
                      amount: response.data.my_ticket.amount_baht,
                      ownerName: response.data.owner_profile.full_name,
                      voucherCode: voucherCode
                  };
              }
              return { success: false, message: response?.status?.message || 'FAILED' };
          } catch (error: any) {
              if (error.response?.body) {
                  try {
                      const errData = typeof error.response.body === 'string' ? JSON.parse(error.response.body) : error.response.body;
                      return { success: false, message: errData.status?.message || 'FAILED' };
                  } catch (e) {}
              }
              return { success: false, message: 'RATE_LIMIT/ERROR' };
          }
      }
  }

  (async () => {
    const t = await import('telegram');
    TelegramClient = t.TelegramClient;
    const ts = await import('telegram/sessions/index.js');
    StringSession = ts.StringSession;
    const te = await import('telegram/events/index.js');
    NewMessage = te.NewMessage;
    const tw = await import('@opecgame/twapi');
    twApi = tw.default;
  })();

  let tgDailyCount = 0;
  let tgLastResetDate = new Date().toISOString().slice(0, 10);

  const tgSessions = new Map<string, {
      client: any,
      status: 'idle' | 'pending_otp' | 'pending_password' | 'connected' | 'error',
      truemoneyPhone: string,
      resolveOtp?: (code: string) => void,
      resolvePassword?: (pwd: string) => void,
      logs: string[]
  }>();

  function pushTgLog(phone: string, msg: string) {
      const sess = tgSessions.get(phone);
      if (sess) {
          sess.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
          if (sess.logs.length > 50) sess.logs.shift();
      }
  }

  function createResolver() {
      let rs: any;
      const p = new Promise(resolve => rs = resolve);
      return { promise: p, resolve: rs };
  }

  app.post('/api/telegram/catcher/request', requireAuth, async (req: any, res: any) => {
      const { telegramPhone, truemoneyPhone } = req.body;
      if (!telegramPhone || !truemoneyPhone) return res.status(400).json({ error: 'Missing phone numbers' });

      // Verify Premium
      const userRef = admin.firestore().collection('users').doc((req as any).user.uid);
      const userDoc = await userRef.get();
      const isPremium = req.isAdmin || (userDoc.exists && userDoc.data()?.isPremium);

      // Daily Limit logic (100 users) -> Note: If premium, bypass.
      const today = new Date().toISOString().slice(0, 10);
      if (tgLastResetDate !== today) {
          tgLastResetDate = today;
          tgDailyCount = 0;
      }

      if (!isPremium) {
          if (tgDailyCount >= 100) {
              return res.status(400).json({ error: 'โควต้าผู้ใช้งานฟรีเต็มแล้วสำหรับวันนี้ (100 คน) กรุณากลับมาใหม่พรุ่งนี้ หรืออัปเกรด VIP' });
          }
          tgDailyCount++;
      }

      try {
          let sess = tgSessions.get(telegramPhone);
          if (sess && sess.status === 'connected') {
             // Already running?
             return res.json({ status: 'connected' });
          }

          const client = new TelegramClient(new StringSession(''), 2040, 'b18441a1ff607e10a989891a5462e627', { connectionRetries: 3 });
          
          sess = { 
              client, 
              status: 'idle', 
              truemoneyPhone,
              logs: ['เริ่มเชื่อมต่อเข้าสู่ระบบ Telegram...']
          };
          tgSessions.set(telegramPhone, sess);

          // Asynchronous start
          client.start({
              phoneNumber: telegramPhone,
              phoneCode: async () => {
                  const sessData = tgSessions.get(telegramPhone)!;
                  sessData.status = 'pending_otp';
                  sessData.logs.push('รอรหัส OTP จาก Telegram ของคุณ...');
                  const { promise, resolve } = createResolver();
                  sessData.resolveOtp = resolve;
                  return await promise as string;
              },
              password: async () => {
                   const sessData = tgSessions.get(telegramPhone)!;
                   sessData.status = 'pending_password';
                   sessData.logs.push('ต้องการรหัส 2FA Password...');
                   const { promise, resolve } = createResolver();
                   sessData.resolvePassword = resolve;
                   return await promise as string;
              },
              onError: (err: any) => {
                  const sessData = tgSessions.get(telegramPhone);
                  if (sessData) {
                      sessData.status = 'error';
                      sessData.logs.push(`ข้อผิดพลาด: ${err.message}`);
                  }
              }
          }).then(() => {
              const sessData = tgSessions.get(telegramPhone)!;
              sessData.status = 'connected';
              sessData.logs.push('เชื่อมต่อบัญชีสำเร็จ! บอทกำลังดักซองในพื้นหลัง (คุณสามารถปิดหน้านี้ได้)');
              
              // Handle New Message
              const topup = new TopupSystem(truemoneyPhone);
              client.addEventHandler(async (event: any) => {
                  const message = event.message;
                  if (!message) return;
                  if (message.message) {
                      const voucherRegex = /https?:\/\/gift\.truemoney\.com\/campaign\/?(?:voucher_detail\/)?\?v=([A-Za-z0-9]{10,})/gi;
                      const matches = message.message.match(voucherRegex);
                      if (matches && matches.length > 0) {
                          for (const vurl of matches) {
                              const startTime = Date.now();
                              pushTgLog(telegramPhone, `🎯 เจอซอง! ${vurl}`);
                              
                              try {
                                  const result = await topup.redeemVoucher(vurl);
                                  
                                  if (result.success) {
                                      const speed = Date.now() - startTime;
                                      pushTgLog(telegramPhone, `✅ รับซองสำเร็จ! +${result.amount} บาท | ${speed}ms`);
                                      
                                      const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
                                      if (webhookUrl) {
                                          await axios.post(webhookUrl, {
                                              embeds: [{
                                                  title: "🌊 FFM Sniper Success!",
                                                  color: 0x00FF00,
                                                  fields: [
                                                      { name: "💰 จำนวนเงิน", value: `**${result.amount}** บาท`, inline: true },
                                                      { name: "⚡ ความเร็ว", value: `\`${speed}ms\``, inline: true },
                                                      { name: "👤 จาก", value: `${result.ownerName}`, inline: true },
                                                      { name: "🔗 ลิงก์", value: `[Link](${vurl})` }
                                                  ],
                                                  timestamp: new Date()
                                              }]
                                          }).catch(() => {});
                                      }
                                  } else {
                                      pushTgLog(telegramPhone, `❌ ${result.message}`);
                                  }
                              } catch(e) {
                                  pushTgLog(telegramPhone, `❌ ข้อผิดพลาดในการรับซอง`);
                              }
                          }
                      }
                  }
              }, new NewMessage({}));
              
          }).catch((e: any) => {
              const sessData = tgSessions.get(telegramPhone);
              if (sessData) {
                  sessData.status = 'error';
                  sessData.logs.push(`ข้อผิดพลาดการเชื่อมต่อ: ${e.message}`);
              }
          });

          // Respond immediately
          res.json({ success: true, status: 'idle' });
          
      } catch (err: any) {
          res.status(500).json({ error: String(err) });
      }
  });

  app.post('/api/telegram/catcher/submit', async (req, res) => {
      const { telegramPhone, type, value } = req.body;
      const sess = tgSessions.get(telegramPhone);
      if (!sess) return res.status(400).json({ error: 'ไม่พบเซสชั่น' });

      if (type === 'otp' && sess.resolveOtp) {
          sess.resolveOtp(value);
          sess.status = 'idle';
      } else if (type === 'password' && sess.resolvePassword) {
          sess.resolvePassword(value);
          sess.status = 'idle';
      }
      
      res.json({ success: true });
  });

  app.get('/api/telegram/catcher/status', async (req, res) => {
      const phone = req.query.phone as string;
      const sess = tgSessions.get(phone);
      if (!sess) return res.json({ status: 'none', logs: [] });
      res.json({ status: sess.status, logs: sess.logs });
  });

  app.post('/api/telegram/catcher/stop', requireAuth, async (req: any, res: any) => {
      const { telegramPhone } = req.body;
      const sess = tgSessions.get(telegramPhone);
      if (sess) {
          try { await sess.client.disconnect(); } catch (e) {}
          tgSessions.delete(telegramPhone);
      }
      res.json({ success: true });
  });

  app.post('/api/truemoney/redeem', requireAuth, async (req: any, res: any) => {
    try {
      const { url, phone } = req.body;
      if (!url || !phone) return res.status(400).json({ error: 'Missing parameters' });
      const result = await twApi(url, phone);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // --- Discord Token On Service ---
  const discordTokenOnSessions = new Map<string, {
      ws: WebSocket,
      status: 'idle' | 'connected' | 'error',
      logs: string[]
  }>();

  function pushDiscordOnLog(token: string, msg: string) {
      const sess = discordTokenOnSessions.get(token);
      if (sess) {
          sess.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
          if (sess.logs.length > 50) sess.logs.shift();
      }
  }

  app.post('/api/discord/token-on/start', requireAuth, async (req: any, res: any) => {
      const { discordToken } = req.body;
      if (!discordToken) return res.status(400).json({ error: 'Missing token' });

      // Verify Premium (since it's a 24/7 process that drains memory, we MUST protect it)
      const userRef = admin.firestore().collection('users').doc((req as any).user.uid);
      const userDoc = await userRef.get();
      if (!req.isAdmin && (!userDoc.exists || !userDoc.data()?.isPremium)) {
          return res.status(403).json({ error: 'Premium feature only' });
      }

      try {
          if (discordTokenOnSessions.size >= 50) {
              return res.status(503).json({ error: 'Server reached maximum concurrent active connections. Please try again later.' });
          }
          let sess = discordTokenOnSessions.get(discordToken);
          if (sess && sess.status === 'connected') {
             return res.json({ status: 'connected' });
          }

          const ws = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9&compress=json');
          
          sess = { 
              ws, 
              status: 'idle', 
              logs: ['🎯 เริ่มระบบ Token On (24/7)...']
          };
          discordTokenOnSessions.set(discordToken, sess);

          let hbInterval: NodeJS.Timeout | null = null;

          ws.on('open', () => {
              sess!.status = 'connected';
              pushDiscordOnLog(discordToken, '✅ เชื่อมต่อ Discord Gateway สำเร็จ! ไอดีของคุณออนไลน์แล้ว');
              // Identify Payload
              ws.send(JSON.stringify({
                  "op": 2,
                  "d": {
                      "token": discordToken,
                      "capabilities": 253,
                      "properties": {
                          "os": "Windows",
                          "browser": "Chrome",
                          "device": "",
                          "system_locale": "en-US",
                          "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.113 Safari/537.36",
                          "browser_version": "96.0.4664.113",
                          "os_version": "10",
                          "referrer": "",
                          "referring_domain": "",
                          "referrer_current": "",
                          "referring_domain_current": "",
                          "release_channel": "stable",
                          "client_build_number": 109190,
                          "client_event_source": null
                      },
                      "presence": {
                          "status": "online",
                          "since": 0,
                          "activities": [],
                          "afk": false
                      },
                      "compress": false
                  }
              }));
          });

          ws.on('message', async (data: any) => {
              const payload = JSON.parse(data);
              
              if (payload.op === 10) {
                  const heartbeatInterval = payload.d.heartbeat_interval;
                  hbInterval = setInterval(() => {
                      if (ws.readyState === WebSocket.OPEN) {
                           ws.send(JSON.stringify({ op: 1, d: null }));
                      }
                  }, heartbeatInterval);
              }
              
              if (payload.t === 'READY') {
                  pushDiscordOnLog(discordToken, `✅ ยืนยันตัวตนสำเร็จ: ${payload.d.user.username}#${payload.d.user.discriminator}`);
              }
          });

          ws.on('close', () => {
              if (hbInterval) clearInterval(hbInterval);
              const curSess = discordTokenOnSessions.get(discordToken);
              if (curSess) {
                 curSess.status = 'error';
                 pushDiscordOnLog(discordToken, '❌ ตัดการเชื่อมต่อจาก Discord Gateway แล้ว');
              }
          });

          ws.on('error', (err: any) => {
              const curSess = discordTokenOnSessions.get(discordToken);
              if (curSess) {
                  curSess.status = 'error';
                  pushDiscordOnLog(discordToken, `❌ ข้อผิดพลาด WebSocket: ${err.message}`);
              }
          });

          // Respond immediately
          res.json({ success: true, status: 'idle' });
          
      } catch (err: any) {
          res.status(500).json({ error: String(err) });
      }
  });

  app.get('/api/discord/token-on/status', async (req, res) => {
      const token = req.query.token as string;
      const sess = discordTokenOnSessions.get(token);
      if (!sess) return res.json({ status: 'none', logs: [] });
      res.json({ status: sess.status, logs: sess.logs });
  });

  app.post('/api/discord/token-on/stop', requireAuth, async (req: any, res: any) => {
      const { discordToken } = req.body;
      const sess = discordTokenOnSessions.get(discordToken);
      if (sess) {
          try { sess.ws.close(); } catch (e) {}
          discordTokenOnSessions.delete(discordToken);
      }
      res.json({ success: true });
  });

  // --- Discord Gift Catcher Service ---
  const discordSessions = new Map<string, {
      ws: WebSocket,
      status: 'idle' | 'connected' | 'error',
      truemoneyPhone: string,
      logs: string[]
  }>();

  function pushDiscordLog(token: string, msg: string) {
      const sess = discordSessions.get(token);
      if (sess) {
          sess.logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
          if (sess.logs.length > 50) sess.logs.shift();
      }
  }

  app.post('/api/discord/catcher/request', requireAuth, async (req: any, res: any) => {
      const { discordToken, truemoneyPhone } = req.body;
      if (!discordToken || !truemoneyPhone) return res.status(400).json({ error: 'Missing token or phone number' });

      // Verify Premium
      const userRef = admin.firestore().collection('users').doc((req as any).user.uid);
      const userDoc = await userRef.get();
      const isPremium = req.isAdmin || (userDoc.exists && userDoc.data()?.isPremium);

      // Daily Limit logic (shared with telegram or separate if prefered, using tgDailyCount for simplicity if not premium)
      const today = new Date().toISOString().slice(0, 10);
      if (tgLastResetDate !== today) {
          tgLastResetDate = today;
          tgDailyCount = 0;
      }

      if (!isPremium) {
          if (tgDailyCount >= 100) {
              return res.status(400).json({ error: 'โควต้าผู้ใช้งานฟรีเต็มแล้วสำหรับวันนี้ (100 คน) กรุณากลับมาใหม่พรุ่งนี้ หรืออัปเกรด VIP' });
          }
          tgDailyCount++;
      }

      try {
          if (discordSessions.size >= 50) {
              return res.status(503).json({ error: 'Server reached maximum concurrent bot capacity. Please try again later.' });
          }
          let sess = discordSessions.get(discordToken);
          if (sess && sess.status === 'connected') {
             return res.json({ status: 'connected' });
          }

          const ws = new WebSocket('wss://gateway.discord.gg/?encoding=json&v=9&compress=json');
          
          sess = { 
              ws, 
              status: 'idle', 
              truemoneyPhone,
              logs: ['เริ่มเชื่อมต่อเข้าสู่ระบบ Discord (WebSocket)...']
          };
          discordSessions.set(discordToken, sess);

          let hbInterval: NodeJS.Timeout | null = null;

          ws.on('open', () => {
              sess!.status = 'connected';
              pushDiscordLog(discordToken, 'เชื่อมต่อ Gateway สำเร็จ กำลังรอรับข้อความซอง...');
              // Identify Payload
              ws.send(JSON.stringify({
                  "op": 2,
                  "d": {
                      "token": discordToken,
                      "capabilities": 253,
                      "properties": {
                          "os": "Windows",
                          "browser": "Chrome",
                          "device": "",
                          "system_locale": "en-US",
                          "browser_user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.113 Safari/537.36",
                          "browser_version": "96.0.4664.113",
                          "os_version": "10",
                          "referrer": "",
                          "referring_domain": "",
                          "referrer_current": "",
                          "referring_domain_current": "",
                          "release_channel": "stable",
                          "client_build_number": 109190,
                          "client_event_source": null
                      },
                      "compress": false
                  }
              }));
          });

          ws.on('message', async (data: any) => {
              const payload = JSON.parse(data);
              if (payload.t === 'MESSAGE_CREATE') {
                  const message = payload.d.content;
                  if (message) {
                      const voucherRegex = /https?:\/\/gift\.truemoney\.com\/campaign\/?(?:voucher_detail\/)?\?v=([A-Za-z0-9]+)/gi;
                      const matches = message.match(voucherRegex);
                      
                      if (matches && matches.length > 0) {
                          pushDiscordLog(discordToken, `🎯 เจอซอง! เริ่มการรับเครดิตเข้าเบอร์ ${truemoneyPhone}`);
                          for (const vurl of matches) {
                              try {
                                  const result = await twApi(vurl, truemoneyPhone);
                                  if (result?.status?.code === 'SUCCESS') {
                                      pushDiscordLog(discordToken, `✅ รับซองสำเร็จ! +${result.data.my_ticket.amount_baht} บาท`);
                                  } else {
                                      // @ts-ignore
                                      pushDiscordLog(discordToken, `❌ ${result?.status?.message || 'ไม่สามารถรับได้'}`);
                                  }
                              } catch(e) {
                                  pushDiscordLog(discordToken, `❌ ข้อผิดพลาดในการรับซอง`);
                              }
                          }
                      }
                  }
              }

              if (payload.op === 10) {
                  const heartbeatInterval = payload.d.heartbeat_interval;
                  hbInterval = setInterval(() => {
                      if (ws.readyState === WebSocket.OPEN) {
                           ws.send(JSON.stringify({ op: 1, d: null }));
                      }
                  }, heartbeatInterval);
              }
          });

          ws.on('close', () => {
              if (hbInterval) clearInterval(hbInterval);
              const curSess = discordSessions.get(discordToken);
              if (curSess) {
                 curSess.status = 'error';
                 pushDiscordLog(discordToken, '❌ ตัดการเชื่อมต่อจาก Discord Gateway แล้ว');
              }
          });

          ws.on('error', (err: any) => {
              const curSess = discordSessions.get(discordToken);
              if (curSess) {
                  curSess.status = 'error';
                  pushDiscordLog(discordToken, `❌ ข้อผิดพลาด WebSocket: ${err.message}`);
              }
          });

          // Respond immediately
          res.json({ success: true, status: 'idle' });
          
      } catch (err: any) {
          res.status(500).json({ error: String(err) });
      }
  });

  app.get('/api/discord/catcher/status', async (req, res) => {
      const token = req.query.token as string;
      const sess = discordSessions.get(token);
      if (!sess) return res.json({ status: 'none', logs: [] });
      res.json({ status: sess.status, logs: sess.logs });
  });

  app.post('/api/discord/catcher/stop', requireAuth, async (req: any, res: any) => {
      const { discordToken } = req.body;
      const sess = discordSessions.get(discordToken);
      if (sess) {
          try { sess.ws.close(); } catch (e) {}
          discordSessions.delete(discordToken);
      }
      res.json({ success: true });
  });

  // Discord HypeSquad Tool API
  app.post('/api/discord/hypesquad', requireAuth, async (req: any, res: any) => {
    try {
      const { token, house_id } = req.body;
      if (!token) return res.status(400).json({ error: 'Token is required' });
      if (![1, 2, 3].includes(house_id)) return res.status(400).json({ error: 'Invalid house_id' });

      const response = await axios.post('https://discord.com/api/v9/hypesquad/online', 
        { house_id },
        { 
          headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 204 || response.status === 200) {
        res.json({ success: true, message: 'รับตราสำเร็จ' });
      } else {
        res.status(response.status).json({ error: 'เกิดข้อผิดพลาดในการรับตรา', details: response.data });
      }
    } catch (error: any) {
      console.error("Discord hypesquad error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "ไม่สามารถเชื่อมต่อกับ Discord ได้ ลองตรวจสอบ Token อีกครั้งหรือบัญชีอาจจะติด Flag" 
      });
    }
  });

  app.delete('/api/discord/hypesquad', requireAuth, async (req: any, res: any) => {
    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ error: 'Token is required' });

      // In Axios, DELETE with body might require { data: ... } or pass token in headers
      const response = await axios.delete('https://discord.com/api/v9/hypesquad/online', {
        headers: { 
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 204 || response.status === 200) {
        res.json({ success: true, message: 'ลบตราสำเร็จ' });
      } else {
        res.status(response.status).json({ error: 'เกิดข้อผิดพลาดในการลบตรา', details: response.data });
      }
    } catch (error: any) {
      console.error("Discord hypesquad remove error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.response?.data?.message || "ไม่สามารถเชื่อมต่อกับ Discord ได้ ลองตรวจสอบ Token อีกครั้ง" 
      });
    }
  });

if (!process.env.VERCEL) {
  (async () => {
    if (process.env.NODE_ENV !== "production") {
      console.log("Initializing Vite middleware (async)...");
      try {
        const { createServer: createViteServer } = await import('vite');
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
        console.log("Vite middleware attached.");
      } catch (err) {
        console.error("Failed to initialize Vite middleware:", err);
      }
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath, { 
        maxAge: '1y',
        setHeaders: (res, path) => {
          if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          } else {
            // Aggressive cache control for JS/CSS/Assets with specific CDN headers
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.setHeader('Cloudflare-CDN-Cache-Control', 'max-age=31536000');
            res.setHeader('CDN-Cache-Control', 'max-age=31536000');
          }
        }
      }));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const server = app.listen(3000, "0.0.0.0", () => {
      logger.info(`[Server] Listening on http://0.0.0.0:3000`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`[Server] Received ${signal}. Draining connections and shutting down gracefully...`);
      server.close(() => {
        logger.info(`[Server] Closed out remaining connections.`);
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('[Server] Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  })();
}

export default app;

