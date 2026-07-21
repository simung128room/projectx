import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, ArrowRight, ShoppingCart, ShieldCheck, Server, Activity, Users, CreditCard, Package, Gift } from "lucide-react";
import { ProductCard } from "./ProductCard";

export const HomeView = (props: any) => {
  const {
    products = [], 
    categories = [],
    stats, 
    user, 
    siteSettings, 
    setActiveView, 
    onProductClick, 
    onSelectCategory,
  } = props;

  const [activeCategory, setActiveCategory] = useState('all');

  const categoryInfo = categories.find((c: any) => c.id === activeCategory || c.name === activeCategory || c.title === activeCategory);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter((p: any) => 
        p.category === activeCategory || 
        p.category === categoryInfo?.id || 
        p.category === categoryInfo?.name || 
        p.category === categoryInfo?.title
      );

  // Sort by latest in-stock first
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const aStock = Number(a.stock) > 0 ? 1 : 0;
    const bStock = Number(b.stock) > 0 ? 1 : 0;
    if (bStock !== aStock) return bStock - aStock;
    return b.id.localeCompare(a.id);
  });

  const visibleProducts = sortedProducts.slice(0, 8);

  return (
    <div className="w-full text-foreground pb-24 lg:pb-0 overflow-x-hidden bg-background">
      
            {/* ===== Hero section ===== */}
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
                <img src="https://img1.pic.in.th/images/1000045512.png" alt="Mascot" className="w-full h-full object-cover scale-110" />
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
      </section>

      {/* ===== Recent Products ===== */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2 text-foreground tracking-[-0.02em]">
              <Gamepad2 className="w-5 h-5 text-muted-foreground" /> สินค้าและบริการหลัก
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">บริการคีย์และไอดีเกมแบบจัดส่งด่วนรวดเร็วทันใจ</p>
          </div>
          <button 
            onClick={() => {
              if (onSelectCategory && activeCategory !== 'all') {
                onSelectCategory(activeCategory);
              } else {
                setActiveView('categories');
              }
            }}
            className="text-xs sm:text-sm font-medium text-foreground hover:text-[#FFFFFF] flex items-center gap-1.5 group transition-colors cursor-pointer self-start md:self-end leading-none"
          >
            ดูสินค้าทั้งหมดในหมวดหมู่นี้ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-8 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all border cursor-pointer shadow-sm ${
              activeCategory === 'all'
                ? 'bg-teal-500/10 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(0,212,170,0.15)]'
                : 'bg-[#1a1f35] text-slate-400 border-[#1e293b] hover:border-teal-500/50 hover:text-slate-200'
            }`}
          >
            <span>✨</span>
            <span>ทั้งหมด ({products.length})</span>
          </button>
          {categories.map((c: any) => {
            const count = products.filter((p: any) => p.category === c.id || p.category === c.name || p.category === c.title).length;
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            // Simple hash for emoji if no obvious match
            const emojis = ['💎', '🎮', '💳', '🎁', '🚀', '🔥', '👑', '🌟'];
            const hash = String(c.title).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
            const defaultEmoji = emojis[Math.abs(hash) % emojis.length];
            
            return (
              <button
                key={c.id || c.name}
                onClick={() => setActiveCategory(c.id || c.name || c.title)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold whitespace-nowrap transition-all border cursor-pointer shadow-sm ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(0,212,170,0.15)]'
                    : 'bg-[#1a1f35] text-slate-400 border-[#1e293b] hover:border-teal-500/50 hover:text-slate-200'
                }`}
              >
                <span>{defaultEmoji}</span>
                <span>{c.title}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono transition-colors ${isActive ? 'bg-teal-500/20 text-teal-300' : 'bg-[#111827] text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {visibleProducts.map((p: any, idx: number) => (
               <ProductCard 
                 key={p.id} 
                 product={p} 
                 onProductClick={onProductClick}
                 index={idx}
               />
            ))}
          </motion.div>
        </AnimatePresence>

        {visibleProducts.length === 0 && (
          <div className="w-full text-center py-20 text-muted-foreground bg-card border border-dashed border-border rounded-lg font-medium text-sm">
            ยังไม่มีสินค้าในหมวดหมู่นี้ในระบบอัพเดท...
          </div>
        )}
      </section>

            {/* ===== Promo Banner ===== */}
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
