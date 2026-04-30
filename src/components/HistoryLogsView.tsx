import React, { useState } from 'react';
import { History, Key, Activity, ArrowRight, Clock, Monitor, Wallet, ShoppingCart, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogsViewProps {
  usedKeysHistory?: any[];
  purchaseHistory?: any[];
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({ usedKeysHistory = [], purchaseHistory = [] }) => {
  const [filter, setFilter] = useState<'topup' | 'purchase' | 'keys'>('purchase');
  const [topupHistory, setTopupHistory] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('apex_topup_history');
      if (saved) {
        setTopupHistory(JSON.parse(saved));
      }
    } catch(e) {}
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-900">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <History className="w-8 h-8 text-red-500" /> 
            ประวัติการใช้งาน
        </h1>
        <p className="text-sm font-medium text-zinc-500">History / Logs ประวัติการใช้งานต่างๆ ของคุณ</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-white border border-zinc-200 rounded-xl w-fit mb-8 shadow-sm overflow-hidden p-1.5 gap-1.5">
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
              className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-lg transition-all ${
                active ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-500 hover:text-red-600 hover:bg-zinc-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm">
        {filter === 'keys' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4">
              <Key className="w-5 h-5 text-emerald-500" /> ประวัติการใช้คีย์
            </h2>
            {usedKeysHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                <History className="w-8 h-8 mb-3 opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีประวัติการใช้งานคีย์</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {usedKeysHistory.map((key) => (
                  <div key={key.id} className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-emerald-600 font-bold tracking-widest text-sm flex items-center gap-2">
                        {key.key}
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Type: {key.type}</span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-xs text-zinc-500 font-medium tracking-wide">
                        {new Date(key.usedAt).toLocaleString('th-TH')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full inline-block ml-auto mt-1">
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
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4">
              <Wallet className="w-5 h-5 text-blue-500" /> ประวัติการเติมเงิน
            </h2>
            {topupHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                <Wallet className="w-8 h-8 mb-3 opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีประวัติการเติมเงิน</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topupHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-zinc-50 p-4 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-colors">
                    <div className="flex flex-col gap-1">
                      <span className="font-sans text-blue-600 font-bold text-base flex items-center gap-2">
                        + {item.amount} บาท
                      </span>
                      <span className="text-xs text-zinc-500 font-medium">Type: {item.type}</span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="text-xs text-zinc-500 font-medium tracking-wide">
                        {new Date(item.timestamp).toLocaleString('th-TH')}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full inline-block ml-auto mt-1">
                        SUCCESS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {filter === 'purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4">
              <ShoppingCart className="w-5 h-5 text-fuchsia-500" /> ประวัติซื้อสินค้า
            </h2>
            {purchaseHistory.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                <ShoppingCart className="w-8 h-8 mb-3 opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีประวัติการซื้อสินค้า</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {purchaseHistory.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-zinc-50 p-5 border border-zinc-200 rounded-2xl hover:border-zinc-300 transition-colors gap-4">
                    <div className="flex flex-col gap-2">
                       <span className="font-bold text-zinc-900 text-base flex items-center gap-2">
                         {item.productName}
                       </span>
                       <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 py-1.5 px-3 rounded-xl w-fit">
                         <span className="font-mono text-zinc-600 font-bold tracking-widest text-xs">
                           {item.secretData}
                         </span>
                         <button 
                           onClick={() => handleCopy(item.secretData, item.id)}
                           className="text-zinc-500 hover:text-zinc-900 transition-colors ml-2"
                         >
                           {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-600"/> : <Copy className="w-4 h-4"/>}
                         </button>
                       </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between font-medium">
                       <div className="flex flex-col gap-1 sm:text-right">
                          <span className="text-xs text-zinc-500 tracking-wide">
                            {new Date(item.timestamp).toLocaleString('th-TH')}
                          </span>
                          <span className="text-sm font-black text-fuchsia-600">
                             - {item.price} บาท
                          </span>
                       </div>
                       <span className="text-[10px] uppercase font-bold text-fuchsia-600 bg-fuchsia-100 px-2 py-0.5 rounded-full mt-1 hidden sm:inline-block">
                         SUCCESS
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
