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
  accentColor = "#2563eb",
}) => {
  return (
    <div
      onClick={onClick}
      className="relative group overflow-hidden rounded-2xl border border-white/12 bg-slate-900/60 backdrop-blur-xl hover:border-blue-400/60 shadow-[0_8px_25px_rgba(0,0,0,0.5)] hover:shadow-[0_12px_30px_rgba(37,99,235,0.3)] transition-all duration-300 flex flex-col cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Top reflection */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-br from-white/15 via-white/5 to-transparent pointer-events-none z-10" />

      {/* Banner Area */}
      <div 
        className="relative w-full overflow-hidden shrink-0 bg-slate-950"
        style={{ aspectRatio: '1640 / 500' }}
      >
        {bgImage ? (
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 opacity-60 group-hover:opacity-80"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-slate-950 flex items-center justify-center">
            <Package className="w-6 h-6 text-slate-600" />
          </div>
        )}
        
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
      </div>

      {/* Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1">
        <h3 className="text-base font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors uppercase truncate mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-xs font-normal mt-4 pt-4 border-t border-white/10">
          {/* Item Count */}
          <span className="text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
            <Package className="w-4 h-4 text-blue-400 shrink-0" />
            <span>ITEMS: <span className="text-white font-bold font-mono">{itemCountDesc?.replace(/[^0-9]/g, '') || '0'}</span></span>
          </span>
          
          {/* Price Range */}
          {priceRangeStr && (
            <span className="text-blue-400 font-mono font-bold tracking-wide text-[11px] bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-lg">
              {priceRangeStr.includes("-") ? priceRangeStr : priceRangeStr.replace("฿", "")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
