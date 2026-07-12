import { config } from "dotenv";
config();
import { encrypt, decrypt } from "../src/services/encryption.service.js";
import { adminDb } from "../src/lib/admindb.js";

const db = adminDb.firestore();

async function run() {
  const purchasesSnap = await db.collection("purchases").get();
  let migratedCount = 0;
  for (const doc of purchasesSnap.docs) {
    const data = doc.data();
    if (data.secretData && data.secretData.startsWith("enc:")) {
      const decrypted = await decrypt(data.secretData);
      if (decrypted !== data.secretData) {
        const reEncrypted = await encrypt(decrypted);
        await doc.ref.update({ secretData: reEncrypted });
        migratedCount++;
      }
    }
  }
  console.log("Migrated:", migratedCount);
}
run().catch(console.error);
