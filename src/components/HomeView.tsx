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
  "https://img2.pic.in.th/24B843A8-C705-48F6-84FB-50AAA5EFAAA6.png"
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
      <div className="fixed inset-0 z-[200] bg-[#0a0d12]/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200">
        <div className="flex items-center justify-center">
          <motion.div
             initial={{ x: -60, y: -30, opacity: 0, rotate: -45, scale: 0.8 }}
             animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
             transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
             className="text-5xl sm:text-6xl font-black text-white tracking-tighter mix-blend-multiply"
          >
            A
          </motion.div>
          <motion.div
             initial={{ x: 60, y: 30, opacity: 0, rotate: 45, scale: 0.8 }}
             animate={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
             transition={{ duration: 0.5, type: 'spring', bounce: 0.5, delay: 0.1 }}
             className="text-5xl sm:text-6xl font-black text-[#1E90FF] tracking-tighter mix-blend-multiply"
          >
            X
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 font-sans text-white mt-4 sm:mt-6">
      
      {/* Banner carousel */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[1640/500] rounded-3xl overflow-hidden shadow-sm border border-white/5">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentBanner}
              src={bannersToUse[currentBanner % (bannersToUse.length || 1)] || undefined}
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
        <div className="bg-[#1E90FF]/10 border border-white/10 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a7fe6]/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="w-12 h-12 bg-[#0B0F14] rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/10 relative z-10">
            <Bell className="w-6 h-6 text-[#1a7fe6] animate-bounce" />
          </div>
          <div className="flex-1 relative z-10 overflow-hidden min-w-0">
            <h3 className="font-bold text-[#166bcc] text-sm mb-1 uppercase tracking-wider font-sans truncate">ประกาศจากผู้ดูแลระบบ</h3>
            <div className="whitespace-nowrap overflow-hidden">
              <motion.div
                animate={{ x: ["100%", "-100%"] }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="inline-block"
              >
                <p className="text-white text-sm font-medium">ยินดีต้อนรับเข้าเว็บ APEX STUDIO ระบบอัตโนมัติตลอด 24 ชม. | สมัครสมาชิกวันนี้รับโปรโมชั่นพิเศษมากมาย</p>
              </motion.div>
            </div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Real-time Stats */}
      <AnimatedScroll delay={200}>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Stat 1: Users */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-xl overflow-hidden flex flex-col justify-center text-left hover:border-[#1E90FF]/30 transition-all duration-300">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Users className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">ผู้ใช้งาน</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={realtimeStats?.users || 0}
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-black text-white tracking-tight"
                >
                  {(realtimeStats?.users || 0).toLocaleString()}
                </motion.span>
                <span className="text-[#1E90FF] font-bold text-sm">คน</span>
              </div>
            </div>
          </div>

          {/* Stat 2: Stock */}
          <div className="group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-xl overflow-hidden flex flex-col justify-center text-left hover:border-[#1E90FF]/30 transition-all duration-300">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <Package className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">สต็อก</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={totalStock}
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-black text-white tracking-tight"
                >
                  {totalStock.toLocaleString()}
                </motion.span>
                <span className="text-[#1E90FF] font-bold text-sm">ชิ้น</span>
              </div>
            </div>
          </div>

          {/* Stat 3: Sales (Transactions) */}
          <div className="col-span-2 lg:col-span-1 group relative p-6 rounded-3xl border border-white/5 bg-[#0a0d12] shadow-xl overflow-hidden flex flex-col justify-center text-left hover:border-[#1E90FF]/30 transition-all duration-300">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/5 pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
              <History className="w-24 h-24" />
            </div>
            <div className="relative z-10 flex flex-col">
              <span className="text-zinc-500 font-bold mb-1 text-sm tracking-wide">ยอดขาย</span>
              <div className="flex items-baseline gap-2">
                <motion.span 
                  key={realtimeStats?.totalOrders || realtimeStats?.sales || 0}
                  initial={{ opacity: 0.5, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl sm:text-5xl font-black text-white tracking-tight"
                >
                  {((realtimeStats?.totalOrders !== undefined ? realtimeStats.totalOrders : (realtimeStats?.sales || 0)) + 4312).toLocaleString()}
                </motion.span>
                <span className="text-[#1E90FF] font-bold text-sm">ครั้ง</span>
              </div>
            </div>
          </div>

        </div>
      </AnimatedScroll>

      {/* Latest Products Feed */}
      <AnimatedScroll delay={210}>
        <div className="pt-2">
          <div className="flex flex-col mb-4">
            <h2 className="text-xl font-bold text-white leading-tight">รายการสินค้าล่าสุด</h2>
            <p className="text-xs text-[#1E90FF] font-medium mt-1">สินค้าที่ลูกค้าเพิ่งซื้อไปเมื่อสักครู่</p>
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
                
                let minsAgo = Math.floor(Math.random() * 5) + i * 2 + 1; 
                if (!isDummy && purchase.date) {
                  const diffMinutes = Math.floor((Date.now() - new Date(purchase.date).getTime()) / 60000);
                  if (diffMinutes >= 0) minsAgo = diffMinutes;
                }
                let timeStr = `${minsAgo} นาทีที่แล้ว`;
                if (!isDummy && purchase.date && minsAgo >= 60) {
                   if (minsAgo < 1440) timeStr = `${Math.floor(minsAgo / 60)} ชั่วโมงที่แล้ว`;
                   else timeStr = `${Math.floor(minsAgo / 1440)} วันที่แล้ว`;
                }

                return (
                  <div 
                    key={index}
                    className="shrink-0 w-[280px] bg-[#0a0d12] border border-white/5 p-3 rounded-2xl flex gap-4 transition-all cursor-default hover:border-white/10 shadow-lg"
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#0B0F14] border border-white/5 shrink-0 overflow-hidden relative">
                      {(matchedProduct?.imageUrl || dummyProduct?.imageUrl) ? (
                        <img src={matchedProduct?.imageUrl || dummyProduct?.imageUrl} alt="Product" className="w-full h-full object-cover opacity-90" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1E90FF]"><ShoppingCart className="w-6 h-6"/></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-sm font-bold text-white truncate">
                        {!isDummy && purchase.username ? purchase.username.substring(0, 2) + '***' : 'Us***'}
                      </div>
                      <div className="text-xs text-zinc-500 truncate mt-0.5">
                        {!isDummy ? purchase.productName : (dummyProduct?.name || 'สินค้าพรีเมียม')}
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-sm font-black text-[#1E90FF]">
                          ฿{!isDummy ? (matchedProduct?.price || purchase.price || 0) : (dummyProduct?.price || 50)}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-semibold">{!isDummy ? purchase.amount || 1 : 1} ชิ้น • {timeStr}</span>
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
          { icon: Wallet, label: 'เติมเงิน', id: 'Topup', desc: 'เพิ่มเครดิต', color: 'blue', action: () => {
            if (!user) {
              Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'โปรดเข้าสู่ระบบก่อนทำการเติมเงิน',
                confirmButtonColor: '#1E90FF',
                background: '#0B0F14',
                color: '#fff'
              })
            } else {
              setActiveView('wallet');
            }
          }},
          { icon: Key, label: 'เปิดใช้งานคีย์', id: 'Redeem', desc: 'ใช้โค้ด/คีย์', color: 'blue', action: () => setActiveView('redeem') },
          { icon: History, label: 'ประวัติเช็คไอดี', id: 'CheckerLogs', desc: 'รายการตรวจสอบ', color: 'blue', action: () => {
            if (!user) {
              Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'โปรดเข้าสู่ระบบก่อนดูประวัติเช็คไอดี',
                confirmButtonColor: '#1E90FF',
                background: '#0B0F14',
                color: '#fff'
              })
            } else {
              setActiveView('checker_logs');
            }
          }}
        ].map((item, i) => {
          return (
            <button 
              key={i} 
              onClick={item.action}
              className="group relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-transparent p-[1px] text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(30,144,255,0.15)] focus:outline-none"
            >
              {/* Dynamic Border Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-100 transition-all duration-500 group-hover:from-[#1E90FF]/60 group-hover:via-[#1E90FF]/10 group-hover:to-transparent" />
              
              <div className="relative flex h-full min-h-[150px] flex-col justify-between rounded-[23px] bg-[#0a0d12]/95 px-6 py-6 backdrop-blur-xl transition-colors duration-300 group-hover:bg-[#0B0F14]/95">
                {/* Background Decor Icon */}
                <div className="absolute -bottom-6 -right-6 opacity-[0.02] text-white transition-all duration-500 group-hover:-rotate-[-15deg] group-hover:scale-125 group-hover:text-[#1E90FF] group-hover:opacity-[0.08] pointer-events-none">
                  <item.icon className="h-36 w-36" />
                </div>
                
                {/* Header (Icon + Arrow) */}
                <div className="flex items-start justify-between relative z-10 w-full">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0B0F14] border border-white/5 text-[#1E90FF] shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:border-[#1E90FF]/30 group-hover:bg-[#1E90FF]/10 group-hover:shadow-[0_0_20px_rgba(30,144,255,0.2)]">
                    <item.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Hover Arrow Indicator */}
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-transparent transition-all duration-500 group-hover:bg-[#1E90FF]/10 group-hover:text-[#1E90FF] -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 -rotate-45 transition-transform duration-500 group-hover:rotate-0"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </div>
                </div>
                
                {/* Body Content */}
                <div className="relative z-10 flex flex-col items-start mt-6 w-full">
                  <span className="text-base sm:text-lg font-black text-white tracking-tight transition-colors duration-300 group-hover:text-[#1E90FF]">
                    {item.label}
                  </span>
                  <span className="mt-1 text-xs font-semibold text-zinc-500 tracking-wider">
                    {item.desc}
                  </span>
                </div>
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
              <div className="w-10 h-10 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a7fe6]/20">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">หมวดหมู่แนะนำ</h2>
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
                className="group w-full bg-[#0B0F14] border border-white/10 rounded-2xl overflow-hidden hover:border-[#1a7fe6] hover:shadow-xl hover:shadow-[#1a7fe6]/5 transition-all text-left"
              >
                <div className="relative aspect-[1640/500] bg-zinc-900 overflow-hidden">
                  {cat.bannerUrl ? (
                    <img src={cat.bannerUrl} alt={cat.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center gap-4">
                      <div className="bg-[#1E90FF] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg tracking-widest text-center leading-tight">
                        REXZY<br/>STUDIO
                      </div>
                      <div className="text-white text-lg font-bold tracking-widest">
                        BANNER 1640×500
                      </div>
                    </div>
                  )}
                  {/* Overlay icon on hover */}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <div className="w-12 h-12 rounded-full bg-[#0B0F14]/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1E90FF]/10 rounded-xl flex items-center justify-center text-[#1E90FF] group-hover:bg-[#1E90FF] group-hover:text-white transition-all">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1E90FF] group-hover:text-[#166bcc]">{cat.title}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> สินค้ายอดนิยม
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const catProducts = products.filter(p => p.category === cat.name);
                    if (catProducts.length === 0) return <div className="text-sm font-bold text-zinc-400 bg-[#0a0d12] px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">ไม่ทราบราคา</div>;
                    const prices = catProducts.map(p => p.price);
                    const minP = Math.min(...prices);
                    const maxP = Math.max(...prices);
                    return minP === maxP ? (
                      <div className="text-sm font-black text-[#1E90FF] bg-[#1E90FF]/10 px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">฿{minP.toLocaleString()}</div>
                    ) : (
                      <div className="text-sm font-black text-[#1E90FF] bg-[#1E90FF]/10 px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">฿{minP.toLocaleString()} - ฿{maxP.toLocaleString()}</div>
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
              <div className="w-10 h-10 bg-[#1E90FF] rounded-xl flex items-center justify-center shadow-lg shadow-[#1a7fe6]/20">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">สินค้าทั่วไป</h2>
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
                className="bg-[#0B0F14] border border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group"
              >
                <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-[#1E90FF] tracking-tighter mb-1">REXZY STUDIO</div>
                        <div className="text-white text-xs font-bold leading-tight">PREVIEW<br/>1500×1500</div>
                      </div>
                    </div>
                  )}
                  {product.stock <= 0 && (
                     <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity opacity-0 group-hover:opacity-100">
                        <span className="bg-[#1E90FF] text-white font-bold rounded-full px-4 py-1.5 text-xs">สินค้าหมด</span>
                     </div>
                  )}
                </div>

                <div className="p-3.5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-2 mb-0.5">
                    {product.originalPrice && product.price && product.originalPrice > product.price && (
                      <span className="text-[10px] text-zinc-400 line-through">฿{(product.originalPrice || 0).toLocaleString()}</span>
                    )}
                    <div className="text-[#1E90FF] font-bold text-sm">฿{(product.price || 0).toLocaleString()}</div>
                  </div>
                  
                  {product.stock <= 0 ? (
                    <button className="w-full mt-3 bg-[#1E90FF]/20 text-[#1E90FF] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
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