import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatTimeCountdown, formatFullDateTime } from '../../utils/formatters';
import { Clock, Key, Eye, EyeOff, Copy, Check, RotateCcw, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const ActiveRentalsView: React.FC = () => {
  const { activeRentals, returnRentalEarly, setCurrentView } = useApp();
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Header - Borderless */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight font-prompt">
            ไอดีเกมที่กำลังเช่าอยู่
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            ดูข้อมูลการเข้าสู่ระบบ เวลานับถอยหลัง และส่งคืนไอดีเมื่อใช้งานเสร็จสิ้น
          </p>
        </div>

        <button
          onClick={() => setCurrentView('marketplace')}
          className="px-4 py-2.5 rounded-2xl text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer self-start sm:self-auto shadow-sm"
        >
          + เช่าไอดีเพิ่ม
        </button>
      </div>

      {activeRentals.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
            <Key className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white font-prompt">
              ยังไม่มีไอดีที่กำลังเช่า
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              คุณสามารถเลือกเช่าไอดีระดับเทพ เลเวลตัน สกินแรร์รายชั่วโมงได้จากตลาดไอดี
            </p>
          </div>
          <button
            onClick={() => setCurrentView('marketplace')}
            className="px-5 py-2.5 rounded-2xl text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>ไปที่ตลาดไอดี</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {activeRentals.map((rental) => {
            const isActive = rental.status === 'active';
            const isVisible = showPassword[rental.id] || false;

            return (
              <motion.div
                key={rental.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-6"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={rental.imageUrl}
                      alt={rental.gameName}
                      className="w-14 h-14 rounded-2xl object-cover shrink-0 bg-neutral-100 dark:bg-neutral-800"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">
                          {rental.productTitle}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {rental.gameName} · รหัสการเช่า <span className="font-mono text-neutral-700 dark:text-neutral-300">#{rental.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Timer */}
                  <div className="text-left sm:text-right bg-neutral-50 dark:bg-neutral-900/50 p-3 sm:p-0 rounded-2xl sm:bg-transparent">
                    {isActive ? (
                      <div>
                        <div className="flex items-center sm:justify-end gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>กำลังเช่าอยู่ (Active)</span>
                        </div>
                        <div className="text-xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                          {formatTimeCountdown(rental.remainingSeconds)}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          หมดเวลา: {formatFullDateTime(new Date(rental.endTime).toISOString())}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-medium text-neutral-400">
                        {rental.status === 'returned' ? 'คืนไอดีเรียบร้อย' : 'หมดเวลาการเช่า'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Credentials Box - Borderless Soft Neutral */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      ข้อมูลบัญชีสำหรับเข้าเล่น
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ห้ามเปลี่ยนรหัสผ่านโดยเด็ดขาด
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Username */}
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400">ชื่อผู้ใช้ (Username)</div>
                        <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                          {rental.credentials.username}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(rental.credentials.username, `user-${rental.id}`)}
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        title="คัดลอก Username"
                      >
                        {copiedKey === `user-${rental.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Password */}
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400">รหัสผ่าน (Password)</div>
                        <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                          {isVisible ? rental.credentials.password : '••••••••••••'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePassword(rental.id)}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(rental.credentials.password || '', `pass-${rental.id}`)}
                          className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                          title="คัดลอก Password"
                        >
                          {copiedKey === `pass-${rental.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {rental.credentials.twoFactorKey && (
                    <div className="p-3 rounded-xl bg-white dark:bg-neutral-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-neutral-400">รหัสยืนยัน 2FA Key / สำรอง</div>
                        <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                          {rental.credentials.twoFactorKey}
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(rental.credentials.twoFactorKey || '', `2fa-${rental.id}`)}
                        className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
                        title="คัดลอก 2FA"
                      >
                        {copiedKey === `2fa-${rental.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {/* Warning Notice */}
                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{rental.credentials.instructions}</span>
                  </div>
                </div>

                {/* Actions */}
                {isActive && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs text-neutral-400">
                      ค่าบริการที่ชำระ: <span className="font-mono font-bold text-neutral-900 dark:text-white">฿{rental.pricePaid}</span> ({rental.durationHours} ชม.)
                    </div>

                    <button
                      onClick={() => returnRentalEarly(rental.id)}
                      className="px-4 py-2 rounded-2xl text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>คืนไอดีก่อนเวลา</span>
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};
