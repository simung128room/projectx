import { adminDb } from './src/lib/admindb.js';

async function test() {
  try {
    const doc = await adminDb.firestore().collection('admins').doc('test-id').get();
    console.log("Admin exists:", doc.exists);
  } catch (e) {
    console.error(e);
  }
}
test();
