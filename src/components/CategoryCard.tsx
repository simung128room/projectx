import React from "react";
import { Package } from "lucide-react";

interface CategoryCardProps {
  title: string;
  label: string;
  itemCountDesc?: string;
  priceRangeStr?: string;
  bgImage?: string;
  index?: number;
  onClick: () => void;
  accentColor?: string;
  glowColor?: string;
  gradientFrom?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  label,
  itemCountDesc,
  priceRangeStr,
  bgImage,
  index = 0,
  onClick,
  accentColor = "#2563EB",
}) => {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] hover:border-white/20 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1 shadow-lg"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div className="relative aspect-[21/9] w-full overflow-hidden shrink-0 bg-[#141416]">
        {bgImage ? (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-85"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
            <Package className="w-8 h-8 text-white/10" />
          </div>
        )}
        
        {/* Top-to-Bottom, Left-to-Right Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-transparent to-transparent opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e]/40 to-transparent" />

        {/* Watermark Logo Label */}
        <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/[0.08] text-[9.5px] uppercase font-mono font-black text-white/80 tracking-widest leading-none select-none">
          OG SHOP
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 bg-[#0c0c0e]">
        <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase truncate mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mt-3 pt-3 border-t border-white/[0.04]">
          {/* Item Count */}
          <span className="text-white/40 flex items-center gap-1.5 uppercase font-bold tracking-wider">
            <Package className="w-3.5 h-3.5 text-white/35 shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-neon-green font-black">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span> รายการ</span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-white font-mono font-black tracking-wider text-xs bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.06] shadow-sm">
              {priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


