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
      whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 212, 170, 0.25)', borderColor: '#00d4aa' }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden transition-all duration-300 flex flex-col cursor-pointer"
      onClick={() => onProductClick(product.id)}
    >
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden shrink-0 pointer-events-none bg-gradient-to-br from-[#140b2e] to-[#0a0e1a]">
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
          <span className="text-[64px] group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {generateEmojiFallback(product.name || product.id)}
          </span>
        </div>

        {/* Diagonal Ribbons or Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10 pointer-events-none">
          {isHot && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">
              🔥 ขายดี
            </span>
          )}
          {isRecommended && (
            <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              ⭐ แนะนำ
            </span>
          )}
        </div>

        {/* Discount Badge on right */}
        {discount !== null && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)] z-10 pointer-events-none">
            ลด {discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 z-10 relative">
        <h3 className="text-[14px] font-bold text-white leading-snug line-clamp-2 min-h-[42px] mb-3 group-hover:text-teal-400 transition-colors duration-300">
          {formatProductName(product.name)}
        </h3>

        {/* Price row */}
        <div className="flex flex-wrap items-end gap-2 mb-4">
          <span className="text-xl font-bold text-teal-400 tracking-tight font-mono">
            ฿{(product.price || 0).toLocaleString()}
          </span>
          {product.originalPrice && product.price < product.originalPrice ? (
            <span className="text-xs text-white/40 line-through font-mono mb-1">฿{product.originalPrice.toLocaleString()}</span>
          ) : null}
          
          {product.stock > 0 ? (
            <span className="ml-auto bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-1 rounded select-none">
              พร้อมส่ง
            </span>
          ) : (
            <span className="ml-auto bg-rose-500/10 text-rose-400 text-[10px] font-bold px-2 py-1 rounded select-none">
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
                background: '#1a1f35',
                color: '#f1f5f9',
                confirmButtonColor: '#00d4aa',
                customClass: { confirmButton: 'text-black font-bold px-5 py-2 rounded' }
              });
            }}
            className="w-full bg-black/40 backdrop-blur-md text-white/60 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer mt-auto border border-white/20 transition-all hover:bg-white/10"
          >
            <Bell className="w-3.5 h-3.5" /> แจ้งเตือนเมื่อมาใหม่
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onProductClick(product.id);
            }}
            className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-teal-500 text-teal-400 hover:text-white py-2.5 rounded-lg text-xs font-bold transition-all mt-auto border border-teal-500 hover:border-transparent cursor-pointer shadow-[0_0_10px_rgba(0,212,170,0.1)] hover:shadow-[0_0_20px_rgba(0,212,170,0.3)]"
          >
            <ShoppingCart className="w-4 h-4" />
            ซื้อสินค้า
          </button>
        )}
      </div>
    </motion.div>
  );
};
