import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GameAccountProduct } from '../../types';
import { Search, ShoppingBag, Clock, Key } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MarketplaceView: React.FC = () => {
  const { 
    accountProducts, 
    setSelectedProductForModal, 
    setOpenPurchaseModal, 
    setPurchaseModalMode,
    isLoggedIn,
    setAuthModalMode,
    setCurrentView,
    activeRentals
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'roblox' | 'valorant' | 'genshin' | 'rov'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const activeRents = activeRentals.filter(r => r.status === 'active');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'roblox', label: 'Roblox' },
    { id: 'valorant', label: 'Valorant' },
    { id: 'genshin', label: 'Genshin Impact' },
    { id: 'rov', label: 'RoV' },
  ] as const;

  const filteredProducts = accountProducts.filter((product) => {
    if (selectedCategory !== 'all' && product.gameCategory !== selectedCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      product.title.toLowerCase().includes(q) ||
      product.gameName.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.features.some(f => f.toLowerCase().includes(q))
    );
  });

  const handleAction = (product: GameAccountProduct, mode: 'buy' | 'rent') => {
    if (!isLoggedIn) {
      setAuthModalMode('login');
      setCurrentView('auth');
      return;
    }
    setSelectedProductForModal(product);
    setPurchaseModalMode(mode);
    setOpenPurchaseModal(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-prompt">
            ตลาดซื้อ-เช่าไอดีเกม
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            เลือกซื้อไอดีถาวร หรือเช่ารายชั่วโมง ระบบส่งรหัสผ่านและ 2FA ให้ทันที
          </p>
        </div>

        {activeRents.length > 0 && (
          <button
            onClick={() => setCurrentView('rentals')}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>ดูไอดีที่เช่าอยู่ ({activeRents.length})</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="ค้นหาไอดี..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#141517] shadow-xs text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                    : 'bg-white dark:bg-[#141517] text-neutral-500 hover:text-neutral-900 dark:hover:text-white shadow-xs'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((product) => {
          const isSold = product.status === 'sold';
          return (
            <div
              key={product.id}
              className="bg-white dark:bg-[#141517] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative h-44 w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white">
                      {product.gameName}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt line-clamp-1">
                    {product.title}
                  </h3>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {product.features.slice(0, 3).map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                  <div>
                    <div className="text-[10px] text-neutral-400">ราคาซื้อถาวร</div>
                    <div className="text-base font-bold font-mono text-neutral-900 dark:text-white">
                      {formatCurrency(product.buyPrice)}
                    </div>
                  </div>

                  {product.isRentable && (
                    <div className="text-right">
                      <div className="text-[10px] text-neutral-400">เช่ารายชั่วโมง</div>
                      <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(product.rentPricePerHour || 20)}/ชม.
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {product.isRentable && (
                    <button
                      disabled={isSold}
                      onClick={() => handleAction(product, 'rent')}
                      className="py-2.5 rounded-2xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>เช่าเล่น</span>
                    </button>
                  )}

                  <button
                    disabled={isSold}
                    onClick={() => handleAction(product, 'buy')}
                    className={`py-2.5 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      product.isRentable ? 'col-span-1' : 'col-span-2'
                    } ${
                      isSold 
                        ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed' 
                        : 'bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 shadow-xs'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isSold ? 'ขายแล้ว' : 'ซื้อทันที'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
