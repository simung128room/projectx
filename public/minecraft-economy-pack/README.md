# Anarchy Economy Pack

ระบบ Economy สำหรับ Minecraft แนวไร้กฎ พร้อมเมนูไอคอน ใช้งานง่าย และ resource pack custom GUI icons.

## การใช้งานด่วน
1. คัดลอก `datapack` เข้า world/datapacks/anarchy_economy
2. คัดลอก `resourcepack` ไปให้ผู้เล่นติดตั้ง
3. เข้าเกมแล้วใช้ `/reload`
4. เปิดเมนูด้วย `/trigger menu`
5. ถ้าต้องการคำสั่ง `/menu` จริง ให้ตั้ง alias บน Paper/Spigot ให้รัน `trigger menu` หรือผูกกับ plugin command bridge

## ฟีเจอร์
- Wallet + Bank ผ่าน scoreboard
- Custom clickable GUI menu ผ่าน tellraw พร้อมไอคอน/สี
- Black market shop 12 รายการ
- Jobs reward functions
- Daily reward
- Bounty/Casino scaffold
- Texture/resource pack พร้อมไฟล์ไอคอน 130 รายการสำหรับต่อ CustomModelData

## หมายเหตุ
Datapack vanilla ไม่สามารถเพิ่มคำสั่ง slash ใหม่ชื่อ `/menu` ได้โดยตรง จึงใช้ `/trigger menu`; alias ฝั่งเซิร์ฟเวอร์สามารถทำให้ผู้เล่นพิมพ์ `/menu` ได้
