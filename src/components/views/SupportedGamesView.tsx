import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, ArrowRight, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Game } from '../../types';

export const SupportedGamesView: React.FC = () => {
  const { games, setOpenCreateModal, setSelectedGameForModal, t } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Roblox', 'MMORPG', 'Gacha', 'Sandbox'];

  const filteredGames = games.filter(g => {
    const matchesSearch = 
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      g.mapName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLaunchGame = (game: Game) => {
    setSelectedGameForModal(game);
    setOpenCreateModal(true);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      
      {/* Header & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-white dark:bg-[#141517] shadow-xs text-blue-600 dark:text-blue-400 mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Headless Cloud Compatibility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-prompt">
            {t.gamesTitle}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-xl">
            รายชื่อเกมและแมพที่รองรับการรัน AFK อัตโนมัติบน Cloud Sandbox 24/7 ปลอดภัย ไร้กังวลเรื่องแบตหมดหรือคอมพัง
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="ค้นหาเกม หรือ แมพ..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-[#141517] shadow-xs text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none w-full sm:w-52"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Games Grid - Borderless */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGames.map((game) => (
          <div 
            key={game.id}
            id={`game-card-${game.id}`}
            className="bg-white dark:bg-[#141517] rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
          >
            <div>
              {/* Top Meta Badges */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                  <span>{game.thumbnail || '🎮'}</span>
                  <span>{game.category}</span>
                </span>
                
                {game.status === 'available' ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{t.gameBadgeActive}</span>
                  </div>
                ) : (
                  <div className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-medium">
                    {t.statusMaintenance}
                  </div>
                )}
              </div>

              {/* Game Title & Map */}
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-prompt group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {game.name}
              </h2>
              <div className="text-xs font-semibold text-neutral-400 mt-0.5">
                {game.mapName}
              </div>

              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-normal mt-2.5 line-clamp-2">
                {game.description}
              </p>

              {/* Key Features List */}
              <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-300 pt-3 mt-3">
                {game.features?.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px]">{feat}</span>
                  </li>
                )) || (
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-[11px]">{t.gameFeature1}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Pricing & Start CTA */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-400 font-normal">{t.createSummaryRate}</div>
                <div className="text-sm font-bold text-neutral-900 dark:text-white font-mono">
                  {formatCurrency(game.pricePerHour)} / {t.createHourUnit}
                </div>
              </div>

              <button
                id={`launch-afk-${game.id}`}
                onClick={() => handleLaunchGame(game)}
                disabled={game.status !== 'available'}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <span>{t.btnLaunchAFK}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-[#141517] rounded-3xl shadow-sm">
          <p className="text-neutral-400 text-xs">ไม่พบเกมที่ตรงกับการค้นหา "{searchQuery}"</p>
        </div>
      )}

      {/* Cloud Security & Reliability Footer Banner - Borderless */}
      <div className="bg-[#141517] text-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-prompt">MINICLOUD Anti-Ban & High-Security Isolation</h3>
          </div>
          <p className="text-xs text-neutral-400 max-w-xl">
            แต่ละอินสแตนซ์ทำงานบน Container Sandbox แยกอิสระ 1 ไอดีต่อ 1 IP ไม่แชร์ทรัพยากร มั่นใจได้ 100% ว่าปลอดภัย
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedGameForModal(null);
            setOpenCreateModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold text-neutral-950 bg-white hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer shrink-0 shadow-sm"
        >
          สร้าง AFK ทันที
        </button>
      </div>

    </div>
  );
};
