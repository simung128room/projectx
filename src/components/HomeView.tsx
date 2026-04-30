import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Package, Wallet, Phone, History, ChevronRight, Bell, Users, TrendingUp } from 'lucide-react';
import { Product, SiteStats } from '../types';

interface HomeViewProps {
  products: Product[];
  stats: SiteStats;
  user?: any;
  setActiveView: (view: any) => void;
}

const BANNERS = [
  "https://img2.pic.in.th/3B7FAB24-03F9-4935-8856-757B88CB4C97.png"
];

export const HomeView: React.FC<HomeViewProps> = ({ products, stats, user, setActiveView }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [realtimeStats, setRealtimeStats] = useState(stats);

  // Sync with props
  useEffect(() => {
    setRealtimeStats(stats);
  }, [stats]);

  // Fake real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeStats(prev => {
        const updateUsers = Math.random() > 0.6;
        const updateSales = Math.random() > 0.4;
        const decreaseStock = Math.random() > 0.8;

        return {
          users: prev.users + (updateUsers ? Math.floor(Math.random() * 3) + 1 : 0),
          sales: prev.sales + (updateSales ? Math.floor(Math.random() * 5) + 1 : 0),
          stock: Math.max(0, prev.stock - (decreaseStock ? 1 : 0)),
          topups: (prev.topups || 15400) + (updateUsers ? Math.floor(Math.random() * 150) + 50 : 0)
        };
      });
    }, 3000); // 3 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 pb-24 font-sans text-zinc-900 mt-4 sm:mt-6">
      
      {/* Banner carousel */}
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

      {/* Admin Announcement */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none"></div>
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-red-100 relative z-10">
          <Bell className="w-6 h-6 text-red-500 animate-bounce" />
        </div>
        <div className="flex-1 relative z-10">
          <h3 className="font-bold text-red-700 text-sm mb-1 uppercase tracking-wider font-sans">ประกาศจากผู้ดูแลระบบ</h3>
          <p className="text-red-900 text-sm font-medium">ยินดีต้อนรับเข้าเว็บ APEX STUDIO ระบบอัตโนมัติตลอด 24 ชม.</p>
        </div>
      </div>

      {/* Real-time Stats & Feed */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Stat 1: Users */}
        <div className="col-span-1 flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
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
        <div className="col-span-1 flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
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

        {/* Live Feed - placed in the middle */}
        <div className="col-span-2 bg-zinc-900 rounded-2xl p-3 flex items-center overflow-hidden border border-zinc-800 shadow-sm relative">
          <div className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-lg uppercase tracking-wider shrink-0 z-10 shadow-sm">
            Live
          </div>
          <div className="flex-1 overflow-hidden ml-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={realtimeStats.sales}
              className="flex items-center gap-2 text-zinc-300 text-xs sm:text-sm font-medium whitespace-nowrap"
            >
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
               User <span className="font-mono text-white">***{Math.floor(Math.random() * 900) + 100}</span> เพิ่งสั่งซื้อสินค้าระดับพรีเมียมเมื่อสักครู่นี้...
            </motion.div>
          </div>
        </div>

        {/* Stat 3: Stock */}
        <div className="col-span-1 flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
             <Package className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">สต็อก</span>
            <motion.span 
              key={realtimeStats.stock}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm font-black font-mono text-zinc-900 tracking-tight"
            >
              {realtimeStats.stock.toLocaleString()}
            </motion.span>
          </div>
        </div>

        {/* Stat 4: Topups */}
        <div className="col-span-1 flex items-center gap-3 p-3 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-colors">
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

      {/* Grid Menu Icons */}
      <div className={`grid gap-4 ${user ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'}`}>
        {[
          { icon: Package, label: 'สินค้าทั้งหมด', id: 'Store', color: 'blue', action: () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: ShoppingCart, label: 'สินค้าแนะนำ', id: 'Recommend', color: 'emerald', action: () => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' }) },
          { icon: Wallet, label: 'เติมเงิน', id: 'Topup', color: 'red', action: () => { if(user) setActiveView('wallet'); else setActiveView('login'); } },
          { icon: Phone, label: 'ติดต่อเรา', id: 'Contact', color: 'zinc', action: () => window.open('https://line.me', '_blank') }
        ].map((item, i) => {
          const colorStyles = {
            blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
            emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white",
            zinc: "bg-zinc-100 text-zinc-600 group-hover:bg-zinc-900 group-hover:text-white",
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

      {/* Featured Products */}
      <div id="products" className="pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-4">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-red-500 rounded-full inline-block"></span>
              สินค้าแนะนำ
            </h2>
            <p className="text-zinc-500 mt-2 text-sm pl-5 font-medium tracking-wide">แนะนำไอเทมสุดฮิตและบัญชีเกมที่น่าสนใจ</p>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
             <button className="px-5 py-2 bg-zinc-900 text-white rounded-full text-sm font-bold shadow-md shadow-zinc-900/20 transition-colors">🎮 ทั้งหมด</button>
             <button className="px-5 py-2 bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-full text-sm font-medium transition-colors whitespace-nowrap">🔥 บัญชีเกม</button>
             <button className="px-5 py-2 bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-full text-sm font-medium transition-colors whitespace-nowrap">💎 เติมเงิน</button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group bg-white border border-zinc-200 rounded-[28px] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 p-2">
                  <div className="w-full h-full rounded-[20px] overflow-hidden relative">
                    {product.isPopular && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold rounded-full px-3 py-1.5 z-10 shadow-md">
                         ยอดนิยม
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-zinc-900 text-[10px] font-bold rounded-full px-3 py-1.5 z-10 shadow-sm">
                        {product.category}
                      </div>
                    )}
                    <img 
                      src={product.imageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    />
                    
                    {product.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-zinc-900 text-white font-bold rounded-full px-6 py-2 text-sm shadow-xl">สินค้าหมด</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-zinc-900 text-lg leading-tight mb-4 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                       <div className="bg-zinc-100 text-zinc-600 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-2">
                         <Package className="w-3.5 h-3.5"/> สต็อก: {product.stock}
                       </div>
                       <div className="text-right">
                         <span className="text-2xl font-black text-red-600 tracking-tight">฿{product.price.toLocaleString()}</span>
                       </div>
                    </div>
                    
                    <button 
                      disabled={product.stock <= 0}
                      className="w-full relative mt-2 font-bold text-sm py-4 rounded-2xl text-white bg-zinc-900 hover:bg-black transition-colors disabled:opacity-50 disabled:bg-zinc-200 disabled:text-zinc-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-xl active:scale-[0.98]"
                    >
                      <ShoppingCart className="w-4 h-4"/> สั่งซื้อสินค้า
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

