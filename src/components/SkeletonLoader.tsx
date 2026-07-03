import React from "react";

export const SkeletonHomeLoader: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-6" id="skeleton-home-loader">
      {/* Mega Hero Banner Skeleton */}
      <div className="relative w-full rounded-md bg-card/[0.01] border border-[#374151] p-6 overflow-hidden min-h-[220px] sm:min-h-[300px] flex flex-col justify-end shimmer-bg">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-neon-green/5  rounded-full " />
        
        {/* Content Skeleton */}
        <div className="relative z-10 flex flex-col gap-3 max-w-lg">
          <div className="w-20 h-4 rounded bg-card/[0.05] " />
          <div className="w-48 sm:w-80 h-8 rounded-md bg-card/[0.08] " />
          <div className="w-32 sm:w-56 h-3 rounded bg-card/[0.06] " />
          <div className="flex gap-2.5 mt-2">
            <div className="w-28 h-9 rounded-md bg-card/[0.08] " />
            <div className="w-24 h-9 rounded-md bg-card/[0.06] " />
          </div>
        </div>
      </div>

      {/* Stats Cards Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="skeleton-stats-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="relative bg-card border border-[#374151] rounded-md p-5 overflow-hidden flex flex-col gap-2 shimmer-bg">
            <div className="w-16 h-3.5 rounded bg-card/[0.06] " />
            <div className="w-24 h-8 rounded bg-card/[0.08] " />
            <div className="w-12 h-3 rounded bg-card/[0.06] " />
          </div>
        ))}
      </div>

      {/* Shortcuts Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="skeleton-shortcuts-row">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-[#374151] rounded-md p-4 flex items-center gap-3.5 overflow-hidden relative shimmer-bg">
            <div className="w-10 h-10 rounded-md bg-card/[0.05] shrink-0 " />
            <div className="flex-1 flex flex-col gap-1.5 min-w-0">
              <div className="w-20 h-3.5 rounded bg-card/[0.06] " />
              <div className="w-16 h-2.5 rounded bg-card/[0.06] " />
            </div>
          </div>
        ))}
      </div>

      {/* Section Divider Skeleton */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-36 h-5 rounded bg-card/[0.06] " />
        <div className="flex-1 h-[1px] bg-card/[0.05]" />
      </div>

      {/* Categories Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="skeleton-categories-row">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-[#374151] bg-card rounded-md overflow-hidden shadow-sm flex flex-col relative h-[160px] shimmer-bg">
            <div className="w-full h-16 bg-card/[0.04] border-b border-[#374151] " />
            <div className="p-4 flex flex-col justify-between flex-1">
              <div className="w-1/3 h-5 rounded bg-card/[0.06] " />
              <div className="flex items-center justify-between mt-4">
                <div className="w-24 h-4 rounded bg-card/[0.06] " />
                <div className="w-16 h-6 rounded-md bg-secondary border border-[#374151] " />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Divider Skeleton 2 */}
      <div className="flex items-center gap-3 mt-4">
        <div className="w-48 h-5 rounded bg-card/[0.06] " />
        <div className="flex-1 h-[1px] bg-card/[0.05]" />
      </div>

      {/* Products Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" id="skeleton-products-row">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-card border border-[#374151] rounded-md p-3 flex flex-col relative h-[280px] overflow-hidden shimmer-bg">
            <div className="w-full h-32 rounded-md bg-card/[0.04] mb-3 " />
            <div className="w-2/3 h-4 rounded bg-card/[0.06] mb-1.5 " />
            <div className="w-1/3 h-3 rounded bg-card/[0.06] mb-4 " />
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-[#374151]">
              <div className="w-12 h-4 rounded bg-card/[0.06] " />
              <div className="w-16 h-7 rounded-md bg-card/[0.08] " />
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
        <div className="w-28 h-5 rounded bg-card/[0.06] " />
        <div className="flex-1 h-[1px] bg-card/[0.05]" />
      </div>
      <div className="bg-card/[0.01] border border-[#374151] rounded-md p-6 flex flex-col gap-4 relative overflow-hidden shimmer-bg">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 py-3 border-b border-[#374151] last:border-0 shadow-sm">
            <div className="w-1/4 h-4 rounded bg-card/[0.05] " />
            <div className="w-3/4 h-3 rounded bg-card/[0.06] " />
          </div>
        ))}
      </div>
    </div>
  );
};


export const SkeletonProductDetailLoader: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="w-32 h-9 rounded-md bg-card/[0.06]" />
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-16 h-3 rounded bg-card/[0.04]" />
          <div className="w-2 h-2 rounded bg-card/[0.03]" />
          <div className="w-24 h-3 rounded bg-card/[0.04]" />
        </div>
      </div>

      {/* Main container */}
      <div className="border border-[#374151] rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0 shimmer-bg">
        {/* Left: Image */}
        <div className="md:col-span-5 p-6 md:p-8 border-b md:border-b-0 md:border-r border-[#374151]">
          <div className="w-full aspect-square rounded-md bg-card/[0.04]" />
          <div className="mt-4 p-4 rounded-md border border-[#374151] flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="w-24 h-3 rounded bg-card/[0.05]" />
              <div className="w-20 h-3 rounded bg-card/[0.06]" />
            </div>
            <div className="flex justify-between">
              <div className="w-28 h-3 rounded bg-card/[0.05]" />
              <div className="w-20 h-3 rounded bg-card/[0.06]" />
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col gap-5">
          <div className="flex gap-2">
            <div className="w-16 h-5 rounded-md bg-card/[0.05]" />
            <div className="w-16 h-5 rounded-md bg-card/[0.05]" />
          </div>
          <div className="w-3/4 h-8 rounded-md bg-card/[0.07]" />
          <div className="p-5 rounded-md border border-[#374151] flex justify-between">
            <div>
              <div className="w-20 h-2 rounded bg-card/[0.04] mb-2" />
              <div className="w-32 h-10 rounded bg-card/[0.08]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-20 rounded-md border border-[#374151] bg-card/[0.03]" />
            <div className="h-20 rounded-md border border-[#374151] bg-card/[0.03]" />
          </div>
          <div className="h-28 rounded-md border border-[#374151] bg-card/[0.03]" />
          <div className="border-t border-[#374151] pt-6 mt-auto">
            <div className="w-full h-12 rounded-md bg-secondary" />
          </div>
        </div>
      </div>
    </div>
  );
};
