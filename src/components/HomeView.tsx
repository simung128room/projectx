import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Users, Package, TrendingUp, Sparkles, Star, ChevronLeft, ChevronRight, Gamepad2, Wallet, Phone, Gift } from 'lucide-react';
import { Product, SiteStats } from '../types';

interface HomeViewProps {
  products: Product[];
  stats: SiteStats;
}

const BANNERS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop"
];

export const HomeView: React.FC<HomeViewProps> = ({ products, stats }) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-10 pb-24 font-sans">
      
      {/* Dynamic Banner Carousel */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] rounded-3xl overflow-hidden group border border-white/5 shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner}
            src={BANNERS[currentBanner]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Banner Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
        
        {/* Banner Content (Optional) */}
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 z-10 w-full">
          <div className="flex justify-between items-end">
            <div>
              <span className="inline-block px-3 py-1 mb-3 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-cyan-500/30">ข่าวสารล่าสุด</span>
              <h2 className="text-2xl sm:text-4xl font-black text-white drop-shadow-md">ต้อนรับเข้าสู่ร้านค้าออนไลน์ของเรา</h2>
              <p className="text-zinc-300 text-xs sm:text-sm mt-2 max-w-xl line-clamp-2">บริการรวดเร็ว ทันใจ สินค้าคุณภาพสูง พร้อมให้บริการ 24 ชั่วโมง</p>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2 z-20">
          {BANNERS.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`h-2 rounded-full transition-all duration-300 ${currentBanner === i ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Menu (MLD Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button className="bg-zinc-900 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-800/80 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group shadow-lg">
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500 group-hover:scale-110 transition-all duration-300">
            <Package className="w-6 h-6 text-cyan-400 group-hover:text-white" />
          </div>
          <span className="font-bold text-white text-sm">สินค้าทั้งหมด</span>
        </button>
        <button className="bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800/80 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group shadow-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:scale-110 transition-all duration-300">
            <Wallet className="w-6 h-6 text-emerald-400 group-hover:text-white" />
          </div>
          <span className="font-bold text-white text-sm">เติมเงิน</span>
        </button>
        <button className="bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group shadow-lg">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500 group-hover:scale-110 transition-all duration-300">
            <Gift className="w-6 h-6 text-indigo-400 group-hover:text-white" />
          </div>
          <span className="font-bold text-white text-sm">สุ่มรางวัล</span>
        </button>
        <button className="bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-800/80 transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group shadow-lg">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center group-hover:bg-rose-500 group-hover:scale-110 transition-all duration-300">
            <Phone className="w-6 h-6 text-rose-400 group-hover:text-white" />
          </div>
          <span className="font-bold text-white text-sm">ติดต่อเรา</span>
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 sm:p-6 shadow-md">
        <div className="flex flex-col items-center text-center">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.users.toLocaleString()}</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
        </div>
        <div className="flex flex-col items-center text-center border-x border-zinc-800">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.stock.toLocaleString()}</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
        </div>
        <div className="flex flex-col items-center text-center">
          <span className="text-xl sm:text-3xl font-black text-white">{stats.sales.toLocaleString()}</span>
          <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
        </div>
      </div>

      {/* Featured Products */}
      <div id="products">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Star className="w-6 h-6 text-cyan-400 fill-cyan-400" /> สินค้าแนะนำ
            </h2>
            <div className="h-1 w-12 bg-cyan-500 rounded-full mt-2"></div>
          </div>
          
          {/* Categories Quick Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full md:w-auto">
             <button className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold whitespace-nowrap shadow-md">ทั้งหมด</button>
             <button className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold whitespace-nowrap transition-colors">เกมออนไลน์</button>
             <button className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs font-bold whitespace-nowrap transition-colors">บัตรเติมเงิน</button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">ยังไม่มีสินค้าในร้าน</h3>
            <p className="text-zinc-500">รอแอดมินเพิ่มสินค้าใหม่เร็วๆ นี้...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] transition-all group flex flex-col h-full"
              >
                <div className="relative aspect-square sm:aspect-video overflow-hidden bg-zinc-800">
                  {product.isPopular && (
                    <div className="absolute top-2 left-2 bg-rose-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2 py-1 rounded z-10 flex items-center gap-1 border border-rose-400/50">
                      <Star className="w-3 h-3 fill-current" /> ขายดีไฟลุก
                    </div>
                  )}
                  {product.category && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded z-10">
                      {product.category}
                    </div>
                  )}
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Stock Indicator overlay logic if needed */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-sm border border-red-400/50 shadow-lg">สินค้าหมด</span>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-white line-clamp-2 text-sm mb-1 leading-tight">{product.name}</h3>
                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">ราคา</span>
                        <span className="text-lg font-black text-cyan-400">฿{product.price.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">คงเหลือ</span>
                        <span className="text-sm font-bold text-white">{product.stock} <span className="text-zinc-500 font-normal">ชิ้น</span></span>
                      </div>
                    </div>
                    
                    <button 
                      disabled={product.stock <= 0}
                      className="w-full bg-white text-black hover:bg-cyan-400 hover:text-black font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <ShoppingCart className="w-4 h-4" /> เลือกซื้อสินค้า
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
