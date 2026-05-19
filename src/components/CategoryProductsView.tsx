import React from "react";
import { motion } from "motion/react";
import { Package, ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { Product, Category } from "../types";
import { AnimatedScroll } from "./AnimatedScroll";

interface CategoryProductsViewProps {
  category: string;
  categories: Category[];
  products: Product[];
  onBack: () => void;
  onProductClick: (id: string) => void;
}

export const CategoryProductsView: React.FC<CategoryProductsViewProps> = ({
  category,
  categories,
  products,
  onBack,
  onProductClick,
}) => {
  const categoryInfo = categories.find(
    (c) => c.name === category || c.title === category || c.id === category,
  );
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 font-sans text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-3 bg-[#0B0F14] hover:bg-[#121820] border border-white/10 rounded-full transition-colors group shadow-sm shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              {category === "all" ? (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-[#1E90FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1a7fe6]/20">
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  สินค้าทั้งหมด
                </div>
              ) : (
                <div className="flex items-center gap-3 uppercase">
                  <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingCart className="w-7 h-7 text-white" />
                  </div>
                  {categoryInfo?.title || category}
                </div>
              )}
            </h1>
            <p className="text-sm font-medium text-zinc-500 mt-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />{" "}
              {categoryInfo?.subtitle ||
                `พบสินค้าทั้งหมด ${filteredProducts.length} รายการ`}
            </p>
          </div>
        </div>
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="border-2 border-dashed border-white/10 bg-[#0B0F14] rounded-3xl p-16 text-center shadow-sm">
          <div className="animate-pulse mb-6 flex justify-center">
            <Package className="w-16 h-16 text-zinc-200" />
          </div>
          <h3 className="text-xl font-bold text-zinc-400">
            ยังไม่มีสินค้าในขณะนี้
          </h3>
          <p className="text-zinc-400 text-sm mt-2 font-medium">
            โปรดรอการอัพเดทจากผู้ดูแลระบบ
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
              className="bg-[#0B0F14] border border-white/10 rounded-2xl overflow-hidden hover:shadow-xl transition-all h-full flex flex-col group"
            >
              <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-[10px] font-black text-[#1E90FF] tracking-tighter mb-1">
                        REXZY STUDIO
                      </div>
                      <div className="text-white text-xs font-bold leading-tight">
                        PREVIEW
                        <br />
                        1500×1500
                      </div>
                    </div>
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity opacity-0 group-hover:opacity-100">
                    <span className="bg-[#1E90FF] text-white font-bold rounded-full px-4 py-1.5 text-xs">
                      สินค้าหมด
                    </span>
                  </div>
                )}
              </div>

              <div className="p-3.5 flex flex-col flex-1">
                <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mb-0.5">
                  {product.originalPrice &&
                    product.price &&
                    product.originalPrice > product.price && (
                      <span className="text-[10px] text-zinc-400 line-through">
                        ฿{(product.originalPrice || 0).toLocaleString()}
                      </span>
                    )}
                  <div className="text-[#1E90FF] font-bold text-sm">
                    ฿{(product.price || 0).toLocaleString()}
                  </div>
                </div>

                {product.stock <= 0 ? (
                  <button className="w-full mt-3 bg-[#1E90FF]/20 text-[#1E90FF] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-default">
                    <Package className="w-3.5 h-3.5" /> สินค้าหมด
                  </button>
                ) : (
                  <button
                    onClick={() => onProductClick(product.id)}
                    className="w-full mt-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl py-2.5 text-xs font-bold transition-colors active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> สั่งซื้อสินค้า
                  </button>
                )}

                <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? "bg-emerald-400 animate-pulse" : "bg-zinc-200"}`}
                  ></span>
                  คงเหลือ{" "}
                  {product.stock >= 999999
                    ? "ไม่จำกัด"
                    : `${product.stock} ชิ้น`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
