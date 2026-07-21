const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const newFooter = `{/* Footer */}
          <footer className="mt-auto bg-[#0a0e1a] border-t border-[#1e293b] relative z-20">
            <div className="container mx-auto px-6 lg:px-8 py-16">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div>
                  <div className="flex items-center gap-2 mb-6 select-none">
                    <img src="https://i.postimg.cc/23R21z5h/file-0000000058c07207a33e20ff92690f16.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                    <span className="text-[20px] font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 tracking-tight">
                      QUIXYSHOP
                    </span>
                  </div>
                  <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
                    บริการจัดจำหน่ายไอดีและสินค้าเกมชั้นนำราคาประหยัด ปลอดภัย มั่นใจได้ 100% พร้อมบริการดูแลตลอด 24 ชั่วโมง
                  </p>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-white mb-6">เมนูหลัก</h3>
                  <ul className="space-y-3">
                    <li><button onClick={() => { setActiveView('home'); window.scrollTo(0,0); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">หน้าแรก</button></li>
                    <li><button onClick={() => { setActiveView('categories'); window.scrollTo(0,0); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">สินค้าทั้งหมด</button></li>
                    <li><button onClick={() => { setActiveView('wallet'); window.scrollTo(0,0); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">เติมเงิน</button></li>
                    <li><button onClick={() => { window.open('#', '_blank'); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">ซื้อเบอร์ SMS</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-white mb-6">ข้อมูลช่วยเหลือ</h3>
                  <ul className="space-y-3">
                    <li><button onClick={() => { setActiveView('terms'); window.scrollTo(0,0); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">ข้อตกลงและเงื่อนไข</button></li>
                    <li><button onClick={() => { setActiveView('privacy'); window.scrollTo(0,0); }} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors">นโยบายความเป็นส่วนตัว</button></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-white mb-6">ติดต่อเรา</h3>
                  <ul className="space-y-3">
                    <li><button onClick={() => window.open('https://line.me', '_blank')} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><span className="text-green-500 text-lg">💬</span> LINE Official</button></li>
                    <li><button onClick={() => window.open('https://facebook.com', '_blank')} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><span className="text-blue-500 text-lg">📘</span> Facebook</button></li>
                    <li><button onClick={() => window.open('https://discord.com', '_blank')} className="text-[14px] text-slate-400 hover:text-teal-400 transition-colors flex items-center gap-2"><span className="text-indigo-400 text-lg">👾</span> Discord</button></li>
                  </ul>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-slate-500 pt-8 border-t border-[#1e293b]">
                <p>© 2025 QUIXYSHOP.COM All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <button onClick={() => { setActiveView('terms'); window.scrollTo(0,0); }} className="hover:text-teal-400 transition-colors">ข้อกำหนด</button>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <button onClick={() => { setActiveView('privacy'); window.scrollTo(0,0); }} className="hover:text-teal-400 transition-colors">ความเป็นส่วนตัว</button>
                </div>
              </div>
            </div>
          </footer>`;

const footerStart = content.indexOf('{/* Footer */}');
const modalsStart = content.indexOf('{/* Modals */}');

if (footerStart !== -1 && modalsStart !== -1) {
  content = content.substring(0, footerStart) + newFooter + '\n          ' + content.substring(modalsStart);
  fs.writeFileSync(file, content);
  console.log('Replaced footer');
} else {
  console.log('Could not find footer bounds');
}
