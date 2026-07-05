import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import axios from "axios";
import CircuitBreaker from "opossum";
import zlib from "node:zlib";
import { promisify } from "node:util";
import { adminDb as admin } from "../lib/admindb.js";
import { encrypt, decrypt } from "../services/encryption.service.js";

import { compressStock, decompressStock } from "../lib/stockUtils.js";

// -------------------------------------------------------------
// HELPER FOR FIND PURCHASE BY WEB CLAIM KEY
// -------------------------------------------------------------
async function findPurchaseByWebClaimKey(key: string) {
  const cleanKey = key.trim();
  if (!cleanKey) return null;
  try {
    const db = admin.firestore();
    const hash = crypto.createHash("sha256").update(cleanKey).digest("hex");
    const querySnapshot = await db
      .collection("purchases")
      .where("licenseKeyHashes", "array-contains", hash)
      .get();
    if (!querySnapshot.empty) {
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.webClaimed) continue;
        let secret = data.secretData || "";
        if (secret.startsWith("enc:") || secret.startsWith("enc2:")) {
          secret = await decrypt(secret);
        }
        return { id: doc.id, ...data, secretData: secret };
      }
    }
  } catch (err: any) {
    console.error("Error finding purchase by claim key (Web):", err);
  }
  return null;
}

// -------------------------------------------------------------
// LOCAL MUTEX LOCK SYSTEM
// -------------------------------------------------------------
const productLocks = new Set();
async function acquireMutex(key: any, timeoutMs = 15e3) {
  const start = Date.now();
  while (productLocks.has(key)) {
    if (Date.now() - start > timeoutMs) {
      return false;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  productLocks.add(key);
  return true;
}

function releaseMutex(key: any) {
  productLocks.delete(key);
}

// -------------------------------------------------------------
// REDIS LOCK SYSTEM
// -------------------------------------------------------------
async function acquireRedisLock(redis: any, lockKey: string, ttlMs = 15e3) {
  if (!redis || redis.status !== "ready") return true;
  try {
    const result = await redis.set(lockKey, "locked", "PX", ttlMs, "NX");
    return result === "OK";
  } catch (err: any) {
    return true;
  }
}

async function releaseRedisLock(redis: any, lockKey: string) {
  if (!redis) return;
  try {
    await redis.del(lockKey);
  } catch (err) {
    console.warn("Failed to release redis lock", err);
  }
}

export interface PaymentsRouterOptions {
  requireAuth: any;
  requireAdmin: any;
  mutationLimiter: any;
  topupLimiter: any;
  getSiteSettings: () => any;
  getRedis: () => any;
  getTwApi: () => any;
  writeAuditLog: (action: string, actor: string, target: string, req: any, extraContext?: any) => Promise<void> | void;
  sendAlert: (title: string, body: string, color: number, reqId: string) => void;
  invalidateCache: (collectionName: string) => void;
  invalidateStatsCache: () => void;
  getCommunityData: () => any;
  saveCommunity: () => Promise<void> | void;
}

export function createPaymentsRouter({
  requireAuth,
  requireAdmin,
  mutationLimiter,
  topupLimiter,
  getSiteSettings,
  getRedis,
  getTwApi,
  writeAuditLog,
  sendAlert,
  invalidateCache,
  invalidateStatsCache,
  getCommunityData,
  saveCommunity,
}: PaymentsRouterOptions) {
  const router = Router();

  // 1. POST /api/buy (atomic purchase & stock deduction)
  router.post("/buy", mutationLimiter, requireAuth, async (req: any, res: any) => {
    const buySchema = z.object({
      productId: z.string().min(1, "Product ID is missing"),
      quantity: z.preprocess(
        (val) => parseInt((val || 0).toString(), 10),
        z.number().int().min(1, "ชื่อสินค้า หรือ จำนวนไม่ถูกต้อง").max(1000, "ซื้อได้สูงสุด 1,000 ชิ้น/ครั้ง")
      ),
    });

    const parseResult = buySchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: parseResult.error.issues[0].message || "ชื่อสินค้า หรือ จำนวนไม่ถูกต้อง",
      });
    }
    const { productId, quantity } = parseResult.data;

    const userId = req.user.uid;
    const lockKey = `lock:product:${productId}`;
    const localAcquired = await acquireMutex(lockKey, 15e3);
    if (!localAcquired) {
      return res.status(429).json({
        error: "ระบบไม่ว่าง กรุณาดำเนินการใหม่อีกครั้งในภายหลัง (Mutex lock timeout)",
      });
    }

    const redis = getRedis();
    const redisAcquired = await acquireRedisLock(redis, lockKey, 15e3);
    if (!redisAcquired) {
      releaseMutex(lockKey);
      return res.status(429).json({
        error: "ระบบอยู่ระหว่างประมวลผลการสั่งซื้อ กรุณารอสักครู่ (Redis lock occupied)",
      });
    }

    try {
      const userRef = admin.firestore().collection("users").doc(userId);
      const productRef = admin.firestore().collection("products").doc(productId);
      const purchasesRef = admin.firestore().collection("purchases").doc();

      console.log(
        "buy request for user",
        userId,
        "product",
        productId,
        "qty",
        quantity
      );

      const idempotencyKey = req.headers["idempotency-key"];
      if (idempotencyKey) {
        if (
          typeof idempotencyKey !== "string" ||
          !/^[a-zA-Z0-9_-]{1,128}$/.test(idempotencyKey)
        ) {
          return res.status(400).json({
            error: "รูปแบบ Idempotency Key ไม่ถูกต้อง",
          });
        }
        try {
          const exactDoc = await admin
            .firestore()
            .collection("idempotency_keys")
            .doc(idempotencyKey)
            .get();

          if (!exactDoc.exists) {
            if (Math.random() < 0.01) {
              const oldKeysSnap = await admin
                .firestore()
                .collection("idempotency_keys")
                .where(
                  "timestamp",
                  "<",
                  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
                )
                .limit(100)
                .get();

              await Promise.all(
                oldKeysSnap.docs.map((doc: any) =>
                  admin
                    .firestore()
                    .collection("idempotency_keys")
                    .doc(doc.id)
                    .delete()
                )
              );
            }

            const recentIdempSnap = await admin
              .firestore()
              .collection("idempotency_keys")
              .where("userId", "==", userId)
              .get();

            if (recentIdempSnap.docs.length >= 10) {
              const docs = recentIdempSnap.docs.map((d: any) => ({
                id: d.id,
                ...d.data(),
              }));
              docs.sort(
                (a: any, b: any) =>
                  new Date(a.timestamp || 0).getTime() -
                  new Date(b.timestamp || 0).getTime()
              );
              const toDelete = docs.slice(0, docs.length - 8);
              await Promise.all(
                toDelete.map((doc: any) =>
                  admin
                    .firestore()
                    .collection("idempotency_keys")
                    .doc(doc.id)
                    .delete()
                )
              );
            }
          }
        } catch (err: any) {
          console.error("[Idempotency] Error handling limit:", err);
        }
      }

      const result: any = await admin.firestore().runTransaction(async (t: any) => {
        let idempRef;
        let idempPromise = Promise.resolve<any>(null);
        if (idempotencyKey) {
          idempRef = admin
            .firestore()
            .collection("idempotency_keys")
            .doc(idempotencyKey);
          idempPromise = t.get(idempRef);
        }

        const [idempDoc, userDoc, productDoc] = await Promise.all([
          idempPromise,
          t.get(userRef),
          t.get(productRef),
        ]);

        if (idempotencyKey && idempDoc && idempDoc.exists) {
          return {
            isCachedIdempotency: true,
            payload: idempDoc.data()?.response,
          };
        }

        if (!userDoc.exists) {
          return { isError: true, message: "User not found" };
        }
        if (!productDoc.exists) {
          return { isError: true, message: "Product not found" };
        }

        const userData = userDoc.data() || {};
        const productData = productDoc.data() || {};
        const price = Number(productData.price) || 0;
        const totalCost = price * quantity;

        if ((Number(userData.balance) || 0) < totalCost) {
          return {
            isError: true,
            message: "ยอดเงินไม่เพียงพอ",
          };
        }

        if (
          !productData.isPreOrder &&
          quantity > (Number(productData.stock) || 0)
        ) {
          return {
            isError: true,
            message: "สินค้าในสต๊อกไม่เพียงพอ",
          };
        }

        let claimedItems: any[] = [];
        let chunkDocsToUpdate: any[] = [];
        let chunkDocsToDelete: any[] = [];
        let remainingBuffer: any[] = [];

        if (productData.isPreOrder) {
          claimedItems = [];
        } else {
          let existingStock = productData.stockData;
          if (existingStock) {
            existingStock = await decompressStock(existingStock);
          }
          if (!Array.isArray(existingStock)) {
            existingStock = [];
          }
          if (existingStock.length > 0) {
            const needed = quantity;
            const taken = existingStock.splice(0, needed);
            claimedItems.push(...taken);
          }

          if (claimedItems.length < quantity) {
            const chunksQuery = admin
              .firestore()
              .collection("product_stock_chunks")
              .where("productId", "==", productId);
            const chunksSnap = await t.get(chunksQuery);

            for (const chunkDoc of chunksSnap.docs) {
              if (claimedItems.length >= quantity) break;
              let chunkItems = chunkDoc.data().items;
              if (chunkItems) {
                chunkItems = await decompressStock(chunkItems);
              }
              if (!Array.isArray(chunkItems)) chunkItems = [];

              if (chunkItems.length > 0) {
                const needed = quantity - claimedItems.length;
                const taken = chunkItems.splice(0, needed);
                claimedItems.push(...taken);

                if (chunkItems.length > 0) {
                  chunkDocsToUpdate.push({
                    ref: chunkDoc.ref,
                    remainingItems: chunkItems,
                  });
                } else {
                  chunkDocsToDelete.push(chunkDoc.ref);
                }
              } else {
                chunkDocsToDelete.push(chunkDoc.ref);
              }
            }
          }

          if (claimedItems.length < quantity) {
            const actualRealStock = existingStock.length + claimedItems.length;
            t.update(productRef, { stock: actualRealStock });
            return {
              isError: true,
              message: "สินค้าในสต๊อกไม่เพียงพอ",
            };
          }
          remainingBuffer = existingStock;
        }

        const newBalance = (Number(userData.balance) || 0) - totalCost;
        const newHistoryItem: any = {
          id: purchasesRef.id,
          userId,
          username:
            userData.username ||
            (req.user && req.user.email
              ? req.user.email.split("@")[0]
              : "Unknown"),
          productId,
          productName: req.body.preOrderOption
            ? `${productData.name || "Unknown Product"} [${req.body.preOrderOption}] (x${quantity})`
            : `${productData.name || "Unknown Product"} (x${quantity})`,
          product_name: productData.name || "Unknown Product",
          quantity,
          price: totalCost,
          secretData: productData.isPreOrder
            ? "ระบบอยู่ระหว่างกำลังจัดหาไอดีให้ท่าน..."
            : claimedItems.join("\n"),
          date: new Date().toISOString(),
          billNumber:
            "B-" +
            Date.now().toString(36).toUpperCase() +
            crypto.randomBytes(4).toString("hex").toUpperCase(),
          is_special: false,
        };

        if (productData.isPreOrder) {
          newHistoryItem.isPreOrder = true;
          newHistoryItem.preOrderOption = req.body.preOrderOption || "";
          newHistoryItem.preOrderStatus = "pending";
        }

        const userUpdatePayload = JSON.parse(
          JSON.stringify({ balance: newBalance })
        );

        const finalProductStock = productData.isPreOrder
          ? productData.stock !== void 0
            ? Math.max(0, (Number(productData.stock) || 0) - quantity)
            : 0
          : (Number(productData.stock) || 0) - quantity;

        const productUpdatePayload: any = {
          ...productData,
          stock: finalProductStock,
          soldCount: (Number(productData.soldCount) || 0) + quantity,
        };

        if (!productData.isPreOrder) {
          productUpdatePayload.stockData = await compressStock(
            remainingBuffer.filter((v) => v !== void 0 && v !== null)
          );
        }

        const keysList = productData.isPreOrder
          ? []
          : claimedItems.map((k: any) => String(k).trim()).filter(Boolean);

        const licenseKeyHashes = keysList.map((k) =>
          crypto.createHash("sha256").update(k).digest("hex")
        );

        const encryptedSecretData = await encrypt(newHistoryItem.secretData || "");
        const historyPayload = JSON.parse(
          JSON.stringify({
            ...newHistoryItem,
            secretData: encryptedSecretData,
            licenseKeyHashes,
          })
        );

        for (const update of chunkDocsToUpdate) {
          t.update(update.ref, {
            items: await compressStock(update.remainingItems),
          });
        }
        for (const delRef of chunkDocsToDelete) {
          t.delete(delRef);
        }

        t.update(userRef, userUpdatePayload);
        t.update(productRef, productUpdatePayload);
        t.set(purchasesRef, historyPayload);

        const { stockData: _omittedStock, ...safeProductData } = productData;
        const resultPayload = {
          purchase: newHistoryItem,
          updatedUser: { ...userData, balance: newBalance },
          updatedProduct: {
            id: productId,
            ...safeProductData,
            stock: finalProductStock,
            soldCount: (productData.soldCount || 0) + quantity,
          },
        };

        if (idempRef) {
          t.set(idempRef, {
            response: resultPayload,
            timestamp: new Date().toISOString(),
            userId,
          });
        }
        return resultPayload;
      });

      if (result.isCachedIdempotency) {
        return res.json({ success: true, ...result.payload });
      }
      if (result.isError) {
        console.warn(
          `[Buy] Purchase validation failed: User ${userId}, Product ${productId}, Quantity ${quantity}. Message: ${result.message}`
        );
        return res.status(400).json({ error: result.message });
      }

      invalidateCache("products");
      invalidateCache("purchases");
      invalidateStatsCache();

      writeAuditLog("PRODUCT_PURCHASE", userId, productId, req, {
        quantity,
        totalCost: result.purchase.price,
        billNumber: result.purchase.billNumber,
      });

      res.json({
        success: true,
        purchase: result.purchase,
        updatedUser: result.updatedUser,
        updatedProduct: result.updatedProduct,
      });
    } catch (err: any) {
      const msg = err.message || "";
      console.error("------- BUY ERROR TRACE -------", err);
      sendAlert(
        "Transaction Failed / Rollback ❌",
        `**User**: ${userId}\n**Product**: ${productId}\n**Error**: ${msg}`,
        16711680,
        req.id
      );
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    } finally {
      releaseMutex(lockKey);
      await releaseRedisLock(redis, lockKey);
    }
  });

  // 2. GET /api/topups (fetch user or admin topups)
  router.get("/topups", requireAuth, async (req: any, res: any) => {
    try {
      const adminDb = admin.firestore();
      let q = adminDb.collection("topups");
      if (req.isAdmin) {
        const snapshot = await q.limit(100).get();
        let data = snapshot.docs.map((doc: any) => ({ dbId: doc.id, ...doc.data() }));
        data.sort(
          (a: any, b: any) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );
        return res.json(data);
      } else if (req.user) {
        const [snapByUid, snapByUserId] = await Promise.all([
          adminDb
            .collection("topups")
            .where("uid", "==", req.user.uid)
            .limit(100)
            .get()
            .catch(() => null),
          adminDb
            .collection("topups")
            .where("userId", "==", req.user.uid)
            .limit(100)
            .get()
            .catch(() => null),
        ]);
        const seen = new Set();
        let data = [];
        for (const snap of [snapByUid, snapByUserId]) {
          if (!snap) continue;
          for (const doc of snap.docs) {
            if (!seen.has(doc.id)) {
              seen.add(doc.id);
              data.push({ dbId: doc.id, ...doc.data() });
            }
          }
        }
        data.sort(
          (a: any, b: any) =>
            new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
        );
        return res.json(data.slice(0, 100));
      } else {
        return res.json([]);
      }
    } catch (err: any) {
      console.error("Internal server error fetching topups:", err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 3. POST /api/topups (admin manually posts a topup)
  router.post("/topups", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });

    const topupSchema = z.object({
      amount: z.coerce.number().min(1, "จำนวนเงินต้องมากกว่า 0"),
      method: z.enum(["truemoney", "promptpay", "bank_transfer", "giftcode"]).optional(),
    }).passthrough();

    try {
      const parseResult = topupSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      const data = parseResult.data;
      const docRef = await admin.firestore().collection("topups").add(data);
      res.json({ id: docRef.id, dbId: docRef.id, ...data });
    } catch (err: any) {
      console.error("Internal server error creating topup:", err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 4. GET /api/used_keys (retrieve keys with details and timestamps)
  router.get("/used_keys", requireAuth, async (req: any, res: any) => {
    try {
      const db = admin.firestore();
      let q = db.collection("used_keys");
      const targetUID = typeof req.query.uid === 'string' ? req.query.uid : undefined;
      let needsSortInMemory = false;
      if (req.isAdmin) {
        if (targetUID) {
          q = q.where("uid", "==", targetUID);
          needsSortInMemory = true;
          q = q.limit(100);
        } else {
          q = q.limit(100);
          needsSortInMemory = true;
        }
      } else if (req.user) {
        q = q.where("uid", "==", req.user.uid).limit(100);
        needsSortInMemory = true;
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const snapshot = await q.get();
      let data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      if (needsSortInMemory) {
        data.sort((a: any, b: any) => {
          const dateA = new Date(a.used_at || 0).getTime();
          const dateB = new Date(b.used_at || 0).getTime();
          return dateB - dateA;
        });
        data = data.slice(0, 100);
      }
      res.json(data);
    } catch (err: any) {
      console.error("Internal server error fetching used_keys:", err.message || err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 5. POST /api/used_keys (admin logs a used key manually with UUID validation)
  router.post("/used_keys", requireAdmin, async (req: any, res: any) => {
    const usedKeySchema = z.object({
      key: z.string().min(1, "Key is required"),
      ip: z.string().min(1, "IP is required"),
      details: z.any().optional(),
      uid: z.union([z.string().uuid("Invalid UID format"), z.literal("")]).optional().nullable(),
    });

    try {
      const parseResult = usedKeySchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      const { key, ip, details, uid } = parseResult.data;
      const newDoc = {
        key,
        ip,
        details,
        uid: uid || null,
        used_at: new Date().toISOString(),
      };
      const docRef = await admin.firestore().collection("used_keys").add(newDoc);
      res.json({ id: docRef.id, dbId: docRef.id, ...newDoc });
    } catch (err: any) {
      console.error("Internal server error inserting used_key:", err);
      res.status(500).json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 6. POST /api/topup/truemoney (TrueMoney AngPao/voucher gateway)
  router.post("/topup/truemoney", topupLimiter, requireAuth, async (req: any, res: any) => {
    let voucherRef: any = null;
    let apiSuccess = false;
    try {
      const { voucherCode } = req.body;
      const uid = req.user.uid;
      const siteSettings = getSiteSettings();
      const phone = siteSettings ? siteSettings.truewallet_phone : "";

      if (!voucherCode) {
        return res.status(400).json({
          success: false,
          error: "กรุณากรอกลิงก์ซองของขวัญ",
        });
      }

      let voucherHash = voucherCode.trim();
      const urlMatch = voucherHash.match(/[?&]v=([^&#\s]+)/);
      if (urlMatch) {
        voucherHash = urlMatch[1];
      } else if (voucherHash.includes("truemoney.com")) {
        const parts = voucherHash.split("/");
        const lastPart = parts[parts.length - 1];
        if (lastPart && lastPart.length >= 10) {
          voucherHash = lastPart;
        }
      }
      voucherHash = voucherHash.trim();

      if (!/^[a-zA-Z0-9\-_]+$/.test(voucherHash)) {
        return res.json({
          success: false,
          error: "รูปแบบรหัสซองของขวัญไม่ถูกต้อง (ต้องเป็นภาษาอังกฤษ ตัวเลข ขีดกลาง หรือขีดล่างเท่านั้น)",
        });
      }

      console.log(`[TrueWallet] Attempting to redeem via XPLUEM: "${voucherHash}" for phone: ${phone}`);
      voucherRef = admin.firestore().collection("vouchers").doc(voucherHash);

      try {
        await admin.firestore().runTransaction(async (t: any) => {
          const doc = await t.get(voucherRef);
          if (doc.exists) {
            throw new Error("DUPLICATE_VOUCHER");
          }
          t.set(voucherRef, {
            usedAt: new Date().toISOString(),
            uid,
            status: "pending",
          });
        });
      } catch (err: any) {
        if (err.message === "DUPLICATE_VOUCHER") {
          return res.json({
            success: false,
            error: "ซองของขวัญนี้ถูกใช้งานไปแล้วในระบบของเรา",
          });
        }
        throw err;
      }

      const fetchTopup = async (vHash: string, pPhone: string) => {
        return await axios.get(`https://api.xpluem.com/${vHash}/${pPhone}`, {
          timeout: 15e3,
          validateStatus: (status) => status < 500,
        });
      };

      const topupBreaker = new CircuitBreaker(fetchTopup, {
        timeout: 15e3,
        errorThresholdPercentage: 50,
        resetTimeout: 3e4,
      });

      let response: any;
      try {
        response = await topupBreaker.fire(voucherHash, phone);
      } catch (err: any) {
        console.error(`[TrueWallet] XPLUEM Circuit Breaker Error:`, err.message);
        if (voucherRef && !apiSuccess) {
          await voucherRef.delete();
        }
        return res.status(503).json({
          error: "ระบบเติมเงินขัดข้อง (Circuit Breaker Open) กรุณาลองใหม่ภายหลัง",
          isProxyError: true,
        });
      }

      const result = response.data;
      console.log(`[TrueWallet] XPLUEM Response:`, JSON.stringify(result));

      if (result.success === true) {
        apiSuccess = true;
        const amount = parseFloat(result.data?.amount || 0);
        if (isNaN(amount) || amount <= 0) {
          if (voucherRef) {
            await voucherRef.delete().catch((e: any) => console.error(e));
          }
          return res.json({
            success: false,
            error: "ข้อมูลซองอั่งเปาไม่ถูกต้อง (ยอดเงินไม่ถูกต้อง)",
          });
        }

        console.log(`[TrueWallet] Successfully redeemed ฿${amount}`);
        if (uid) {
          try {
            const userRef = admin.firestore().collection("users").doc(uid);
            let finalBalance = 0;
            let topupDoc: any = null;

            await admin.firestore().runTransaction(async (t: any) => {
              const uDoc = await t.get(userRef);
              if (uDoc.exists) {
                const currentBalance = uDoc.data().balance || 0;
                finalBalance = currentBalance + amount;
                t.update(userRef, { balance: finalBalance });
                topupDoc = {
                  id: crypto.randomUUID(),
                  userId: uDoc.data().username || "Unknown",
                  uid,
                  amount,
                  date: new Date().toISOString(),
                  type: "truewallet",
                  money: amount,
                  title: "เติมเงินสำเร็จ",
                  image: "https://img1.pic.in.th/images/IMG_6162.png",
                };
                const topupRef = admin.firestore().collection("topups").doc(topupDoc.id);
                t.set(topupRef, topupDoc);
                t.update(voucherRef, { status: "completed", amount });
              } else {
                throw new Error("USER_NOT_FOUND");
              }
            });

            console.log(`[TrueWallet] Updated balance for user ${uid} (+฿${amount})`);
            return res.json({
              success: true,
              amount,
              message: result.message || "รับเงินสำเร็จ",
              topup: topupDoc,
            });
          } catch (syncErr: any) {
            if (syncErr.message === "USER_NOT_FOUND") {
              await voucherRef.delete().catch((e: any) => console.error(e));
              return res.json({
                success: false,
                error: "ข้อมูลสมาชิกไม่ถูกต้อง",
              });
            }
            console.error(`[TrueWallet] Balance sync error:`, syncErr);
          }
        }

        return res.json({
          success: true,
          amount,
          message: result.message || "รับเงินสำเร็จ",
        });
      } else {
        const errorMsg = result.message || "ไม่สามารถรับเงินได้ (สถานะไม่สำเร็จ)";
        console.warn(`[TrueWallet] Failed: ${errorMsg}`);
        if (voucherRef) {
          await voucherRef.delete().catch((e: any) => console.error(e));
        }
        return res.json({ success: false, error: errorMsg });
      }
    } catch (error: any) {
      console.error("[TrueWallet] Gateway Error:", error.message);
      if (voucherRef) {
        await voucherRef.delete().catch((e: any) => console.error(e));
      }
      if (error.response) {
        const result = error.response.data;
        return res.json({
          success: false,
          error: result?.message || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ API",
        });
      }
      return res.status(500).json({
        success: false,
        error: "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย",
      });
    }
  });

  // 7. POST /api/topup/slip (bank transfer slip scanner SlipOK gateway)
  router.post("/topup/slip", mutationLimiter, requireAuth, async (req: any, res: any) => {
    try {
      const { imageBase64 } = req.body;
      const uid = req.user.uid;
      if (!imageBase64) {
        return res.status(400).json({
          success: false,
          error: "ข้อมูลไม่ครบถ้วน",
        });
      }

      if (!process.env.SLIPOK_API_KEY) {
        console.warn(`[Slip] SLIPOK_API_KEY is missing. Rejecting slip upload.`);
        return res.status(503).json({
          success: false,
          error: "ระบบสแกนสลิปปิดปรับปรุงชั่วคราว กรุณาติดต่อผู้นำเข้าระบบหรือแอดมิน",
        });
      }

      const imageBuffer = Buffer.from(imageBase64, "base64");
      if (imageBuffer.length > 5 * 1024 * 1024) {
        console.warn(`[Security] User ${uid} attempted to upload a file too large (${imageBuffer.length} bytes).`);
        return res.status(400).json({
          success: false,
          error: "ขนาดไฟล์ใหญ่เกินไป (ห้ามเกิน 5MB)",
        });
      }

      const hex = imageBuffer.toString("hex", 0, 4).toUpperCase();
      const isJpeg = hex.startsWith("FFD8FF");
      const isPng = hex.startsWith("89504E47");
      if (!isJpeg && !isPng) {
        console.warn(`[Security] User ${uid} uploaded invalid file type (magic bytes: ${hex}).`);
        return res.status(400).json({
          success: false,
          error: "รูปแบบไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG หรือ PNG เท่านั้น",
        });
      }

      const blob = new Blob([imageBuffer], {
        type: isJpeg ? "image/jpeg" : "image/png",
      });
      const form = new FormData();
      form.append("files", blob, isJpeg ? "slip.jpg" : "slip.png");

      const slipokApiId = process.env.SLIPOK_API_ID;
      const slipokApiKey = process.env.SLIPOK_API_KEY;
      if (!slipokApiId || !slipokApiKey) {
        return res.status(500).json({
          success: false,
          error: "ระบบไม่ได้ตั้งค่า SLIPOK_API_ID หรือ SLIPOK_API_KEY ไว้",
        });
      }

      const response = await axios.post(
        `https://api.slipok.com/api/line/apikey/${slipokApiId}`,
        form,
        { headers: { "x-authorization": slipokApiKey } }
      );

      if (
        response.data.success === true ||
        response.data.code === "0000" ||
        response.data.data?.amount !== void 0
      ) {
        const amount = parseFloat(response.data.data?.amount || 0);
        if (isNaN(amount) || amount <= 0) {
          return res.json({
            success: false,
            error: "ยอดเงินในสลิปไม่ถูกต้อง",
          });
        }

        const transRef = response.data.data?.transRef;
        const transDateStr =
          response.data.data?.sendingDateTime ||
          response.data.data?.date?.value ||
          response.data.data?.transDate ||
          "";

        if (
          !transRef ||
          typeof transRef !== "string" ||
          transRef.trim().length < 8 ||
          !/^[A-Za-z0-9\-_]+$/.test(transRef.trim())
        ) {
          return res.json({
            success: false,
            error: "ไม่พบหมายเลขอ้างอิงสลิปที่ถูกต้อง หรือสลิปไม่ได้มาตรฐาน (Invalid or missing Transaction Reference)",
          });
        }

        if (transDateStr) {
          try {
            const parseSlipDate = (dateStr: string) => {
              const clean = dateStr.trim();
              if (!clean) return null;
              if (/^\d{8}$/.test(clean)) {
                const y = parseInt(clean.substring(0, 4), 10);
                const m = parseInt(clean.substring(4, 6), 10) - 1;
                const d = parseInt(clean.substring(6, 8), 10);
                return new Date(y, m, d);
              }
              const dmyMatch = clean.match(
                /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
              );
              if (dmyMatch) {
                const d = parseInt(dmyMatch[1], 10);
                const m = parseInt(dmyMatch[2], 10) - 1;
                const y = parseInt(dmyMatch[3], 10);
                const hh = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 0;
                const mm = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
                const ss = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;
                return new Date(y, m, d, hh, mm, ss);
              }
              const ymdMatch = clean.match(
                /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/
              );
              if (ymdMatch) {
                const y = parseInt(ymdMatch[1], 10);
                const m = parseInt(ymdMatch[2], 10) - 1;
                const d = parseInt(ymdMatch[3], 10);
                const hh = ymdMatch[4] ? parseInt(ymdMatch[4], 10) : 0;
                const mm = ymdMatch[5] ? parseInt(ymdMatch[5], 10) : 0;
                const ss = ymdMatch[6] ? parseInt(ymdMatch[6], 10) : 0;
                return new Date(y, m, d, hh, mm, ss);
              }
              const parsed = new Date(clean);
              if (!isNaN(parsed.getTime())) {
                return parsed;
              }
              return null;
            };

            const parsedDate = parseSlipDate(transDateStr);
            if (!parsedDate || isNaN(parsedDate.getTime())) {
              return res.json({
                success: false,
                error: "ระบบไม่สามารถยืนยันวันที่ของสลิปได้ (Invalid Date format)",
              });
            }

            const diffTime = Math.abs(Date.now() - parsedDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 7) {
              return res.json({
                success: false,
                error: "สลิปนี้เก่าเกินไป ระบบรับเฉพาะสลิปที่มีอายุไม่เกิน 7 วันเท่านั้น",
              });
            }
          } catch (e: any) {
            console.error("Caught error parsing slip date:", e);
            return res.json({
              success: false,
              error: "ระบบเกิดข้อผิดพลาดในการตรวจสอบสลิป",
            });
          }
        }

        const receiverProxy = response.data.data?.receiver?.proxy?.value || "";
        const receiverName =
          response.data.data?.receiver?.displayName ||
          response.data.data?.receiver?.name ||
          "";
        const EXPECTED_NAME_TH = process.env.SHOP_ACCOUNT_NAME_TH || "กรวิชญ์";
        const EXPECTED_PROMPTPAY = process.env.SHOP_PROMPTPAY_NUMBER || "";

        if (!EXPECTED_PROMPTPAY) {
          return res.json({
            success: false,
            error: "ระบบไม่ได้เปิดใช้งานช่องทางการชำระเงินเนื่องจากข้อมูลสลิปไม่ครบถ้วน (กรุณาตั้งค่า SHOP_PROMPTPAY_NUMBER)",
          });
        }

        const isMatch =
          receiverProxy.includes(EXPECTED_PROMPTPAY) ||
          receiverProxy.replace(/-/g, "").includes(EXPECTED_PROMPTPAY);

        if (!isMatch) {
          return res.json({
            success: false,
            error: `ชื่อบัญชีผู้รับเงินหรือเบอร์ผู้รับไม่ถูกต้อง (สลิปโอนไปที่: ${receiverName || "ไม่ระบุ"}) ไม่ตรงกับของทางร้าน กรุณาติดต่อแอดมิน`,
          });
        }

        if (transRef) {
          try {
            await admin.firestore().runTransaction(async (t: any) => {
              const docRef = admin.firestore().collection("slips").doc(transRef);
              const existingRef = await t.get(docRef);
              if (existingRef.exists) {
                throw new Error("SLIP_USED");
              }
              t.set(docRef, { uid, amount, used_at: new Date().toISOString() });
            });
          } catch (e: any) {
            if (e.message === "SLIP_USED") {
              return res.json({
                success: false,
                error: "สลิปนี้ถูกใช้งานไปแล้ว (ตรวจสอบจากระบบ)",
              });
            }
            console.error("Slip transaction failed:", e);
            return res.status(500).json({
              success: false,
              error: "ระบบขัดข้องชั่วคราว ไม่สามารถตรวจสอบสลิปได้ กรุณาลองใหม่อีกครั้ง",
            });
          }
        }

        if (uid) {
          try {
            const userRef = admin.firestore().collection("users").doc(uid);
            let finalBalance = 0;
            let topupDoc: any = null;

            await admin.firestore().runTransaction(async (t: any) => {
              const uDoc = await t.get(userRef);
              if (uDoc.exists) {
                const currentBalance = uDoc.data().balance || 0;
                finalBalance = currentBalance + amount;
                t.update(userRef, { balance: finalBalance });
                topupDoc = {
                  id: crypto.randomUUID(),
                  userId: uDoc.data().username || "Unknown",
                  uid,
                  amount,
                  date: new Date().toISOString(),
                  type: "slip",
                  money: amount,
                  title: "เติมเงินสำเร็จ",
                  image: "https://img2.pic.in.th/IMG_6166.png",
                };
                const topupRef = admin.firestore().collection("topups").doc(topupDoc.id);
                t.set(topupRef, topupDoc);
              } else {
                throw new Error("USER_NOT_FOUND");
              }
            });

            console.log(`[Slip] Updated balance for user ${uid} (+฿${amount})`);
            return res.json({ success: true, amount, topup: topupDoc });
          } catch (syncErr: any) {
            if (syncErr.message === "USER_NOT_FOUND") {
              return res.json({
                success: false,
                error: "ข้อมูลสมาชิกไม่ถูกต้อง",
              });
            }
            console.error(`[Slip] Balance sync error:`, syncErr);
          }
        }
        return res.json({ success: true, amount });
      } else {
        const errorMsg = response.data.data?.message || response.data.message;
        return res.json({
          success: false,
          error: errorMsg || "ไม่สามารถรับเงินได้",
        });
      }
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.message;
        return res.json({
          success: false,
          error: errorMsg || "สลิปไม่ถูกต้อง หรือถูกใช้งานไปแล้ว",
        });
      } else {
        console.error("SlipOK API Error:", error.message);
        return res.status(500).json({
          success: false,
          error: "เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย",
        });
      }
    }
  });

  // 8. POST /api/voucher (voucher redeem using voucherSchema)
  const voucherSchema = z.object({
    code: z.string().trim().min(4).max(64),
  });

  router.post("/voucher", mutationLimiter, requireAuth, async (req: any, res: any) => {
    const parseResult = voucherSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { code } = parseResult.data;

    try {
      const uid = req.user.uid;
      let keyData: any = null;
      let keyDocRef: any = null;
      let isProductKey = false;

      const snapshot = await admin
        .firestore()
        .collection("license_keys")
        .where("key", "==", code)
        .where("status", "==", "active")
        .get();

      if (!snapshot.docs || snapshot.docs.length === 0) {
        let foundDoc = await findPurchaseByWebClaimKey(code);
        if (!foundDoc) {
          return res.status(400).json({
            error: "ไม่พบคีย์ในระบบ หรือคีย์นี้ถูกใช้งานไปแล้ว",
          });
        }
        isProductKey = true;
        keyData = foundDoc;
        keyDocRef = admin.firestore().collection("purchases").doc(foundDoc.id);
      } else {
        keyData = snapshot.docs[0].data();
        keyDocRef = admin
          .firestore()
          .collection("license_keys")
          .doc(snapshot.docs[0].id);
      }

      let rankToGive = "premium";
      let expireDate = new Date();

      await admin.firestore().runTransaction(async (t: any) => {
        const docSnap = await t.get(keyDocRef);
        if (!docSnap.exists) throw new Error("Key not found");
        const docData = docSnap.data();
        if (isProductKey) {
          if (docData.webClaimed) throw new Error("Key already used");
          t.update(keyDocRef, { webClaimed: true });
        } else {
          if (docData.status === "used") throw new Error("Key already used");
          t.update(keyDocRef, { status: "used" });
        }
      });

      if (isProductKey) {
        rankToGive = keyData.productName?.replace(/ \(.+\)/g, "") || "VIP";
        await admin
          .firestore()
          .collection("used_keys")
          .add({
            key: code,
            ip: req.ip || "",
            uid,
            details: `Redeemed product rank ${rankToGive}`,
            used_at: new Date().toISOString(),
          });
        expireDate.setDate(expireDate.getDate() + 9999);
      } else {
        await admin
          .firestore()
          .collection("used_keys")
          .add({
            key: code,
            ip: req.ip || "",
            uid,
            details: `Redeemed rank ${keyData.type}`,
            used_at: new Date().toISOString(),
          });
        let days = 1;
        if (keyData.type === "Week") days = 7;
        if (keyData.type === "Month") days = 30;
        if (keyData.type === "3Month") days = 90;
        if (keyData.type === "Year") days = 365;
        if (keyData.type === "Lifetime") days = 9999;
        expireDate.setDate(expireDate.getDate() + days);
      }

      const communityData = getCommunityData();
      if (communityData) {
        communityData.userRanks = communityData.userRanks || {};
        communityData.userRanks[uid] = rankToGive;
        await saveCommunity();
      }

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(
          {
            isPremium: true,
            rank: rankToGive,
            premiumExpireDate: expireDate.toISOString(),
          },
          { merge: true }
        );

      res.json({
        success: true,
        rank: rankToGive,
        type: isProductKey ? "Product Rank" : keyData.type,
      });
    } catch (e: any) {
      res.status(500).json({
        error:
          e.message === "Key already used"
            ? "คีย์ถูกใช้งานไปแล้ว"
            : e.message,
      });
    }
  });

  // 9. POST /api/redeem (backward-compatible legacy redeem endpoint)
  router.post("/redeem", mutationLimiter, requireAuth, async (req: any, res: any) => {
    const { key } = req.body;
    if (!key || typeof key !== "string" || key.trim().length < 4) {
      return res.status(400).json({
        error: "รูปแบบคีย์ไม่ถูกต้องหรือสั้นเกินไป",
      });
    }

    try {
      const uid = req.user.uid;
      let keyData: any = null;
      let keyDocRef: any = null;
      let isProductKey = false;

      const snapshot = await admin
        .firestore()
        .collection("license_keys")
        .where("key", "==", key)
        .where("status", "==", "active")
        .get();

      if (!snapshot.docs || snapshot.docs.length === 0) {
        let foundDoc = await findPurchaseByWebClaimKey(key);
        if (!foundDoc) {
          return res.status(400).json({
            error: "ไม่พบคีย์ในระบบ หรือคีย์นี้ถูกใช้งานไปแล้ว",
          });
        }
        isProductKey = true;
        keyData = foundDoc;
        keyDocRef = admin.firestore().collection("purchases").doc(foundDoc.id);
      } else {
        keyData = snapshot.docs[0].data();
        keyDocRef = admin
          .firestore()
          .collection("license_keys")
          .doc(snapshot.docs[0].id);
      }

      let rankToGive = "premium";
      let expireDate = new Date();

      await admin.firestore().runTransaction(async (t: any) => {
        const docSnap = await t.get(keyDocRef);
        if (!docSnap.exists) throw new Error("Key not found");
        const docData = docSnap.data();
        if (isProductKey) {
          if (docData.webClaimed) throw new Error("Key already used");
          t.update(keyDocRef, { webClaimed: true });
        } else {
          if (docData.status === "used") throw new Error("Key already used");
          t.update(keyDocRef, { status: "used" });
        }
      });

      if (isProductKey) {
        rankToGive = keyData.productName?.replace(/ \(.+\)/g, "") || "VIP";
        await admin
          .firestore()
          .collection("used_keys")
          .add({
            key,
            ip: req.ip || "",
            uid,
            details: `Redeemed product rank ${rankToGive}`,
            used_at: new Date().toISOString(),
          });
        expireDate.setDate(expireDate.getDate() + 9999);
      } else {
        await admin
          .firestore()
          .collection("used_keys")
          .add({
            key,
            ip: req.ip || "",
            uid,
            details: `Redeemed rank ${keyData.type}`,
            used_at: new Date().toISOString(),
          });
        let days = 1;
        if (keyData.type === "Week") days = 7;
        if (keyData.type === "Month") days = 30;
        if (keyData.type === "3Month") days = 90;
        if (keyData.type === "Year") days = 365;
        if (keyData.type === "Lifetime") days = 9999;
        expireDate.setDate(expireDate.getDate() + days);
      }

      const communityData = getCommunityData();
      if (communityData) {
        communityData.userRanks = communityData.userRanks || {};
        communityData.userRanks[uid] = rankToGive;
        await saveCommunity();
      }

      await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .set(
          {
            isPremium: true,
            rank: rankToGive,
            premiumExpireDate: expireDate.toISOString(),
          },
          { merge: true }
        );

      res.json({
        success: true,
        rank: rankToGive,
        type: isProductKey ? "Product Rank" : keyData.type,
      });
    } catch (e: any) {
      res.status(500).json({
        error:
          e.message === "Key already used"
            ? "คีย์ถูกใช้งานไปแล้ว"
            : e.message,
      });
    }
  });

  return router;
}
