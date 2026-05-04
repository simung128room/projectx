const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const replacement = `let cachedStats: any = null;
  let lastStatsFetch = 0;

  app.get('/api/stats', async (req, res) => {
    try {
      const now = Date.now();
      if (cachedStats && now - lastStatsFetch < 600000) {
        return res.json(cachedStats);
      }

      const adminDb = admin.firestore();
      
      let totalStock = 0;
      try {
        const productsSnap = await adminDb.collection('products').get();
        productsSnap.forEach(doc => {
          const data = doc.data();
          if (data.stock > 0 && data.stock < 999999) totalStock += data.stock;
        });
      } catch (e) {
      }

      let totalSales = 0;
      let totalPurchaseOrders = 0;
      try {
        const purchasesSnap = await adminDb.collection('purchases').get();
        purchasesSnap.forEach(doc => {
          totalSales += (doc.data().price || 0);
          totalPurchaseOrders++;
        });
      } catch(e) {
      }

      let totalTopupsAmount = 0;
      try {
        const topupsSnap = await adminDb.collection('topups').get();
        topupsSnap.forEach(doc => {
          totalTopupsAmount += (doc.data().amount || 0);
        });
      } catch(e) {
      }

      let totalUsersCount = 0;
      try {
        const usersSnap = await adminDb.collection('users').get();
        totalUsersCount = usersSnap.size;
      } catch(e) {
      }

      cachedStats = {
        users: totalUsersCount + (siteSettings.stats_users_offset || 0),
        sales: totalSales + (siteSettings.stats_sales_offset || 0),
        stock: totalStock,
        totalOrders: totalPurchaseOrders,
        totalTopupsAmount
      };
      
      if (totalUsersCount > 0 || totalPurchaseOrders > 0 || totalStock > 0 || totalTopupsAmount > 0) {
         lastStatsFetch = now;
      }
      
      res.json(cachedStats);
    } catch (err: any) {
      console.error('STATS ERROR:', err);
      // Fallback
      res.json(cachedStats || {
        users: siteSettings.stats_users_offset || 0,
        sales: siteSettings.stats_sales_offset || 0,
        stock: 0,
        totalOrders: 0,
        totalTopupsAmount: 0
      });
    }
  });`;

const startIdx = code.indexOf(`app.get('/api/stats', async (req, res) => {`);
const endIdx = code.indexOf(`  // --- Purchases Endpoints ---`);

code = code.substring(0, startIdx) + replacement + "\n\n" + code.substring(endIdx);
fs.writeFileSync('server.ts', code);
