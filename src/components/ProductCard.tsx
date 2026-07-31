import React from "react";
import { motion } from "motion/react";
import { Package, ShoppingCart, Bell } from "lucide-react";
import { Product } from "../types";
import Swal from "sweetalert2";

// Helper utilities from CategoryProductsView
const generateEmojiFallback = (name: string) => {
  const emojis = ['🚀', '🔥', '💎', '🎮', '👑', '🎁', '⚡', '🌟', '🏆', '🎧'];
  const hash = String(name).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return emojis[Math.abs(hash) % emojis.length];
};

const formatProductName = (name: string) => {
  return name.replace(/\)/g, " )").replace(/\(/g, "( ");
};

interface ProductCardProps {
  product: Product;
  onProductClick: (id: string) => void;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onProductClick, index = 0 }) => {
  const discount = product.originalPrice && product.price < product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;
    
  const isHot = !!(product.isPopular || product.tag?.toLowerCase() === 'hot');
  const isRecommended = product.tag?.toLowerCase() === 'recommended';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: '0 14px 35px -5px rgba(37, 99, 235, 0.35)', borderColor: 'rgba(59, 130, 246, 0.7)' }}
      transition={{ duration: 0.2 }}
      className="group relative bg-slate-900/60 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer shadow-[0_8px_25px_rgba(0,0,0,0.5)]"
      onClick={() => onProductClick(product.id)}
    >
      {/* Top Glass shine reflection */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-br from-white/15 via-white/5 to-transparent pointer-events-none z-10" />

      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0 pointer-events-none bg-slate-950">
        {product.imageUrl && product.imageUrl.trim() !== "" ? (
          <img loading="lazy"
            src={product.imageUrl}
            alt={formatProductName(product.name)}
            className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              if (e.currentTarget.nextElementSibling) {
                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
              }
            }}
            referrerPolicy="no-referrer"
          />
        ) : null}
        
        <div 
          className="w-full h-full flex flex-col items-center justify-center opacity-90 transition-all duration-300 group-hover:opacity-100"
          style={{ display: product.imageUrl && product.imageUrl.trim() !== "" ? 'none' : 'flex' }}
        >
          <span className="text-[60px] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
            {generateEmojiFallback(product.name || product.id)}
          </span>
        </div>

        {/* Diagonal Ribbons or Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {isHot && (
            <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-red-400/40 shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              🔥 ขายดี
            </span>
          )}
          {isRecommended && (
            <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/40 shadow-[0_0_10px_rgba(37,99,235,0.5)]">
              ⭐ แนะนำ
            </span>
          )}
        </div>

        {/* Discount Badge on right */}
        {discount !== null && (
          <div className="absolute top-2.5 right-2.5 bg-blue-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-blue-300/40 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 pointer-events-none">
            ลด {discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 z-10 relative">
        <h3 className="text-[14px] font-bold text-white leading-snug line-clamp-2 min-h-[40px] mb-3 group-hover:text-blue-400 transition-colors duration-300">
          {formatProductName(product.name)}
        </h3>

        {/* Price row */}
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <span className="text-xl font-bold text-blue-400 tracking-tight font-mono">
            ฿{(product.price || 0).toLocaleString()}
          </span>
          {product.originalPrice && product.price < product.originalPrice ? (
            <span className="text-xs text-white/40 line-through font-mono mb-1">฿{product.originalPrice.toLocaleString()}</span>
          ) : null}
          
          {product.stock > 0 ? (
            <span className="ml-auto bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold px-2 py-1 rounded-md select-none">
              พร้อมส่ง
            </span>
          ) : (
            <span className="ml-auto bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold px-2 py-1 rounded-md select-none">
              สินค้าหมด
            </span>
          )}
        </div>

        {/* Buy Button */}
        {product.stock <= 0 ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              Swal.fire({
                title: 'แจ้งเตือนเมื่อมีสินค้า',
                text: `เราจะส่งข้อความแจ้งเตือนเมื่อ ${product.name} กลับมามีสต็อกอีกครั้ง`,
                icon: 'success',
                confirmButtonText: 'ตกลง',
                background: '#090d16',
                color: '#ffffff',
                confirmButtonColor: '#2563eb',
                customClass: { confirmButton: 'text-white font-bold px-5 py-2 rounded-xl' }
              });
            }}
            className="w-full bg-white/5 backdrop-blur-md text-white/60 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-auto border border-white/15 transition-all hover:bg-white/10"
          >
            <Bell className="w-3.5 h-3.5" /> แจ้งเตือนเมื่อมาใหม่
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product.id);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-xs font-bold transition-all mt-auto border border-blue-400/40 cursor-pointer shadow-[0_4px_15px_rgba(37,99,235,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4" />
            สั่งซื้อสินค้า
          </button>
        )}
      </div>
    </motion.div>
  );
};
