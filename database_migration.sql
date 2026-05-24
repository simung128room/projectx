-- 1. แก้ตาราง purchases (ทำให้ระบบ /buy บันทึกข้อมูลได้ ไม่ติด 500)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id TEXT; 
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS _version INTEGER NOT NULL DEFAULT 1;

-- 2. แก้ตาราง topups (ลดภาระ CPU ไม่ให้ Server ค้าง)
ALTER TABLE topups ADD COLUMN IF NOT EXISTS uid TEXT;

-- 3. แก้ตาราง used_keys (ลดภาระ CPU ไม่ให้ Server ค้าง)
ALTER TABLE used_keys ADD COLUMN IF NOT EXISTS uid TEXT;

-- 4. ย้ำอีกครั้งสำหรับตาราง products (ถ้าก่อนหน้านี้ยังไม่ได้รัน)
ALTER TABLE products ADD COLUMN IF NOT EXISTS _version INTEGER NOT NULL DEFAULT 1;
