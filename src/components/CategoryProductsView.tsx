import React, { useState } from "react";
import { motion } from "motion/react";
import { Package, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { Product, Category } from "../types";
import { AnimatedScroll } from "./AnimatedScroll";
import { generateGradient, formatProductName } from "../utils";
import { ProductCard } from "./ProductCard";

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
      ? [...products]
      : products.filter(
          (p) =>
            p.category === category ||
            p.category === categoryInfo?.title ||
            p.category === categoryInfo?.name ||
            p.category === categoryInfo?.id,
        );
        
  // Sort products: in-stock first, then out-of-stock
  filteredProducts.sort((a, b) => {
    const aStock = Number(a.stock) > 0 ? 1 : 0;
    const bStock = Number(b.stock) > 0 ? 1 : 0;
    return bStock - aStock; // 1 (in-stock) comes before 0 (out-of-stock)
  });
        
  const visibleProducts = filteredProducts.slice(0, renderLimit);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 font-sans text-[#1e1e20]">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-white hover:bg-[#f2efe9] border border-[#e6e2da] rounded-xl transition-colors group shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:text-[#1e1e20]" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1e1e20] tracking-tight flex items-center gap-3">
              {category === "all" ? (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-white border border-[#e6e2da] text-blue-500 flex items-center justify-center rounded-xl">
                    <Package className="w-6 h-6 text-blue-500" />
                  </div>
                  สินค้าทั้งหมด
                </div>
              ) : (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-white border border-[#e6e2da] text-blue-500 flex items-center justify-center rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>
                  {categoryInfo?.title || category}
                </div>
              )}
            </h1>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />{" "}
              {categoryInfo?.subtitle ||
                `พบสินค้าทั้งหมด ${filteredProducts.length} รายการ`}
            </p>
          </div>
        </div>
      </div>

      {/* Category Banner Image (1640 x 500 style) */}
      {category !== "all" && categoryInfo?.bannerUrl && (
        <div 
          className="relative w-full rounded-2xl overflow-hidden border border-[#e6e2da] bg-white mb-10 group shadow-sm"
          style={{ aspectRatio: '1640 / 500' }}
        >
          <img
            src={categoryInfo.bannerUrl}
            alt={categoryInfo.title || "Banner"}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-95 transition-all duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="border border-dashed border-[#e6e2da] bg-white rounded-2xl p-16 text-center">
          <div className="mb-6 flex justify-center">
            <Package className="w-16 h-16 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold text-[#1e1e20]">
            ยังไม่มีสินค้าในขณะนี้
          </h3>
          <p className="text-muted-foreground text-sm mt-2 font-medium">
            โปรดรอการอัพเดทจากผู้ดูแลระบบ
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {visibleProducts.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                onProductClick={onProductClick}
                index={i}
              />
            ))}
          </div>
          
          {visibleProducts.length < filteredProducts.length && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setRenderLimit(prev => prev + 20)}
                className="px-8 py-3 bg-white border border-[#e6e2da] text-[#1e1e20] hover:bg-[#f2efe9] rounded-xl font-bold transition-all active:scale-95 cursor-pointer"
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
