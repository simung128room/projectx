import { adminDb as admin } from './src/lib/admindb.js';

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
            items = []; // Just for console checking
         }
         if (Array.isArray(items)) {
            total_chunk_items += items.length;
         } else if (typeof items === 'string') {
             try {
                const parsed = JSON.parse(items);
                if (Array.isArray(parsed)) total_chunk_items += parsed.length;
                console.log(`    Chunk string parsed length: ${parsed.length}`);
             } catch(e) { console.log(`    Chunk parsing failed`); }
         } else if (typeof items === 'object') {
             // Maybe it's compressed
             console.log(`    Chunk is object:`, Object.keys(items));
             if (items.__compressed) {
                 import('zlib').then(zlib => {
                    import('util').then(util => {
                        util.promisify(zlib.gunzip)(Buffer.from(items.__compressed, 'base64')).then(buf => {
                            const dec = JSON.parse(buf.toString('utf-8'));
                            console.log(`    Chunk decompressed length: ${dec.length}`);
                        });
                    });
                 });
             } else if (items.length !== undefined) {
                 total_chunk_items += items.length;
             }
         }
      }
      let main_stock = data.stockData;
      let total_main_stock = 0;
      if (Array.isArray(main_stock)) total_main_stock = main_stock.length;
      else if (typeof main_stock === 'object' && main_stock && main_stock.__compressed) {
          console.log(`  Main stock is compressed`);
            import('zlib').then(zlib => {
                import('util').then(util => {
                    util.promisify(zlib.gunzip)(Buffer.from(main_stock.__compressed, 'base64')).then(buf => {
                        const dec = JSON.parse(buf.toString('utf-8'));
                        console.log(`  Main decompressed length: ${dec.length}`);
                    }).catch(console.error);
                });
            });
      }
      console.log(`  Main StockItems Array Length: ${total_main_stock}`);
    }
  }
}
run();
