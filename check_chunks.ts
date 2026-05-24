import { adminDb as admin } from './src/lib/admindb.js';
import zlib from 'zlib';
import { promisify } from 'util';
const gunzipAsync = promisify(zlib.gunzip);

async function run() {
  const products = await admin.firestore().collection('products').get();
  for (const p of products.docs) {
    const data = p.data();
    if (data.stock > 0) {
      console.log(`Product: ${p.id} ${data.name} Stock: ${data.stock}`);
      const chunks = await admin.firestore().collection('product_stock_chunks').where('productId', '==', p.id).get();
      console.log(`  Chunks: ${chunks.docs.length}`);
      
      let total_chunk_items = 0;
      for (const c of chunks.docs) {
         let items = c.data().items;
         console.log(`  Chunk ID: ${c.id}, items_type: ${typeof items}, isArray: ${Array.isArray(items)}`);
         
         if (items && items.__compressed) {
            console.log(`    Chunk is compressed`);
            const buf = await gunzipAsync(Buffer.from(items.__compressed, 'base64'));
            const dec = JSON.parse(buf.toString('utf-8'));
            console.log(`    Chunk decompressed length: ${dec.length}`);
            total_chunk_items += dec.length;
         } else if (Array.isArray(items)) {
            total_chunk_items += items.length;
         } else if (typeof items === 'string') {
             try {
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) total_chunk_items += parsed.length;
                console.log(`    Chunk string parsed length: ${parsed.length}`);
             } catch(e) { console.log(`    Chunk parsing failed`); }
         } else if (items && typeof items === 'object' && items.length !== undefined) {
             console.log(`    Chunk is object with length, length: ${items.length}`);
             total_chunk_items += items.length;
         } else if (items && typeof items === 'object' && !Array.isArray(items)) {
             // Maybe it's a supabase jsonb object ?
             console.log(`    Chunk is object jsonb:`, Object.keys(items));
             // Supabase sometimes returns array as object { "0": "a", "1": "b" }
             if (items["0"]) {
                const len = Object.keys(items).length;
                console.log(`    Chunk object looks like array, length: ${len}`);
                total_chunk_items += len;
             }
         }
      }
      
      let main_stock = data.stockData;
      let total_main_stock = 0;
      if (Array.isArray(main_stock)) {
          total_main_stock = main_stock.length;
      } else if (main_stock && main_stock.__compressed) {
          console.log(`  Main stock is compressed`);
            const buf = await gunzipAsync(Buffer.from(main_stock.__compressed, 'base64'));
            const dec = JSON.parse(buf.toString('utf-8'));
            total_main_stock = dec.length;
            console.log(`  Main decompressed length: ${dec.length}`);
      } else if (main_stock && typeof main_stock === 'object' && !Array.isArray(main_stock)) {
           // Supabase sometimes returns array as object { "0": "a", "1": "b" }
           if (main_stock["0"]) {
              const len = Object.keys(main_stock).length;
              console.log(`  Main object looks like array, length: ${len}`);
              total_main_stock = len;
           } else if (main_stock[0] && typeof main_stock[0] === 'object' && main_stock[0].__compressed) {
              // wait, array of objects? let's see.
              console.log(`  Main stock is array-like object with compressed value`);
              const buf = await gunzipAsync(Buffer.from(main_stock[0].__compressed, 'base64'));
              const dec = JSON.parse(buf.toString('utf-8'));
              total_main_stock = dec.length;
              console.log(`  Main decompressed nested length: ${dec.length}`);
           }
      }
      
      console.log(`  Total items found: Main(${total_main_stock}) + Chunks(${total_chunk_items}) = ${total_main_stock + total_chunk_items}`);
    }
  }
}
run();
