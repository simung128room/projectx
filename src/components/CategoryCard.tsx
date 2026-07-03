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
      className="relative group overflow-hidden rounded-lg border border-white/[0.08] bg-[#121212] hover:border-white/[0.18] transition-all duration-300 flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-[#161616]"
        style={{ aspectRatio: '1640 / 500' }}
      >
        {bgImage ? (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 opacity-50 group-hover:opacity-75"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#161616] flex items-center justify-center">
            <Package className="w-6 h-6 text-white/10" />
          </div>
        )}
        
        {/* Subtle dark overlay to make titles pop on any image */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-[#121212]">
        <h3 className="text-base font-semibold text-[#EDEDED] px-0.5 tracking-tight uppercase truncate mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-normal mt-4 pt-4 border-t border-white/[0.08]">
          {/* Item Count */}
          <span className="text-[#888888] flex items-center gap-1.5 uppercase tracking-wide">
            <Package className="w-4 h-4 text-[#888888] shrink-0" />
            <span>ITEMS: <span className="text-white font-semibold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span></span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-[#EDEDED] font-mono font-medium tracking-wide text-[11px] bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
              {priceRangeStr.includes("-") ? priceRangeStr : priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
