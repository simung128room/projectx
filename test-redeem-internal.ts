import { adminDb as admin } from './src/lib/admindb.js';

async function testRedeem() {
  const key = 'NON_EXISTENT_KEY';
  const uid = 'my-uid-1234';

  try {
    console.log("Checking license_keys...");
    const snapshot = await admin.firestore().collection('license_keys')
      .where('key', '==', key)
      .where('status', '==', 'active')
      .get();
      
    console.log(`license_keys length:`, snapshot.docs?.length);

    if (!snapshot.docs || snapshot.docs.length === 0) {
      console.log("Checking purchases...");
      const purchasesRef = admin.firestore().collection('purchases');
      const purchasesSnapshot = await purchasesRef.get();
      let foundDoc = null;
      let keyDocRef = null;
      
      console.log(`purchases length:`, purchasesSnapshot.docs?.length);
      
      for (const doc of purchasesSnapshot.docs) {
        const data = doc.data();
        if (data.secretData && data.secretData.includes(key) && !data.webClaimed) {
            foundDoc = { id: doc.id, ...data };
            keyDocRef = purchasesRef.doc(doc.id);
            break;
        }
      }

      if (!foundDoc) {
          console.log("Key not found -> 400 error");
          return;
      }
      console.log("Found in purchases:", foundDoc);
    } else {
      console.log("Found in license_keys:", snapshot.docs[0].data());
    }
  } catch (e: any) {
    console.error("Test redeem error:", e.message);
  }
}

testRedeem();
