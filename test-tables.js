async function check() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) return console.log('no url');
  
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`, {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  const tables = Object.keys(data.definitions);
  console.log('Tables:', tables);
}
check();
