import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, Wallet, Phone, History, ChevronRight, Bell, Users, TrendingUp, Star, ArrowLeft, Key } from 'lucide-react';
import { Product, SiteStats, Category } from '../types';
import { AnimatedScroll } from './AnimatedScroll';

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

const DEFAULT_BANNERS = [
  "https://img1.pic.in.th/images/534FA0AA-6136-4D5D-8726-630F23B7D6C4.png"
];

export const HomeView: React.FC<HomeViewProps> = ({ products, categories, stats, user, siteSettings, purchaseHistory, setActiveView, onProductClick, onSelectCategory }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState(stats);
  const [isProductLoading, setIsProductLoading] = useState(false);
  
  const bannersToUse = siteSettings?.banners && siteSettings.banners.length > 0 ? siteSettings.banners : DEFAULT_BANNERS;

  const handleProductSelect = (product: Product | null) => {
    if (product) {
      setIsProductLoading(true);
      setTimeout(() => {
        onProductClick(product.id);
        setIsProductLoading(false);
      }, 300); // reduced delay for better UX
    }
  };

  // Sync with props
  useEffect(() => {
    setRealtimeStats(stats);
  }, [stats]);

  const totalStock = Array.isArray(products) ? products.reduce((sum, product) => {
    // If stock is "unlimited" (represented by 99999 or more), we don't count it towards the total stock
    return sum + (product.stock >= 99999 ? 0 : product.stock);
  }, 0) : 0;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannersToUse.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [bannersToUse.length]);

  if (isProductLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-zinc-50/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-center">
          <motion.div
             initial={{ x: -60, y: -30, opacity: 0, rotate: -45, scale: 0.8 }}
             animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
             transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
             className="text-5xl sm:text-6xl font-black text-zinc-900 tracking-tighter mix-blend-multiply"
          >
            A
          </motion.div>
          <motion.div
             initial={{ x: 60, y: 30, opacity: 0, rotate: 45, scale: 0.8 }}
             animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
             transition={{ duration: 0.5, type: 'spring', bounce: 0.5, delay: 0.1 }}
             className="text-5xl sm:text-6xl font-black text-red-600 tracking-tighter mix-blend-multiply"
          >
            X
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 font-sans text-zinc-900 mt-4 sm:mt-6">
      
      {/* Banner carousel */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[1640/500] rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentBanner}
              src={bannersToUse[currentBanner] || undefined}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>
      </AnimatedScroll>

      {/* Admin Announcement */}
      <AnimatedScroll delay={100}>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-red-100 relative z-10">
            <Bell className="w-6 h-6 text-red-500 animate-bounce" />
          </div>
          <div className="flex-1 relative z-10 overflow-hidden min-w-0">
            <h3 className="font-bold text-red-700 text-sm mb-1 uppercase tracking-wider font-sans truncate">ประกาศจากผู้ดูแลระบบ</h3>
            <div className="whitespace-nowrap overflow-hidden">
              <motion.div
                animate={{ x: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="inline-block"
              >
                <p className="text-red-900 text-sm font-medium">ยินดีต้อนรับเข้าเว็บ APEX STUDIO ระบบอัตโนมัติตลอด 24 ชม. | สมัครสมาชิกวันนี้รับโปรโมชั่นพิเศษมากมาย</p>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Real-time Stats */}
      <AnimatedScroll delay={200}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Stat 1: Users */}
          <div className="relative p-6 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col justify-center text-left">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-100/50 pointer-events-none">
              <Users className="w-20 h-20" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-600 font-bold mb-1">ผู้ใช้งาน</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={realtimeStats?.users || 0}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight"
                >
                  {(realtimeStats?.users || 0).toLocaleString()}
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">คน</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Stock */}
          <div className="relative p-6 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col justify-center text-left">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-100/50 pointer-events-none">
              <Package className="w-20 h-20" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-600 font-bold mb-1">สต็อก</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={totalStock}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight"
                >
                  {totalStock.toLocaleString()}
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Sales (Transactions) */}
          <div className="col-span-2 lg:col-span-1 relative p-6 rounded-3xl border border-zinc-200 bg-white shadow-sm overflow-hidden flex flex-col justify-center text-left">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-100/50 pointer-events-none">
              <History className="w-20 h-20" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-600 font-bold mb-1">ยอดขาย</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={realtimeStats?.sales || 0}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-4xl sm:text-5xl font-black text-red-600 tracking-tight"
                >
                  {(realtimeStats?.sales || 0).toLocaleString()}
                </motion.span>
                <span className="text-zinc-500 font-bold text-sm">ครั้ง</span>
              </div>
            </div>
          </div>

        </div>
      </AnimatedScroll>

      {/* Latest Products Feed */}
      <AnimatedScroll delay={210}>
        <div className="pt-2">
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-bold text-zinc-900 leading-tight">รายการสินค้าล่าสุด</h2>
            <p className="text-xs text-zinc-500 font-medium mt-1">สินค้าที่ลูกค้าเพิ่งซื้อไปเมื่อสักครู่</p>
          </div>

          <div className="flex overflow-hidden relative group w-full">
            <motion.div 
              className="flex gap-4 pr-4 w-max shrink-0 hover:[animation-play-state:paused]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 40, repeat: Infinity }}
            >
              {[...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1,2,3,4,5]), ...(purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory.slice(0, 10) : [1,2,3,4,5])].map((purchase: any, index) => {
                const i = index % 10;
                let isDummy = typeof purchase === 'number';
                const dummyProduct = isDummy ? products[i % (products.length || 1)] : null;
                const matchedProduct = !isDummy ? products.find(p => p.name === purchase.productName) : null;
                
                const minsAgo = Math.floor(Math.random() * 5) + i * 2 + 1; 

                return (
                  <div 
                    key={index}
                    className="shrink-0 w-[280px] bg-white border border-zinc-200 p-3 rounded-2xl flex gap-4 transition-all cursor-default"
                  >
                    <div className="w-16 h-16 rounded-xl bg-zinc-100 shrink-0 overflow-hidden relative">
                      {(matchedProduct?.imageUrl || dummyProduct?.imageUrl) ? (
                        <img src={matchedProduct?.imageUrl || dummyProduct?.imageUrl} alt="Product" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500"><ShoppingCart className="w-6 h-6"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-bold text-zinc-900 truncate">
                        {!isDummy && purchase.username ? purchase.username.substring(0, 2) + '***' : 'Us***'}
                      </div>
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {!isDummy ? purchase.productName : (dummyProduct?.name || 'สินค้าพรีเมียม')}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-black text-red-600">
                          ฿{!isDummy ? (matchedProduct?.price || purchase.price || 0) : (dummyProduct?.price || 50)}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-semibold">{!isDummy ? purchase.amount || 1 : 1} ชิ้น • {minsAgo} นาทีที่แล้ว</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Grid Menu Icons */}
      <AnimatedScroll delay={200}>
        <div className={`grid gap-4 ${user ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {[
          { icon: Package, label: 'สินค้าทั้งหมด', id: 'Store', desc: 'หมวดหมู่สินค้า', color: 'blue', action: () => { setActiveView('categories'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
          { icon: Wallet, label: 'เติมเงิน', id: 'Topup', desc: 'เพิ่มเครดิต', color: 'emerald', action: () => {
            if (!user) {
              Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'โปรดเข้าสู่ระบบก่อนทำการเติมเงิน',
                confirmButtonColor: '#dc2626'
              })
            } else {
              window.location.hash = 'wallet';
              setActiveView('wallet');
            }
          }},
          { icon: Key, label: 'เปิดใช้งานคีย์', id: 'Redeem', desc: 'ใช้โค้ด/คีย์', color: 'amber', action: () => setActiveView('redeem') },
          { icon: History, label: 'ประวัติเช็คไอดี', id: 'CheckerLogs', desc: 'รายการตรวจสอบ', color: 'indigo', action: () => {
            if (!user) {
              Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'โปรดเข้าสู่ระบบก่อนดูประวัติเช็คไอดี',
                confirmButtonColor: '#4f46e5'
              })
            } else {
              window.location.hash = 'checker_logs';
              setActiveView('checker_logs');
            }
          }}
        ].map((item, i) => {
          const colorStyles = {
            blue: "bg-blue-50/50 border-blue-200/60 hover:border-blue-500 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)]",
            emerald: "bg-emerald-50/50 border-emerald-200/60 hover:border-emerald-500 hover:shadow-[0_8px_30px_rgb(16,185,129,0.15)]",
            amber: "bg-amber-50/50 border-amber-200/60 hover:border-amber-500 hover:shadow-[0_8px_30px_rgb(245,158,11,0.15)]",
            red: "bg-red-50/50 border-red-200/60 hover:border-red-500 hover:shadow-[0_8px_30px_rgb(239,68,68,0.15)]"
          };
          const iconStyles = {
            blue: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30",
            emerald: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30",
            amber: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30",
            red: "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30"
          };
          const textStyles = {
            blue: "text-blue-900",
            emerald: "text-emerald-900",
            amber: "text-amber-900",
            red: "text-red-900"
          };
          const bgIconStyles = {
            blue: "text-blue-500",
            emerald: "text-emerald-500",
            amber: "text-amber-500",
            red: "text-red-500"
          };

          return (
            <button 
              key={i} 
              onClick={item.action}
              className={`group relative overflow-hidden bg-white border p-5 sm:p-6 rounded-3xl flex flex-col items-start justify-between min-h-[140px] transition-all duration-300 hover:-translate-y-1 ${colorStyles[item.color as keyof typeof colorStyles]}`}
            >
              {/* Background Icon */}
              <div className={`absolute -right-6 -bottom-6 opacity-[0.07] pointer-events-none transition-transform duration-500 group-hover:scale-125 group-hover:-rotate-12 ${bgIconStyles[item.color as keyof typeof bgIconStyles]}`}>
                <item.icon className="w-36 h-36" />
              </div>
              
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconStyles[item.color as keyof typeof iconStyles]}`}>
                <item.icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              
              <div className="flex flex-col items-start text-left mt-6 relative z-10">
                <span className={`font-bold text-base sm:text-lg leading-tight transition-colors ${textStyles[item.color as keyof typeof textStyles]}`}>{item.label}</span>
                <span className="text-[11px] sm:text-xs text-zinc-500 font-bold mt-1 opacity-80">{item.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
      </AnimatedScroll>

      {/* Categories Section */}
      <AnimatedScroll delay={220}>
        <div className="pt-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 leading-tight">หมวดหมู่แนะนำ</h2>
                <p className="text-[11px] text-zinc-500 font-medium">สินค้าแนะนำสำหรับคุณ</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveView('categories')}
              className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all active:scale-95 flex items-center gap-2"
            >
              ดูเพิ่มเติม <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {categories && categories.slice(0, 3).map((cat, i) => (
              <motion.button 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSelectCategory(cat.name)}
                className="group w-full bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-red-500 hover:shadow-xl hover:shadow-red-500/5 transition-all text-left"
              >
                <div className="relative aspect-[1640/500] bg-zinc-900 overflow-hidden">
                  {cat.bannerUrl ? (
                    <img src={cat.bannerUrl} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gap-4">
                      <div className="bg-red-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest text-center leading-tight">
                        REXZY<br/>STUDIO
                      </div>
                      <div className="text-white text-lg font-bold tracking-widest">
                        BANNER 1640×500
                      </div>
                    </div>
                  )}
                  {/* Overlay icon on hover */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-all">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-600 group-hover:text-red-700">{cat.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> สินค้ายอดนิยม
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const catProducts = products.filter(p => p.category === cat.name);
                    if (catProducts.length === 0) return <div className="text-sm font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200 whitespace-nowrap">ไม่ทราบราคา</div>;
                    const prices = catProducts.map(p => p.price);
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    return minP === maxP ? (
                      <div className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 whitespace-nowrap">฿{minP.toLocaleString()}</div>
                    ) : (
                      <div className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100 whitespace-nowrap">฿{minP.toLocaleString()} - ฿{maxP.toLocaleString()}</div>
                    );
                  })()}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </AnimatedScroll>

      {/* Featured Products */}
      <AnimatedScroll delay={250}>
        <div id="products" className="pt-12">
          <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-zinc-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-zinc-900 leading-tight">สินค้าทั่วไป</h2>
                <p className="text-[11px] text-zinc-500 font-medium">สินค้าแนะนำสำหรับคุณ</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group"
              >
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-red-600 tracking-tighter mb-1">REXZY STUDIO</div>
                        <div className="text-white text-xs font-bold leading-tight">PREVIEW<br/>1500×1500</div>
                      </div>
                    </div>
                  )}
                  {product.stock <= 0 && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity opacity-0 group-hover:opacity-100">
                        <span className="bg-red-600 text-white font-bold rounded-full px-4 py-1.5 text-xs">สินค้าหมด</span>
                     </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <h3 className="font-bold text-zinc-900 text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-0.5">
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-[10px] text-zinc-400 line-through">฿{product.originalPrice.toLocaleString()}</span>
                    )}
                    <div className="text-red-600 font-bold text-sm">฿{product.price.toLocaleString()}</div>
                  </div>
                  
                  {product.stock <= 0 ? (
                    <button className="w-full mt-3 bg-red-100 text-red-600 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                      <Package className="w-3.5 h-3.5" /> สินค้าหมด
                    </button>
                  ) : (
                    <button 
                      onClick={() => onProductClick(product.id)}
                      className="w-full mt-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl py-2.5 text-xs font-bold transition-colors active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อสินค้า
                    </button>
                  )}
                  
                  <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <span className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-200'}`}></span>
                    คงเหลือ {product.stock >= 999999 ? 'ไม่จำกัด' : `${product.stock} ชิ้น`}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedScroll>

    </div>
  );
};