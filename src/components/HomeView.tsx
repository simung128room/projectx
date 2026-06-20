import React from "react";
import { Gamepad2, ArrowRight, ShoppingCart, ShieldCheck, Server, Activity, Users, CreditCard } from "lucide-react";
import { ProductCard } from "./ProductCard";

export const HomeView = (props: any) => {
  const {
    products = [], 
    stats, 
    user, 
    siteSettings, 
    setActiveView, 
    onProductClick, 
  } = props;

  const recentProducts = [...products].sort((a: any,b: any) => b.id.localeCompare(a.id)).slice(0, 4);

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
            ต้อนรับสู่ VHOUSE SPACE
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-[#1e1e20] leading-tight">
            เช่าเว็บไซต์ราคาประหยัด <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600">
              มั่นคง และ ปลอดภัย
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-xl">
            VHOUSE ให้บริการเช่าเว็บไซต์หลากหลายรูปแบบ ระบบเสถียร ใช้งานง่าย เปิดใช้งานได้ทันที มีแอดมินดูแล
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-[#1e1e20]">
              <Gamepad2 className="w-5 h-5 text-blue-500" /> สินค้าแนะนำ
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">เลือกซื้อเว็บไซต์และแพลตฟอร์มที่กำลังมาแรง</p>
          </div>
          <button 
            onClick={() => setActiveView('categories')}
            className="text-xs sm:text-sm font-semibold text-blue-500 hover:text-blue-600 flex items-center gap-1 group transition-colors cursor-pointer"
          >
            ดูทั้งหมด <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {recentProducts.map((p: any) => (
             <ProductCard 
               key={p.id} 
               product={p} 
               onProductClick={onProductClick}
             />
          ))}
        </div>
        {recentProducts.length === 0 && (
          <div className="w-full text-center py-12 text-muted-foreground bg-white border border-[#e6e2da] rounded-2xl">
            ยังไม่มีสินค้า แอดมินกำลังเพิ่มสินค้าเข้าสู่ระบบ...
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
             <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#1e1e20]">เชื่อมั่นใน <span className="text-blue-500">VHOUSE</span></h2>
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
