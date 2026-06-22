import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  ArrowLeft, 
  ShoppingCart, 
  Star, 
  Search, 
  Filter, 
  Gamepad2, 
  Tv, 
  SlidersHorizontal, 
  CheckCircle, 
  X, 
  TrendingUp, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Category, Product } from '../types';
import { ProductCard } from './ProductCard';

interface CategoriesViewProps {
  categories: Category[];
  products: Product[];
  siteSettings?: any;
  selectedCategory?: string;
  setSelectedCategory?: (categoryId: string | null) => void;
  onBack: () => void;
  onSelectCategory?: (categoryId: string) => void;
  onProductClick: (id: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({ 
  categories = [], 
  products = [], 
  siteSettings, 
  selectedCategory: propSelectedCategory,
  setSelectedCategory: propSetSelectedCategory,
  onBack, 
  onSelectCategory,
  onProductClick
}) => {
  // If parent state is not supplied (fallback), use local state
  const [localSelectedCategory, setLocalSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('recommend');
  const [showOnlyInStock, setShowOnlyInStock] = useState<boolean>(false);
  const [renderLimit, setRenderLimit] = useState(24);

  const activeCategory = propSelectedCategory !== undefined ? (propSelectedCategory || 'all') : localSelectedCategory;

  // Reset limit when category or search changes
  useEffect(() => {
    setRenderLimit(24);
  }, [activeCategory, searchQuery]);

  const handleSelectCategory = (catId: string) => {
    if (propSetSelectedCategory) {
      propSetSelectedCategory(catId === 'all' ? 'all' : catId);
    } else {
      setLocalSelectedCategory(catId);
    }
    
    if (onSelectCategory) {
      onSelectCategory(catId);
    }
  };

  const getCategoryPriceInfo = (cat: any) => {
    const catProducts = cat === 'all' 
      ? products 
      : products.filter(p => p.category === cat.id || p.category === cat.name || p.category === cat.title);
    
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
    const catProducts = cat === 'all' 
      ? products 
      : products.filter(p => p.category === cat.id || p.category === cat.name || p.category === cat.title);
    return catProducts.length;
  };

  const categoryInfo = categories.find(
    (c) => c.id === activeCategory || c.name === activeCategory || c.title === activeCategory
  );

  // Filter products
  const filteredProducts = products.filter((p) => {
    // 1. Category search
    let matchesCategory = false;
    if (activeCategory === "all") {
      matchesCategory = true;
    } else {
      matchesCategory = 
        p.category === activeCategory ||
        p.category === categoryInfo?.id ||
        p.category === categoryInfo?.name ||
        p.category === categoryInfo?.title;
    }

    // 2. Text Search Match
    const matchesSearch = searchQuery.trim() !== ''
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    // 3. Stock Match
    const matchesStock = showOnlyInStock ? p.stock > 0 : true;

    return matchesCategory && matchesSearch && matchesStock;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // In-stock products always sorted first for standard store layout
    const aStock = Number(a.stock) > 0 ? 1 : 0;
    const bStock = Number(b.stock) > 0 ? 1 : 0;
    if (bStock !== aStock) {
      return bStock - aStock; 
    }
    
    if (sortBy === "price_asc") {
      return a.price - b.price;
    } else if (sortBy === "price_desc") {
      return b.price - a.price;
    } else if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    // Default or recommendation
    return b.id.localeCompare(a.id);
  });

  const visibleProducts = sortedProducts.slice(0, renderLimit);

  // Map category to a gorgeous icon
  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes("เกม") || lower.includes("gaming") || lower.includes("id") || lower.includes("rov") || lower.includes("freefire")) {
      return <Gamepad2 className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />;
    }
    if (lower.includes("แอป") || lower.includes("app") || lower.includes("premium") || lower.includes("บันเทิง") || lower.includes("netflix") || lower.includes("spotify")) {
      return <Tv className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />;
    }
    return <Package className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:scale-110" />;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 font-sans text-[#1e1e20] bg-white">
      
      {/* ===== Header Bar ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white hover:bg-slate-100 border border-[#e2e8f0] rounded-xl transition-colors group cursor-pointer"
            aria-label="กลับหน้าหลัก"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-[#1e1e20]" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e1e20] tracking-tight flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-blue-500 animate-pulse" /> ซื้อไอดีเกม & บริการ
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-muted-foreground mt-1">ปลอดภัย ไร้กังวล จัดส่งข้อมูลทันทีหลังทำรายการ</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ======================================================== */}
        {/* 1. Category Navigation (DESKTOP SIDEBAR)               */}
        {/* ======================================================== */}
        <div className="hidden lg:flex flex-col w-[280px] bg-white border border-zinc-150 rounded-2xl p-5 shrink-0 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.03)] sticky top-24">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 px-2 flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-650" /> เลือกหมวดหมู่
          </h2>
          
          <div className="space-y-1">
            {/* "All" Category Item */}
            <button
              onClick={() => handleSelectCategory('all')}
              className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all group cursor-pointer border ${
                activeCategory === 'all' 
                  ? 'bg-blue-50/75 text-blue-600 border-blue-100 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]' 
                  : 'text-zinc-500 hover:text-[#1a1a1c] hover:bg-slate-50 border-transparent hover:border-zinc-100/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${activeCategory === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-zinc-400 group-hover:bg-white'}`}>
                  <Package className="w-4 h-4" />
                </div>
                <span>สินค้าทั้งหมด</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full font-mono transition-colors duration-300 ${activeCategory === 'all' ? 'bg-blue-100/50 text-blue-610' : 'bg-zinc-100 text-zinc-400'}`}>
                {getProductCountText('all')}
              </span>
            </button>

            {/* List of Custom Categories */}
            {categories.map((c) => {
              const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
              const count = getProductCountText(c);
              return (
                <button
                  key={c.id || c.name}
                  onClick={() => handleSelectCategory(c.id || c.name || c.title)}
                  className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl text-xs font-bold transition-all group cursor-pointer border ${
                    isActive 
                      ? 'bg-blue-50/75 text-blue-600 border-blue-100 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]' 
                      : 'text-zinc-500 hover:text-[#1a1a1c] hover:bg-slate-50 border-transparent hover:border-zinc-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-50 text-zinc-400 group-hover:bg-white'}`}>
                      {getCategoryIcon(c.title || c.name)}
                    </div>
                    <span className="truncate max-w-[130px]">{c.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 font-bold rounded-full font-mono transition-colors duration-300 ${isActive ? 'bg-blue-100/50 text-blue-610' : 'bg-zinc-100 text-zinc-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Notice Banner inside Sidebar */}
          <div className="mt-8 bg-slate-50/60 border border-zinc-150 p-4 rounded-xl text-left">
            <h4 className="text-[11px] font-black text-[#1a1a1c] flex items-center gap-1.5 mb-1.5 uppercase tracking-wide">
              <Info className="w-3.5 h-3.5 text-blue-600" /> บริการแบบออโต้
            </h4>
            <p className="text-[10px] leading-relaxed text-zinc-450 font-semibold">
              เว็บไซต์ของเราจัดจำหน่ายผ่านระบบอัตโนมัติ 100% ชำระเงินแล้วสามารถรอการแสดงผลและจัดส่งข้อมูลรหัสลับได้ทันทีทางเมนูประวัติการสั่งซื้อ
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 1. Category Selector (MOBILE HORIZONTAL TABS SCROLLER) */}
        {/* ======================================================== */}
        <div className="lg:hidden w-full overflow-x-auto overflow-y-hidden py-1.5 mb-3 shrink-0 flex items-center gap-2 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {/* Scroll item "All" */}
          <button
            onClick={() => handleSelectCategory('all')}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:bg-blue-750'
                : 'bg-white text-[#1a1a1c] border-zinc-200 hover:border-zinc-300'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ทั้งหมด ({getProductCountText('all')})</span>
          </button>

          {/* Scroll items of categories */}
          {categories.map((c) => {
            const isActive = activeCategory === c.id || activeCategory === c.name || activeCategory === c.title;
            const count = getProductCountText(c);
            return (
              <button
                key={c.id || c.name}
                onClick={() => handleSelectCategory(c.id || c.name || c.title)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:bg-blue-750'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {getCategoryIcon(c.title || c.name)}
                <span>{c.title} ({count})</span>
              </button>
            );
          })}
        </div>


        {/* ======================================================== */}
        {/* 2. Main Shop Area & Products Catalog                   */}
        {/* ======================================================== */}
        <div className="flex-1 w-full flex flex-col">
          
          {/* Filters, Search Inputs, Layout */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.02)] w-full">
            
            {/* Left: Input Text Search */}
            <div className="relative w-full md:max-w-md group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="ค้นหาสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 text-xs font-bold py-3 pl-12 pr-10 rounded-full placeholder:text-zinc-400 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-[#1a1a1c] h-10 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right: Sort options & In-Stock toggle */}
            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 justify-start md:justify-end">
              
              {/* Only in Stock Checkbox */}
              <button
                onClick={() => setShowOnlyInStock(!showOnlyInStock)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showOnlyInStock 
                    ? 'bg-blue-50/75 border-blue-200/60 text-blue-600 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.05)]' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-[#1a1a1c]'
                }`}
              >
                {showOnlyInStock ? (
                  <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 fill-blue-500/15" />
                ) : (
                  <div className="w-4 h-4 border-2 border-zinc-300 rounded-md shrink-0" />
                )}
                <span>เฉพาะพร้อมส่ง</span>
              </button>

              {/* Select dropdown sorting */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-zinc-200 text-xs font-bold px-4 py-2.5 pr-9 rounded-xl outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all text-[#1a1a1c] cursor-pointer appearance-none"
                >
                  <option value="recommend">แนะนำล่าสุด</option>
                  <option value="price_asc">ราคา: ประหยัดสุด</option>
                  <option value="price_desc">ราคา: ราคาสูงไปต่ำ</option>
                  <option value="name">ชื่อสินค้า (A - Z)</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                  <ChevronRight className="w-3.5 h-3.5 transform rotate-90" />
                </div>
              </div>
            </div>
          </div>

          {/* Banner of Active Category if available */}
          <AnimatePresence mode="wait">
            {activeCategory !== 'all' && categoryInfo?.bannerUrl && (
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative w-full rounded-2xl overflow-hidden border border-zinc-150 bg-white mb-6 group shadow-[0_8px_24px_rgba(0,0,0,0.02)] shrink-0"
                style={{ aspectRatio: '1640 / 500' }}
              >
                <img
                  src={categoryInfo.bannerUrl}
                  alt={categoryInfo.title || "Banner"}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-95 transition-all duration-300 pointer-events-none"
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid with smooth scale and stagger effects */}
          <AnimatePresence mode="popLayout">
            {sortedProducts.length === 0 ? (
              <motion.div 
                key="empty-state"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="w-full border border-dashed border-[#e2e8f0] bg-white rounded-2xl py-16 px-6 text-center shadow-sm"
              >
                <Package className="w-14 h-14 text-zinc-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-[#1e1e20]">ไม่พบรายงานสินค้าที่คุณกำลังต้องการ</h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
                  ไม่พบสินค้าในคำค้นหา หรือหมวดหมู่นี้ในขณะนี้ ท่านสามารถลองเปลี่ยนการค้นหาหรือเลือกหมวดหมู่อื่นเพื่อรับคำชมได้ทันที
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setShowOnlyInStock(false);
                    handleSelectCategory('all');
                  }}
                  className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 border border-blue-200/40 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="products-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              >
                {visibleProducts.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={onProductClick}
                    index={i}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Load More Button */}
          {visibleProducts.length < sortedProducts.length && (
            <div className="mt-12 flex justify-center pb-12">
              <button
                onClick={() => setRenderLimit(prev => prev + 24)}
                className="px-8 py-3 bg-white border border-[#e2e8f0] text-[#1e1e20] hover:bg-slate-50 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              >
                แสดงสินค้าเพิ่มเติม ({sortedProducts.length - visibleProducts.length} ชิ้น)
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
