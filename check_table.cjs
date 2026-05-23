const fetch = require('node-fetch');
async function check() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) return console.log('no url');
  
  const res = await fetch(`${url}/rest/v1/product_stock_chunks?limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(res.status, await res.text());
}
check();
