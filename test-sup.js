import { createClient } from '@supabase/supabase-js';

async function check() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url) return console.log('no url');
  
  const supabase = createClient(url, key);
  const { data, error } = await supabase.from('products').update({}).eq('id', '123');
  console.log('Error:', error);
}
check();
