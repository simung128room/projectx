import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameCard } from './GameCard';
import { HeroBanner } from '../home/HeroBanner';
import { useStore } from '../../context/StoreContext';
import { Gamepad2, SearchX, RotateCcw } from 'lucide-react';

export const ShopView: React.FC = () => {
  const { products, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'rent'>('all');

  const filteredProducts = products.filter(product => {
    // Category filter
    if (selectedCategory !== 'all' && product.game !== selectedCategory) {
      return false;
    }

    // Buy/Rent filter
    if (filterType === 'buy' && (!product.buyPrice || product.productType === 'rent')) {
      return false;
    }
    if (filterType === 'rent' && (!product.rentalOptions || product.rentalOptions.length === 0 || product.productType === 'buy')) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchGame = product.gameName.toLowerCase().includes(q);
      const matchRank = product.rank?.toLowerCase().includes(q);
      const matchItems = product.featuredItems.some(i => i.toLowerCase().includes(q));

      if (!matchTitle && !matchGame && !matchRank && !matchItems) {
        return false;
      }
    }

    return true;
  });

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setFilterType('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero & Filter Controls */}
      <HeroBanner filterType={filterType} setFilterType={setFilterType} />

      {/* Products Grid & Results Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
          <span>
            แสดงรายการสินค้า <b className="text-zinc-200">{filteredProducts.length}</b> ไอดี
          </span>
          {(selectedCategory !== 'all' || searchQuery || filterType !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-16 rounded-3xl bg-[#0f1015] border border-zinc-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-zinc-500 flex items-center justify-center mx-auto">
              <SearchX className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">ไม่พบรายการไอดีที่ตรงกับคำค้นหา</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                ลองค้นหาด้วยคำค้นอื่น หรือเปลี่ยนหมวดหมู่เกมเพื่อดูสินค้าทั้งหมด
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="py-2.5 px-5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 cursor-pointer transition-colors"
            >
              ดูไอดีทั้งหมดในร้าน
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredProducts.map((product) => (
              <GameCard key={product.id} product={product} />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};
