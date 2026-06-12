import React from "react";

export const SkeletonHomeLoader: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6" id="skeleton-home-loader">
      {/* Mega Hero Banner Skeleton */}
      <div className="relative w-full rounded-md bg-white/[0.01] border border-white/[0.04] p-6 overflow-hidden min-h-[220px] sm:min-h-[300px] flex flex-col justify-end shimmer-bg">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-neon-green/5 blur-[80px] rounded-full " />
        
        {/* Content Skeleton */}
        <div className="relative z-10 flex flex-col gap-3 max-w-lg">
          <div className="w-20 h-4 rounded bg-white/[0.05] " />
          <div className="w-48 sm:w-80 h-8 rounded-md bg-white/[0.08] " />
          <div className="w-32 sm:w-56 h-3 rounded bg-white/[0.06] " />
          <div className="flex gap-2.5 mt-2">
            <div className="w-28 h-9 rounded-md bg-white/[0.08] " />
            <div className="w-24 h-9 rounded-md bg-white/[0.06] " />
          </div>
        </div>
      </div>

      {/* Stats Cards Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="skeleton-stats-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative bg-[#0d0d0d] border border-white/[0.04] rounded-md p-5 overflow-hidden flex flex-col gap-2 shimmer-bg">
            <div className="w-16 h-3.5 rounded bg-white/[0.06] " />
            <div className="w-24 h-8 rounded bg-white/[0.08] " />
            <div className="w-12 h-3 rounded bg-white/[0.06] " />
          </div>
        ))}
      </div>

      {/* Shortcuts Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="skeleton-shortcuts-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0d0d0d] border border-white/[0.04] rounded-md p-4 flex items-center gap-3.5 overflow-hidden relative shimmer-bg">
            <div className="w-10 h-10 rounded-md bg-white/[0.05] shrink-0 " />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="w-20 h-3.5 rounded bg-white/[0.06] " />
              <div className="w-16 h-2.5 rounded bg-white/[0.06] " />
            </div>
          </div>
        ))}
      </div>

      {/* Section Divider Skeleton */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-36 h-5 rounded bg-white/[0.06] " />
        <div className="flex-1 h-[1px] bg-white/[0.05]" />
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="skeleton-categories-row">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-white/[0.06] bg-[#0c0c0e] rounded-md overflow-hidden shadow-sm flex flex-col relative h-[160px] shimmer-bg">
            <div className="w-full h-16 bg-white/[0.04] border-b border-white/[0.04] " />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="w-1/3 h-5 rounded bg-white/[0.06] " />
              <div className="flex items-center justify-between mt-4">
                <div className="w-24 h-4 rounded bg-white/[0.06] " />
                <div className="w-16 h-6 rounded-md bg-[#141416] border border-white/[0.05] " />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Divider Skeleton 2 */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-48 h-5 rounded bg-white/[0.06] " />
        <div className="flex-1 h-[1px] bg-white/[0.05]" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="skeleton-products-row">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-[#0c0c0e] border border-white/[0.05] rounded-md p-3 flex flex-col relative h-[280px] overflow-hidden shimmer-bg">
            <div className="w-full h-32 rounded-md bg-white/[0.04] mb-3 " />
            <div className="w-2/3 h-4 rounded bg-white/[0.06] mb-1.5 " />
            <div className="w-1/3 h-3 rounded bg-white/[0.06] mb-4 " />
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-white/[0.03]">
              <div className="w-12 h-4 rounded bg-white/[0.06] " />
              <div className="w-16 h-7 rounded-md bg-white/[0.08] " />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonGenericLoader: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6" id="skeleton-generic-loader">
      <div className="flex items-center gap-3">
        <div className="w-28 h-5 rounded bg-white/[0.06] " />
        <div className="flex-1 h-[1px] bg-white/[0.05]" />
      </div>
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-md p-6 flex flex-col gap-4 relative overflow-hidden shimmer-bg">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 py-3 border-b border-white/[0.03] last:border-0 shadow-sm">
            <div className="w-1/4 h-4 rounded bg-white/[0.05] " />
            <div className="w-3/4 h-3 rounded bg-white/[0.06] " />
          </div>
        ))}
      </div>
    </div>
  );
};
