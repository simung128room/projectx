import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ArrowLeft, 
  Square, 
  Plus, 
  Play,
  Pause,
  Send,
  Sliders,
  Terminal,
  Copy,
  Check,
  Bell,
  Activity,
  Server,
  Wifi
} from 'lucide-react';
import { 
  formatTimeDetailed, 
  formatCurrency, 
  formatTimeCountdown 
} from '../../utils/formatters';
import { StopConfirmModal } from '../modals/StopConfirmModal';

export const SessionDetailView: React.FC = () => {
  const { 
    selectedSession, 
    setCurrentView, 
    stopAFKSession, 
    pauseAFKSession,
    resumeAFKSession,
    extendAFKSession, 
    executeTerminalCommand,
    updateSessionSettings,
    user,
    t
  } = useApp();

  const [isStopModalOpen, setIsStopModalOpen] = useState<boolean>(false);
  const [showExtendModal, setShowExtendModal] = useState<boolean>(false);
  const [extendHours, setExtendHours] = useState<number>(6);
  const [extendError, setExtendError] = useState<string | null>(null);
  
  const [commandInput, setCommandInput] = useState<string>('');
  const [copiedSessionId, setCopiedSessionId] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'settings'>('terminal');
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>('');
  const [webhookTestStatus, setWebhookTestStatus] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSession?.webhookUrl) {
      setWebhookUrlInput(selectedSession.webhookUrl);
    }
  }, [selectedSession?.id]);

  useEffect(() => {
    if (activeTab === 'terminal') {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedSession?.logs?.length, activeTab]);

  if (!selectedSession) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-neutral-400 text-xs">ไม่พบเซสชันที่เลือก</p>
        <button
          onClick={() => setCurrentView('dashboard')}
          className="mt-3 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-2xl cursor-pointer"
        >
          กลับหน้าหลัก
        </button>
      </div>
    );
  }

  const isRunning = selectedSession.status === 'running';
  const isPaused = selectedSession.status === 'paused';

  const handleExtend = () => {
    setExtendError(null);
    const res = extendAFKSession(selectedSession.id, extendHours);
    if (res.success) {
      setShowExtendModal(false);
    } else {
      setExtendError(res.error || 'Failed to extend');
    }
  };

  const handleSendCommand = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commandInput.trim()) return;
    executeTerminalCommand(selectedSession.id, commandInput);
    setCommandInput('');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(selectedSession.id);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  const handleTestWebhook = () => {
    if (!webhookUrlInput.trim()) {
      setWebhookTestStatus('กรุณากรอก URL Webhook');
      return;
    }
    updateSessionSettings(selectedSession.id, { webhookUrl: webhookUrlInput });
    setWebhookTestStatus('กำลังส่งสัญญาณแจ้งเตือน...');
    setTimeout(() => {
      executeTerminalCommand(selectedSession.id, `[DISCORD] Test ping sent successfully to Discord Webhook`);
      setWebhookTestStatus('ส่งแจ้งเตือนเข้า Discord สำเร็จ!');
      setTimeout(() => setWebhookTestStatus(null), 3000);
    }, 600);
  };

  const progressPercent = Math.min(100, Math.max(0, (1 - (selectedSession.remainingSeconds / Math.max(1, selectedSession.totalSeconds))) * 100));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-in fade-in duration-150">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>กลับไปยังแดชบอร์ด</span>
        </button>

        <button
          onClick={handleCopyId}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-mono bg-white dark:bg-[#141517] shadow-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {copiedSessionId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span>#{selectedSession.id}</span>
        </button>
      </div>

      {/* Main Focus Card */}
      <div className="bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-blue-600 dark:text-blue-400">{selectedSession.gameName}</span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-400">{selectedSession.mapName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight mt-1 font-prompt">
              Roblox: <span className="font-mono text-emerald-600 dark:text-emerald-400">{selectedSession.robloxUsername}</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isRunning ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>กำลังทำงาน</span>
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>หยุดชั่วคราว</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-medium">
                {selectedSession.status}
              </span>
            )}
          </div>
        </div>

        {/* Remaining Time Display */}
        <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-400 mb-1">เวลาที่เหลืออยู่</div>
              <div className="text-3xl sm:text-4xl font-bold font-mono text-neutral-900 dark:text-white">
                {formatTimeDetailed(selectedSession.remainingSeconds)}
              </div>
            </div>

            {(isRunning || isPaused) && (
              <div className="flex items-center gap-2">
                {isRunning ? (
                  <button
                    onClick={() => pauseAFKSession(selectedSession.id)}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-neutral-200/80 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>หยุดชั่วคราว</span>
                  </button>
                ) : (
                  <button
                    onClick={() => resumeAFKSession(selectedSession.id)}
                    className="px-3.5 py-2 rounded-2xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>ทำงานต่อ</span>
                  </button>
                )}

                <button
                  onClick={() => setShowExtendModal(true)}
                  className="px-4 py-2 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ต่อเวลา</span>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono">
              <span>ผ่านไปแล้ว: {Math.floor(progressPercent)}%</span>
              <span>โฮสต์: {selectedSession.workerName}</span>
            </div>
          </div>
        </div>

        {/* Minimal Tab Switcher */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 w-fit">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'terminal'
                  ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>คอนโซลคำสั่ง</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ตั้งค่าบอท</span>
            </button>
          </div>

          {/* TAB 1: TERMINAL */}
          {activeTab === 'terminal' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#0e1013] text-neutral-300 font-mono text-[11px] space-y-1.5 h-64 overflow-y-auto">
                {selectedSession.logs?.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
                    {log.level === 'cmd' ? (
                      <span className="text-blue-400 font-semibold">$ {log.message}</span>
                    ) : (
                      <span className={
                        log.level === 'success' ? 'text-emerald-400' :
                        log.level === 'warn' ? 'text-amber-400' :
                        log.level === 'error' ? 'text-rose-400' : 'text-neutral-300'
                      }>
                        {log.message}
                      </span>
                    )}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              {/* Quick Command Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                {['/stats', '/ping', '/jump', '/collect', '/reconnect', '/help'].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => executeTerminalCommand(selectedSession.id, cmd)}
                    className="px-3 py-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-mono cursor-pointer shrink-0"
                  >
                    {cmd}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendCommand} className="flex items-center gap-2">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder="พิมพ์คำสั่ง เช่น /stats, /jump..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs font-mono outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่ง</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="p-5 rounded-3xl bg-neutral-50 dark:bg-neutral-900/40 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Auto-Reconnect เมื่อหลุดการเชื่อมต่อ</div>
                  <div className="text-[11px] text-neutral-400">เข้าเกมใหม่ให้อัตโนมัติเมื่อเซิร์ฟเวอร์ Roblox รีเซ็ต</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedSession.autoReconnect ?? true}
                  onChange={(e) => updateSessionSettings(selectedSession.id, { autoReconnect: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">Anti-Idle Movement (กันหลุด AFK 20 นาที)</div>
                  <div className="text-[11px] text-neutral-400">ขยับตัวและกระโดดอัตโนมัติเป็นระยะเพื่อป้องกันการถูกเตะ</div>
                </div>
                <input 
                  type="checkbox" 
                  checked={selectedSession.antiAfkJump ?? true}
                  onChange={(e) => updateSessionSettings(selectedSession.id, { antiAfkJump: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="pt-2 space-y-2">
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-blue-500" />
                    <span>Discord Webhook แจ้งเตือน</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">รับข้อความแจ้งเตือนเมื่อเซสชันใกล้หมดเวลาหรือมีปัญหา</div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white outline-none"
                  />
                  <button
                    onClick={handleTestWebhook}
                    className="px-4 py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-neutral-700 hover:bg-neutral-800 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    ทดสอบ
                  </button>
                </div>

                {webhookTestStatus && (
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    {webhookTestStatus}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Stop Action */}
        {(isRunning || isPaused) && (
          <div className="pt-2">
            <button
              onClick={() => setIsStopModalOpen(true)}
              className="w-full py-3 rounded-2xl font-semibold text-xs text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>หยุดและปิดเซสชันนี้</span>
            </button>
          </div>
        )}

      </div>

      <StopConfirmModal
        isOpen={isStopModalOpen}
        onClose={() => setIsStopModalOpen(false)}
        onConfirm={() => stopAFKSession(selectedSession.id)}
        sessionId={selectedSession.id}
        remainingText={formatTimeCountdown(selectedSession.remainingSeconds)}
      />

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#141517] rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-prompt">
              ต่อเวลา AFK #{selectedSession.id}
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[1, 6, 12].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setExtendHours(hrs)}
                  className={`p-3 rounded-2xl text-center text-xs font-bold transition-all cursor-pointer ${
                    extendHours === hrs
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  +{hrs} ชม.
                  <div className="text-[10px] font-mono mt-0.5">
                    {formatCurrency(hrs * 5)}
                  </div>
                </button>
              ))}
            </div>

            {extendError && (
              <p className="text-xs text-rose-500 font-medium">{extendError}</p>
            )}

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-neutral-400">ยอดเงินในกระเป๋า: {formatCurrency(user.walletBalance)}</span>
              <span className="font-bold font-mono text-neutral-900 dark:text-white">รวม: {formatCurrency(extendHours * 5)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowExtendModal(false)}
                className="py-2.5 rounded-2xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleExtend}
                className="py-2.5 rounded-2xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 cursor-pointer shadow-xs"
              >
                ยืนยันการต่อเวลา
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
