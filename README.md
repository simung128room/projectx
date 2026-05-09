# Discord Clone (Community System)

ระบบจัดการคอมมูนิตี้แบบดิสคอร์ด (Discord Clone) ที่มาครบทุกฟังก์ชันทั้ง Categories, Channels, Roles และ Permission พื้นฐาน

## ฟีเจอร์ที่รองรับ (Features)

1. **ระบบหมวดหมู่ (Category Management)**
   - สร้าง แก้ไข และลบหมวดหมู่
   - ลบหมวดหมู่พร้อมลบช่องภายในแบบ Cascade ทันที

2. **ระบบจัดการช่อง (Channel Management)**
   - สร้าง แก้ไข เปลี่ยนไอคอน และลบช่อง
   - ไอคอนหลากหลายให้เลือก (หน้าบอร์ด, เสียง, แชท, เกม, โล่ระบบ, ดาวประกาศ ฯลฯ)
   - การจัดการสิทธิ์การมองเห็นระดับช่อง (ตั้งค่ายศ \`allowedRanks\`) ทำให้รองรับ Private Channel ได้อย่างแท้จริง

3. **ระบบบทบาท/ยศ (Role Management & Permission)**
   - สิทธิ์พื้นฐาน \`user\` (เฉพาะหน้ายืนยันตัวตน), \`basic\` และ \`premium\`
   - แต่ละหมวดหมู่/ช่อง สามารถล็อกได้เลยว่าให้ใครเข้าได้บ้าง ทำให้แอดมินจำกัดสิทธิ์ได้ตามใจ

## การส่งไฟล์และรูปภาพ
- รองรับการลากวางไฟล์ หรืออัปโหลดรูป
- ระบบอัปโหลดปลอดภัย จำกัดขนาด 10MB พร้อมแสดงรูปแนบในแชทสวยงาม
- สามารถโหลดไฟล์ได้หากไม่ใช่ภาพ (เช่น PDF/DOC)

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS, Framer Motion
- UI Icons: Lucide React
- Notifications: SweetAlert2
- Backend: Express (TypeScript)
- Authentication: ระบบจำลอง Token / Admin Session พื้นฐาน

## วิธีพัฒนาต่อยอด (Development)
1. ติดตั้งแพ็กเกจ: \`npm install\`
2. รันเซิร์ฟเวอร์แบบ Development: \`npm run dev\`
3. เพื่อนำขึ้นโปรดักชัน รัน \`npm run build\` และ \`npm run start\`

เซิร์ฟเวอร์จะรันที่พอร์ต \`3000\` โดยมี Express Serve ทำการดูแลไฟล์ Static ด้วยเมื่อเป็น Production
