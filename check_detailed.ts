import fs from 'fs';
const envData = fs.readFileSync('.env.example', 'utf-8');
envData.split('\n').forEach(line => {
  const i = line.indexOf('=');
  if (i > -1) {
    const k = line.substring(0, i).trim();
    const v = line.substring(i + 1).trim();
    if (k && v) process.env[k] = v;
  }
});
import { adminDb as admin } from './src/lib/admindb.js';

async function run() {
  const products = await admin.firestore().collection('products').get();
  console.log(`Found ${products.docs?.length || 0} products`);
  for (const d of products.docs || []) {
      const p = d.data();
      if (p.stock > 0) {
         console.log(`Product: ${p.id} Name: ${p.name}`);
         console.log(` - stock numeric: ${p.stock}`);
         const typeStockData = typeof p.stockData;
         console.log(` - stockData type: ${typeStockData}`);
         const chunksQuery = admin.firestore().collection('product_stock_chunks').where('productId', '==', p.id);
         const chunksSnap = await chunksQuery.get();
         console.log(` - chunks length: ${chunksSnap.docs.length}`);
         let localFileExists = fs.existsSync('.data/product_stock_chunks.json');
         console.log(` - local check: ${localFileExists}`);
         let tableData = localFileExists ? JSON.parse(fs.readFileSync('.data/product_stock_chunks.json', 'utf8')) : [];
         console.log(` - local physical records matched: ${tableData.filter((x:any) => x.productId === p.id).length}`);
      }
  }
}
run().catch(console.error);
