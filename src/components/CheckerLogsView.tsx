import React from 'react';
import { Terminal, Shield, CheckCircle2, X, Check, Square, Crown, ArrowLeft, History } from 'lucide-react';
import { motion } from 'motion/react';
import { LogEntry } from '../types';

interface CheckerLogsViewProps {
  logs: LogEntry[];
  onBack: () => void;
}

export const CheckerLogsView: React.FC<CheckerLogsViewProps> = ({ logs, onBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-[#0B0F14] border border-white/10 rounded-full flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#0a0d12] transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <History className="w-8 h-8 text-indigo-600" />
            ประวัติระบบเช็คไอดี
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Checker Logs / รายการตรวจสอบไอดีล่าสุดของคุณ</p>
        </div>
      </div>

      <div className="bg-[#0B0F14] border border-white/10 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col h-[70vh]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121820] border border-white/10 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Console Logs</h3>
              <p className="text-xs font-medium text-zinc-500 mt-0.5">บันทึกการทำงานล่าสุด (100 รายการ)</p>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#0a0d12] border border-white/10 p-6 rounded-2xl text-[13px] font-mono overflow-auto scrollbar-thin scrollbar-thumb-zinc-300">
          {logs.length === 0 && (
            <div className="text-zinc-400 flex flex-col items-center justify-center h-full gap-4 opacity-70">
              <Terminal className="w-12 h-12" />
              <span>ยังไม่มีประวัติการตรวจสอบไอดี...</span>
            </div>
          )}
          
          <div className="flex flex-col-reverse">
            {[...logs].map(log => {
              let lightModeColor = 'text-zinc-400';
              if(log.colorClass.includes('emerald') || log.colorClass.includes('green')) lightModeColor = 'text-emerald-600';
              else if (log.colorClass.includes('red')) lightModeColor = 'text-[#2563EB]';
              else if (log.colorClass.includes('cyan') || log.colorClass.includes('amber')) lightModeColor = 'text-amber-500';

              return (
                <div key={log.id} className={`${lightModeColor} mb-2 flex items-start gap-3 break-all whitespace-pre-wrap leading-relaxed`}>
                  <span className="shrink-0 text-zinc-400 font-medium">[{log.time}]</span>
                  <span className="flex-1">
                    <div className="flex items-start">
                      {log.iconName === 'shield' && <Shield className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'terminal-pulse' && <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 animate-pulse mt-1" />}
                      {log.iconName === 'terminal' && <Terminal className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'check-circle' && <CheckCircle2 className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'x' && <X className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'check' && <Check className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'square' && <Square className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      {log.iconName === 'crown' && <Crown className="inline w-3.5 h-3.5 mr-2.5 shrink-0 mt-1" />}
                      <span className="flex-1 font-medium">{log.text}</span>
                    </div>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
