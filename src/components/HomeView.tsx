import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Users, Package, TrendingUp, Sparkles, Star, ChevronLeft, ChevronRight, Gamepad2, Wallet, Phone, Gift, ArrowBigRight } from 'lucide-react';
import { Product, SiteStats } from '../types';

interface HomeViewProps {
  products: Product[];
  stats: SiteStats;
  user?: any;
}

const BANNERS = [
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop"
];

export const HomeView: React.FC<HomeViewProps> = ({ products, stats, user }) => {
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
    <div className="space-y-12 pb-24 font-sans text-white">
      
      {/* Brutalist Banner Carousel */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] border-2 border-white overflow-hidden group shadow-[8px_8px_0px_#22d3ee]">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBanner}
            src={BANNERS[currentBanner]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover grayscale opacity-60"
          />
        </AnimatePresence>
        
        {/* Striped overlay for technical feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI0IiB5Mj0iNCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] pointer-events-none"></div>

        {/* Brutalist Content Overlay */}
        <div className="absolute bottom-0 left-0 p-6 sm:p-10 z-10 w-full bg-gradient-to-t from-black via-black/80 to-transparent">
          <div className="flex flex-col items-start gap-2">
            <span className="inline-block px-3 py-1 bg-cyan-400 text-black font-black text-[11px] uppercase tracking-widest border border-black shadow-[2px_2px_0px_#fff]">SYSTEM.ONLINE</span>
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tighter leading-[0.85] mt-2">
              Welcome TO <br/><span className="text-transparent text-stroke-white text-stroke-2">THE ARENA</span>
            </h2>
            <p className="text-cyan-400 font-mono text-xs sm:text-sm mt-3 uppercase tracking-widest max-w-xl">
              // Premium Gaming Services & Authentication
            </p>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
          {BANNERS.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`h-2 rounded-sm transition-all duration-300 ${currentBanner === i ? 'w-8 bg-cyan-400' : 'w-2 bg-white/30 hover:bg-white/50 border border-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Grid Stats (Technical Grid Recipe) */}
      <div className="grid grid-cols-3 border-2 border-zinc-800 bg-[#0a0a0c]">
        {[
          { label: 'Registered Users', value: realtimeStats.users, color: 'text-cyan-400' },
          { label: 'Available Stock', value: realtimeStats.stock, color: 'text-fuchsia-400' },
          { label: 'Total Sales', value: realtimeStats.sales, color: 'text-emerald-400' }
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-6 border-r-2 border-zinc-800 last:border-r-0 hover:bg-zinc-900 transition-colors">
            <motion.span 
              key={stat.value}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl sm:text-5xl font-black font-mono ${stat.color} tracking-tighter`}
            >
              {stat.value.toLocaleString()}
            </motion.span>
            <span className="text-[10px] sm:text-xs text-zinc-500 font-bold uppercase tracking-widest mt-2">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Access Menu / Hardware style */}
      <div className={`grid gap-4 ${user ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2'}`}>
        {[
          { icon: Package, label: 'Store', desc: 'สินค้าทั้งหมด' },
          ...(user ? [
            { icon: Wallet, label: 'Topup', desc: 'เติมเงิน', isCyan: true },
            { icon: Gift, label: 'Gacha', desc: 'สุ่มรางวัล' }
          ] : []),
          { icon: Phone, label: 'Contact', desc: 'ติดต่อเรา' }
        ].map((item, i) => (
          <button key={i} className="group relative bg-[#0a0a0c] border border-zinc-800 p-6 flex flex-col items-start gap-4 overflow-hidden outline outline-1 outline-transparent hover:outline-cyan-500 transition-all duration-300">
            {/* Corner bracket decorative elements */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-zinc-700 group-hover:border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-zinc-700 group-hover:border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-zinc-700 group-hover:border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-zinc-700 group-hover:border-cyan-400"></div>

            <div className={`w-10 h-10 flex items-center justify-center ${item.isCyan ? 'bg-cyan-500/10 text-cyan-400' : 'bg-zinc-900 text-zinc-400 group-hover:bg-cyan-500/10 group-hover:text-cyan-400'} transition-colors`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex flex-col items-start text-left">
              <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-widest">{item.label}</span>
              <span className="font-black text-white text-lg tracking-tight group-hover:translate-x-1 transition-transform">{item.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Featured Products Terminal Style */}
      <div id="products" className="pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b-2 border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-cyan-400 animate-pulse"></div>
              <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">// Featured Items</span>
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
              Store <span className="text-zinc-600 font-light">Directory</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
             <button className="px-6 py-2 bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-cyan-400 transition-colors border border-transparent">ALL</button>
             <button className="px-6 py-2 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-400 text-xs font-black uppercase tracking-widest transition-colors">GAME ACCOUNTS</button>
             <button className="px-6 py-2 bg-transparent border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-400 text-xs font-black uppercase tracking-widest transition-colors">TOPUP</button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="border border-dashed border-zinc-800 p-16 text-center font-mono">
            <div className="animate-pulse mb-4">
              <Package className="w-8 h-8 text-zinc-600 mx-auto" />
            </div>
            <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">EMPTY_STORE_DATA</h3>
            <p className="text-zinc-600 text-xs mt-2 uppercase tracking-widest">&gt; Waiting for administrator module...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative bg-[#050505] border border-zinc-800 hover:border-cyan-500 transition-colors flex flex-col h-full overflow-hidden"
              >
                {/* Image Section */}
                <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-zinc-900 border-b border-zinc-800">
                  {product.isPopular && (
                    <div className="absolute top-3 right-3 bg-cyan-400 text-black text-[10px] font-black uppercase px-2 py-1 z-10 flex items-center gap-1">
                       HOT ITEM
                    </div>
                  )}
                  {product.category && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur text-white text-[10px] font-mono uppercase tracking-widest px-2 py-1 border border-zinc-700 z-10">
                      {product.category}
                    </div>
                  )}
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=400&auto=format&fit=crop"} 
                    alt={product.name}
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                  />
                  {/* Status Lines overlay */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJ0cmFuc3BhcmVudCIvPgo8bGluZSB4MT0iMCIgeTE9IjAiIHgyPSI0IiB5Mj0iNCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+Cjwvc3ZnPg==')] pointer-events-none opacity-30 mix-blend-overlay"></div>
                  
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[2px] flex items-center justify-center z-10 border-4 border-red-500/50">
                      <span className="bg-red-500 text-white font-black px-6 py-2 text-sm tracking-widest uppercase shadow-[4px_4px_0px_#000]">SOLD OUT</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-white text-base leading-tight uppercase tracking-tight mb-4">{product.name}</h3>
                  <div className="mt-auto flex flex-col gap-4">
                    <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">PRICE</span>
                        <div className="flex items-start text-cyan-400">
                          <span className="text-sm font-bold mr-1 mt-1">฿</span>
                          <span className="text-2xl font-black">{product.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">STOCK</span>
                        <span className="text-sm font-mono text-zinc-300">{product.stock.toString().padStart(3, '0')}</span>
                      </div>
                    </div>
                    
                    <button 
                      disabled={product.stock <= 0}
                      className="w-full relative uppercase tracking-widest font-black text-xs py-4 text-black bg-white hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group/btn overflow-hidden flex items-center justify-center gap-2"
                    >
                      <span className="relative z-10">PURCHASE</span>
                      <ArrowBigRight className="w-4 h-4 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
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
