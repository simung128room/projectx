import { Router } from "express";
import { z } from "zod";
import path from "path";
import sharp from "sharp";
import { adminDb as admin, supabaseAdmin } from "../lib/admindb.js";

// Helper for image extensions and MIME types safety checks
function isImageSafe(buffer: Buffer): boolean {
  if (buffer.length < 4) return false;
  const hex = buffer.toString("hex", 0, 4).toUpperCase();
  const isJpeg = hex.startsWith("FFD8FF");
  const isPng = hex.startsWith("89504E47");
  const isGif = hex.startsWith("47494638");
  const isWebp =
    hex.startsWith("52494646") &&
    buffer.toString("hex", 8, 12).toUpperCase() === "57454250";
  if (!(isJpeg || isPng || isGif || isWebp)) return false;
  
  const bufferString = buffer.toString(
    "utf8",
    0,
    Math.min(buffer.length, 8192),
  );
  const dangerousPatterns = [
    /<\?php/i,
    /<script/i,
    /<\/script/i,
    /<\s*html/i,
    /<\s*body/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /proc_open/i,
    /shell_exec/i,
  ];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(bufferString)) {
      return false;
    }
  }
  return true;
}

function validateUploadFileMetadata(file: any): boolean {
  if (!file) return false;
  const ext = path.extname(file.originalname || "").toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  return (
    allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)
  );
}

// Zod Input Validation Schema for Profile Update
const profileUpdateSchema = z.object({
  avatar: z.string().url().or(z.literal("")).or(z.literal("N/A")).optional(),
  displayName: z.string().min(1, "ชื่อเล่นต้องไม่ว่างเปล่า").max(50, "ชื่อเล่นยาวเกินไป").optional(),
  bio: z.string().max(250, "คำอธิบายตัวตนยาวเกินไป").optional(),
  username: z.string().min(3, "ชื่อผู้ใช้งานสั้นเกินไป").max(30, "ชื่อผู้ใช้งานยาวเกินไป").optional(),
  fullName: z.string().max(100, "ชื่อจริงยาวเกินไป").optional(),
  email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  registeredAt: z.string().optional(),
  
  // Admin-only fields
  balance: z.number().nonnegative("ยอดเงินต้องไม่ติดลบ").optional(),
  status: z.string().optional(),
  rank: z.string().optional(),
  customPlan: z.any().optional(),
}).partial();

interface UsersRouterDeps {
  requireAuth: any;
  requireAdmin: any;
  mutationLimiter: any;
  communityUpload: any;
  uploadToSupabaseStorage: any;
  getCommunityData: () => any;
  invalidateUserTokenCache: (uid: string) => void;
  invalidateCache: (key: string) => void;
  invalidateStatsCache: () => void;
  sendAlert?: any;
}

