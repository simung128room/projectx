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
    <div className="w-full text-foreground pb-24 lg:pb-0 overflow-x-hidden bg-[#faf8f5]">
      
      {/* ===== Hero Gradient Banner (Elegant Cream & Blue Gradient) ===== */}
      <section className="relative w-full overflow-hidden min-h-[40vh] sm:min-h-[50vh] flex flex-col items-center justify-center p-6 text-center border-b border-[#e6e2da] bg-gradient-to-b from-[#faf6ee] via-[#faf8f5] to-transparent">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#caa95e]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            ต้อนรับสู่ Sunoid.shop
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-[#1e1e20] leading-tight">
            ไอดีเกมราคาถูก คุณภาพสูง <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              ปลอดภัย และ จัดส่งทันที
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl">
            Sunoid.shop ให้บริการจัดจำหน่ายไอดีเกมชั้นนำราคาประหยัด มีสินค้าให้เลือกหลากหลาย ปลอดภัย มั่นใจได้ 100% พร้อมบริการดูแลตลอด 24 ชั่วโมง
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button 
              onClick={() => setActiveView('categories')}
              className="bg-[#3b82f6] hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
            >
              เลือกซื้อสินค้า <ShoppingCart className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                if(!user) { setActiveView('login'); return; }
                setActiveView('wallet');
              }}
              className="bg-white hover:bg-[#faf6ee] border border-[#e6e2da] text-[#1e1e20] px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              เติมเงินเข้าระบบ <CreditCard className="w-4 h-4 text-blue-500" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== Stats Grid ===== */}
      <section className="px-4 py-8 max-w-7xl mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e6e2da] p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-2">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">สมาชิกทั้งหมด</span>
            <span className="text-2xl font-bold text-[#1e1e20]">{stats?.totalUsers?.toLocaleString() || '1,000+'}</span>
          </div>
          <div className="bg-white border border-[#e6e2da] p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-2">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">สินค้าที่ขายแล้ว</span>
            <span className="text-2xl font-bold text-[#1e1e20]">{stats?.totalOrders?.toLocaleString() || '2,500+'}</span>
          </div>
          <div className="bg-white border border-[#e6e2da] p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-2">
              <Server className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">จำนวนสินค้า</span>
            <span className="text-2xl font-bold text-[#1e1e20]">{products?.length || '50+'}</span>
          </div>
          <div className="bg-white border border-[#e6e2da] p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 mb-2">
              <Activity className="w-4 h-4" />
            </div>
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">อัพไทม์ระบบ</span>
            <span className="text-2xl font-bold text-[#1e1e20]">99.9%</span>
          </div>
        </div>
      </section>

      {/* ===== Recent Products ===== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#1e1e20]">
              <Gamepad2 className="w-5 h-5 text-blue-500" /> สินค้าและบริการหลัก
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">แยกหมวดหมู่บริการเพื่อง่ายต่อการเลือกชมและสั่งซื้อง่ายขึ้น</p>
          </div>
          <button 
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(activeCategory);
              } else {
                setActiveView('categories');
              }
            }}
            className="text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1.5 group transition-colors cursor-pointer self-start md:self-end"
          >
            ดูสินค้าทั้งหมดในหมวดหมู่นี้ <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Tab Selector with Horizontal scroll layout */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setActiveCategory('all')}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                : 'bg-white text-muted-foreground border-[#e6e2da] hover:text-[#1e1e20]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ทั้งหมด ({products.length})</span>
          </button>

          {categories.map((c: any) => {
            const count = products.filter((p: any) => p.category === c.id || p.category === c.name || p.category === c.title).length;
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            return (
              <button
                key={c.id || c.name}
                onClick={() => setActiveCategory(c.id || c.name || c.title)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10'
                    : 'bg-white text-zinc-500 border-[#e6e2da] hover:text-[#1e1e20]'
                }`}
              >
                <span>{c.title}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${isActive ? 'bg-blue-500/15 text-white' : 'bg-[#f2efe9] text-muted-foreground'}`}>
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
            transition={{ duration: 0.25, ease: "easeOut" }}
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
          <div className="w-full text-center py-16 text-muted-foreground bg-white border border-[#e6e2da] rounded-2xl">
            ยังไม่มีสินค้าในหมวดหมู่นี้ในระบบอัพเดท...
          </div>
        )}
      </section>

      {/* ===== Features Banner ===== */}
      <section className="max-w-7xl mx-auto px-4 py-12 mb-12">
        <div className="bg-white border border-[#e6e2da] rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-blue-500/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
           <div className="relative z-10 max-w-xl text-left">
             <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-6">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#1e1e20]">เชื่อมั่นใน <span className="text-blue-500">Sunoid.shop</span></h2>
             <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
               ทีมงานมีประสบการณ์ดูแลระบบมายาวนานกว่า 3 ปี พร้อมดูแลแก้ไขปัญหา หากพบเจอบัคหรือปัญหาการใช้งานแจ้งทีมงานได้ทันที บริการหลังการขายเป็นเลิศ
             </p>
           </div>
           <div className="relative z-10 shrink-0 w-full md:w-auto flex justify-end">
             <button 
                onClick={() => window.open(siteSettings?.facebook_link || '#', '_blank')}
                className="bg-white hover:bg-[#faf6ee] border border-[#e6e2da] text-[#1e1e20] px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                ติดต่อทีมงาน <ArrowRight className="w-4 h-4 text-blue-500" />
              </button>
           </div>
        </div>
      </section>

    </div>
  );
};
