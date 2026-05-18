const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\('\/api\/buy'[\s\S]*?\n  \}\);\n/g;

const newCode = `app.post('/api/buy', mutationLimiter, requireAuth, async (req: any, res: any) => {
    const { productId, quantity } = req.body;
    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    const userId = req.user.uid;
    const lockKey = userId + '_' + productId;
    
    // Memory lock as an extra precaution before entering transaction
    while (purchaseLocks[lockKey]) { await purchaseLocks[lockKey]; }
    let releaseLock: () => void;
    purchaseLocks[lockKey] = new Promise(resolve => { releaseLock = resolve as any; });

    try {
      const userRef = admin.firestore().collection('users').doc(userId);
      const productRef = admin.firestore().collection('products').doc(productId);
      const purchasesRef = admin.firestore().collection('purchases').doc(); // Auto-gen transaction docref
      
      console.log('buy request for user', userId, 'product', productId, 'qty', quantity);

      const result = await admin.firestore().runTransaction(async (t) => {
        const userDoc = await t.get(userRef);
        const productDoc = await t.get(productRef);

        if (!userDoc.exists) { throw new Error('User not found'); }
        if (!productDoc.exists) { throw new Error('Product not found'); }

        const userData = userDoc.data() || {};
        const productData = productDoc.data() || {};

        const price = Number(productData.price) || 0;
        const totalCost = price * quantity;

        if ((Number(userData.balance) || 0) < totalCost) {
          throw new Error('ยอดเงินไม่เพียงพอ');
        }

        // Decompress stock array for safe extraction
        let existingStock = productData.stockData;
        if (existingStock) { existingStock = decompressStock(existingStock); }
        if (!Array.isArray(existingStock)) { existingStock = []; }

        const availableStock = existingStock.length;
        if (availableStock < quantity) { throw new Error('สินค้าในสต๊อกไม่เพียงพอ'); }

        // Claim items (FIFO)
        const currentStockData = [...existingStock];
        const claimedItems: string[] = [];
        for (let i = 0; i < quantity; i++) {
          claimedItems.push(currentStockData.shift() as string);
        }

        const newBalance = (Number(userData.balance) || 0) - totalCost;

        const newHistoryItem = {
          id: purchasesRef.id,
          userId: userId,
          username: userData.username || (req.user && req.user.email ? req.user.email.split('@')[0] : 'Unknown'),
          productId: productId,
          productName: \`\${productData.name || 'Unknown Product'} (x\${quantity})\`,
          price: totalCost,
          secretData: claimedItems.join('\\n'),
          date: new Date().toISOString(),
          billNumber: 'B-' + Math.floor(Math.random()*1000000).toString().padStart(6, '0'),
          is_special: false
        };

        const userUpdatePayload = JSON.parse(JSON.stringify({ balance: newBalance }));
        const productUpdatePayload = JSON.parse(JSON.stringify({ 
          ...productData,
          stock: currentStockData.length, 
          stockData: compressStock(currentStockData.filter(v => v !== undefined && v !== null)), 
          soldCount: (Number(productData.soldCount) || 0) + quantity 
        }));
        const historyPayload = JSON.parse(JSON.stringify(newHistoryItem));

        t.update(userRef, userUpdatePayload);
        t.update(productRef, productUpdatePayload);
        t.set(purchasesRef, historyPayload);

        return {
          purchase: newHistoryItem,
          updatedUser: { ...userData, balance: newBalance },
          updatedProduct: { id: productId, ...productData, stock: currentStockData.length, soldCount: (productData.soldCount || 0) + quantity },
        };
      });

      // Transaction succeeded
      invalidateCache('products');
      invalidateCache('purchases');
      invalidateStatsCache();

      res.json({
        success: true,
        purchase: result.purchase,
        updatedUser: result.updatedUser,
        updatedProduct: result.updatedProduct,
      });

    } catch (err: any) {
      console.error('------- BUY ERROR TRACE -------', err);
      const msg = err.message || '';
      if (msg === 'ยอดเงินไม่เพียงพอ' || msg === 'สินค้าในสต๊อกไม่เพียงพอ' || msg === 'User not found' || msg === 'Product not found') {
         res.status(400).json({ error: msg });
      } else {
         res.status(500).json({ error: String(err && err.message ? err.message : err) });
      }
    } finally {
      if (releaseLock) releaseLock();
      delete purchaseLocks[lockKey];
    }
  });
`;

const result = code.replace(regex, newCode);
if (result !== code) {
  fs.writeFileSync('server.ts', result);
  console.log('Successfully updated buy endpoint');
} else {
  console.log('Regex did not match');
}
