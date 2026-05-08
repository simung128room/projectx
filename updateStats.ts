import dotenv from 'dotenv';
dotenv.config();
import { adminDb as admin } from './src/lib/admindb.js';

async function update() {
  const docNameDev = 'site_dev';
  const docNameProd = 'site';

  const u = { stats_users_offset: 892, stats_sales_offset: 4432 };
  try {
    await admin.firestore().collection('settings').doc(docNameDev).set(u, { merge: true });
    await admin.firestore().collection('settings').doc(docNameProd).set(u, { merge: true });
    console.log("Updated!");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
update();
