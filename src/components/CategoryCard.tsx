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
      className="relative group overflow-hidden rounded-lg border border-border bg-card hover:border-ring transition-all duration-300 flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-secondary"
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
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <Package className="w-6 h-6 text-foreground/10" />
          </div>
        )}
        
        {/* Subtle dark overlay to make titles pop on any image */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-card">
        <h3 className="text-base font-semibold text-foreground px-0.5 tracking-tight uppercase truncate mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-normal mt-4 pt-4 border-t border-border">
          {/* Item Count */}
          <span className="text-muted-foreground flex items-center gap-1.5 uppercase tracking-wide">
            <Package className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>ITEMS: <span className="text-foreground font-semibold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span></span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-foreground font-mono font-medium tracking-wide text-[11px] bg-border px-2 py-0.5 rounded border border-border">
              {priceRangeStr.includes("-") ? priceRangeStr : priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
