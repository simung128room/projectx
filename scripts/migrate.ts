import { encrypt, decrypt } from "../src/services/encryption.service";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

async function run() {
  const purchasesSnap = await db.collection("purchases").get();
  let migratedCount = 0;
  let batch = db.batch();
  let ops = 0;
  for (const doc of purchasesSnap.docs) {
    const data = doc.data();
    if (data.secretData && data.secretData.startsWith("enc:")) {
      const decrypted = await decrypt(data.secretData);
      if (decrypted !== data.secretData) {
        const reEncrypted = await encrypt(decrypted);
        batch.update(doc.ref, { secretData: reEncrypted });
        migratedCount++;
        ops++;
        if(ops >= 500) {
            await batch.commit();
            batch = db.batch();
            ops = 0;
        }
      }
    }
  }
  if(ops > 0) {
      await batch.commit();
  }
  console.log("Migrated:", migratedCount);
}
run().catch(console.error);
