import { adminDb as admin } from './src/lib/admindb.js';

async function testUpdate() {
  try {
    const keyDocRef = admin.firestore().collection('license_keys').doc('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    console.log("Updating license_key status...");
    await keyDocRef.update({ status: 'used' });
    console.log("Success update license_keys");
  } catch (e: any) {
    console.error("license_keys update error:", e.message);
  }

  try {
    const pDocRef = admin.firestore().collection('purchases').doc('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
    console.log("Updating purchases webClaimed...");
    await pDocRef.update({ productName: 'TestProduct', webClaimed: true });
    console.log("Success update purchases");
  } catch (e: any) {
    console.error("purchases update error:", e.message);
  }

  try {
    console.log("Adding to used_keys_history...");
    await admin.firestore().collection('used_keys_history').add({
        key: 'TEST',
        ip: '127.0.0.1',
        details: 'Redeemed rank undefined',
        used_at: new Date().toISOString()
    });
    console.log("Success update used_keys");
  } catch (err: any) {
    console.error("used_keys add error:", err.message);
  }

  try {
    console.log("Merging into users...");
    await admin.firestore().collection('users').doc('dummy-uid').set({
        isPremium: true,
        rank: 'VIP',
        premiumExpireDate: new Date().toISOString()
    }, { merge: true });
    console.log("Success update users");
  } catch (err: any) {
    console.error("users merge error:", err.message);
  }
}

testUpdate();
