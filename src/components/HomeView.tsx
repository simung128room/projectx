import React, { useState, useEffect, useMemo } from "react";
import { Product, SiteStats, Category } from "../types";
import { generateGradient } from "../utils";
import { ShoppingCart, Package, Wallet, Star, Filter, LogIn, Users } from "lucide-react";

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  stats: SiteStats;
  user?: any;
  siteSettings?: any;
  purchaseHistory?: any[];
  setActiveView: (view: any) => void;
  onProductClick: (id: string) => void;
  onSelectCategory: (categoryId: string) => void;
}

function ROVCard({ label, color = "#555555", title }: { label: string; color?: string; title?: string }) {
  return (
    <div className="h-full min-h-[100px] p-2.5 rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #050505 0%, #1a1a1a 50%, #050505 100%)" }}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 70% 30%, ${color}22 0%, transparent 60%)`,
        }}
      />
      <div className="text-[10px] text-white/50 mb-0.5 z-10 font-sans tracking-widest text-center leading-tight">WELCOME TO STORE</div>
      <div className="text-[13px] font-black tracking-widest z-10 text-center uppercase"
           style={{ color: "#ffffff", textShadow: `0 0 12px ${color}88` }}>
        {title ? title : "APEX PRODUCT"}
      </div>
      <div className="text-[9px] text-white/50 z-10 mt-0.5">สินค้าคุ้มค่าราคาประหยัด!!</div>
      <div className="mt-1.5 text-black font-black text-[11px] rounded-md px-2 py-[1px] z-10" style={{ background: "#ffffff" }}>
        {label}
      </div>
    </div>
  );
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  stats,
  user,
  siteSettings,
  purchaseHistory,
  setActiveView,
  onProductClick,
  onSelectCategory
}) => {
  const safeProducts = useMemo(() => Array.isArray(products) ? products : [], [products]);
  
  const totalSales = siteSettings?.stats_sales_override !== undefined && siteSettings?.stats_sales_override !== null 
      ? Number(siteSettings.stats_sales_override) : (stats?.sales || 0);

  const totalMembers = siteSettings?.stats_users_override !== undefined && siteSettings?.stats_users_override !== null
      ? Number(siteSettings.stats_users_override) : (stats?.users || 0);

  const totalStockAvailable = safeProducts.reduce((acc, p) => acc + (Math.max(0, p.stock || 0)), 0);

  const recentSales = [
    { user: "อ***", product: "ROV สุ่มไอดีเทพ", price: 0.99, time: "1 นาทีที่แล้ว" },
    { user: "ก***", product: "ROV ของคุ้มระดับกลาง", price: 35, time: "2 นาทีที่แล้ว" },
    { user: "ส***", product: "ROV ไอดีระดับสูง", price: 89, time: "5 นาทีที่แล้ว" },
  ];

  return (
    <div className="w-full pb-32 font-sans bg-[#050505] text-white -mt-2">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4">
        
        {/* Banner */}
        <div className="rounded-2xl overflow-hidden p-5 sm:p-6 relative min-h-[120px] mb-4 shadow-xl border border-white/10"
             style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 40%, #050505 100%)" }}>
          <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
          <div className="text-[10px] sm:text-xs text-white/50 tracking-widest mb-1 font-mono">● WELCOME TO STORE</div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-widest leading-[1.1]"
               style={{ textShadow: "0 0 20px rgba(255,255,255,0.2)" }}>
            APEX STORE
          </div>
          <div className="text-[10px] sm:text-xs text-white/70 mt-1.5 font-medium">
            จำหน่ายสินค้าเกมออนไลน์ ไอดีเกม สคริปต์
          </div>
          <div className="flex gap-1.5 mt-3 flex-wrap relative z-10">
            {["PREMIUM APP", "ROV ID", "PROXY", "LICENSE KEY"].map((t) => (
              <span key={t} className="bg-[#050505]/10 border border-white/20 text-white text-[9px] px-1.5 py-0.5 rounded-[4px] font-bold">
                {t}
              </span>
            ))}
          </div>
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-0">
            <div className="text-[50px] sm:text-[70px] text-white/5 font-black -rotate-12 blur-[1px]">
              APEX
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="text-[13px] text-zinc-400 mb-1 font-medium">จำนวนสมาชิก</div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalMembers.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">คน</div>
            <div className="absolute right-3 bottom-0 text-5xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><Users className="w-12 h-12 text-white" /></div>
          </div>
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="text-[13px] text-zinc-400 mb-1 font-medium">สินค้าในสต็อก</div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalStockAvailable.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">ชิ้น</div>
            <div className="absolute right-3 bottom-0 text-5xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><Package className="w-12 h-12 text-white" /></div>
          </div>
        </div>

        {/* Sales Stat */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 mb-4 relative overflow-hidden shadow-lg group hover:border-white/10 transition-colors">
          <div className="text-[13px] text-zinc-400 mb-1 font-medium">ยอดขายรวม</div>
          <div className="text-3xl sm:text-4xl font-black text-white">{totalSales.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">รายการสั่งซื้อ</div>
          <div className="absolute right-4 bottom-2 text-6xl opacity-[0.03] text-white group-hover:scale-110 transition-transform duration-500">🛒</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
          <button onClick={() => setActiveView(user ? "wallet" : "login")} className="bg-gradient-to-br from-[#121212] to-[#161616] rounded-2xl p-4 border border-white/10 flex items-center gap-3 text-left active:scale-95 transition-all hover:border-white/10 hover:shadow-lg">
            <div className="w-12 h-12 bg-[#050505]/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
              <Wallet className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="text-[11px] font-black text-white tracking-wider">TOPUP</div>
              <div className="text-[13px] font-bold text-zinc-400 leading-tight">เติมเงิน</div>
            </div>
          </button>
          <button onClick={() => setActiveView(user ? "history" : "login")} className="bg-gradient-to-br from-[#121212] to-[#161616] rounded-2xl p-4 border border-white/10 flex items-center gap-3 text-left active:scale-95 transition-all hover:border-white/10 hover:shadow-lg">
            <div className="w-12 h-12 bg-[#050505]/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
              <Star className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="text-[11px] font-black text-white tracking-wider">HISTORY</div>
              <div className="text-[13px] font-bold text-zinc-400 leading-tight">ประวัติสั่งซื้อ</div>
            </div>
          </button>
        </div>

        {/* Recent Sales Ticker */}
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6">
          <div className="text-[15px] font-bold text-white mb-0.5">รายการสินค้าล่าสุด</div>
          <div className="text-xs text-zinc-500 mb-4">สินค้าที่ลูกค้าเพิ่งซื้อไปเมื่อสักครู่</div>
          <div className="flex flex-col gap-2.5">
            {recentSales.map((s, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#0a0a0a] rounded-xl p-2.5 border border-white/10 hover:bg-[#111] transition-colors">
                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0">
                  <ROVCard label={String(s.price) + " ฿"} color="#555555" title={s.product.substring(0, 3)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-zinc-500 font-medium">{s.user}</div>
                  <div className="text-[13px] font-bold text-zinc-200 truncate">{s.product}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{s.time}</div>
                </div>
                <div className="text-[13px] font-black text-white pl-2">฿{s.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Limited Items */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-4">
            <div className="flex items-start gap-2.5">
              <span className="text-xl text-white mt-1">★</span>
              <div>
                <div className="text-base sm:text-lg font-black text-white leading-[1.2]">
                  สินค้าทั้งหมด <br /> ของดีมีจำกัด
                </div>
                <div className="text-[11px] sm:text-xs text-zinc-500 mt-1 font-medium">เลือกซื้อสินค้าที่ต้องการได้เลย</div>
              </div>
            </div>
            <button onClick={() => setActiveView("categories")} className="border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-300 hover:bg-[#121212] hover:text-white transition-colors text-right leading-tight whitespace-nowrap active:scale-95">
              ดูหมวดหมู่<br />ทั้งหมด
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {safeProducts.map((p) => {
              const discount = p.originalPrice && p.price < p.originalPrice
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
              
              const isBestSeller = p.price > 100 || (discount && discount >= 20);
              
              return (
                <div key={p.id} className="bg-[#121212] rounded-2xl overflow-hidden border border-white/10 shadow-lg group hover:border-white/10 transition-all">
                  {/* Product Image / ROVCard */}
                  <div className="relative aspect-square w-full bg-[#0a0a0a]">
                    {p.imageUrl && p.imageUrl.trim() !== "" ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" onError={(e) => { e.currentTarget.style.display = 'none'; if(e.currentTarget.nextElementSibling) (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex'; }} />
                    ) : null}
                    <div className="w-full h-full absolute inset-0 text-white flex flex-col justify-center items-center" style={{ display: p.imageUrl && p.imageUrl.trim() !== "" ? 'none' : 'flex' }}>
                       <div className="w-full h-full p-2">
                         <ROVCard label={p.price + " ฿"} color="#555555" title={p.name?.substring(0, 8)} />
                       </div>
                    </div>
                    {/* Badge */}
                    {isBestSeller ? (
                      <div className="absolute top-2.5 left-2.5 bg-[#121212]/90 backdrop-blur-sm shadow border border-zinc-700/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-20">
                        ขายดี
                      </div>
                    ) : (
                      <div className="absolute top-2.5 left-2.5 bg-[#121212]/90 backdrop-blur-sm shadow border border-zinc-700/50 text-white text-[9px] font-black px-2 py-0.5 rounded-full z-20">
                        แนะนำ
                      </div>
                    )}
                    {discount && (
                      <div className="absolute top-2.5 right-2.5 bg-[#050505] backdrop-blur-sm shadow border border-white/20 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full z-20">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <div className="text-[13px] font-bold text-white mb-1.5 leading-[1.3] line-clamp-1 group-hover:text-zinc-300 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-zinc-500 mb-3 line-clamp-2 min-h-[32px]">{p.description}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px] font-black text-white">฿{p.price.toFixed(2)}</span>
                      {p.originalPrice && p.price < p.originalPrice && (
                        <span className="text-[11px] text-zinc-500 line-through font-medium">
                          ฿{p.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium mb-3">📦 คงเหลือ: {p.stock.toLocaleString()}</div>
                    <button onClick={() => onProductClick(p.id)} className="w-full bg-[#050505]/5 hover:bg-[#050505] hover:text-black text-white border border-white/10 hover:border-white rounded-xl py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <ShoppingCart className="w-4 h-4" /> ดูสินค้า
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 mb-8 rounded-2xl p-5 text-center border border-white/10" style={{ background: "linear-gradient(135deg, #0a0a0a, #111111)" }}>
          <div className="text-lg font-black text-white tracking-[0.2em] opacity-90">APEX STORE</div>
          <div className="text-[11px] text-zinc-500 mt-1.5">ขายสินค้าคุณภาพ ส่งมอบทันใจแบบอัตโนมัติ</div>
          <div className="flex justify-center gap-3 mt-4">
            {["LINE", "DISCORD", "FB", "IG"].map((s) => (
              <button key={s} className="bg-[#050505]/5 border border-white/10 text-zinc-400 rounded-lg px-3 py-1.5 text-[10px] font-black hover:bg-[#050505] hover:text-black transition-all active:scale-95">
                {s}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
