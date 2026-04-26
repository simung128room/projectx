import React from 'react';
import { History, X } from 'lucide-react';
import { LogEntry } from '../../types'; // Assuming LogEntry is available, actually I need to check where it is

interface HistoryModalProps {
  show: boolean;
  onClose: () => void;
  logs: any[];
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ show, onClose, logs }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-[70] backdrop-blur-md font-sans animate-in zoom-in-95 duration-200">
      <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 shrink-0">
          <History className="w-5 h-5 text-emerald-400"/> ประวัติการทำรายการ
        </h2>
        <div className="overflow-y-auto pr-2 space-y-3 custom-scrollbar flex-1 min-h-[300px]">
          {logs.length > 0 ? logs.map((log, i) => (
             <div key={i} className="p-3 bg-zinc-900/50 border border-white/5 rounded-xl flex flex-col text-sm break-words">
               <div className="flex justify-between items-start mb-1 gap-4">
                 <span className={`font-mono text-xs ${log.colorClass}`}>{log.text}</span>
                 <span className="text-[10px] text-zinc-500 shrink-0">{log.time}</span>
               </div>
               <span className="text-[10px] text-zinc-600 uppercase">ประเภท: {log.iconName}</span>
             </div>
          )) : (
            <div className="text-center text-zinc-500 py-10 flex flex-col items-center">
              <History className="w-10 h-10 mb-2 opacity-50" />
              ยังไม่มีประวัติการใช้งาน
            </div>
          )}
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
