import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Gamepad2, ArrowRight, ShoppingCart, ShieldCheck, Server, Activity, Users, CreditCard, Package } from "lucide-react";
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
      
      {/* ===== Hero Gradient Banner ===== */}
      <section className="relative w-full overflow-hidden min-h-[40vh] sm:min-h-[50vh] flex flex-col items-center justify-center p-6 text-center border-b border-[#1f293d] bg-gradient-to-b from-background via-background/90 to-transparent">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/10 to-transparent opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 flex items-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="font-logo text-sm font-bold tracking-wider">ต้อนรับสู่ XENOBUX STORE</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white leading-tight font-logo uppercase">
            XENOBUX STORE <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-[#00d2ff] font-sans font-bold normal-case tracking-normal text-3xl md:text-5xl mt-2 block">
              บริการ เติมเกม สะดวก ปลอดภัย
            </span>
          </h1>
          <p className="text-sm sm:text-lg text-zinc-400 mb-10 max-w-xl font-medium">
            ให้บริการจัดจำหน่ายไอดีเกมชั้นนำราคาประหยัด มีสินค้าให้เลือกหลากหลาย ปลอดภัย มั่นใจได้ 100% พร้อมบริการดูแลตลอด 24 ชั่วโมง
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => setActiveView('categories')}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] active:scale-95 cursor-pointer"
            >
              เลือกซื้อสินค้า <ShoppingCart className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if(!user) { setActiveView('login'); return; }
                setActiveView('wallet');
              }}
              className="bg-[#161a26] hover:bg-[#1a1f2e] border border-[#1f293d] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              เติมเงินเข้าระบบ <CreditCard className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== Stats Grid ===== */}
      <section className="px-4 py-8 max-w-7xl mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#11131a] border border-[#1f293d] p-5 rounded-2xl flex flex-col gap-2 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_32px_-12px_rgba(59,130,246,0.3)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2 border border-blue-500/20">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">สมาชิกทั้งหมด</span>
            <span className="text-2xl font-black text-white tracking-tight">{stats?.totalUsers?.toLocaleString() || '1,000+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#11131a] border border-[#1f293d] p-5 rounded-2xl flex flex-col gap-2 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_32px_-12px_rgba(16,185,129,0.3)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2 border border-emerald-500/20">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">สินค้าที่ขายแล้ว</span>
            <span className="text-2xl font-black text-white tracking-tight">{stats?.totalOrders?.toLocaleString() || '2,500+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#11131a] border border-[#1f293d] p-5 rounded-2xl flex flex-col gap-2 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_32px_-12px_rgba(139,92,246,0.3)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2 border border-purple-500/20">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">จำนวนสินค้า</span>
            <span className="text-2xl font-black text-white tracking-tight">{products?.length || '50+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-[#11131a] border border-[#1f293d] p-5 rounded-2xl flex flex-col gap-2 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_32px_-12px_rgba(245,158,11,0.3)] transition-all duration-300"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2 border border-amber-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-zinc-500 text-[11px] font-black uppercase tracking-widest">อัพไทม์ระบบ</span>
            <span className="text-2xl font-black text-white tracking-tight">99.9%</span>
          </motion.div>
        </div>
      </section>

      {/* ===== Recent Products ===== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 text-white tracking-tight">
              <Gamepad2 className="w-6 h-6 text-blue-500" /> สินค้าและบริการหลัก
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 font-bold mt-1">แยกหมวดหมู่บริการเพื่อง่ายต่อการเลือกชมและสั่งซื้อง่ายขึ้น</p>
          </div>
          <button 
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(activeCategory);
              } else {
                setActiveView('categories');
              }
            }}
            className="text-xs sm:text-sm font-extrabold text-blue-500 hover:text-blue-400 flex items-center gap-1.5 group transition-colors cursor-pointer self-start md:self-end leading-none"
          >
            ดูสินค้าทั้งหมดในหมวดหมู่นี้ <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* Categories Tab Selector with Horizontal scroll layout */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-8 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-500'
                : 'bg-[#11131a] text-zinc-400 border-[#1f293d] hover:border-[#2d3748] hover:text-white'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>ทั้งหมด ({products.length})</span>
          </button>

          {categories.map((c: any) => {
            const count = products.filter((p: any) => p.category === c.id || p.category === c.name || p.category === c.title).length;
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            return (
              <button
                key={c.id || c.name}
                onClick={() => setActiveCategory(c.id || c.name || c.title)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:bg-blue-500'
                    : 'bg-[#11131a] text-zinc-400 border-[#1f293d] hover:border-[#2d3748] hover:text-white'
                }`}
              >
                <span>{c.title}</span>
                <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-black font-mono transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-[#1f293d] text-zinc-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
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
          <div className="w-full text-center py-20 text-zinc-405 bg-white border border-dashed border-zinc-200 rounded-3xl font-bold text-sm">
            ยังไม่มีสินค้าในหมวดหมู่นี้ในระบบอัพเดท...
          </div>
        )}
      </section>

      {/* ===== Features Banner ===== */}
      <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
        <motion.div 
          whileHover={{ y: -4, ...({} as any) }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white border border-zinc-150 rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_8px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_48px_rgba(59,130,246,0.08)] transition-all duration-300"
        >
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/5 via-teal-500/0 to-transparent rounded-full blur-[80px] pointer-events-none" />
           <div className="relative z-10 max-w-xl text-left">
             <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/10">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-black mb-4 text-[#1a1a1c] tracking-tight">เชื่อมั่นใน <span className="text-blue-600">Sunoid.shop</span></h2>
             <p className="text-xs sm:text-sm text-zinc-400 font-bold leading-relaxed">
               ทีมงานมีประสบการณ์ดูแลระบบมายาวนานกว่า 3 ปี พร้อมดูแลแก้ไขปัญหา หากพบเจอบัคหรือปัญหาการใช้งานแจ้งทีมงานได้ทันที บริการหลังการขายเป็นเลิศ
             </p>
           </div>
           <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
             <button 
                onClick={() => window.open(siteSettings?.facebook_link || '#', '_blank')}
                className="bg-white hover:bg-slate-50 border border-zinc-200 text-zinc-800 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:border-zinc-300 cursor-pointer text-sm"
              >
                ติดต่อทีมงาน <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>
           </div>
        </motion.div>
      </section>

    </div>
  );
};
