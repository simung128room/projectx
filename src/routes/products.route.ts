import { Router } from "express";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import readline from "node:readline";
import zlib from "node:zlib";
import { promisify } from "node:util";
import multer from "multer";
import { adminDb as admin } from "../lib/admindb.js";

const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);

// Setup multer upload directory in temp dir
const uploadDir = path.join(os.tmpdir(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const diskUpload = multer({ dest: uploadDir });

async function compressStock(stockData: any) {
  if (!Array.isArray(stockData)) return stockData;
  if (stockData.length >= 250) {
    const buffer = await gzipAsync(JSON.stringify(stockData));
    return [{ __compressed: buffer.toString("base64") }];
  }
  const str = JSON.stringify(stockData);
  if (str.length > 5e4) {
    const buffer = await gzipAsync(str);
    return [{ __compressed: buffer.toString("base64") }];
  }
  return stockData;
}

async function decompressStock(data: any): Promise<any[]> {
  let compData = data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
      compData = data;
    } catch (e) {
      console.error("Caught error:", e);
    }
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    if (data["0"]) {
      const arr = [];
      for (let i = 0; i < Object.keys(data).length; i++) {
        if (data[i] !== void 0) arr.push(data[i]);
      }
      data = arr;
      compData = data;
    }
  }
  if (
    Array.isArray(data) &&
    data.length === 1 &&
    data[0] &&
    typeof data[0] === "object" &&
    data[0].__compressed
  ) {
    compData = data[0];
  }
  if (compData && typeof compData === "object" && compData.__compressed) {
    try {
      const buffer = await gunzipAsync(
        Buffer.from(compData.__compressed, "base64"),
      );
      return JSON.parse(buffer.toString("utf-8"));
    } catch (e) {
      console.error("decompressStock error:", e);
      return [];
    }
  }
  return data;
}

export interface ProductsRouterOptions {
  requireAdmin: any;
  getCachedCollection: (collectionName: string, ttl?: number, res?: any, req?: any) => Promise<any[]>;
  writeAuditLog: (action: string, actor: string, target: string, req: any, extraContext?: any) => Promise<void>;
  invalidateCache: (collectionName: string) => void;
  invalidateStatsCache: () => void;
}

