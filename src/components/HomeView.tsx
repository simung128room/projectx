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
      <section className="relative w-full overflow-hidden py-20 sm:py-28 flex flex-col items-center justify-center p-6 text-center border-b border-[rgba(255,255,255,0.08)] bg-background">
        {/* Subtle, soft dark gradient highlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-border text-foreground border border-border px-3.5 py-1.5 rounded-md text-xs font-medium tracking-tight mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="font-mono text-xs tracking-wider">SYSTEM STATUS: ONLINE</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] mb-4 text-foreground leading-[1.1] font-sans">
            Sunoid.shop
            <span className="text-muted-foreground font-sans font-normal tracking-[-0.02em] text-2xl md:text-4xl mt-3 block">
              บริการเติมเกม สะดวก ปลอดภัย ด้วยระบบอัตโนมัติ
            </span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground mb-10 max-w-lg font-normal leading-relaxed">
            ให้บริการจัดจำหน่ายไอดีและสินค้าเกมชั้นนำราคาประหยัด ปลอดภัย มั่นใจได้ 100% พร้อมบริการดูแลตลอด 24 ชั่วโมง
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button 
              onClick={() => setActiveView('categories')}
              className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer border-none"
            >
              เลือกซื้อสินค้า <ShoppingCart className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if(!user) { setActiveView('login'); return; }
                setActiveView('wallet');
              }}
              className="bg-card hover:bg-secondary border border-border text-foreground px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer"
            >
              เติมเงิน <CreditCard className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={() => {
                if(!user) { setActiveView('login'); return; }
                setActiveView('redeem');
              }}
              className="bg-transparent hover:bg-border border border-dashed border-amber-500/20 text-amber-400 px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer"
            >
              รับโบนัสฟรี <Gift className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== Stats Grid ===== */}
      <section className="px-4 py-8 max-w-7xl mx-auto -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border p-5 rounded-lg flex flex-col gap-2 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded bg-border flex items-center justify-center text-foreground mb-1 border border-white/[0.04]">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-tight">สมาชิกทั้งหมด</span>
            <span className="text-xl font-semibold text-foreground tracking-tight font-mono">{stats?.totalUsers?.toLocaleString() || '1,000+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border p-5 rounded-lg flex flex-col gap-2 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded bg-border flex items-center justify-center text-foreground mb-1 border border-white/[0.04]">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-tight">สินค้าที่ขายแล้ว</span>
            <span className="text-xl font-semibold text-foreground tracking-tight font-mono">{stats?.totalOrders?.toLocaleString() || '2,500+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border p-5 rounded-lg flex flex-col gap-2 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded bg-border flex items-center justify-center text-foreground mb-1 border border-white/[0.04]">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-tight">จำนวนสินค้า</span>
            <span className="text-xl font-semibold text-foreground tracking-tight font-mono">{products?.length || '50+'}</span>
          </motion.div>

          <motion.div 
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="bg-card border border-border p-5 rounded-lg flex flex-col gap-2 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded bg-border flex items-center justify-center text-foreground mb-1 border border-white/[0.04]">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-medium tracking-tight">อัพไทม์ระบบ</span>
            <span className="text-xl font-semibold text-foreground tracking-tight font-mono">99.9%</span>
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
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-foreground text-primary-foreground border-[#EDEDED]'
                : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-white/[0.15]'
            }`}
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>ทั้งหมด ({products.length})</span>
          </button>

          {categories.map((c: any) => {
            const count = products.filter((p: any) => p.category === c.id || p.category === c.name || p.category === c.title).length;
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            return (
              <button
                key={c.id || c.name}
                onClick={() => setActiveCategory(c.id || c.name || c.title)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-foreground text-primary-foreground border-[#EDEDED]'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-white/[0.15]'
                }`}
              >
                <span>{c.title}</span>
                <span className={`text-[9.5px] px-1.5 py-0.5 rounded font-mono transition-colors ${isActive ? 'bg-black/10 text-primary-foreground' : 'bg-foreground/[0.05] text-muted-foreground'}`}>
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

      {/* ===== Features Banner ===== */}
      <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
        <motion.div 
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-lg p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300"
        >
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-foreground/[0.01] rounded-full blur-[80px] pointer-events-none" />
           <div className="relative z-10 max-w-xl text-left">
             <div className="w-10 h-10 bg-border text-foreground rounded-lg flex items-center justify-center mb-5 border border-white/[0.04]">
               <ShieldCheck className="w-5 h-5" />
             </div>
             <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-foreground tracking-[-0.02em]">เชื่อมั่นใน Sunoid.shop</h2>
             <p className="text-sm text-muted-foreground font-normal leading-relaxed">
               ทีมงานมีประสบการณ์ดูแลระบบมายาวนานกว่า 3 ปี พร้อมดูแลแก้ไขปัญหา หากพบเจอบัคหรือปัญหาการใช้งานแจ้งทีมงานได้ทันที บริการหลังการขายเป็นเลิศ
             </p>
           </div>
           <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
             <button 
                onClick={() => window.open(siteSettings?.facebook_link || '#', '_blank')}
                className="bg-card hover:bg-secondary border border-border text-foreground px-6 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all active:scale-[0.97] cursor-pointer"
              >
                ติดต่อทีมงาน <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </button>
           </div>
        </motion.div>
      </section>

    </div>
  );
};
