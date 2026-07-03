import React from "react";
import { motion } from "motion/react";
import { Package, ShoppingCart, Bell } from "lucide-react";
import { Product } from "../types";
import Swal from "sweetalert2";

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
  const isHot = !!(product.isPopular || product.tag?.toLowerCase() === 'hot');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-card border border-border rounded-lg overflow-hidden hover:border-ring transition-all duration-300 flex flex-col"
    >
      {/* Image area with corner ribbon */}
      <div className="relative aspect-square w-full bg-secondary overflow-hidden shrink-0 pointer-events-none">
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
          <span className="text-4xl font-extrabold text-foreground/10 uppercase tracking-tighter group-hover:scale-105 transition-transform duration-500">
            {(formatProductName(product.name) || "P")[0].toUpperCase()}
          </span>
          <span className="text-[10px] font-mono text-foreground/30 uppercase tracking-wider mt-1">SUNOID</span>
        </div>
 
        {/* Diagonal "Best Seller" ribbon in image corner */}
        {isHot && (
          <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none z-10">
            <div className="absolute top-3 -right-6 bg-foreground text-background text-[9px] font-semibold uppercase py-1 w-24 text-center transform rotate-45 shadow-sm tracking-wider">
              Hot
            </div>
          </div>
        )}
 
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
 
        {/* Discount Badge on left */}
        {discount !== null && (
          <div className="absolute top-3 left-3 bg-foreground text-background text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-10">
            -{discount}%
          </div>
        )}
      </div>
 
      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-card border-t border-border mt-[-8px] z-10 rounded-t-xl transition-colors duration-300 group-hover:bg-secondary">
        <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[40px] mb-3 group-hover:text-foreground transition-colors duration-300 cursor-pointer" onClick={() => onProductClick(product.id)}>
          {formatProductName(product.name)}
        </h3>
 
        {/* "ราคาสินค้า" subtle label */}
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block mb-1">PRICE</span>
 
        {/* Price row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {product.originalPrice && product.price < product.originalPrice ? (
            <span className="text-xs text-muted-foreground line-through font-mono">฿{product.originalPrice.toLocaleString()}</span>
          ) : null}
          
          <span className="text-base font-semibold text-foreground tracking-tight font-mono">
            ฿{(product.price || 0).toLocaleString()}
          </span>
 
          {product.stock > 0 ? (
            <span className="ml-auto bg-cardmerald-500/10 text-emerald-400 border border-emerald-500/15 text-[9px] font-medium px-1.5 py-0.5 rounded leading-none select-none">
              มีสินค้า
            </span>
          ) : (
            <span className="ml-auto bg-rose-500/10 text-rose-400 border border-rose-500/15 text-[9px] font-medium px-1.5 py-0.5 rounded leading-none select-none">
              หมด
            </span>
          )}
        </div>
 
        {/* Buy Button */}
        {product.stock <= 0 ? (
          <button
            onClick={() => {
              Swal.fire({
                title: 'แจ้งเตือนเมื่อมีสินค้า',
                text: `เราจะส่งข้อความแจ้งเตือนเมื่อ ${product.name} กลับมามีสต็อกอีกครั้ง`,
                icon: 'success',
                confirmButtonText: 'ตกลง',
                background: '#1f1c14',
                color: '#EDEDED',
                confirmButtonColor: '#FFFFFF',
                customClass: {
                  confirmButton: 'bg-foreground text-background font-semibold px-5 py-2 rounded'
                }
              });
            }}
            className="w-full bg-secondary hover:bg-border text-muted-foreground py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer mt-auto transition-all border border-border"
          >
            <Bell className="w-3.5 h-3.5 text-muted-foreground" /> แจ้งเตือนเมื่อมาใหม่
          </button>
        ) : (
          <button
            onClick={() => onProductClick(product.id)}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 text-primary-foreground py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.97] mt-auto border-none cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            สั่งซื้อสินค้า
          </button>
        )}
 
        {/* Stock Row Box */}
        <div className="mt-3 py-2 rounded bg-secondary border border-border flex items-center justify-center gap-2 text-[9px] text-muted-foreground font-mono uppercase tracking-wider leading-none transition-colors duration-300 group-hover:bg-background">
          <Package className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span>STOCK: <span className="text-foreground font-semibold">{product.stock >= 999999 ? "UNLIMITED" : product.stock.toLocaleString()}</span></span>
        </div>
      </div>
    </motion.div>
  );
};
