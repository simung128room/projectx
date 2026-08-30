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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30, delay: Math.min(index, 10) * 0.03 }}
      className="group relative bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden hover:border-[#3b82f6]/40 transition-colors duration-200 flex flex-col shadow-sm hover:shadow-md"
    >
      {/* Image area with corner ribbon */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden shrink-0 pointer-events-none">
        {product.imageUrl && product.imageUrl.trim() !== "" ? (
          <img loading="lazy"
            src={product.imageUrl}
            alt={formatProductName(product.name)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
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
          className="w-full h-full flex flex-col items-center justify-center opacity-90"
          style={{ 
            display: product.imageUrl && product.imageUrl.trim() !== "" ? 'none' : 'flex',
            background: generateGradient(formatProductName(product.name) || product.id)
          }}
        >
          <span className="text-4xl font-bold text-[#1e1e20]/20 uppercase">
            {(formatProductName(product.name) || "P")[0].toUpperCase()}
          </span>
          <span className="text-[10px] font-bold text-[#1e1e20]/40 uppercase tracking-widest mt-1">STORETH</span>
        </div>

        {/* Diagonal "Best Seller" ribbon in image corner */}
        {isHot && (
          <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none z-10">
            <div className="absolute top-3 -right-6 bg-[#3b82f6] text-white text-[9px] font-bold uppercase py-1 w-24 text-center transform rotate-45 shadow-sm">
              Hot
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 to-transparent opacity-80" />

        {/* Discount Badge on left */}
        {discount !== null && (
          <div className="absolute top-3 left-3 bg-[#ff3d60] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-lg shadow-md z-10">
            -{discount}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white border-t border-[#e2e8f0] mt-[-10px] z-10 rounded-t-2xl">
        <h3 className="text-sm font-bold text-[#1e1e20] leading-snug line-clamp-2 min-h-[40px] mb-3 group-hover:text-[#3b82f6] transition-colors cursor-pointer" onClick={() => onProductClick(product.id)}>
          {formatProductName(product.name)}
        </h3>

        {/* "ราคาสินค้า" subtle label */}
        <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">ราคาสินค้า</span>

        {/* Price row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.originalPrice && product.price < product.originalPrice ? (
            <span className="text-xs text-[#ff3d60]/80 line-through font-mono font-medium">฿{product.originalPrice.toLocaleString()}</span>
          ) : null}
          
          <span className="text-base font-bold text-blue-600 tracking-tight font-mono">
            ฿{(product.price || 0).toLocaleString()}
          </span>

          {product.stock > 0 ? (
            <span className="ml-auto bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 text-[9px] font-semibold px-2 py-0.5 rounded-lg leading-none select-none">
              มีสินค้า
            </span>
          ) : (
            <span className="ml-auto bg-red-500/10 text-red-500 border border-red-500/20 text-[9px] font-semibold px-2 py-0.5 rounded-lg leading-none select-none">
              หมด
            </span>
          )}
        </div>

        {/* Buy Button */}
        {product.stock <= 0 ? (
          <button className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-default mt-auto">
            <Package className="w-3.5 h-3.5" /> สินค้าหมด
          </button>
        ) : (
          <button
            onClick={() => onProductClick(product.id)}
            className="w-full flex items-center justify-center gap-2 bg-[#3b82f6] hover:bg-blue-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-200 mt-auto shadow-md shadow-blue-500/10 active:scale-95 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            สั่งซื้อสินค้า
          </button>
        )}

        {/* Stock Row Box */}
        <div className="mt-3.5 py-2 rounded-xl bg-slate-50 border border-[#e2e8f0] flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-wider leading-none">
          <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>คงเหลือ <span className="text-[#1e1e20] font-mono">{product.stock >= 999999 ? "ไม่จำกัด" : product.stock.toLocaleString()}</span> ชิ้น</span>
        </div>
      </div>
    </motion.div>
  );
};
