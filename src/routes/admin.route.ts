import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { adminDb as admin, supabaseAdmin } from "../lib/admindb.js";
import { encrypt, decrypt } from "../services/encryption.service.js";

// Zod schema for updating user details in admin panel
const adminUserUpdateSchema = z.object({
  balance: z.number().nonnegative("ยอดเงินต้องไม่ติดลบ").optional(),
  status: z.string().optional(),
  rank: z.string().optional(),
  role: z.string().optional(),
  displayName: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
}).partial();

interface AdminRouterDeps {
  requireAdmin: any;
  writeAuditLog: any;
  sendAlert?: any;
  invalidateUserTokenCache: (uid: string) => void;
  invalidateCache: (key: string) => void;
  invalidateStatsCache: () => void;
  getCommunityData: () => any;
  saveCommunity: () => any;
}

export function createAdminRouter({
  requireAdmin,
  writeAuditLog,
  sendAlert,
  invalidateUserTokenCache,
  invalidateCache,
  invalidateStatsCache,
  getCommunityData,
  saveCommunity,
}: AdminRouterDeps) {
  const router = Router();

  // GET /api/admin/users (user list + search)
  router.get("/admin/users", requireAdmin, async (req: any, res: any) => {
    try {
      const search = (req.query.search || req.query.q || "").toString().toLowerCase().trim();
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(500, parseInt(req.query.limit) || 200);
      const offset = (page - 1) * limit;

      const db = admin.firestore();
      
      let users = [];
      if (!search) {
        const snapshot = await db.collection("users").limit(limit).offset(offset).get();
        users = snapshot.docs.map((doc: any) => ({
          id: doc.id,
          uid: doc.id,
          ...doc.data(),
        }));
      } else {
        // Mitigation: Do multiple queries with prefix match and merge, limiting results
        // to prevent loading all users into memory
        const endSearch = search + "\uf8ff";
        
        // Exact match by ID first
        const idDoc = await db.collection("users").doc(search).get();
        const idUser = idDoc.exists ? [{ id: idDoc.id, uid: idDoc.id, ...idDoc.data() }] : [];

        // Prefix match by username
        const usernameSnap = await db.collection("users")
          .where("username", ">=", search)
          .where("username", "<=", endSearch)
          .limit(limit)
          .get();
        
        // Prefix match by email
        const emailSnap = await db.collection("users")
          .where("email", ">=", search)
          .where("email", "<=", endSearch)
          .limit(limit)
          .get();
          
        const resultsMap = new Map();
        
        if (idUser.length) resultsMap.set(idUser[0].id, idUser[0]);
        
        usernameSnap.docs.forEach((doc: any) => {
          resultsMap.set(doc.id, { id: doc.id, uid: doc.id, ...doc.data() });
        });
        
        emailSnap.docs.forEach((doc: any) => {
          resultsMap.set(doc.id, { id: doc.id, uid: doc.id, ...doc.data() });
        });

        users = Array.from(resultsMap.values());
      }

      users = users.slice(offset, offset + limit);

      res.json(users);
    } catch (err: any) {
      console.error("Admin: Error fetching users:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });



  // PUT /api/admin/users/:uid (ban/unban, role/rank change, balance change)
  router.put("/admin/users/:uid", requireAdmin, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      const parsed = adminUserUpdateSchema.parse(req.body);

      const db = admin.firestore();
      const docRef = db.collection("users").doc(uid);
      const snapshot = await docRef.get();
      if (!snapshot.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const prevData = snapshot.data() || {};
      const dataToUpdate = { ...parsed, updatedAt: new Date().toISOString() };

      // Handle custom rank changes if specified via community userRanks
      if (parsed.role || parsed.rank) {
        const updateRank = parsed.role || parsed.rank;
        const communityData = getCommunityData();
        if (!communityData.userRanks) {
          communityData.userRanks = {};
        }
        communityData.userRanks[uid] = updateRank;
        await saveCommunity().catch((err: any) => console.error("Save community rank error:", err));
      }

      await docRef.update(dataToUpdate);

      // Log action
      await writeAuditLog(
        "ADMIN_USER_PUT_UPDATE",
        req.user?.uid || "admin",
        uid,
        req,
        { previousFields: prevData, updatedFields: parsed }
      ).catch(() => {});

      invalidateUserTokenCache(uid);
      invalidateCache("users");
      invalidateStatsCache();

      res.json({ success: true });
    } catch (err: any) {
      console.error("Admin: Error updating user profile:", err);
      res.status(400).json({ error: err.message || String(err) });
    }
  });

  // DELETE /api/admin/users/:uid (Delete user completely)
  router.delete("/admin/users/:uid", requireAdmin, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      
      // Delete from Firestore
      await admin.firestore().collection("users").doc(uid).delete();
      
      // Attempt delete from Supabase Auth
      await supabaseAdmin.auth.admin.deleteUser(uid).catch((e: any) => {
        console.error("Supabase user deletion failed, continuing...", e.message || e);
      });

      // Audit Log
      await writeAuditLog(
        "ADMIN_USER_DELETE",
        req.user?.uid || "admin",
        uid,
        req,
        { uid }
      ).catch(() => {});

      invalidateUserTokenCache(uid);
      invalidateCache("users");
      invalidateStatsCache();

      res.json({ success: true });
    } catch (err: any) {
      console.error("Admin: Error deleting user:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // GET /api/admin/audit-logs (Get sys_audit_logs)
  router.get("/admin/audit-logs", requireAdmin, async (req: any, res: any) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(500, parseInt(req.query.limit) || 100);
      const offset = (page - 1) * limit;

      const db = admin.firestore();
      const snapshot = await db
        .collection("sys_audit_logs")
        .orderBy("timestamp", "desc")
        .limit(limit)
        .offset(offset)
        .get();

      const logs = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json(logs);
    } catch (err: any) {
      console.error("Admin: Error getting audit logs:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // POST /api/admin/migrate-encryption (SEC-007)
  router.post("/admin/migrate-encryption", requireAdmin, async (req: any, res: any) => {
    try {
      const db = admin.firestore();
      const purchasesSnap = await db.collection("purchases").get();
      let migratedCount = 0;
      const promises = [];

      for (const doc of purchasesSnap.docs) {
        const data = doc.data();
        if (data.secretData && (data.secretData.startsWith("enc:") || data.secretData.startsWith("enc2:"))) {
          const decrypted = await decrypt(data.secretData);
          if (decrypted !== data.secretData) {
            const reEncrypted = await encrypt(decrypted);
            promises.push(doc.ref.update({ secretData: reEncrypted }));
            migratedCount++;
          }
        }
      }
      
      // Process in batches of 50 to avoid connection overload
      for (let i = 0; i < promises.length; i += 50) {
        await Promise.all(promises.slice(i, i + 50));
      }

      await writeAuditLog(
        "ENCRYPTION_MIGRATION",
        req.user?.uid || "admin",
        "system",
        req,
        { migratedCount }
      ).catch(() => {});

      res.json({ success: true, migratedCount });
    } catch (err: any) {
      console.error("Migration error:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // GET /api/admin/api-keys (key management list keys)
  router.get("/admin/api-keys", requireAdmin, async (req: any, res: any) => {
    try {
      const snapshot = await admin
        .firestore()
        .collection("api_keys")
        .limit(500)
        .get();
      const keys = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      keys.sort(
        (a: any, b: any) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime(),
      );
      res.json(keys);
    } catch (err: any) {
      console.error("API Keys fetch error:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // POST /api/admin/api-keys (create key)
  router.post("/admin/api-keys", requireAdmin, async (req: any, res: any) => {
    try {
      const { name, is_lifetime, expire_days } = req.body;
      const keyString = "apx_" + crypto.randomBytes(16).toString("hex");
      const now = new Date();
      let expires_at = null;
      if (!is_lifetime && expire_days) {
        now.setDate(now.getDate() + parseInt(expire_days));
        expires_at = now.toISOString();
      }
      const newKey = {
        key: keyString,
        name: name || "Unnamed Key",
        status: "active",
        created_at: new Date().toISOString(),
        expires_at,
        last_used: null,
      };
      await admin.firestore().collection("api_keys").doc(keyString).set(newKey);
      
      await writeAuditLog(
        "API_KEY_CREATE",
        req.user?.uid || "admin",
        keyString,
        req,
        { name, is_lifetime, expire_days }
      ).catch(() => {});

      res.json(newKey);
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // DELETE /api/admin/api-keys/:key (revoke key)
  router.delete("/admin/api-keys/:key", requireAdmin, async (req: any, res: any) => {
    try {
      const { key } = req.params;
      await admin.firestore().collection("api_keys").doc(key).delete();
      
      await writeAuditLog(
        "API_KEY_REVOKE",
        req.user?.uid || "admin",
        key,
        req,
        { key }
      ).catch(() => {});

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // PATCH /api/admin/api-keys/:key (update status)
  router.patch("/admin/api-keys/:key", requireAdmin, async (req: any, res: any) => {
    try {
      const { key } = req.params;
      const { status } = req.body;
      
      const keyRef = admin.firestore().collection("api_keys").doc(key);
      const keyDoc = await keyRef.get();
      if (!keyDoc.exists) {
        return res.status(404).json({ error: "Key not found" });
      }
      
      await keyRef.update({ status, updated_at: new Date() });
      
      await writeAuditLog(
        "API_KEY_STATUS",
        req.user?.uid || "admin",
        key,
        req,
        { status }
      ).catch(() => {});

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  return router;
}
