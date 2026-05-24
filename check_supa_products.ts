import { supabaseAdmin } from './src/lib/admindb.js';

async function run() {
  const { data, error } = await supabaseAdmin.from('products').select('id, name, stock, stockdata, stockData').gt('stock', 0);
  if (error) {
    console.error('Error fetching table:', error.message);
  } else {
    for (const d of data) {
       console.log(d.id, d.name, d.stock, "stockdata len:", (d.stockdata || d.stockData || []).length);
       if (d.stockdata && typeof d.stockdata === 'string') {
          console.log(`String of length ${d.stockdata.length}`);
       } else if (d.stockdata && d.stockdata.__compressed) {
          console.log(`Compressed string...`);
       } else if (typeof d.stockdata === 'object' && d.stockdata && !Array.isArray(d.stockdata)) {
          console.log(`Object with keys length: ${Object.keys(d.stockdata).length}`);
       }
    }
  }
}
run();
