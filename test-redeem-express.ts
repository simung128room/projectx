import express from 'express';
import { adminDb as admin } from './src/lib/admindb.js';

const app = express();
app.use(express.json());

const redeemLocks: Record<string, Promise<any>> = {};

app.post('/api/redeem', async (req: any, res: any) => {
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: 'Key is required' });

    // Acquire lock for this key
    while (redeemLocks[key]) {
      await redeemLocks[key];
    }
    
    let releaseLock: () => void;
    redeemLocks[key] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const uid = 'test-uid';
      let keyData: any = null;
      let keyDocRef: any = null;
      let isProductKey = false;

      const snapshot = await admin.firestore().collection('license_keys').where('key', '==', key).where('status', '==', 'active').get();
      if (!snapshot.docs || snapshot.docs.length === 0) {
        
        const purchasesRef = admin.firestore().collection('purchases');
        const purchasesSnapshot = await purchasesRef.get();
        let foundDoc = null;
        for (const doc of purchasesSnapshot.docs) {
          const data = doc.data();
          if (data.secretData && data.secretData.includes(key) && !data.webClaimed) {
             foundDoc = { id: doc.id, ...data };
             keyDocRef = purchasesRef.doc(doc.id);
             break;
          }
        }

        if (!foundDoc) {
           return res.status(400).json({ error: 'ไม่พบคีย์ในระบบ หรือคีย์นี้ถูกใช้งานไปแล้ว' });
        }

        isProductKey = true;
        keyData = foundDoc;

      } else {
        keyData = snapshot.docs[0].data();
        keyDocRef = admin.firestore().collection('license_keys').doc(snapshot.docs[0].id);
      }
      
      let rankToGive = 'premium';
      let expireDate = new Date();

      if (isProductKey) {
        await keyDocRef.update({ webClaimed: true });
        rankToGive = keyData.productName?.replace(/ \(.+\)/g, '') || 'VIP';
        await admin.firestore().collection('used_keys').add({
          key: key,
          ip: req.ip || 'Unknown',
          details: `Redeemed product rank ${rankToGive}`,
          used_at: new Date().toISOString()
        });
        expireDate.setDate(expireDate.getDate() + 9999);

      } else {
        await keyDocRef.update({ status: 'used' });
        await admin.firestore().collection('used_keys').add({
          key: key,
          ip: req.ip || 'Unknown',
          details: `Redeemed rank ${keyData.type}`,
          used_at: new Date().toISOString()
        });
        
        let days = 1;
        if (keyData.type === 'Week') days = 7;
        if (keyData.type === 'Month') days = 30;
        if (keyData.type === '3Month') days = 90;
        if (keyData.type === 'Year') days = 365;
        if (keyData.type === 'Lifetime') days = 9999;
        expireDate.setDate(expireDate.getDate() + days);
      }

      await admin.firestore().collection('users').doc(uid).set({
        isPremium: true,
        rank: rankToGive,
        premiumExpireDate: expireDate.toISOString()
      }, { merge: true });
      
      res.json({ success: true, rank: rankToGive, type: isProductKey ? 'Product Rank' : keyData.type });
    } catch (e: any) {
      console.error("EXPECTED ERROR 500 TRACE:", e.stack);
      res.status(500).json({ error: e.message });
    } finally {
      releaseLock!();
      delete redeemLocks[key];
    }
  });

app.listen(3015, () => console.log('Listening on 3015'));
