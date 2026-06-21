import React from 'react';

export const HomeViewSkeleton: React.FC = () => {
  return (
    <div className="w-full text-foreground pb-24 lg:pb-0 overflow-x-hidden bg-white animate-pulse">
      {/* Hero Content Skeleton */}
      <section className="relative w-full overflow-hidden min-h-[40vh] sm:min-h-[50vh] flex flex-col items-center justify-center p-6 text-center border-b border-[#e2e8f0] bg-zinc-50">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent opacity-60 pointer-events-none" />
        <div className="relative z-10 max-w-3xl flex flex-col items-center">
          <div className="w-32 h-6 bg-zinc-200 rounded-full mb-6"></div>
          <div className="w-3/4 md:w-2/3 h-12 md:h-16 bg-zinc-200 rounded-2xl mb-4"></div>
          <div className="w-5/6 md:w-3/4 h-8 bg-zinc-200 rounded-xl mb-8 mt-2"></div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="w-40 h-12 bg-zinc-200 rounded-xl"></div>
            <div className="w-40 h-12 bg-zinc-200 rounded-xl"></div>
          </div>
        </div>
      </section>

      {/* Stats Grid Skeleton */}
      <section className="px-4 py-8 max-w-7xl mx-auto -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#e2e8f0] p-5 rounded-2xl flex flex-col gap-2 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-zinc-100 mb-2"></div>
              <div className="w-16 h-3 bg-zinc-200 rounded-full"></div>
              <div className="w-20 h-6 bg-zinc-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Grid Section Skeleton */}
      <section className="px-4 py-12 max-w-7xl mx-auto w-full">
        {/* Category Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200"></div>
            <div className="w-48 h-8 bg-zinc-200 rounded-lg"></div>
          </div>
          <div className="w-24 h-6 bg-zinc-200 rounded-full"></div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col">
              {/* Product Cover */}
              <div className="aspect-[4/3] w-full bg-zinc-200"></div>
              {/* Product Info */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <div className="w-full h-5 bg-zinc-200 rounded-lg"></div>
                <div className="w-2/3 h-5 bg-zinc-200 rounded-lg"></div>
                <div className="h-px bg-zinc-100 my-1 w-full"></div>
                <div className="mt-auto flex justify-between items-center pt-2">
                  <div className="flex flex-col gap-1">
                    <div className="w-10 h-3 bg-zinc-200 rounded-full"></div>
                    <div className="w-16 h-5 bg-zinc-200 rounded-lg"></div>
                  </div>
                  <div className="w-20 h-8 bg-zinc-200 rounded-xl"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export const CategoriesViewSkeleton: React.FC = () => {
  return (
    <div className="w-full text-foreground pb-24 lg:pb-0 overflow-x-hidden bg-[#fafafa] flex flex-col min-h-screen animate-pulse">
      {/* Search Header Skeleton */}
      <section className="bg-white border-b border-zinc-200 shadow-sm sticky top-0 z-30 pt-4 pb-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-zinc-200"></div>
            <div className="w-48 h-8 bg-zinc-200 rounded-lg"></div>
          </div>
          <div className="w-full h-12 bg-zinc-100 rounded-xl border border-zinc-200"></div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8 flex-1">
        
        {/* Sidebar categories skeleton */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-3">
          <div className="w-32 h-6 bg-zinc-200 rounded-lg mb-2"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-full h-12 bg-zinc-200 rounded-xl"></div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div className="w-40 h-6 bg-zinc-200 rounded-lg"></div>
            <div className="w-8 h-8 bg-zinc-200 rounded-lg"></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-[4/3] w-full bg-zinc-200"></div>
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div className="w-full h-5 bg-zinc-200 rounded-lg"></div>
                  <div className="w-2/3 h-5 bg-zinc-200 rounded-lg"></div>
                  <div className="h-px bg-zinc-100 my-1 w-full"></div>
                  <div className="mt-auto flex justify-between items-center pt-2">
                    <div className="flex flex-col gap-1">
                      <div className="w-10 h-3 bg-zinc-200 rounded-full"></div>
                      <div className="w-16 h-5 bg-zinc-200 rounded-lg"></div>
                    </div>
                    <div className="w-20 h-8 bg-zinc-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
