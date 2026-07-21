const fs = require('fs');
const file = 'src/components/HomeView.tsx';
let content = fs.readFileSync(file, 'utf8');

const newBottom = `      {/* ===== Promo Banner ===== */}
      <section className="max-w-6xl mx-auto px-4 py-8 relative z-20">
        <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 border border-purple-500/30 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_0_30px_rgba(124,58,237,0.15)]">
           <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none" />
           <div className="relative z-10 max-w-xl text-left">
             <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white font-display">พร้อมลุยเกมไปกับเราหรือยัง?</h2>
             <p className="text-base text-purple-200 mb-8 max-w-md">
               เริ่มต้นช้อปสินค้าคุณภาพสูง ราคาถูก ได้แล้ววันนี้ รับประกันความพึงพอใจตลอดการใช้งาน
             </p>
             <button 
               onClick={() => setActiveView('login')}
               className="bg-white text-purple-900 hover:bg-slate-100 px-8 py-3.5 rounded-xl font-bold text-[15px] transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
             >
               สมัครสมาชิกเลย
             </button>
           </div>
           <div className="relative z-10 text-[100px] md:text-[140px] drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] animate-bounce" style={{ animationDuration: '3s' }}>
             🚀
           </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 font-display">คำถามที่พบบ่อย</h2>
          <p className="text-slate-400">ข้อสงสัยที่พบบ่อยจากผู้ใช้งาน</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1f35] border border-[#1e293b] rounded-xl p-5 hover:border-teal-500/30 transition-colors">
            <h3 className="font-bold text-white mb-2 text-[15px]">Q: สั่งซื้อแล้วได้รับสินค้าตอนไหน?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">A: ระบบเราเป็นแบบอัตโนมัติ คุณจะได้รับสินค้าทันทีที่ชำระเงินเสร็จสิ้น ตลอด 24 ชั่วโมง</p>
          </div>
          <div className="bg-[#1a1f35] border border-[#1e293b] rounded-xl p-5 hover:border-teal-500/30 transition-colors">
            <h3 className="font-bold text-white mb-2 text-[15px]">Q: ชำระเงินผ่านช่องทางไหนได้บ้าง?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">A: เรารองรับการชำระเงินผ่าน TrueMoney Wallet และโอนเงินผ่านบัญชีธนาคาร (QR Code)</p>
          </div>
          <div className="bg-[#1a1f35] border border-[#1e293b] rounded-xl p-5 hover:border-teal-500/30 transition-colors">
            <h3 className="font-bold text-white mb-2 text-[15px]">Q: สินค้ามีปัญหา มีรับประกันไหม?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">A: สินค้าทุกชิ้นมีการรับประกันตามเงื่อนไขที่ระบุ สามารถติดต่อทีมงานเพื่อขอความช่วยเหลือได้ตลอด</p>
          </div>
          <div className="bg-[#1a1f35] border border-[#1e293b] rounded-xl p-5 hover:border-teal-500/30 transition-colors">
            <h3 className="font-bold text-white mb-2 text-[15px]">Q: สามารถเติมเงินเก็บไว้ได้ไหม?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">A: ได้ครับ สามารถเติมเงินเข้าสู่กระเป๋าเงิน (Wallet) ในระบบเพื่อใช้สั่งซื้อสินค้าได้อย่างรวดเร็ว</p>
          </div>
        </div>
      </section>

      {/* ===== Contact Bar ===== */}
      <section className="max-w-6xl mx-auto px-4 py-8 mb-12">
        <div className="bg-gradient-to-b from-[#1a1f35] to-[#0a0e1a] border border-[#1e293b] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center text-2xl">
              📞
            </div>
            <div>
              <h3 className="font-bold text-white">ต้องการความช่วยเหลือ?</h3>
              <p className="text-sm text-slate-400">ติดต่อทีมงานซัพพอร์ตได้ตลอด 24 ชั่วโมง</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.open('https://line.me', '_blank')} className="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-[#06c755] hover:text-white text-slate-300 flex items-center justify-center transition-colors text-xl shadow-lg">
              💬
            </button>
            <button onClick={() => window.open('https://facebook.com', '_blank')} className="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-[#1877f2] hover:text-white text-slate-300 flex items-center justify-center transition-colors text-xl shadow-lg">
              📘
            </button>
            <button onClick={() => window.open('https://discord.com', '_blank')} className="w-10 h-10 rounded-full bg-[#1e293b] hover:bg-[#5865f2] hover:text-white text-slate-300 flex items-center justify-center transition-colors text-xl shadow-lg">
              👾
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
`;

const featuresStart = content.indexOf('{/* ===== Features Banner ===== */}');

if (featuresStart !== -1) {
  content = content.substring(0, featuresStart) + newBottom;
  fs.writeFileSync(file, content);
  console.log('Replaced bottom of HomeView');
} else {
  console.log('Could not find features banner bounds');
}
