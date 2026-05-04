import admin from 'firebase-admin';

admin.initializeApp({
  projectId: "apex-gen"
});

async function test() {
  try {
    const snap = await admin.firestore().collection('products').get();
    console.log("SUCCESS:", snap.size);
  } catch(err) {
    console.error("ADMIN DB ERROR:", err);
  }
}

test();