export function createProductsRouter({
  requireAdmin,
  getCachedCollection,
  writeAuditLog,
  invalidateCache,
  invalidateStatsCache,
}: ProductsRouterOptions) {
  const router = Router();

  // 1. GET /api/products (public, cached)
  router.get("/products", async (req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    try {
      const data = await getCachedCollection("products", 1e4, res, req);
      if (data) {
        const processedData = data.map((item) => {
          const { stockData, ...publicItem } = item;
          return publicItem;
        });
        res.json(processedData);
      }
    } catch (err: any) {
      console.error(
        "PROD ERR OBJ:",
        JSON.stringify(err, Object.getOwnPropertyNames(err)),
      );
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 2. GET /api/products/:id (requireAdmin)
  router.get("/products/:id", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const doc = await admin
        .firestore()
        .collection("products")
        .doc(req.params.id)
        .get();
      if (!doc.exists)
        return res.status(404).json({ error: "Product not found" });
      const data = doc.data();
      const { stockData, ...safeProductData } = data || {};
      const responseData = { id: doc.id, ...safeProductData };
      res.json(responseData);
    } catch (err: any) {
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 3. GET /api/products/:id/stock (requireAdmin)
  router.get("/products/:id/stock", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const docRef = admin.firestore().collection("products").doc(req.params.id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Product not found" });
      }
      let stockData = doc.data()?.stockData || [];
      if (stockData) {
        stockData = await decompressStock(stockData);
      }
      if (!Array.isArray(stockData)) stockData = [];
      const chunksSnapshot = await admin
        .firestore()
        .collection("product_stock_chunks")
        .where("productId", "==", req.params.id)
        .get();
      for (const chunkDoc of chunksSnapshot.docs) {
        const chunkItems = chunkDoc.data().items;
        if (chunkItems) {
          const dec = await decompressStock(chunkItems);
          if (Array.isArray(dec)) stockData = stockData.concat(dec);
        }
      }
      res.json({ stockData });
    } catch (err: any) {
      console.error("Error fetching stock data:", err);
      res.status(500).json({ error: String(err.message || err) });
    }
  });

  // 4. POST /api/products (requireAdmin + Zod)
  router.post("/products", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });

    const productSchema = z.object({
      name: z.string().min(1, "กรุณากรอกชื่อสินค้า"),
      price: z.coerce.number().min(0, "ราคาไม่สามารถติดลบได้"),
      stock: z.coerce.number().min(0, "สต๊อกสินค้าไม่สามารถติดลบได้").optional().default(0),
    }).passthrough();

    try {
      const parseResult = productSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      const product = parseResult.data;
      const allowedFields = [
        "name",
        "description",
        "price",
        "originalPrice",
        "stock",
        "categoryId",
        "stockData",
        "image",
        "imageUrl",
        "category",
        "isHighlight",
        "customPageId",
        "youtubeUrl",
        "type",
        "isPopular",
        "soldCount",
        "tag",
        "_version",
        "isPreOrder",
        "preOrderOptions",
      ];
      const sanitizedProduct = Object.fromEntries(
        Object.entries(product).filter(([k]) => allowedFields.includes(k)),
      );
      sanitizedProduct._version = 1;
      const { id, ...dataToSaveRaw } = sanitizedProduct;
      if (dataToSaveRaw.stockData) {
        dataToSaveRaw.stockData = await compressStock(dataToSaveRaw.stockData);
      }
      const dataToSave = JSON.parse(JSON.stringify(dataToSaveRaw));
      const docRef = await admin
        .firestore()
        .collection("products")
        .add(dataToSave);
      invalidateCache("products");
      invalidateStatsCache();
      const { stockData, ...safeData } = dataToSave;
      const responseData = { id: docRef.id, dbId: docRef.id, ...safeData };
      res.json(responseData);
    } catch (err: any) {
      console.error(
        "Internal server error creating product:",
        JSON.stringify(err, Object.getOwnPropertyNames(err)),
      );
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });

  // 5. POST /api/products/:id/stock-file (requireAdmin)
  router.post(
    "/products/:id/stock-file",
    requireAdmin,
    diskUpload.single("file"),
    async (req: any, res: any) => {
      if (!admin.firestore())
        return res.status(500).json({ error: "DB not connected" });
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }
        const linesPerItem = parseInt(req.body.linesPerItem || "1") || 1;
        const fileStream = fs.createReadStream(req.file.path);
        const rl = readline.createInterface({
          input: fileStream,
          crlfDelay: Infinity,
        });
        let currentLines = [];
        const chunkedItems = [];
        for await (const line of rl) {
          const trimmed = line.trim();
          if (trimmed.length > 0) {
            currentLines.push(trimmed);
            if (currentLines.length >= linesPerItem) {
              chunkedItems.push(currentLines.join("\n"));
              currentLines = [];
            }
          }
        }
        if (currentLines.length > 0) {
          chunkedItems.push(currentLines.join("\n"));
        }
        fs.unlink(req.file.path, () => {});
        if (chunkedItems.length === 0) {
          return res.status(400).json({ error: "No valid data found in file" });
        }
        const docRef = admin
          .firestore()
          .collection("products")
          .doc(req.params.id);
        let finalProductData = {};
        await admin.firestore().runTransaction(async (t) => {
          const doc = await t.get(docRef);
          if (!doc.exists) {
            throw new Error("NOT_FOUND");
          }
          const p = doc.data() || {};
          let existingStock = [];
          if (p.stockData) {
            existingStock = await decompressStock(p.stockData);
          }
          const mergedStock = [...existingStock, ...chunkedItems];
          const compressed = await compressStock(mergedStock);
          const newVersion = (p._version || 0) + 1;
          t.update(docRef, {
            stockData: compressed,
            stock: mergedStock.length,
            _version: newVersion,
          });
          finalProductData = {
            ...p,
            stockData: void 0,
            stock: mergedStock.length,
            _version: newVersion,
            id: doc.id,
          };
        });
        invalidateCache("products");
        invalidateStatsCache();
        await writeAuditLog(
          "ADD_STOCK",
          req.user?.uid || "admin",
          `Product ${req.params.id}`,
          req,
          { itemsAdded: chunkedItems.length },
        );
        res.json({
          success: true,
          count: chunkedItems.length,
          product: finalProductData,
        });
      } catch (err: any) {
        if (req.file) fs.unlink(req.file.path, () => {});
        console.error("Error in /api/products/:id/stock-file:", err);
        res
          .status(err.message === "NOT_FOUND" ? 404 : 500)
          .json({ error: String(err.message || err) });
      }
    },
  );

  // 6. POST /api/products/:id/stock (requireAdmin)
  router.post("/products/:id/stock", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const { newItems } = req.body;
      if (!Array.isArray(newItems) || newItems.length === 0) {
        return res.json({ success: true });
      }
      const docRef = admin.firestore().collection("products").doc(req.params.id);
      let finalProductData = {};
      await admin.firestore().runTransaction(async (t) => {
        const doc = await t.get(docRef);
        if (!doc.exists) {
          throw new Error("NOT_FOUND");
        }
        const docData = doc.data();
        let existingStock = docData?.stockData || [];
        if (existingStock) {
          existingStock = await decompressStock(existingStock);
        }
        if (!Array.isArray(existingStock)) {
          existingStock = [];
        }
        existingStock = existingStock.concat(newItems);
        const previousStock = docData?.stock || 0;
        const newStockCount = previousStock + newItems.length;
        t.update(docRef, {
          stock: newStockCount,
          stockData: await compressStock(existingStock),
        });
        const { stockData, ...safeData } = docData || {};
        finalProductData = { ...safeData, stock: newStockCount };
      });
      invalidateCache("products");
      invalidateStatsCache();
      res.json({
        success: true,
        added: newItems.length,
        product: finalProductData,
      });
    } catch (err: any) {
      if (err.message === "NOT_FOUND") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error(
        "Internal server error appending stock:",
        JSON.stringify(err, Object.getOwnPropertyNames(err)),
      );
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });


  // 12. PUT /api/products/bulk/category (requireAdmin)
  router.put("/products/bulk/category", requireAdmin, async (req: any, res: any) => {
    try {
      const { idsToAdd, idsToRemove, categoryId } = req.body;
      const updatePromises = [];
      if (Array.isArray(idsToAdd)) {
        for (const id of idsToAdd) {
          updatePromises.push(
            admin
              .firestore()
              .collection("products")
              .doc(id)
              .update({ category: categoryId }),
          );
        }
      }
      if (Array.isArray(idsToRemove)) {
        for (const id of idsToRemove) {
          updatePromises.push(
            admin
              .firestore()
              .collection("products")
              .doc(id)
              .update({ category: "" }),
          );
        }
      }
      await Promise.all(updatePromises);
      invalidateCache("products");
      res.json({ success: true });

  // 7. PUT /api/products/:id (requireAdmin + Zod)
  router.put("/products/:id", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });

    const productUpdateSchema = z.object({
      name: z.string().min(1, "กรุณากรอกชื่อสินค้า").optional(),
      price: z.coerce.number().min(0, "ราคาไม่สามารถติดลบได้").optional(),
      stock: z.coerce.number().min(0, "สต๊อกสินค้าไม่สามารถติดลบได้").optional(),
    }).passthrough();

    try {
      const parseResult = productUpdateSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      const productUpdates = parseResult.data;
      const docRef = admin.firestore().collection("products").doc(req.params.id);
      const allowedFields = [
        "name",
        "description",
        "price",
        "originalPrice",
        "stock",
        "categoryId",
        "stockData",
        "image",
        "imageUrl",
        "category",
        "isHighlight",
        "customPageId",
        "youtubeUrl",
        "type",
        "isPopular",
        "soldCount",
        "tag",
        "_version",
        "isPreOrder",
        "preOrderOptions",
      ];
      const sanitizedUpdates = Object.fromEntries(
        Object.entries(productUpdates).filter(
          ([k]) => allowedFields.includes(k) && k !== "id",
        ),
      );
      let finalData: any;
      let deltaBefore: any = {};
      let deltaAfter: any = {};
      await admin.firestore().runTransaction(async (t) => {
        const currentDoc = await t.get(docRef);
        if (!currentDoc.exists) {
          throw new Error("NOT_FOUND");
        }
        const existingData = currentDoc.data() || {};
        Object.keys(sanitizedUpdates).forEach((k) => {
          if (k !== "_version" && sanitizedUpdates[k] !== existingData[k]) {
            deltaBefore[k] = existingData[k];
            deltaAfter[k] = sanitizedUpdates[k];
          }
        });
        let nextVersion = existingData._version || 0;
        if (Object.keys(deltaAfter).length > 0) {
          nextVersion += 1;
          deltaAfter._version = nextVersion;
        }
        if (deltaAfter.stockData && !deltaAfter.stockData[0]?.__compressed) {
          deltaAfter.stockData = await compressStock(deltaAfter.stockData);
        }
        const dataToSave = JSON.parse(JSON.stringify(deltaAfter));
        if (Object.keys(dataToSave).length > 0) {
          t.update(docRef, dataToSave);
        }
        finalData = { ...existingData, ...dataToSave, id: req.params.id };
      });
      invalidateCache("products");
      invalidateStatsCache();
      if (Object.keys(deltaAfter).length > 0) {
        writeAuditLog(
          "PRODUCT_UPDATE",
          req.user?.uid || "admin",
          req.params.id,
          req,
          { changes: { before: deltaBefore, after: deltaAfter } },
        );
      }
      const { stockData, ...safeFinalData } = finalData;
      res.json(safeFinalData);
    } catch (err: any) {
      if (err.message === "VERSION_CONFLICT") {
        return res
          .status(409)
          .json({
            error:
              "Conflict: Product was updated by another admin. Please refresh and try again.",
          });
      }
      if (err.message === "NOT_FOUND") {
        return res.status(404).json({ error: "Product not found" });
      }
      console.error(
        "Internal server error updating product:",
        JSON.stringify(err, Object.getOwnPropertyNames(err)),
      );
      const errMsg = err?.message || JSON.stringify(err);
      res.status(500).json({ error: String(errMsg) });
    }
  });

  // 8. DELETE /api/products/:id (requireAdmin)
  router.delete("/products/:id", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const docRef = admin.firestore().collection("products").doc(req.params.id);
      let existingData: any = null;
      let exists = false;
      const doc = await docRef.get();
      if (doc.exists) {
        exists = true;
        existingData = doc.data();
        await docRef.delete();
      }
      invalidateCache("products");
      invalidateStatsCache();
      if (exists && existingData) {
        writeAuditLog(
          "PRODUCT_DELETE",
          req.user?.uid || "admin",
          req.params.id,
          req,
          {
            changes: {
              before: existingData,
              after: { isDeleted: true, hardDeleted: true },
            },
          },
        );
      }
      res.json({
        success: true,
        softDeleted: false,
        deleted: true,
        existed: exists,
      });
    } catch (err: any) {
      console.error("Internal server error deleting product:", err);
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 9. GET /api/categories (public, cached)
  router.get("/categories", async (req, res) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    try {
      const data = await getCachedCollection("categories", 1e4, res, req);
      if (data) res.json(data);
    } catch (err: any) {
      console.error(
        "Internal server error fetching categories:",
        err.message || err,
      );
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 10. POST /api/categories (requireAdmin)
  router.post("/categories", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const data = req.body;
      const { id, ...dataToSave } = data;
      const docRef = await admin
        .firestore()
        .collection("categories")
        .add(dataToSave);
      invalidateCache("categories");
      res.json({ id: docRef.id, dbId: docRef.id, ...dataToSave });
    } catch (err: any) {
      console.error("Internal server error creating category:", err);
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  // 11. PUT /api/categories/:id (requireAdmin)
  router.put("/categories/:id", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      const data = req.body;
      const { id, ...dataToSave } = data;
      const docRef = admin
        .firestore()
        .collection("categories")
        .doc(req.params.id);
      await docRef.update(dataToSave);
      invalidateCache("categories");
      res.json({ id: req.params.id, ...dataToSave });
    } catch (err: any) {
      console.error("Internal server error updating category:", err);
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 13. DELETE /api/categories/:id (requireAdmin)
  router.delete("/categories/:id", requireAdmin, async (req: any, res: any) => {
    if (!admin.firestore())
      return res.status(500).json({ error: "DB not connected" });
    try {
      await admin
        .firestore()
        .collection("categories")
        .doc(req.params.id)
        .delete();
      invalidateCache("categories");
      res.json({ success: true });
    } catch (err: any) {
      console.error("Internal server error deleting category:", err);
      res
        .status(500)
        .json({ error: String(err && err.message ? err.message : err) });
    }
  });

  return router;
}
