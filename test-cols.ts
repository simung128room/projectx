import { supabaseAdmin } from './src/lib/admindb.js';

async function testCols() {
  const { data: users } = await supabaseAdmin.from('users').select('*').limit(1);
  console.log("users:", Object.keys(users?.[0] || {}));

  const { data: license_keys } = await supabaseAdmin.from('license_keys').select('*').limit(1);
  console.log("license_keys:", Object.keys(license_keys?.[0] || {}));
}
testCols();
