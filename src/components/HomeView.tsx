import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, Wallet, Phone, History, ChevronRight, Bell, Users, TrendingUp, Star, ArrowLeft, Key } from 'lucide-react';
import { Product, SiteStats } from '../types';
import { AnimatedScroll } from './AnimatedScroll';

interface HomeViewProps {
  products: Product[];
  stats: SiteStats;
  user?: any;
  purchaseHistory?: any[];
  setActiveView: (view: any) => void;
  onProductClick: (id: string) => void;
}

const BANNERS = [
  "https://img2.pic.in.th/86B05EC5-E611-42BD-A4E1-3E266EA3C2E8.png"
];

export const HomeView: React.FC<HomeViewProps> = ({ products, stats, user, purchaseHistory, setActiveView, onProductClick }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState(stats);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isProductLoading, setIsProductLoading] = useState(false);

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

  const totalStock = products.reduce((sum, product) => {
    // If stock is "unlimited" (represented by 99999 or more), we don't count it towards the total stock
    return sum + (product.stock >= 99999 ? 0 : product.stock);
  }, 0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  if (isProductLoading) {
    return (
      <div className="fixed inset-0 z-[200] bg-zinc-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-200">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 border-[3px] border-zinc-200 rounded-full"></div>
            <div className="absolute top-0 left-0 w-24 h-24 border-[3px] border-t-zinc-800 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="Logo" className="w-12 h-12 object-contain absolute opacity-70 grayscale brightness-0" />
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-black text-zinc-800 tracking-tight animate-pulse">กำลังโหลดข้อมูล...</h2>
            <p className="text-zinc-500 text-sm font-medium mt-1">โปรดรอสักครู่</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 font-sans text-zinc-900 mt-4 sm:mt-6">
      
      {/* Banner carousel */}
      <AnimatedScroll>
        <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[32/11] rounded-3xl overflow-hidden shadow-sm border border-zinc-100">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentBanner}
              src={BANNERS[currentBanner] || undefined}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Stat 1: Users */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
             <Users className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ผู้ใช้งาน</span>
            <motion.span 
              key={realtimeStats.users}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black font-mono text-zinc-900 tracking-tight"
            >
              {realtimeStats.users.toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* Stat 2: Sales */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
             <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ยอดขาย</span>
            <motion.span 
              key={realtimeStats.sales}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black font-mono text-zinc-900 tracking-tight"
            >
              {realtimeStats.sales.toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* Stat 3: Stock */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
             <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">สต็อก</span>
            <motion.span 
              key={totalStock}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black font-mono text-zinc-900 tracking-tight"
            >
              {totalStock.toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* Stat 4: Topups */}
        <div className="flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
             <Wallet className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ยอดเติม</span>
            <motion.span 
              key={realtimeStats.topups}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black font-mono text-zinc-900 tracking-tight"
            >
              {(realtimeStats.topups || 15400).toLocaleString()}
            </motion.span>
          </div>
        </div>
        </div>
      </AnimatedScroll>

      {/* Live Feed - placed below stats */}
      <AnimatedScroll delay={150}>
        <div className="bg-red-600 rounded-2xl p-3 flex items-center overflow-hidden border border-zinc-800 shadow-sm relative">
          <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0 z-10 shadow-sm">
            Live
          </div>
          <div className="flex-1 overflow-hidden ml-4 relative min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={realtimeStats.sales}
              className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-medium whitespace-nowrap"
            >
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
               {purchaseHistory && purchaseHistory.length > 0 && purchaseHistory[0].username ? (
                 <>
                   ผู้ใช้ <span className="font-mono text-white">{purchaseHistory[0].username}</span> เพิ่งสั่งซื้อ <span className="text-white">{purchaseHistory[0].productName}</span> เมื่อสักครู่นี้...
                 </>
               ) : (
                 <>
                   User <span className="font-mono text-white">***{Math.floor(Math.random() * 900) + 100}</span> เพิ่งสั่งซื้อสินค้าระดับพรีเมียมเมื่อสักครู่นี้...
                 </>
               )}
            </motion.div>
          </div>
        </div>
      </AnimatedScroll>

      {/* Grid Menu Icons */}
      <AnimatedScroll delay={200}>
        <div className={`grid gap-4 ${user ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {[
          { icon: Package, label: 'สินค้าทั้งหมด', id: 'Store', color: 'blue', action: () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: Wallet, label: 'เติมเงิน', id: 'Topup', color: 'zinc', action: () => {
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
          { icon: Key, label: 'เปิดใช้งานคีย์', id: 'Redeem', color: 'amber', action: () => setActiveView('redeem') },
          { icon: History, label: 'ประวัติ', id: 'History', color: 'red', action: () => {
            if (!user) {
              Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'โปรดเข้าสู่ระบบก่อนดูประวัติการสั่งซื้อ',
                confirmButtonColor: '#dc2626'
              })
            } else {
              window.location.hash = 'logs';
              setActiveView('logs');
            }
          }}
        ].map((item, i) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
            zinc: "bg-zinc-100 text-zinc-600 group-hover:bg-red-600 group-hover:text-white",
            red: "bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white"
          };
          return (
            <button 
              key={i} 
              onClick={item.action}
              className="group relative bg-white border border-zinc-200 p-6 rounded-[24px] flex flex-col items-center justify-center gap-4 hover:border-zinc-300 hover:shadow-md transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorStyles[item.color as keyof typeof colorStyles]} transition-all duration-300`}>
                <item.icon className="w-7 h-7" />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="font-bold text-zinc-900 text-lg group-hover:text-zinc-700 transition-colors">{item.label}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{item.id}</span>
              </div>
            </button>
          );
        })}
      </div>
      </AnimatedScroll>

      {/* Featured Products */}
      <AnimatedScroll delay={250}>
        <div id="products" className="pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-red-500 rounded-full inline-block"></span>
              สินค้าแนะนำ <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
            </h2>
            <p className="text-zinc-500 mt-2 text-sm pl-5 font-medium tracking-wide">สินค้าทั่วไป</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full max-w-full">
             <button onClick={() => setShowCategoryModal(true)} className="px-6 py-3 bg-zinc-100/80 hover:bg-zinc-200 text-zinc-900 rounded-2xl text-sm font-bold border border-zinc-200 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2">
               <Package className="w-4 h-4" /> ดูสินค้าทั้งหมด
             </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-200 bg-white rounded-3xl p-16 text-center shadow-sm">
            <div className="animate-pulse mb-6 flex justify-center">
              <Package className="w-16 h-16 text-zinc-200" />
            </div>
            <h3 className="text-xl font-bold text-zinc-400">ยังไม่มีสินค้าในขณะนี้</h3>
            <p className="text-zinc-400 text-sm mt-2 font-medium">โปรดรอการอัพเดทจากผู้ดูแลระบบ</p>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 mx-auto w-full max-w-3xl ${products.length === 1 ? 'grid-cols-1 max-w-sm' : 'grid-cols-2'}`}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={`group bg-white rounded-[24px] overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full bg-clip-padding ${i === 0 ? 'border-2 border-pink-500 shadow-lg shadow-pink-500/20 ring-4 ring-pink-500/10' : 'border border-zinc-200 hover:shadow-xl'}`}
              >
                {/* Image Section */}
                <div className="relative aspect-square overflow-hidden bg-zinc-100 p-1.5">
                  <div className="w-full h-full rounded-[18px] overflow-hidden relative">
                    {product.isPopular && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-bold rounded-full px-2 py-1 z-10 shadow-md">
                         ยอดนิยม
                      </div>
                    )}
                    <img 
                      src={product.imageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    />
                    
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white font-bold rounded-full px-4 py-1.5 text-xs shadow-xl">สินค้าหมด</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-zinc-900 text-base leading-tight mb-4 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <div className="bg-zinc-100 text-zinc-600 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5">
                         <Package className="w-3 h-3"/> สต็อก: {product.stock >= 999999 ? 'ไม่จำกัด' : product.stock}
                       </div>
                       <div className="text-right">
                         <span className="text-xl font-black text-red-600 tracking-tight">฿{product.price.toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={() => handleProductSelect(product)}
                      className="w-full relative mt-1 font-bold text-xs py-3 rounded-xl text-zinc-900 bg-zinc-100/80 hover:bg-zinc-200 border border-zinc-200 transition-colors flex items-center justify-center gap-2"
                    >
                      ดูสินค้า
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </AnimatedScroll>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-zinc-200 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowCategoryModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-900 transition-colors bg-zinc-50 hover:bg-zinc-100 p-2 rounded-full">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="flex items-center gap-4 mb-6">
               <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                 <Package className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-black text-xl text-zinc-900 tracking-tight">หมวดหมู่สินค้า</h3>
                  <p className="text-zinc-500 text-sm font-medium">เลือกหมวดหมู่สินค้าที่คุณสนใจ</p>
               </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowCategoryModal(false)} className="w-full bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-700 py-4 px-6 rounded-2xl font-bold flex items-center gap-3 transition-colors text-left group">
                <span className="text-xl group-hover:scale-110 transition-transform">🎮</span> 
                <span>ทั้งหมด</span>
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="w-full bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-700 py-4 px-6 rounded-2xl font-bold flex items-center gap-3 transition-colors text-left group">
                <span className="text-xl group-hover:scale-110 transition-transform">🔥</span> 
                <span>บัญชีเกม</span>
              </button>
              <button onClick={() => setShowCategoryModal(false)} className="w-full bg-zinc-50 hover:bg-red-50 border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-700 py-4 px-6 rounded-2xl font-bold flex items-center gap-3 transition-colors text-left group">
                <span className="text-xl group-hover:scale-110 transition-transform">💎</span> 
                <span>เติมเงิน</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};