import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionStatus } from '../../types';
import { formatCurrency, formatFullDateTime, formatTimeCountdown } from '../../utils/formatters';
import { ChevronRight, Key, Eye, EyeOff, Copy, Check, ShoppingBag, Clock } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { sessions, storeOrders, setSelectedSessionId, setCurrentView, t } = useApp();
  const [mainTab, setMainTab] = useState<'afk' | 'orders'>('afk');
  const [selectedFilter, setSelectedFilter] = useState<'all' | SessionStatus>('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filters: { id: 'all' | SessionStatus; label: string }[] = [
    { id: 'all', label: t.historyFilterAll },
    { id: 'running', label: t.historyFilterRunning },
    { id: 'completed', label: t.historyFilterCompleted },
    { id: 'stopped', label: t.historyFilterStopped },
    { id: 'failed', label: t.historyFilterFailed },
  ];

  const filteredSessions = sessions.filter(session => {
    if (selectedFilter === 'all') return true;
    return session.status === selectedFilter;
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      
      {/* Header - Borderless */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight font-prompt">
            ประวัติการใช้งาน & คำสั่งซื้อ
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            ตรวจสอบประวัติการรันบอท Cloud AFK และรายการซื้อ-เช่าไอดีเกมทั้งหมดของคุณ
          </p>
        </div>

        {/* Main Switcher Tab - Borderless */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 self-start sm:self-auto">
          <button
            onClick={() => setMainTab('afk')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'afk'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>เซสชัน AFK ({sessions.length})</span>
          </button>
          <button
            onClick={() => setMainTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              mainTab === 'orders'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>ซื้อ-เช่าไอดี ({storeOrders.length})</span>
          </button>
        </div>
      </div>

      {mainTab === 'afk' ? (
        <>
          {/* AFK Filter Pills - Borderless */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {filters.map(filter => {
              const isSelected = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  id={`history-filter-${filter.id}`}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* AFK Sessions List - Borderless */}
          <div className="bg-white dark:bg-[#141517] rounded-3xl overflow-hidden shadow-sm space-y-1 p-2">
            {filteredSessions.length === 0 ? (
              <div className="p-10 text-center text-neutral-400 text-xs font-normal">
                {t.historyNoRecords}
              </div>
            ) : (
              filteredSessions.map(session => {
                const isRunning = session.status === 'running';
                return (
                  <div
                    key={session.id}
                    id={`history-item-${session.id}`}
                    onClick={() => {
                      setSelectedSessionId(session.id);
                      setCurrentView('session-detail');
                    }}
                    className="p-4 rounded-2xl flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-900/40 transition-colors cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                          {session.gameName}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          #{session.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                        <span>{session.robloxUsername}</span>
                        <span>·</span>
                        <span>{session.durationHours} {t.createHourUnit}</span>
                        <span>·</span>
                        <span className="font-mono">{formatFullDateTime(session.startedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white font-mono">
                          {formatCurrency(session.price)}
                        </div>
                        <div>
                          {isRunning ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              {t.statusRunning} ({formatTimeCountdown(session.remainingSeconds)})
                            </span>
                          ) : session.status === 'completed' ? (
                            <span className="text-[11px] text-neutral-400">
                              {t.statusCompleted}
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-500 capitalize">
                              {session.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Store Orders & Bought IDs Tab - Borderless */
        <div className="space-y-4">
          {storeOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141517] shadow-sm text-neutral-400 text-xs">
              ยังไม่มีประวัติคำสั่งซื้อไอดี
            </div>
          ) : (
            storeOrders.map((order) => {
              const isVisible = showPassword[order.id] || false;
              const isBuy = order.type === 'buy';

              return (
                <div
                  key={order.id}
                  className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                          {isBuy ? 'ซื้อขาดถาวร' : `เช่า ${order.durationHours} ชม.`}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          #{order.orderNumber}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white mt-1">
                        {order.productTitle}
                      </h3>
                      <div className="text-[11px] text-neutral-400">
                        สั่งซื้อเมื่อ: {order.purchasedAt}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(order.price)}
                      </div>
                      <span className="text-[10px] text-emerald-500 font-medium">
                        ส่งมอบสำเร็จ (Delivered)
                      </span>
                    </div>
                  </div>

                  {/* Account Login Credentials Card - Borderless */}
                  <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      <span className="flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-500" />
                        ข้อมูลไอดีสำหรับเข้าเล่น
                      </span>
                      {order.credentials.emailLinked && (
                        <span className="text-[10px] text-neutral-400">
                          {order.credentials.emailLinked}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Username */}
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400">Username</div>
                          <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                            {order.credentials.username}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(order.credentials.username, `user-${order.id}`)}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === `user-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password */}
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400">Password</div>
                          <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                            {isVisible ? order.credentials.password : '••••••••••••'}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePassword(order.id)}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(order.credentials.password || '', `pass-${order.id}`)}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          >
                            {copiedKey === `pass-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {order.credentials.twoFactorKey && (
                      <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-neutral-400">รหัส 2FA Key / สำรอง</div>
                          <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                            {order.credentials.twoFactorKey}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(order.credentials.twoFactorKey || '', `2fa-${order.id}`)}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          {copiedKey === `2fa-${order.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
