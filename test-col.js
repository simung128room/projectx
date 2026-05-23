async function check() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) return console.log('no url');
  
  const res = await fetch(`${url}/rest/v1/products?_version=eq.1&limit=1`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  console.log(res.status, await res.text());
}
check();
