import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Users, Package, TrendingUp, Sparkles, Star } from 'lucide-react';
import { Product, SiteStats } from '../types';

interface HomeViewProps {
  products: Product[];
  stats: SiteStats;
}

export const HomeView: React.FC<HomeViewProps> = ({ products, stats }) => {
  return (
    <div className="space-y-12 pb-24">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 p-8 sm:p-12 min-h-[300px] flex items-center justify-between">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3.5 h-3.5" /> เว็บไซต์คุณภาพโดย เอเปกซ์ สตูดิโอ
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.1] tracking-tight mb-6 relative">
              ยินดีต้อนรับเข้าสู่<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">APEX STUDIO</span>
            </h1>
            <p className="text-zinc-400 text-lg md:text-xl line-clamp-3 mb-8 max-w-xl">
              ศูนย์รวมบริการครบวงจร เช็คไอดีเกม, ร้านค้าสินค้าเกม, รหัสเกม, และโปรแกรมช่วยเหลือคุณภาพสูงที่คุณไว้วางใจได้
            </p>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5"/> ดูสินค้าทั้งหมด
            </button>
          </motion.div>
        </div>
        
        <div className="hidden lg:block relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-72 h-72 rounded-3xl bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 border border-white/5 shadow-2xl flex items-center justify-center p-8 backdrop-blur-sm"
          >
             <div className="absolute inset-0 bg-cyan-500/5 rounded-3xl animate-pulse"></div>
             <img src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=600&auto=format&fit=crop" alt="Hero 3D Elements" className="w-full h-full object-cover rounded-2xl drop-shadow-2xl mix-blend-luminosity brightness-150" />
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-cyan-400" />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-2">
            <div className="p-3 bg-cyan-500/10 rounded-xl">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">ผู้ใช้งานทั้งหมด</h3>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats.users.toLocaleString()}</p>
          <div className="mt-2 text-sm text-emerald-400 flex items-center gap-1 relative z-10">
            <TrendingUp className="w-4 h-4" /> +12% เดือนนี้
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Package className="w-24 h-24 text-indigo-400" />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-2">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Package className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">สินค้าในสต๊อก</h3>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats.stock.toLocaleString()}</p>
          <div className="mt-2 text-sm text-indigo-400 flex items-center gap-1 relative z-10">
            อัพเดทล่าสุดเมื่อสักครู่
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShoppingCart className="w-24 h-24 text-emerald-400" />
          </div>
          <div className="relative z-10 flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-zinc-400 font-medium">ยอดขายทั้งหมด</h3>
          </div>
          <p className="text-3xl font-black text-white relative z-10">{stats.sales.toLocaleString()}</p>
          <div className="mt-2 text-sm text-zinc-500 flex items-center gap-1 relative z-10">
            รายการสำเร็จ 100%
          </div>
        </motion.div>
      </div>

      {/* Featured Products */}
      <div id="products">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-cyan-400" /> สินค้าทั้งหมด
            </h2>
            <p className="text-zinc-400 text-sm mt-1">เลือกซื้อสินค้าเกมที่คุณชื่นชอบ</p>
          </div>
          
          {/* Categories Quick Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
             <button className="px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold whitespace-nowrap">ทั้งหมด</button>
             <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold whitespace-nowrap transition-colors">เกมออนไลน์</button>
             <button className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-bold whitespace-nowrap transition-colors">บัตรเติมเงิน</button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-colors group relative flex flex-col"
              >
                {product.isPopular && (
                  <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md z-10 shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> ขายดีไฟลุก
                  </div>
                )}
                
                <div className="relative aspect-video overflow-hidden bg-zinc-800">
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-80"></div>
                  {product.category && (
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                      {product.category}
                    </div>
                  )}
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-white line-clamp-2 leading-tight">{product.name}</h3>
                  </div>
                  <p className="text-zinc-400 text-xs line-clamp-2 mb-4 flex-1">{product.description}</p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-0.5">ราคา</span>
                      <span className="text-lg font-black text-emerald-400">฿{product.price.toLocaleString()}</span>
                    </div>
                    <button className="bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black w-10 h-10 rounded-xl transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                      <ShoppingCart className="w-5 h-5" />
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
