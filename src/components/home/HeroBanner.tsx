import React from 'react';
import { motion } from 'motion/react';
import { 
  Gamepad2, 
  Search, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Zap, 
  Clock, 
  Crosshair, 
  Box, 
  Swords, 
  Trophy, 
  Orbit 
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CATEGORIES } from '../../data/mockData';
import { GameCategory } from '../../types/store';

interface HeroBannerProps {
  filterType: 'all' | 'buy' | 'rent';
  setFilterType: (type: 'all' | 'buy' | 'rent') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ filterType, setFilterType }) => {
  const { selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, theme } = useStore();

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Crosshair': return <Crosshair className="w-4 h-4" />;
      case 'Box': return <Box className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Swords': return <Swords className="w-4 h-4" />;
      case 'Flame': return <Flame className="w-4 h-4" />;
      case 'Orbit': return <Orbit className="w-4 h-4" />;
      case 'Trophy': return <Trophy className="w-4 h-4" />;
      default: return <Gamepad2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Showcase Card */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-gradient-to-r from-zinc-950 via-[#0d131a] to-zinc-950 p-6 sm:p-10 shadow-2xl">
        {/* Background glow & mesh */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEXUS STORE • สโตร์ไอดีเกมแท้ 100% ระบบส่งมอบอัตโนมัติ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            ศูนย์รวม <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">ซื้อ-ขาย & เช่าไอดีเกม</span> ชั้นนำยอดนิยม
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
            พร้อมส่งมอบความคุ้มค่า ปลอดภัยด้วยระบบรับประกัน 100% ครอบคลุมทั้ง Valorant, Roblox Blox Fruits, Genshin Impact, RoV และ Steam CS2 อัตโนมัติตลอด 24 ชั่วโมง
          </p>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 max-w-lg">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">15,000+</span>
              <span className="text-[11px] text-zinc-400 font-medium">รายการจัดส่งสำเร็จ</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">5 วินาที</span>
              <span className="text-[11px] text-zinc-400 font-medium">รับรหัสผ่านทันที</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 col-span-2 sm:col-span-1">
              <span className="text-xl sm:text-2xl font-black text-cyan-400 font-mono block">100%</span>
              <span className="text-[11px] text-zinc-400 font-medium">รับประกันความปลอดภัย</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อเกม, สกินปืน, แรงค์, หรือไอเทม..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-900/90 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Type Filter Tabs (All / Buy / Rent) */}
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 shrink-0">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ไอดีทั้งหมด
            </button>
            <button
              onClick={() => setFilterType('buy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'buy'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              เฉพาะซื้อขาด
            </button>
            <button
              onClick={() => setFilterType('rent')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'rent'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              เฉพาะเช่าไอดี
            </button>
          </div>
        </div>

        {/* Categories Carousel/List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {getCategoryIcon(cat.iconName)}
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
