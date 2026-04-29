import React, { useState } from 'react';
import { History, Key, Activity, ArrowRight, Clock, MapPin, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLog {
  id: string;
  type: 'redeem' | 'check' | 'login';
  action: string;
  details: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

const DUMMY_LOGS: HistoryLog[] = [
  { id: '1', type: 'login', action: 'เข้าสู่ระบบ (System Account)', details: 'IP: 192.168.1.1 - Bangkok, TH', timestamp: new Date().toISOString(), status: 'success' },
  { id: '2', type: 'redeem', action: 'เติมโค้ด - อัปเกรดระดับ', details: 'ใช้โค้ดลดราคา: APEX-VIP-1M', timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'success' },
  { id: '3', type: 'check', action: 'เช็คไอดีเกม - ROV', details: 'ตรวจสอบ UID: 994827103', timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'success' },
  { id: '4', type: 'check', action: 'เช็คไอดีเกม - Free Fire', details: 'ตรวจสอบ UID: 184920199', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'failed' },
  { id: '5', type: 'login', action: 'ล็อกอินจากอุปกรณ์ใหม่', details: 'Safari on iPhone (Chiang Mai)', timestamp: new Date(Date.now() - 172800000).toISOString(), status: 'pending' },
];

export const HistoryLogsView: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'redeem' | 'check' | 'login'>('all');

  const filteredLogs = DUMMY_LOGS.filter(log => filter === 'all' || log.type === filter);

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white">
      {/* Header aligned with "Technical Dashboard" aesthetic */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">System Logs <span className="text-zinc-600">//</span> History</h1>
        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">บันทึกประวัติการใช้งาน และการเข้าสู่ระบบทั้งหมดของคุณ</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-1 w-fit mb-8 shadow-xl">
        {[
          { id: 'all', label: 'ทั้งหมด (All)', icon: History },
          { id: 'redeem', label: 'การเติมเงิน (Redeem)', icon: Key },
          { id: 'check', label: 'ตรวจสอบไอดี (Check)', icon: Activity },
          { id: 'login', label: 'การล็อกอิน (Login)', icon: Monitor }
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

      {/* Grid Header (Technical Grid Recipe) */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-3 border-b border-zinc-800 text-xs font-mono uppercase tracking-widest text-zinc-500">
        <div className="col-span-3">Timestamp</div>
        <div className="col-span-2">Type</div>
        <div className="col-span-4">Action</div>
        <div className="col-span-2">Status</div>
      </div>

      {/* Grid Content */}
      <div className="flex flex-col">
        <AnimatePresence>
          {filteredLogs.map(log => {
            const date = new Date(log.timestamp);
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-4 md:py-3 border-b border-zinc-900 hover:bg-zinc-900 transition-colors cursor-crosshair group items-center"
              >
                {/* Timestamp */}
                <div className="col-span-3 font-mono text-xs text-zinc-400 flex items-center gap-2">
                  <Clock className="w-3 h-3 opacity-50" />
                  {date.toLocaleString('th-TH')}
                </div>
                
                {/* Type Label */}
                <div className="col-span-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                    log.type === 'redeem' ? 'bg-amber-500/10 text-amber-500' :
                    log.type === 'check' ? 'bg-fuchsia-500/10 text-fuchsia-500' :
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    {log.type}
                  </span>
                </div>

                {/* Action Details */}
                <div className="col-span-4 flex flex-col">
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-cyan-400 transition-colors">
                    {log.action}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono mt-0.5 flex items-center gap-1.5 line-clamp-1">
                    <ArrowRight className="w-3 h-3" />
                    {log.details}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                      log.status === 'failed' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                      'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                    }`} />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                      {log.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {filteredLogs.length === 0 && (
          <div className="py-12 text-center text-zinc-500 font-mono text-sm uppercase tracking-widest">
            <Activity className="w-8 h-8 opacity-20 mx-auto mb-3" />
            No logs found for this filter.
          </div>
        )}
      </div>
    </div>
  );
};
