import { adminDb } from './src/lib/admindb.js';

async function run() {
  try {
    const db = adminDb.firestore();
    const data: any = {
      id: "abc-def-123",
      isPremium: false,
      premiumExpireDate: null,
      balance: 0,
      email: "test2@test.com",
      role: "Member"
    };

    // Pretend not admin
    delete data.balance;
    delete data.amount;
    delete data.role;
    delete data.isPremium;

    await db.collection('users').doc("abc-def-123").set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });

    console.log("Success");
  } catch(e) {
    console.error('Test error:', e);
  }
}
run();
