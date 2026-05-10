import { adminDb as admin } from './src/lib/admindb.js';

async function run() {
  try {
    const snapshot = await admin.firestore().collection('categories').get();
    console.log("Categories:", snapshot.docs.map(doc => doc.data()));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}
run();
