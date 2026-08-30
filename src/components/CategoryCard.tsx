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
      className="relative group overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white hover:border-[#3b82f6]/45 transition-all duration-300 flex flex-col cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-[#f1f5f9]"
        style={{ aspectRatio: '1640 / 500' }}
      >
        {bgImage ? (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-80 group-hover:opacity-95"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center">
            <Package className="w-8 h-8 text-[#1e1e20]/10" />
          </div>
        )}
        
        {/* Subtle light overlay to make titles pop on any image */}
        <div className="absolute inset-0 bg-white/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <h3 className="text-base sm:text-lg font-bold text-[#1e1e20] px-0.5 tracking-wide uppercase truncate mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-semibold mt-4 pt-4 border-t border-[#e2e8f0]">
          {/* Item Count */}
          <span className="text-muted-foreground flex items-center gap-1.5 uppercase font-medium tracking-wider">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>มีสินค้าทั้งหมด <span className="text-blue-500 font-bold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span> รายการ</span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-[#10b981] font-mono font-semibold tracking-wider text-xs bg-[#10b981]/5 px-3 py-1.5 rounded-xl border border-[#10b981]/15 shadow-sm">
              {priceRangeStr.includes("-") ? priceRangeStr : priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
