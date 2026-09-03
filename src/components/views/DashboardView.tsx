import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  ArrowRight, 
  Play,
  Wallet,
  ShoppingBag,
  Terminal,
  Activity,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatCurrency, formatTimeCountdown } from '../../utils/formatters';
import { motion } from 'motion/react';

export const DashboardView: React.FC = () => {
  const { 
    user, 
    sessions, 
    activeSessions, 
    setCurrentView, 
    setSelectedSessionId, 
    setOpenCreateModal, 
    setOpenTopUpModal,
    activeRentals
  } = useApp();

  const primarySession = activeSessions[0] || null;
  const activeRents = activeRentals.filter(r => r.status === 'active');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 animate-in fade-in duration-150">
      
      {/* Top Header: Simple & Direct */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-prompt">
            แดชบอร์ด Cloud AFK
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            จัดการระบบบอทฟาร์มและตรวจสอบสถานะการทำงานแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpenTopUpModal(true)}
            className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-500" />
            <span>฿{user.walletBalance.toFixed(2)}</span>
          </button>

          <button
            id="dashboard-new-afk-btn"
            onClick={() => setOpenCreateModal(true)}
            className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เริ่มบอทใหม่</span>
          </button>
        </div>
      </div>

      {/* Active Rental Banner (Only if any) */}
      {activeRents.length > 0 && (
        <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              🔑
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white font-prompt">
                คุณมีไอดีเกมที่กำลังเช่าอยู่ {activeRents.length} บัญชี
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {activeRents[0].productTitle} ({activeRents[0].accountUsername})
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentView('rentals')}
            className="px-3.5 py-1.5 rounded-2xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors cursor-pointer shrink-0"
          >
            ดูรหัสผ่าน
          </button>
        </div>
      )}

      {/* Main Focal Card: Active AFK Bot */}
      {primarySession ? (
        <div className="bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {primarySession.status === 'running' ? 'กำลังรันบนคลาวด์' : 'หยุดชั่วคราว'}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <span className="text-xs text-neutral-400">{primarySession.gameName}</span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white font-prompt mt-0.5">
                  Roblox: <span className="font-mono text-emerald-600 dark:text-emerald-400">{primarySession.robloxUsername}</span>
                </h2>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedSessionId(primarySession.id);
                setCurrentView('session-detail');
              }}
              className="px-4 py-2 rounded-2xl text-xs font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>เปิดหน้าควบคุม & คำสั่ง</span>
            </button>
          </div>

          {/* Time Remaining Bar */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-neutral-400">เวลาที่เหลืออยู่</span>
              <span className="text-2xl sm:text-3xl font-bold font-mono text-neutral-900 dark:text-white">
                {formatTimeCountdown(primarySession.remainingSeconds)}
              </span>
            </div>
            
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, Math.max(0, (1 - (primarySession.remainingSeconds / Math.max(1, primarySession.totalSeconds))) * 100))}%` 
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span>โฮสต์เซิร์ฟเวอร์: {primarySession.workerName}</span>
              <span>สถานะ: เชื่อมต่อสมบูรณ์ (Ping {primarySession.pingMs || 18}ms)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Clean & Friendly */
        <div className="bg-white dark:bg-[#141517] rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-3xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center mx-auto text-xl">
            ☁️
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white font-prompt">
              ยังไม่มีบอท AFK ที่กำลังทำงาน
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed">
              เปิดเซสชันคลาวด์ Sandbox ปลอดภัย ไม่กินสเปกคอม ไม่ต้องเปิดเครื่องทิ้งไว้
            </p>
          </div>
          <button
            onClick={() => setOpenCreateModal(true)}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>เริ่มเปิดใช้งาน AFK ทันที</span>
          </button>
        </div>
      )}

      {/* Quick Launch & Market Gateway */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Marketplace Card */}
        <div 
          onClick={() => setCurrentView('marketplace')}
          className="bg-white dark:bg-[#141517] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt group-hover:text-blue-500 transition-colors">
              ตลาดซื้อ-เช่าไอดีเกม
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              ไอดี Blox Fruits ผลตื่น, King Legacy, Pet Sim 99 พร้อมระบบส่งรหัสผ่านทันที
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400 pt-1">
            <span>เลือกดูไอดีทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Wallet / Top-up Card */}
        <div 
          onClick={() => setOpenTopUpModal(true)}
          className="bg-white dark:bg-[#141517] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
        >
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt group-hover:text-emerald-500 transition-colors">
              เติมเงินเข้ากระเป๋า
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              รองรับ PromptPay QR Code สแกนจ่ายเข้าทันที และซองของขวัญ TrueMoney
            </p>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
            <span>ยอดคงเหลือ: ฿{user.walletBalance.toFixed(2)}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Recent Sessions History (Clean Table / List) */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              ประวัติเซสชัน AFK ล่าสุด
            </h3>
            <button
              onClick={() => setCurrentView('history')}
              className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="bg-white dark:bg-[#141517] rounded-3xl p-2 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {sessions.slice(0, 3).map((session) => (
              <div 
                key={session.id}
                onClick={() => {
                  setSelectedSessionId(session.id);
                  setCurrentView('session-detail');
                }}
                className="p-3.5 sm:p-4 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-xs shrink-0">
                    🎮
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate font-prompt">
                      {session.robloxUsername}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {session.gameName} · {session.durationHours} ชม.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                    session.status === 'running' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' :
                    session.status === 'completed' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500' :
                    'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  }`}>
                    {session.status === 'running' ? 'กำลังทำงาน' : session.status === 'completed' ? 'เสร็จสิ้น' : session.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
