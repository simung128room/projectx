import React from "react";
import { motion } from "motion/react";
import { Package, ShoppingCart } from "lucide-react";
import { Product } from "../types";

// Helper utilities from CategoryProductsView
const generateGradient = (seed: string | number) => {
  const hash = String(seed).split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue1 = hash % 360;
  const hue2 = (hash * 2) % 360;
  return `linear-gradient(135deg, hsl(${hue1}, 60%, 93%), hsl(${hue2}, 50%, 88%))`;
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
  const isHot = product.price > 100 || (discount !== null && discount >= 20) || product.stock > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, ...({} as any) }}
      transition={{ 
        type: "spring", 
        stiffness: 280, 
        damping: 22, 
        delay: Math.min(index, 8) * 0.03
      }}
      className="group relative bg-white border border-zinc-150 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-colors duration-300 flex flex-col shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05),0_10px_20px_-12px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-8px_rgba(59,130,246,0.12),0_4px_12px_-4px_rgba(59,130,246,0.05)]"
    >
      {/* Image area with corner ribbon */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden shrink-0 pointer-events-none">
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
          style={{ 
            display: product.imageUrl && product.imageUrl.trim() !== "" ? 'none' : 'flex',
            background: generateGradient(formatProductName(product.name) || product.id)
          }}
        >
          <span className="text-4xl font-extrabold text-[#1a1a1c]/20 uppercase tracking-tighter group-hover:scale-110 transition-transform duration-500">
            {(formatProductName(product.name) || "P")[0].toUpperCase()}
          </span>
          <span className="text-[10px] font-black text-[#1a1a1c]/30 uppercase tracking-widest mt-1">STORETH</span>
        </div>

        {/* Diagonal "Best Seller" ribbon in image corner */}
        {isHot && (
          <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none z-10">
            <div className="absolute top-3 -right-6 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[9px] font-extrabold uppercase py-1 w-24 text-center transform rotate-45 shadow-sm tracking-wider">
              Hot
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Discount Badge on left */}
        {discount !== null && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-lg shadow-[0_4px_12px_rgba(244,63,94,0.3)] z-10">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white border-t border-zinc-100 mt-[-10px] z-10 rounded-t-2xl transition-colors duration-300 group-hover:bg-slate-50/20">
        <h3 className="text-sm font-bold text-[#1e1e20] leading-snug line-clamp-2 min-h-[40px] mb-3 group-hover:text-blue-600 transition-colors duration-300 cursor-pointer" onClick={() => onProductClick(product.id)}>
          {formatProductName(product.name)}
        </h3>

        {/* "ราคาสินค้า" subtle label */}
        <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-widest block mb-1">ราคาสินค้า</span>

        {/* Price row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.originalPrice && product.price < product.originalPrice ? (
            <span className="text-xs text-zinc-400 line-through font-mono font-bold">฿{product.originalPrice.toLocaleString()}</span>
          ) : null}
          
          <span className="text-base font-extrabold text-blue-600 tracking-tight font-mono">
            ฿{(product.price || 0).toLocaleString()}
          </span>

          {product.stock > 0 ? (
            <span className="ml-auto bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-black px-2 py-0.5 rounded-lg leading-none select-none tracking-wide">
              มีสินค้า
            </span>
          ) : (
            <span className="ml-auto bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black px-2 py-0.5 rounded-lg leading-none select-none tracking-wide">
              หมด
            </span>
          )}
        </div>

        {/* Buy Button */}
        {product.stock <= 0 ? (
          <button className="w-full bg-zinc-100 text-zinc-450 border border-zinc-200/60 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default mt-auto transition-all duration-300">
            <Package className="w-3.5 h-3.5" /> สินค้าหมด
          </button>
        ) : (
          <button
            onClick={() => onProductClick(product.id)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 mt-auto shadow-[0_4px_12px_rgba(59,130,246,0.15)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            สั่งซื้อสินค้า
          </button>
        )}

        {/* Stock Row Box */}
        <div className="mt-3 py-2 rounded-xl bg-slate-50 border border-zinc-100 flex items-center justify-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none transition-colors duration-300 group-hover:bg-zinc-100/40">
          <Package className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>คงเหลือ <span className="text-[#1a1a1c] font-black font-mono">{product.stock >= 999999 ? "ไม่จำกัด" : product.stock.toLocaleString()}</span> ชิ้น</span>
        </div>
      </div>
    </motion.div>
  );
};
