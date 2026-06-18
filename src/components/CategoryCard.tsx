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
  accentColor = "#00e676",
}) => {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-zinc-900 bg-[#070709] hover:border-[#00e676]/35 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-[#00e676]/5"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-zinc-950"
        style={{ aspectRatio: '2100 / 500' }}
      >
        {bgImage ? (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-50 group-hover:opacity-75"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
            <Package className="w-8 h-8 text-white/10" />
          </div>
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-zinc-950 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070709] via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-[#070709]">
        <h3 className="text-base sm:text-lg font-bold text-white px-0.5 tracking-wide uppercase truncate mb-1 font-display">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mt-4 pt-4 border-t border-zinc-900">
          {/* Item Count */}
          <span className="text-zinc-500 flex items-center gap-1.5 uppercase font-medium tracking-wider font-sans">
            <Package className="w-4 h-4 text-zinc-650 shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-[#00e676] font-bold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span> รายการ</span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-white font-mono font-semibold tracking-wider text-xs bg-[#00e676]/5 px-3 py-1.5 rounded-xl border border-zinc-900 shadow-sm">
              {priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


