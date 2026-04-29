import React, { useState } from 'react';
import { History, Key, Activity, ArrowRight, Clock, Monitor, Wallet, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogsViewProps {
  usedKeysHistory?: any[];
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({ usedKeysHistory = [] }) => {
  const [filter, setFilter] = useState<'topup' | 'purchase' | 'keys'>('keys');

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">History <span className="text-zinc-600">//</span> Logs</h1>
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">ประวัติการใช้งานต่างๆ ของคุณ</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg w-fit mb-8 shadow-xl overflow-hidden p-1 gap-1">
        {[
          { id: 'topup', label: 'ประวัติการเติมเงิน', icon: Wallet },
          { id: 'purchase', label: 'ประวัติซื้อสินค้า', icon: ShoppingCart },
          { id: 'keys', label: 'ประวัติการใช้งานคีย์', icon: Key }
        ].map(tab => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-widest rounded-md transition-all ${
                active ? 'bg-cyan-500/10 text-cyan-400 font-bold' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 md:p-8">
        {filter === 'keys' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Key className="w-5 h-5 text-emerald-400" /> ประวัติการใช้คีย์
            </h2>
            {usedKeysHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                <History className="w-8 h-8 mb-3 opacity-20" />
                <p className="font-mono text-sm">ยังไม่มีประวัติการใช้งานคีย์</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {usedKeysHistory.map((key) => (
                  <div key={key.id} className="flex justify-between items-center bg-black/40 p-4 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-emerald-400 font-bold tracking-widest text-sm flex items-center gap-2">
                        {key.key}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">Type: {key.type}</span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-xs text-zinc-400 font-mono">
                        {new Date(key.usedAt).toLocaleString('th-TH')}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block ml-auto">
                        SUCCESS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {filter === 'topup' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <Wallet className="w-5 h-5 text-cyan-400" /> ประวัติการเติมเงิน
            </h2>
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
              <Wallet className="w-8 h-8 mb-3 opacity-20" />
              <p className="font-mono text-sm">ยังไม่มีประวัติการเติมเงิน</p>
            </div>
          </div>
        )}

        {filter === 'purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4">
              <ShoppingCart className="w-5 h-5 text-fuchsia-400" /> ประวัติซื้อสินค้า
            </h2>
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
              <ShoppingCart className="w-8 h-8 mb-3 opacity-20" />
              <p className="font-mono text-sm">ยังไม่มีประวัติการซื้อสินค้า</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
