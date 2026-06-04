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
    <div className="h-full min-h-[100px] p-2.5 flex flex-col items-center justify-center relative overflow-hidden"
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
      <div className="mt-1.5 text-black font-black text-[11px] px-2 py-[1px] z-10" style={{ background: "#ffffff" }}>
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
    <div className="w-full pb-32 font-sans bg-card text-white -mt-2 brut-card">
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-4">
        
        {/* Banner */}
        <div className="overflow-hidden relative min-h-[180px] sm:min-h-[220px] mb-6 border border-border border-2">
          <img src="https://i.postimg.cc/pVnngYLx/apex-storeth-v4-resized.png" alt="APEX STORE" className="w-full h-full object-cover" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div className="bg-card border border-border border-2 p-4 sm:p-5 relative overflow-hidden group hover:border-white/10 transition-colors brut-card">
            <div className="text-[13px] text-muted-foreground mb-1 font-medium">จำนวนสมาชิก</div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalMembers.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">คน</div>
            <div className="absolute right-3 bottom-0 text-5xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><Users className="w-12 h-12 text-white" /></div>
          </div>
          <div className="bg-card border border-border border-2 p-4 sm:p-5 relative overflow-hidden group hover:border-white/10 transition-colors brut-card">
            <div className="text-[13px] text-muted-foreground mb-1 font-medium">สินค้าในสต็อก</div>
            <div className="text-2xl sm:text-3xl font-black text-white">{totalStockAvailable.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">ชิ้น</div>
            <div className="absolute right-3 bottom-0 text-5xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity"><Package className="w-12 h-12 text-white" /></div>
          </div>
        </div>

        {/* Featured Categories */}
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-black text-white tracking-tight">หมวดหมู่แนะนำ</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.slice(0, 4).map(cat => (
                    <div key={cat.id} 
                        onClick={() => onSelectCategory(cat.id)}
                        className="cursor-pointer group relative overflow-hidden aspect-[21/5] border border-border border-2 hover:border-white/20 transition-all">
                        {cat.imageUrl && <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500" />}
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-white tracking-widest">{cat.name}</div>
                    </div>
                ))}
            </div>
        </div>

        {/* Recent Sales Ticker */}
        <div className="bg-card border border-border border-2 p-4 sm:p-5 mb-5 sm:mb-6 brut-card">
          <div className="text-[15px] font-bold text-white mb-0.5">รายการสินค้าล่าสุด</div>
          <div className="text-xs text-muted-foreground mb-4">สินค้าที่ลูกค้าเพิ่งซื้อไปเมื่อสักครู่</div>
          <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
            {recentSales.map((s, i) => (
              <div key={i} className="flex-none flex items-center gap-3 bg-card p-3 border border-border border-2 hover:bg-[#111] transition-colors w-[220px] brut-card">
                <div className="w-12 h-12 shrink-0">
                  <ROVCard label={String(s.price) + " ฿"} color="#555555" title={s.product.substring(0, 3)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-muted-foreground font-medium">{s.user}</div>
                  <div className="text-[12px] font-bold text-muted-foreground truncate">{s.product}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{s.time}</div>
                </div>
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
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {safeProducts.map((p) => {
              const discount = p.originalPrice && p.price < p.originalPrice
                ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : null;
              
              const isBestSeller = p.price > 100 || (discount && discount >= 20);
              
              return (
                <div key={p.id} className="bg-card overflow-hidden border border-border border-2 group hover:border-white/10 transition-all brut-card">
                  {/* Product Image / ROVCard */}
                  <div className="relative aspect-square w-full bg-card brut-card">
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
                      <div className="absolute top-2.5 left-2.5 bg-card backdrop-blur-sm shadow border border-zinc-700/50 text-white text-[9px] font-black px-2 py-0.5 z-20 brut-card">
                        ขายดี
                      </div>
                    ) : (
                      <div className="absolute top-2.5 left-2.5 bg-card backdrop-blur-sm shadow border border-zinc-700/50 text-white text-[9px] font-black px-2 py-0.5 z-20 brut-card">
                        แนะนำ
                      </div>
                    )}
                    {discount && (
                      <div className="absolute top-2.5 right-2.5 bg-card backdrop-blur-sm shadow border border-border border-2 text-black text-[9px] font-black px-1.5 py-0.5 z-20 brut-card">
                        -{discount}%
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3 sm:p-4">
                    <div className="text-[13px] font-bold text-white mb-1.5 leading-[1.3] line-clamp-1 group-hover:text-zinc-300 transition-colors">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground mb-3 line-clamp-2 min-h-[32px]">{p.description}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[14px] font-black text-white">฿{p.price.toFixed(2)}</span>
                      {p.originalPrice && p.price < p.originalPrice && (
                        <span className="text-[11px] text-muted-foreground line-through font-medium">
                          ฿{p.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium mb-3">📦 คงเหลือ: {p.stock.toLocaleString()}</div>
                    <button onClick={() => onProductClick(p.id)} className="w-full bg-card hover:bg-[#050505] hover:text-black text-white border border-border border-2 hover:border-white py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 brut-card">
                      <ShoppingCart className="w-4 h-4" /> ดูสินค้า
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 mb-8 text-center text-xs text-muted-foreground">
           © {new Date().getFullYear()} เอเพ็กซ์สโตร์ — สงวนลิขสิทธิ์
        </div>

      </div>
    </div>
  );
};
