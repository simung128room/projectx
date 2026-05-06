import { adminDb } from './src/lib/admindb.js';

async function test() {
  try {
    const res = await adminDb.auth().verifyIdToken("invalid_token");
    console.log(res);
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
test();
