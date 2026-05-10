import { supabaseAdmin } from './src/lib/admindb.js';

async function run() {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById('mock');
  console.log("No, we can't run DDL via postgREST easily unless RPC.");
}

run();
