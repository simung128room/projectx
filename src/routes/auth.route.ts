import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { adminDb as admin, supabaseAdmin } from "../lib/admindb.js";

// Export the router factory
export function createAuthRouter({
  authLimiter,
  invalidateCache,
  invalidateStatsCache,
}: {
  authLimiter: any;
  invalidateCache: (cacheName: string) => void;
  invalidateStatsCache: () => void;
}) {
  const router = Router();

  router.post("/reset-password", authLimiter, async (req, res) => {
    const resetSchema = z.object({
      username: z.string().min(1, "กรุณากรอกชื่อผู้ใช้"),
      email: z.string().email("กรุณากรอกอีเมลที่ถูกต้อง"),
      newPassword: z.string().optional().nullable(),
      otp: z.string().length(6, "OTP ต้องมี 6 หลัก").regex(/^\d{6}$/, "OTP ต้องเป็นตัวเลข 6 หลัก").optional().nullable(),
    });

    const parseResult = resetSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.issues[0].message });
    }
    const { username, email, newPassword, otp } = parseResult.data;

    try {
      const generatedEmail = `${username.toLowerCase().replace(/\s+/g, "")}@apex-studio.com`;
      const usersSnapshot = await admin
        .firestore()
        .collection("users")
        .where("email", "==", generatedEmail)
        .where("recoveryEmail", "==", email)
        .limit(1)
        .get();

      if (usersSnapshot.empty) {
        return res.status(404).json({
          error: "ไม่พบผู้ใช้นี้ หรือข้อมูลไม่ถูกต้อง",
        });
      }

      const userDoc = usersSnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;

      if (!otp) {
        if (
          !newPassword ||
          newPassword.length < 8 ||
          !/[a-z]/.test(newPassword) ||
          !/[A-Z]/.test(newPassword) ||
          !/\d/.test(newPassword) ||
          !/[^a-zA-Z\d]/.test(newPassword)
        ) {
          return res.status(400).json({
            error:
              "รหัสผ่านใหม่ไม่ปลอดภัยเพียงพอ รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร, ประกอบด้วย อักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษอย่างละ 1 ตัว",
          });
        }

        const generatedOtp = crypto.randomInt(1e5, 999999).toString();
        const otpExpires = Date.now() + 5 * 60 * 1e3;

        await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .update({
            resetOtp: generatedOtp,
            resetOtpExpires: otpExpires,
            resetOtpAttempts: 0,
          });

        console.log(
          `[SECURITY] OTP Generated successfully for password reset: username=${username}, OTP=[REDACTED]`,
        );

        return res.json({
          otpRequired: true,
          message:
            "ดำเนินการสร้างรหัส OTP เรียบร้อยแล้ว (การแสดงผล OTP ทางอีเมลถูกจำกัดในโหมดทดสอบ กรุณาติดต่อผู้ดูแลระบบหากไม่ได้รับสิทธิ์)",
        });
      }

      const storedOtp = userData.resetOtp;
      const storedOtpExpires = userData.resetOtpExpires;
      const attempts = userData.resetOtpAttempts || 0;

      if (attempts >= 5) {
        return res.status(429).json({
          error: "คุณใส่ข้อมูลผิดเกินความพยายามสูงสุดแล้ว กรุณาขอ OTP ใหม่อีกครั้งเพื่อความปลอดภัย",
        });
      }

      if (
        !storedOtp ||
        !storedOtpExpires ||
        storedOtp !== otp ||
        storedOtpExpires < Date.now()
      ) {
        await admin
          .firestore()
          .collection("users")
          .doc(userId)
          .update({ resetOtpAttempts: attempts + 1 });

        return res.status(400).json({
          error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุการใช้งานแล้ว",
        });
      }

      if (
        !newPassword ||
        newPassword.length < 8 ||
        !/[a-z]/.test(newPassword) ||
        !/[A-Z]/.test(newPassword) ||
        !/\d/.test(newPassword) ||
        !/[^a-zA-Z\d]/.test(newPassword)
      ) {
        return res.status(400).json({
          error:
            "รหัสผ่านใหม่ไม่ปลอดภัยเพียงพอ รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร, ประกอบด้วย อักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษอย่างละ 1 ตัว",
        });
      }

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: newPassword,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .update({ resetOtp: null, resetOtpExpires: null });

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal error" });
    }
  });

  router.post("/signup", authLimiter, async (req, res) => {
    const signupSchema = z.object({
      email: z
        .string()
        .email("อีเมลไม่ถูกต้อง")
        .regex(/^[a-z0-9_.-]+@apex-studio\.com$/i, "รูปแบบอีเมลไม่ถูกต้องสำหรับระบบนี้"),
      password: z
        .string()
        .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
        .regex(/[a-z]/, "รหัสผ่านต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
        .regex(/[A-Z]/, "รหัสผ่านต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
        .regex(/\d/, "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว")
        .regex(/[^a-zA-Z\d]/, "รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว"),
      recoveryEmail: z.string().email("อีเมลสำหรับกู้คืนไม่ถูกต้อง").optional().nullable(),
    });

    try {
      const parseResult = signupSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: parseResult.error.issues[0].message });
      }
      const { email, password, recoveryEmail } = parseResult.data;

      const usersCheck = await admin
        .firestore()
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

      if (!usersCheck.empty) {
        return res.status(400).json({
          error: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานไปแล้ว",
        });
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      try {
        await admin
          .firestore()
          .collection("users")
          .doc(data.user.id)
          .set(
            {
              email,
              recoveryEmail: recoveryEmail || null,
              username: email.split("@")[0],
              balance: 0,
              role: "user",
              status: "active",
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        invalidateCache("users");
        invalidateStatsCache();
      } catch (err: any) {
        console.error("Failed to create user doc:", err.message || err);
        if (err.details) console.error("Error Details:", err.details);
      }
      return res.json({ success: true, user: data.user });
    } catch (e) {
      return res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
