import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowLeft, ChevronRight, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Category, Product } from '../types';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, products, onBack, onSelectCategory }) => {
  const getCategoryPriceInfo = (categoryName: string) => {
    const catProducts = categoryName === 'all' ? products : products.filter(p => p.category === categoryName);
    if (catProducts.length === 0) return null;
    const prices = catProducts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }
    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  const getProductCountText = (categoryName: string) => {
    const catProducts = categoryName === 'all' ? products : products.filter(p => p.category === categoryName);
    return `${catProducts.length} สินค้า`;
  };

  const allPriceInfo = getCategoryPriceInfo('all');
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white hover:bg-zinc-100 border border-zinc-200 rounded-full transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-zinc-900" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
             <Package className="w-8 h-8 text-red-500" /> หมวดหมู่สินค้า
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-2">เลือกหมวดหมู่ที่ต้องการดูสินค้า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           onClick={() => onSelectCategory('all')}
           className="bg-white border text-left border-zinc-200 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/10 rounded-3xl overflow-hidden transition-all cursor-pointer group flex flex-col"
        >
           <div className="h-32 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-50"></div>
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 relative z-10 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div className="absolute bottom-2 right-4 text-[10px] font-black text-white/40 tracking-widest uppercase">Apex Store</div>
           </div>
           <div className="p-6 pb-8 flex-1 flex flex-col items-start justify-center">
              <div className="flex w-full items-center justify-between mb-2">
                 <h2 className="text-xl font-black text-zinc-900 group-hover:text-red-500 transition-colors">ดูสินค้าทั้งหมด</h2>
                 <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                 </div>
              </div>
              <div className="w-full flex items-center justify-between mt-4">
                 <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5">
                   <Package className="w-3.5 h-3.5" /> ทุกหมวดหมู่ · {getProductCountText('all')}
                 </p>
                 {allPriceInfo ? (
                   <span className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{allPriceInfo}</span>
                 ) : (
                   <span className="text-sm font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200">ไม่ทราบราคา</span>
                 )}
              </div>
           </div>
        </motion.div>

        {categories.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 1) * 0.05 }}
            onClick={() => onSelectCategory(c.name)}
            className="bg-white text-left border border-zinc-200 hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/10 rounded-3xl overflow-hidden transition-all cursor-pointer group flex flex-col"
          >
            {c.bannerUrl ? (
              <div className="h-32 w-full overflow-hidden relative">
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                 </div>
                 <img src={c.bannerUrl || undefined} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            ) : (
              <div className="h-32 bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-tr from-red-600/20 to-transparent opacity-50"></div>
                 <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 relative z-10 group-hover:scale-110 transition-transform">
                   <Package className="w-8 h-8" />
                 </div>
                 <div className="absolute bottom-2 right-4 text-[10px] font-black text-white/40 tracking-widest uppercase">Category</div>
              </div>
            )}
            <div className="p-6 pb-8 flex-1 flex flex-col items-start justify-center">
               <div className="flex items-center w-full justify-between mb-2">
                  <h2 className="text-xl font-black text-zinc-900 group-hover:text-red-500 transition-colors uppercase tracking-tight">{c.title}</h2>
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                  </div>
               </div>
               <div className="w-full flex items-center justify-between mt-4">
                 <p className="text-sm text-zinc-500 font-medium flex items-center gap-1.5">
                   <Star className="w-3.5 h-3.5 text-amber-500" /> {c.subtitle || `1 หมวดหมู่ · ${getProductCountText(c.name)}`}
                 </p>
                 {getCategoryPriceInfo(c.name) ? (
                   <span className="text-sm font-black text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100">{getCategoryPriceInfo(c.name)}</span>
                 ) : (
                   <span className="text-sm font-bold text-zinc-400 bg-zinc-50 px-3 py-1 rounded-lg border border-zinc-200">ไม่ทราบราคา</span>
                 )}
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
