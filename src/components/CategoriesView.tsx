import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowLeft, ChevronRight, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Category, Product } from '../types';
import { CategoryCard } from './CategoryCard';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  siteSettings?: any;
  isLoading?: boolean;
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
}


const CategoryCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: index * 0.05 }}
    className="relative h-[260px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5"
    aria-hidden="true"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-blue-500/[0.03]" />
    <div className="absolute inset-x-0 top-0 h-32 bg-white/[0.04] animate-pulse" />
    <div className="relative z-10 mt-28 space-y-4">
      <div className="h-4 w-24 rounded-full bg-white/[0.08] animate-pulse" />
      <div className="h-7 w-3/4 rounded-lg bg-white/[0.1] animate-pulse" />
      <div className="h-4 w-1/2 rounded-full bg-white/[0.06] animate-pulse" />
      <div className="flex items-center justify-between pt-4">
        <div className="h-9 w-28 rounded-xl bg-white/[0.07] animate-pulse" />
        <div className="h-9 w-20 rounded-xl bg-blue-500/[0.12] animate-pulse" />
      </div>
    </div>
  </motion.div>
);

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories = [], products = [], siteSettings, isLoading = false, onBack, onSelectCategory }) => {
  const getCategoryPriceInfo = (cat: any) => {
    const catProducts = cat === 'all' ? products : products.filter(p => p.category === cat.id || p.category === cat.name || p.category === cat.title);
    if (catProducts.length === 0) return null;
    const prices = catProducts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `฿${minPrice.toLocaleString()}`;
    }
    return `฿${minPrice.toLocaleString()} - ฿${maxPrice.toLocaleString()}`;
  };

  const getProductCountText = (cat: any) => {
    const catProducts = cat === 'all' ? products : products.filter(p => p.category === cat.id || p.category === cat.name || p.category === cat.title);
    return `${catProducts.length} สินค้า`;
  };

  const allPriceInfo = getCategoryPriceInfo('all');
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-card hover:bg-[#121212] border border-border border-2 transition-colors group brut-card"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-white" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-medium text-white tracking-tight flex items-center gap-3">
             <Package className="w-8 h-8 text-[#0066ff]" /> หมวดหมู่สินค้า
          </h1>
          <p className="text-sm font-medium text-muted-foreground mt-2">เลือกหมวดหมู่ที่ต้องการดูสินค้า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <CategoryCardSkeleton key={i} index={i} />)
        ) : (
          <>
        <CategoryCard
          title="ดูสินค้าทั้งหมด"
          label="ทุกหมวดหมู่"
          itemCountDesc={`ทั้งหมด ${getProductCountText('all')}`}
          priceRangeStr={allPriceInfo || undefined}
          bgImage={siteSettings?.banners?.[0] || "https://img1.pic.in.th/images/-81_20260601213128.png"}
          index={0}
          onClick={() => onSelectCategory('all')}
          accentColor="#0066ff"
          glowColor="transparent"
          gradientFrom="#0a0a0a"
        />

        {categories.map((c, i) => (
          <CategoryCard
            key={c.id || c.name || `category-${i}`}
            title={c.title}
            label={c.subtitle || "หมวดหมู่"}
            itemCountDesc={`${getProductCountText(c)}`}
            priceRangeStr={getCategoryPriceInfo(c) || undefined}
            bgImage={c.bannerUrl || undefined}
            index={i + 1}
            onClick={() => onSelectCategory(c.id || c.name || c.title)}
            accentColor="#0066ff"
            glowColor="transparent"
            gradientFrom="#0a0a0a"
          />
        ))}
          </>
        )}
      </div>
    </div>
  );
};
