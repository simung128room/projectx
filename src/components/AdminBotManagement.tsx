import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Terminal, Save, Download, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminBotManagement: React.FC = () => {
  const [config, setConfig] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/bot/config');
      setConfig(res.data.config);
    } catch(e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.post('/api/bot/save', { config });
      Swal.fire({ title: 'บันทึกโค้ดบอทสำเร็จ!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch(e: any) {
      Swal.fire('ข้อผิดพลาด', e.response?.data?.error || String(e), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-[#1a7fe6]" />
            แจกบอทดักซอง Telegram (UltraRace)
          </h2>
          <p className="text-zinc-400 mt-2 flex items-center gap-4">
             <span>จัดการและดาวน์โหลดสคริปต์ Python สำหรับรันบอทดักซองบนคอมพิวเตอร์ของคุณเอง</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <a
                href="/bot-code"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#1a7fe6]/10 text-[#1a7fe6] px-5 py-3 rounded-2xl font-bold hover:bg-[#1a7fe6]/20 border border-[#1a7fe6]/30 flex items-center gap-2 transition-all shadow-md"
            >
                <Download className="w-5 h-5" /> ดาวน์โหลด bot.py
            </a>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#1E90FF] text-white hover:bg-[#166bcc] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-[#1E90FF]/20"
            >
                <Save className="w-5 h-5" /> {isSaving ? "Saving..." : "บันทึกสคริปต์"}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Help Panel */}
        <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col space-y-4">
            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                วิธีใช้งาน (How to run)
            </h3>
            <div className="text-zinc-300 text-sm space-y-3 leading-relaxed">
                <p>สคริปต์นี้เป็นบอทสำหรับแอพพลิเคชั่น Telegram เขียนด้วยภาษา Python</p>
                <p>1. <strong>ติดตั้ง Python:</strong> ตรวจสอบว่าในเครื่องคอมพิวเตอร์ของคุณมี Python 3 ขึ้นไป</p>
                <p>2. <strong>ติดตั้งไลบรารีที่จำเป็น:</strong> เปิด Terminal / Command Prompt แล้วพิมพ์คำสั่ง:
                   <code className="block bg-black p-2 mt-2 rounded border border-white/10 text-emerald-400">pip install telethon httpx aiohttp cloudscraper pillow pyzbar opencv-python colorama</code>
                </p>
                <p>3. <strong>ตั้งค่าตัวแปร:</strong> แก้ไขตัวแปรในส่วน `# ========= CONFIG =========` ในโค้ดหรือใช้ Environment Variables (เช่น <code className="text-emerald-400">TG_API_ID</code>, <code className="text-emerald-400">TG_API_HASH</code>, เบอร์โทรศัพท์, Webhook Discord) ก่อนรัน</p>
                <p>4. <strong>รันบอท:</strong> ใช้คำสั่ง:
                   <code className="block bg-black p-2 mt-2 rounded border border-white/10 text-emerald-400">python bot.py</code>
                </p>
                <p className="text-amber-400 mt-4 text-xs font-medium">⚠️ สคริปต์นี้รันในเครื่องส่วนตัวหรือเซิร์ฟเวอร์แยกต่างหาก (VPS) และจะขอรหัส OTP เข้าสู่ระบบ Telegram ในครั้งแรก (สร้าง session 파일)</p>
            </div>
        </div>

        {/* Config Editor */}
        <div className="lg:col-span-2 bg-[#0a0d12] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#1E90FF]" />
                ตัวจัดการสคริปต์ bot.py
            </h3>
            <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 min-h-[500px] bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#1E90FF]/50 scrollbar-thin scrollbar-thumb-zinc-600"
            />
        </div>
      </div>
    </div>
  );
};
