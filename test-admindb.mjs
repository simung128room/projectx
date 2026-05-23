async function check() {
  const { adminDb } = await import('./dist/server.cjs');
  try {
     console.log('Inserting...');
     await adminDb.firestore().collection('product_stock_chunks').add({ productId: '123', items: '["test"]' });
     console.log('Fetching...');
     const res = await adminDb.firestore().collection('product_stock_chunks').where('productId', '==', '123').get();
     console.log('Result:', res.docs.length);
  } catch (e) {
     console.error('Error:', e.message);
  }
}
check();
