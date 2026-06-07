import React, { useState } from "react";
import { motion } from "motion/react";
import { Package, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { Product, Category } from "../types";
import { AnimatedScroll } from "./AnimatedScroll";
import { generateGradient } from "../utils";

interface CategoryProductsViewProps {
  category: string;
  categories: Category[];
  products: Product[];
  onBack: () => void;
  onProductClick: (id: string) => void;
}

export const CategoryProductsView: React.FC<CategoryProductsViewProps> = ({
  category,
  categories = [],
  products = [],
  onBack,
  onProductClick,
}) => {
  const categoryInfo = categories.find(
    (c) => c.name === category || c.title === category || c.id === category,
  );
  const [renderLimit, setRenderLimit] = useState(20);
  
  const filteredProducts =
    category === "all"
      ? products
      : products.filter(
          (p) =>
            p.category === category ||
            p.category === categoryInfo?.title ||
            p.category === categoryInfo?.name ||
            p.category === categoryInfo?.id,
        );
        
  const visibleProducts = filteredProducts.slice(0, renderLimit);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 font-sans text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-card hover:bg-[#121212] border border-border border-2 transition-colors group shrink-0 brut-card"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {category === "all" ? (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-primary text-primary-foreground flex items-center justify-center">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  สินค้าทั้งหมด
                </div>
              ) : (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-card flex items-center justify-center brut-card">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  {categoryInfo?.title || category}
                </div>
              )}
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />{" "}
              {categoryInfo?.subtitle ||
                `พบสินค้าทั้งหมด ${filteredProducts.length} รายการ`}
            </p>
          </div>
        </div>
      </div>

      {/* Category Banner Image (2100 x 500 style) */}
      {category !== "all" && categoryInfo?.bannerUrl && (
        <div 
          className="relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d0d] mb-10 group shadow-lg"
          style={{ aspectRatio: '2100 / 500' }}
        >
          <img
            src={categoryInfo.bannerUrl}
            alt={categoryInfo.title || "Banner"}
            className="w-full h-full object-cover transition-transform duration-500 opacity-75 group-hover:opacity-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </div>
      )}

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="border-2 border-dashed border-border bg-card p-16 text-center brut-card">
          <div className="animate-pulse mb-6 flex justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-muted-foreground">
            ยังไม่มีสินค้าในขณะนี้
          </h3>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            โปรดรอการอัพเดทจากผู้ดูแลระบบ
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((product, i) => {
              const discount = product.originalPrice && product.price < product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : null;
              const isHot = product.price > 100 || (discount !== null && discount >= 20) || product.stock > 0;
              
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                  className="group relative bg-[#0c0c0e] border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 flex flex-col hover:-translate-y-1 shadow-lg"
                >
                  {/* Image area with corner ribbon */}
                  <div className="relative aspect-square w-full bg-[#141416] overflow-hidden shrink-0">
                    {product.imageUrl && product.imageUrl.trim() !== "" ? (
                      <img loading="lazy"
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                      className="w-full h-full flex flex-col items-center justify-center opacity-85"
                      style={{ 
                        display: product.imageUrl && product.imageUrl.trim() !== "" ? 'none' : 'flex',
                        background: generateGradient(product.name || product.id)
                      }}
                    >
                      <span className="text-4xl font-black text-white mix-blend-overlay opacity-65">
                        {(product.name || "P")[0].toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest mt-1">{product.category || "STORETH"}</span>
                    </div>

                    {/* Diagonal "Best Seller" ribbon in image corner */}
                    {isHot && (
                      <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none z-10">
                        <div className="absolute top-3 -right-6 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black uppercase py-1 w-24 text-center transform rotate-45 shadow-md border-b border-white/10">
                          Best Seller
                        </div>
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-80" />

                    {/* Discount Badge on left */}
                    {discount !== null && (
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-md z-10">
                        -{discount}%
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 bg-[#0c0c0e]">
                    <h3 className="text-sm font-black text-white leading-snug line-clamp-1 mb-3 group-hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>

                    {/* "ราคาสินค้า" subtle label */}
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider block mb-1">ราคาสินค้า</span>

                    {/* Price row */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      {product.originalPrice && product.price < product.originalPrice ? (
                        <span className="text-xs text-red-500/80 line-through font-mono font-bold">฿{product.originalPrice.toLocaleString()}</span>
                      ) : null}
                      
                      <span className="text-base font-black text-amber-400 tracking-tight font-mono">
                        ฿{(product.price || 0).toLocaleString()}
                      </span>

                      {product.stock > 0 ? (
                        <span className="ml-auto bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none select-none">
                          พร้อมจำหน่าย
                        </span>
                      ) : (
                        <span className="ml-auto bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none select-none">
                          สินค้าหมด
                        </span>
                      )}
                    </div>

                    {/* Buy Button */}
                    {product.stock <= 0 ? (
                      <button className="w-full bg-red-600/10 text-red-400 border border-red-500/20 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-default mt-auto">
                        <Package className="w-3.5 h-3.5" /> สินค้าหมด
                      </button>
                    ) : (
                      <button
                        onClick={() => onProductClick(product.id)}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 rounded-xl text-xs font-black transition-all duration-200 mt-auto shadow-md"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        สั่งซื้อสินค้า
                      </button>
                    )}

                    {/* Stock Row Box */}
                    <div className="mt-3.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2 text-[10px] text-white/40 font-black uppercase tracking-widest leading-none">
                      <Package className="w-3.5 h-3.5 text-white/20 shrink-0" />
                      <span>คงเหลือ <span className="text-white/70 font-mono">{product.stock >= 999999 ? "ไม่จำกัด" : product.stock.toLocaleString()}</span> ชิ้น</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {visibleProducts.length < filteredProducts.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setRenderLimit(prev => prev + 20)}
                className="px-8 py-3 bg-card border border-border border-2 hover:border-white/20 text-white font-bold transition-all active:scale-95 brut-card"
              >
                โหลดเพิ่มเติม ({filteredProducts.length - visibleProducts.length} รายการ)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
