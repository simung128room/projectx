-- 1. แก้ตาราง purchases (ทำให้ระบบ /buy บันทึกข้อมูลได้ ไม่ติด 500)
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id TEXT; 
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS _version INTEGER NOT NULL DEFAULT 1;

-- 2. แก้ตาราง topups (ลดภาระ CPU ไม่ให้ Server ค้าง)
ALTER TABLE topups ADD COLUMN IF NOT EXISTS uid TEXT;

-- 3. แก้ตาราง used_keys (ลดภาระ CPU ไม่ให้ Server ค้าง)
ALTER TABLE used_keys ADD COLUMN IF NOT EXISTS uid TEXT;

-- 4. ย้ำอีกครั้งสำหรับตาราง products (ถ้าก่อนหน้านี้ยังไม่ได้รัน)
ALTER TABLE products ADD COLUMN IF NOT EXISTS _version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS custom_page_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS youtube_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_options TEXT[];
