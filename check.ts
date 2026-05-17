import axios from 'axios';
import https from 'https';
async function test() {
  const agent = new https.Agent({ rejectUnauthorized: false });
  try {
    const preloginRes = await axios.get('https://sso.garena.com/api/prelogin', {
      params: { app_id: '10100', account: 'test4u', format: 'json', id: Date.now() },
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'Referer': 'https://account.garena.com/'
      },
      httpsAgent: agent,
      httpAgent: agent,
      validateStatus: () => true
    });
    console.log('Prelogin Res', preloginRes.status, preloginRes.data);
  } catch(e) {}
}
test();
