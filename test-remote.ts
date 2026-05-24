import { adminDb as admin } from './src/lib/admindb.js';

async function testFetch() {
  const r = await fetch('https://ais-dev-yqcwrqpfmcv3f3k4u45xxa-109803326919.asia-east1.run.app/api/products');
  const d = await r.json();
  const products = (d.products || d).filter((p:any) => p.stock > 0);
  for (const p of products) {
    console.log(`${p.id}: ${p.name} -> stock: ${p.stock}`);
    
    // Now call the admin api to get the product doc natively
    const r2 = await fetch(`https://ais-dev-yqcwrqpfmcv3f3k4u45xxa-109803326919.asia-east1.run.app/api/products/${p.id}`);
    const d2 = await r2.json();
    console.log(`  stockData provided in API? ${d2.stockData ? 'yes' : 'no'}`);
    if (d2.stockData) {
       console.log(`  stockData type: ${typeof d2.stockData}, isArray? ${Array.isArray(d2.stockData)}, length: ${d2.stockData.length}`);
    }
  }
}
testFetch();
