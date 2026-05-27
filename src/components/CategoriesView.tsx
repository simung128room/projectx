import React from 'react';
import { motion } from 'motion/react';
import { Package, ArrowLeft, ChevronRight, ShoppingCart, Star, TrendingUp } from 'lucide-react';
import { Category, Product } from '../types';
import { CategoryCard } from './CategoryCard';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  siteSettings?: any;
  onBack: () => void;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ categories, products, siteSettings, onBack, onSelectCategory }) => {
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
          className="p-3 bg-[#0B0D0F] hover:bg-[#121820] border border-white/10 rounded-full transition-colors group shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
        </button>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
             <Package className="w-8 h-8 text-[#2563EB]" /> หมวดหมู่สินค้า
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-2">เลือกหมวดหมู่ที่ต้องการดูสินค้า</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CategoryCard
          title="ดูสินค้าทั้งหมด"
          label="ทุกหมวดหมู่"
          itemCountDesc={`ทั้งหมด ${getProductCountText('all')}`}
          priceRangeStr={allPriceInfo || undefined}
          bgImage={siteSettings?.banners?.[0] || "https://img2.pic.in.th/-71_20260516210303.png"}
          index={0}
          onClick={() => onSelectCategory('all')}
          accentColor="#3B82F6"
          glowColor="rgba(59,130,246,0.6)"
          gradientFrom="#0B0D0F"
        />

        {categories.map((c, i) => (
          <CategoryCard
            key={c.id}
            title={c.title}
            label={c.subtitle || "หมวดหมู่"}
            itemCountDesc={`${getProductCountText(c.name)}`}
            priceRangeStr={getCategoryPriceInfo(c.name) || undefined}
            bgImage={c.bannerUrl || undefined}
            index={i + 1}
            onClick={() => onSelectCategory(c.name)}
            accentColor="#3B82F6"
            glowColor="rgba(59,130,246,0.6)"
            gradientFrom="#0B0D0F"
          />
        ))}
      </div>
    </div>
  );
};
