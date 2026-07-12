import { Router } from "express";
import { z } from "zod";
import crypto from "node:crypto";
import { adminDb as admin, supabaseAdmin } from "../lib/admindb.js";
import axios from "axios";
import nodemailer from "nodemailer";

const safeCompare = (a: string, b: string) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

const sendResetOTP = async (email: string, otp: string) => {
  if (!process.env.SMTP_HOST) {
    console.warn("[WARNING] SMTP_HOST is not set. OTP email will not be sent.");
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@nxyshop.com",
    to: email,
    subject: "Password Reset OTP - nxyshop",
    text: `Your OTP for password reset is ${otp}. It expires in 15 minutes.`,
  });
};

const verifyTurnstile = async (req: any, res: any, next: any) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return next();
  }

  const token = req.body.turnstileToken;
  if (!token) {
    return res.status(400).json({ error: "Missing Turnstile token" });
  }

  if (token === "bypass") {
    if (process.env.NODE_ENV !== "production") {
      return next();
    }
    return res.status(400).json({ error: "Bypass not allowed in production" });
  }

  try {
    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret,
        response: token,
        remoteip: req.ip || "",
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.success) {
      return next();
    } else {
      return res.status(400).json({ error: "Invalid CAPTCHA" });
    }
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return res.status(500).json({ error: "CAPTCHA verification failed" });
  }
};

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

  router.post("/reset-password", authLimiter, verifyTurnstile, async (req, res) => {
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
          `[SECURITY] OTP Generated successfully for password reset: username=${username} (In production, this should be emailed instead)`
        );

        try {
          await sendResetOTP(userData.recoveryEmail || email, generatedOtp);
        } catch (emailErr: any) {
          console.error("Failed to send OTP email:", emailErr);
          return res.status(500).json({ error: "ไม่สามารถส่งอีเมล OTP ได้ กรุณาลองใหม่อีกครั้ง" });
        }

        return res.json({
          otpRequired: true,
          message:
            "ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบอีเมล (รวมถึงในโฟลเดอร์จดหมายขยะ)",
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
        !safeCompare(storedOtp, otp) ||
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
        .update({ resetOtp: null, resetOtpExpires: null, resetOtpAttempts: 0 });

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Internal error" });
    }
  });

  router.post("/signup", authLimiter, verifyTurnstile, async (req, res) => {
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
    } catch (e: any) {
      return res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
