import fs from 'fs';
const envData = fs.readFileSync('.env.example', 'utf-8');
envData.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) process.env[k.trim()] = v.trim();
});
import { supabaseAdmin } from './src/lib/admindb.js';

async function run() {
  const { data, error } = await supabaseAdmin.from('products').select('*');
  console.log(error ? error : `Found ${data.length} products`);
  for (const d of data || []) {
      console.log(d.id, d.productname, 'stock:', d.stock, 'stockdata_len:', d.stockdata ? d.stockdata.length : 0);
  }
}
run();
