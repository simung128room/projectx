const fs = require('fs');
const file = 'src/components/HomeView.tsx';
let content = fs.readFileSync(file, 'utf8');

const heroSectionNew = `      {/* ===== Hero section ===== */}
      <section className="relative w-full overflow-hidden py-16 sm:py-24 flex flex-col lg:flex-row items-center justify-center px-4 sm:px-6 lg:px-20 min-h-[550px] bg-gradient-to-b from-[#140b2e] to-[#0a0e1a] text-left">
        {/* Radial glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-6">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-[#1a1f35]/80 text-[#94a3b8] border border-teal-500/30 px-4 py-1.5 rounded-full text-xs font-medium tracking-wide mb-6 flex items-center gap-2 shadow-[0_0_15px_rgba(0,212,170,0.1)] backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              <span>ร้านค้าเปิดให้บริการ 24 ชม.</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.02em] mb-4 font-display leading-[1.2]">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-sm">บริการขายสินค้าราคาดี</span>
            </h1>
            
            <p className="text-[15px] sm:text-base text-slate-300 mb-8 max-w-lg font-normal leading-relaxed opacity-90">
              ร้านแอปพรีเมียม สั่งซื้ออัตโนมัติ รวดเร็วทันใจ ปลอดภัย 100% พร้อมทีมงานซัพพอร์ตตลอดเวลา
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8">
              <div className="bg-[#1a1f35] border border-[#334155] px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-200 flex items-center gap-2">
                <span className="text-lg">⚡</span> ส่งอัตโนมัติ
              </div>
              <div className="bg-[#1a1f35] border border-[#334155] px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-200 flex items-center gap-2">
                <span className="text-lg">🔒</span> ปลอดภัย
              </div>
              <div className="bg-[#1a1f35] border border-[#334155] px-3 py-1.5 rounded-lg text-[13px] font-medium text-slate-200 flex items-center gap-2">
                <span className="text-lg">💰</span> ราคาถูก
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button 
                onClick={() => setActiveView('categories')}
                className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white px-8 py-3 rounded-xl font-medium text-[15px] shadow-[0_0_20px_rgba(0,212,170,0.3)] transition-all transform hover:scale-105 active:scale-95 border-none cursor-pointer flex items-center gap-2"
              >
                ดูสินค้าทั้งหมด <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => window.open('https://line.me', '_blank')}
                className="bg-[#1a1f35]/50 hover:bg-[#1e293b] border border-[#334155] hover:border-teal-500/50 text-slate-200 px-8 py-3 rounded-xl font-medium text-[15px] transition-all active:scale-95 cursor-pointer backdrop-blur-sm"
              >
                ติดต่อเรา
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center items-center relative animate-in fade-in slide-in-from-right-8 duration-700 delay-150">
            {/* Mascot circular glowing rings */}
            <div className="relative flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] bg-teal-500/20 rounded-full blur-[15px]" />
              <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-blue-500/10 rounded-full blur-[25px]" />
              <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute w-[320px] h-[320px] sm:w-[440px] sm:h-[440px] bg-purple-500/10 rounded-full blur-[40px]" />
              
              {/* Actual Mascot image (or generic placeholder icon simulating it) */}
              <div className="relative z-10 w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full overflow-hidden border-4 border-[#1e293b] shadow-2xl flex items-center justify-center bg-[#1a1f35]">
                <img src="https://i.postimg.cc/23R21z5h/file-0000000058c07207a33e20ff92690f16.png" alt="Mascot" className="w-full h-full object-cover scale-110" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Grid ===== */}
      <section className="px-4 py-8 max-w-6xl mx-auto -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 212, 170, 0.2)", borderColor: "#00d4aa" }}
            className="bg-[#1a1f35] border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300"
          >
            <div className="text-3xl mb-2">👥</div>
            <div className="font-bold text-2xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">{(stats?.totalUsers || 284).toLocaleString()}</div>
            <div className="text-[13px] text-slate-400 font-medium">สมาชิกรวม</div>
            <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">▲ +12 วันนี้</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 212, 170, 0.2)", borderColor: "#00d4aa" }}
            className="bg-[#1a1f35] border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300"
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="font-bold text-2xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">{(stats?.totalProducts || 14).toLocaleString()}</div>
            <div className="text-[13px] text-slate-400 font-medium">สินค้าทั้งหมด</div>
            <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">▲ +2 วันนี้</div>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 212, 170, 0.2)", borderColor: "#00d4aa" }}
            className="bg-[#1a1f35] border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300"
          >
            <div className="text-3xl mb-2">⭐</div>
            <div className="font-bold text-2xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">{(stats?.totalSales || 1892).toLocaleString()}</div>
            <div className="text-[13px] text-slate-400 font-medium">ขายแล้วทั้งหมด</div>
            <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">▲ +45 วันนี้</div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 212, 170, 0.2)", borderColor: "#00d4aa" }}
            className="bg-[#1a1f35] border border-[#1e293b] rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300"
          >
            <div className="text-3xl mb-2">🎮</div>
            <div className="font-bold text-2xl font-mono bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">24/7</div>
            <div className="text-[13px] text-slate-400 font-medium">ระบบทำงานอัตโนมัติ</div>
            <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-wider">ออนไลน์ 100%</div>
          </motion.div>
        </div>
      </section>`;

const heroStart = content.indexOf('{/* ===== Hero section ===== */}');
const recentStart = content.indexOf('{/* ===== Recent Products ===== */}');

if (heroStart !== -1 && recentStart !== -1) {
  content = content.substring(0, heroStart) + heroSectionNew + '\n\n      ' + content.substring(recentStart);
  fs.writeFileSync(file, content);
  console.log('Replaced Hero Section in HomeView');
} else {
  console.log('Could not find hero or recent bounds');
}
