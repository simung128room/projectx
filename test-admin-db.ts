import admin from 'firebase-admin';
admin.initializeApp({ projectId: "apex-gen" });
const db = admin.firestore();
async function test() {
  try {
    const snap = await db.collection("license_keys").limit(1).get();
    console.log("Success! Docs:", snap.size);
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}
test();
