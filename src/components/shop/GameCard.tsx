import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  ShoppingCart, 
  ShieldCheck, 
  Sparkles, 
  Flame, 
  Check, 
  ChevronRight,
  Zap,
  Tag
} from 'lucide-react';
import { GameProduct } from '../../types/store';
import { useStore } from '../../context/StoreContext';

interface GameCardProps {
  product: GameProduct;
}

export const GameCard: React.FC<GameCardProps> = ({ product }) => {
  const { openPurchaseModal, theme } = useStore();

  const lowestRentalPrice = product.rentalOptions && product.rentalOptions.length > 0 
    ? Math.min(...product.rentalOptions.map(r => r.price))
    : null;

  const discountPercent = product.originalBuyPrice && product.buyPrice
    ? Math.round(((product.originalBuyPrice - product.buyPrice) / product.originalBuyPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
        theme === 'dark'
          ? 'bg-[#0f1015] border-zinc-800/80 hover:border-emerald-500/40 hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.15)]'
          : 'bg-white border-zinc-200 hover:border-emerald-500/40 hover:shadow-[0_12px_30px_-8px_rgba(16,185,129,0.15)]'
      }`}
    >
      {/* Image Thumbnail Area */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        {/* Hot / Verified Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.isHot && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/30 tracking-wider">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
          {product.isVerified && (
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-black backdrop-blur-md">
              <ShieldCheck className="w-3 h-3" /> ยืนยันแล้ว
            </span>
          )}
        </div>

        {/* Discount tag */}
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-rose-600 text-white text-[10px] font-black shadow-md tracking-wider">
            -{discountPercent}%
          </div>
        )}

        {/* Game Name & Rank Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded bg-black/70 text-zinc-300 border border-zinc-700/60 backdrop-blur-md">
            {product.gameName}
          </span>
          {product.rank && (
            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded border backdrop-blur-md ${product.rankColor || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}>
              {product.rank}
            </span>
          )}
        </div>
      </div>

      {/* Content Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <h4 className="text-sm font-bold line-clamp-2 leading-snug group-hover:text-emerald-400 transition-colors">
            {product.title}
          </h4>

          {/* Featured highlights chips */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {product.featuredItems.slice(0, 3).map((item, idx) => (
              <span 
                key={idx} 
                className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                  theme === 'dark' 
                    ? 'bg-zinc-900 text-zinc-300 border-zinc-800' 
                    : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                }`}
              >
                {item}
              </span>
            ))}
            {product.featuredItems.length > 3 && (
              <span className="text-[10px] font-semibold text-zinc-500 px-1 py-0.5">
                +{product.featuredItems.length - 3} ไอเทม
              </span>
            )}
          </div>
        </div>

        {/* Pricing Block */}
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="flex items-end justify-between mb-3">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 block">ราคาซื้อขาด (Full Buy)</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-emerald-400 font-mono">
                  ฿{product.buyPrice?.toLocaleString()}
                </span>
                {product.originalBuyPrice && (
                  <span className="text-xs text-zinc-500 line-through font-mono">
                    ฿{product.originalBuyPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {lowestRentalPrice !== null && (
              <div className="text-right">
                <span className="text-[10px] font-semibold text-amber-400/90 block">ราคาเช่าเริ่มต้น</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  ฿{lowestRentalPrice}/ชม.
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Rent Button */}
            {product.rentalOptions && product.rentalOptions.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openPurchaseModal(product, 'rent')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  theme === 'dark'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>เช่าไอดี</span>
              </motion.button>
            )}

            {/* Buy Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => openPurchaseModal(product, 'buy')}
              className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md ${
                product.rentalOptions && product.rentalOptions.length > 0 ? '' : 'col-span-2'
              } ${
                product.status === 'sold'
                  ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
              }`}
              disabled={product.status === 'sold'}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{product.status === 'sold' ? 'ขายแล้ว' : 'ซื้อทันที'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