export function createUsersRouter({
  requireAuth,
  requireAdmin,
  mutationLimiter,
  communityUpload,
  uploadToSupabaseStorage,
  getCommunityData,
  invalidateUserTokenCache,
  invalidateCache,
  invalidateStatsCache,
  sendAlert,
}: UsersRouterDeps) {
  const router = Router();

  // GET /api/users/:uid (Fetch Single User Profile)
  router.get("/users/:uid", requireAuth, async (req: any, res: any) => {
    if (req.user.uid !== req.params.uid && !req.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!admin.firestore()) {
      return res.status(500).json({ error: "DB not connected" });
    }
    try {
      const docRef = admin.firestore().collection("users").doc(req.params.uid);
      const snapshot = await docRef.get();
      if (snapshot.exists) {
        const data = snapshot.data() || {};
        const communityData = getCommunityData();
        data.rank = communityData.userRanks?.[req.params.uid] || data.rank || "user";
        res.json(data);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err: any) {
      console.error("Error fetching user:", err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Helper handling update logic
  const handleUserUpdate = async (req: any, res: any) => {
    if (req.user.uid !== req.params.uid && !req.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    if (!admin.firestore()) {
      return res.status(500).json({ error: "DB not connected" });
    }
    try {
      const { uid } = req.params;
      
      // Validate incoming data using Zod
      const parsedBody = profileUpdateSchema.parse(req.body);
      
      let dataToUpdate: Record<string, any> = parsedBody;
      
      // Check for uniqueness of email and username
      if (parsedBody.email || parsedBody.username) {
        const usersRef = admin.firestore().collection("users");
        if (parsedBody.email) {
          const emailSnap = await usersRef.where("email", "==", parsedBody.email).get();
          if (!emailSnap.empty && emailSnap.docs.some((doc: any) => doc.id !== uid)) {
            return res.status(400).json({ error: "อีเมลนี้ถูกใช้งานแล้ว" });
          }
        }
        if (parsedBody.username) {
          const usernameSnap = await usersRef.where("username", "==", parsedBody.username).get();
          if (!usernameSnap.empty && usernameSnap.docs.some((doc: any) => doc.id !== uid)) {
            return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว" });
          }
        }
      }
      
      // Non-admin can only update generic profile metadata
      if (!req.isAdmin) {
        const allowedFields = [
          "avatar",
          "displayName",
          "bio",
          "username",
          "fullName",
        ];
        dataToUpdate = Object.fromEntries(
          Object.entries(parsedBody).filter(([k]) => allowedFields.includes(k) && parsedBody[k as keyof typeof parsedBody] !== undefined),
        );
      }

      const docRef = admin.firestore().collection("users").doc(uid);
      await docRef.set(
        { ...dataToUpdate, updatedAt: new Date().toISOString() },
        { merge: true },
      );

      invalidateUserTokenCache(uid);
      invalidateCache("users");
      invalidateStatsCache();
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error saving user:", err.message || JSON.stringify(err));
      res.status(400).json({ error: err.message || String(err) });
    }
  };

  // PUT /api/users/:uid (Profile update + Zod check)
  router.put("/users/:uid", requireAuth, handleUserUpdate);

  // POST /api/users/:uid (Profile update backward compatibility)
  router.post("/users/:uid", requireAuth, handleUserUpdate);

  // POST /api/users/:uid/password (Admin password reset)
  router.post("/users/:uid/password", requireAdmin, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      const { password } = req.body;
      const passwordSchema = z.string()
        .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
        .regex(/[a-z]/, "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
        .regex(/[A-Z]/, "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
        .regex(/\d/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
        .regex(/[^a-zA-Z\d]/, "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว");
      const parseResult = passwordSchema.safeParse(password);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      await supabaseAdmin.auth.admin.updateUserById(uid, { password });
      invalidateUserTokenCache(uid);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // DELETE /api/users/:uid (User profile delete)
  router.delete("/users/:uid", requireAuth, async (req: any, res: any) => {
    try {
      const { uid } = req.params;
      if (req.user.uid !== uid && !req.isAdmin) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await supabaseAdmin.auth.admin.deleteUser(uid).catch((e: any) => console.error(e));
      await admin.firestore().collection("users").doc(uid).delete();
      invalidateUserTokenCache(uid);
      invalidateCache("users");
      invalidateStatsCache();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // GET /api/users (Admin-only list of users)
  router.get("/users", requireAdmin, async (req: any, res: any) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(200, parseInt(req.query.limit) || 100);
      const offset = (page - 1) * limit;
      const snapshot = await admin
        .firestore()
        .collection("users")
        .limit(limit)
        .offset(offset)
        .get();
      const data = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      res.json(data);
    } catch (err: any) {
      console.error("Error fetching all users:", err.message || err);
      res.status(500).json({ error: err.message || String(err) });
    }
  });

  // POST /api/avatar (Image upload + Sharp Processing)
  router.post(
    "/avatar",
    requireAuth,
    mutationLimiter,
    (req: any, res: any, next: any) => {
      communityUpload.single("file")(req, res, (err: any) => {
        if (err) {
          console.error("Avatar Multer error:", err);
          return res.status(500).json({ error: "Upload failed: " + err.message });
        }
        next();
      });
    },
    async (req: any, res: any) => {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      if (!validateUploadFileMetadata(req.file) || !isImageSafe(req.file.buffer)) {
        if (sendAlert) {
          sendAlert(
            "Unsafe Avatar Upload Attempt ⚠️",
            `**IP**: ${req.ip}\n**User**: ${req.user?.uid || "guest"}`,
            16753920,
            req.id,
          );
        }
        return res.status(400).json({ error: "Invalid file type. Only secure images allowed." });
      }
      try {
        const image = sharp(req.file.buffer);
        // Crop/resize avatar to 256x256 using sharp with cover fit and encode to webp
        const sanitizedBuffer = await image
          .resize(256, 256, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer();

        const mimeType = "image/webp";
        if (sanitizedBuffer.length > 5 * 1024 * 1024) {
          return res.status(400).json({
            error: "Output image size exceeds limit after re-encoding (Max 5MB)",
          });
        }

        let fileUrl;
        try {
          fileUrl = await uploadToSupabaseStorage(
            sanitizedBuffer,
            "avatar_" + Date.now() + ".webp",
            mimeType,
          );
          console.log("[Storage] Successfully uploaded user avatar to Supabase:", fileUrl);
        } catch (uploadErr: any) {
          console.warn(
            "[Storage] Supabase avatar upload failed, falling back to base64:",
            uploadErr.message || uploadErr,
          );
          const base64Data = sanitizedBuffer.toString("base64");
          fileUrl = `data:${mimeType};base64,${base64Data}`;
        }
        res.json({ url: fileUrl });
      } catch (err: any) {
        console.error("Avatar image processing failed:", err);
        res.status(500).json({ error: "Failed to process image" });
      }
    }
  );

  return router;
}
