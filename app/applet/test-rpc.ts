import { createClient } from '@supabase/supabase-js';

async function checkRPC() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) return console.log('no url');
  
  const res = await fetch(`${url}/rest/v1/?apikey=${key}`, {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  console.log('Paths:', Object.keys(data.paths).filter(p => !p.startsWith('/')).join(', '));
}
checkRPC();
