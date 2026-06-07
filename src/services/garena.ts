import crypto from 'crypto';

const IV_LENGTH = 12; // GCM mode uses 96-bit (12 bytes) IV

const getEncryptionKey = (): string => {
  const encryptionKey = process.env.BACKEND_ENCRYPTION_KEY;
  if (!encryptionKey) {
    throw new Error('BACKEND_ENCRYPTION_KEY not set in environment variables');
  }
  return encryptionKey;
};

export function encrypt(text: string): string {
  try {
    const key = crypto.createHash('sha256').update(getEncryptionKey()).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
  } catch (e) {
    throw new Error('Encryption failed');
  }
}

export function decrypt(text: string): string {
  try {
    const textParts = text.split(':');
    if (textParts.length < 3) throw new Error('Invalid encrypted format');
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = textParts[1];
    const authTag = Buffer.from(textParts[2], 'hex');
    const key = crypto.createHash('sha256').update(getEncryptionKey()).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    throw new Error('Decryption failed');
  }
}

export const getMD5 = (text: string): string => {
  let raw = text;
  try {
    if (text.includes('%')) {
      raw = decodeURIComponent(text);
    }
  } catch (e) {}
  return crypto.createHash('md5').update(raw).digest('hex');
};

// NOTE: This function matches Garena login OAuth protocol signature exactly.
// It uses AES-256-ECB. Since this matches Garena's mandated proprietary login interface requirements,
// we must retain ECB mode here to maintain compatibility with external Garena APIs.
export const encryptPassword = (password: string, v1: string, v2: string): string => {
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

export const getCodmInfo = async (client: any): Promise<any> => {
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
          "sec-ch-ua": '"Chromium";v="107", "Not=A?Brand";v="24"',
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
  } catch (e) {}
  return null;
};

export const getGameConnections = async (client: any): Promise<string[]> => {
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
