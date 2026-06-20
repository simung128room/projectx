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
  accentColor = "#364153",
}) => {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-gray-800 bg-[#111218] hover:border-#3b82f6/35 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-#3b82f6/5"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-gray-900"
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
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <Package className="w-8 h-8 text-white/10" />
          </div>
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gray-900 opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1e1e] via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-[#111218]">
        <h3 className="text-base sm:text-lg font-bold text-white px-0.5 tracking-wide uppercase truncate mb-1 font-display">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mt-4 pt-4 border-t border-gray-800">
          {/* Item Count */}
          <span className="text-zinc-500 flex items-center gap-1.5 uppercase font-medium tracking-wider font-sans">
            <Package className="w-4 h-4 text-zinc-650 shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-#3b82f6 font-bold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span> รายการ</span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-white font-mono font-semibold tracking-wider text-xs bg-#3b82f6/5 px-3 py-1.5 rounded-xl border border-gray-800 shadow-sm">
              {priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


