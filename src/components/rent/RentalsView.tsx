import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Key, 
  Lock, 
  Copy, 
  Check, 
  RotateCcw, 
  ShieldAlert, 
  Gamepad2, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { ActiveRental } from '../../types/store';
import Swal from 'sweetalert2';

export const RentalsView: React.FC<{ onNavigateToShop?: () => void }> = ({ onNavigateToShop }) => {
  const { activeRentals, returnRentalEarly, theme } = useStore();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [now, setNow] = useState<number>(Date.now());

  // Tick timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReturnEarly = (rental: ActiveRental) => {
    Swal.fire({
      title: 'ยืนยันการคืนไอดี?',
      text: `คุณต้องการส่งมอบไอดี ${rental.productTitle} คืนระบบก่อนกำหนดใช่หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการคืน',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#27272a',
      background: theme === 'dark' ? '#121216' : '#ffffff',
      color: theme === 'dark' ? '#ffffff' : '#000000'
    }).then((res) => {
      if (res.isConfirmed) {
        returnRentalEarly(rental.id);
      }
    });
  };

  const formatRemainingTime = (endTime: number) => {
    const diff = endTime - now;
    if (diff <= 0) return { label: 'หมดเวลาการเช่าแล้ว', isExpired: true };

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      label: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      isExpired: false
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Active Game ID Rentals</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            คลังไอดีเกมที่กำลังเช่า (Rentals)
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ติดตามเวลานับถอยหลัง ดูรหัสผ่านเข้าเกม และจัดการสถานะการเช่าแบบเรียลไทม์
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>กำลังใช้งาน {activeRentals.filter(r => r.status === 'active').length} ไอดี</span>
          </div>
        </div>
      </div>

      {/* Rentals Grid */}
      {activeRentals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">ยังไม่มีรายการเช่าไอดีในขณะนี้</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              คุณสามารถเลือกเช่าไอดีเกมดังราคาประหยัด เริ่มต้นเพียง ฿20/ชม. พร้อมรับรหัสเข้าเล่นได้ทันที
            </p>
          </div>
          {onNavigateToShop && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onNavigateToShop}
              className="py-2.5 px-5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>ไปเลือกดูไอดีสำหรับเช่า</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeRentals.map((rental) => {
            const timer = formatRemainingTime(rental.endTime);
            const isRentalActive = rental.status === 'active' && !timer.isExpired;

            return (
              <motion.div
                key={rental.id}
                layout
                className={`p-6 rounded-2xl border transition-all ${
                  isRentalActive
                    ? 'bg-[#0f1015] border-amber-500/40 shadow-[0_4px_25px_-5px_rgba(245,158,11,0.15)]'
                    : 'bg-zinc-900/40 border-zinc-800/80 opacity-75'
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={rental.imageUrl}
                      alt={rental.productTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                        {rental.gameName}
                      </span>
                      <h3 className="text-sm font-bold text-zinc-100 line-clamp-1 mt-1">
                        {rental.productTitle}
                      </h3>
                      <span className="text-xs text-zinc-400">
                        ระยะเวลาเช่า: <b>{rental.durationHours} ชั่วโมง</b> (฿{rental.pricePaid})
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {rental.status === 'returned' ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-400 border border-zinc-700">
                        คืนไอดีแล้ว
                      </span>
                    ) : timer.isExpired ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        หมดเวลา
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                        กำลังใช้งาน
                      </span>
                    )}
                  </div>
                </div>

                {/* Countdown Timer Display */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                      <Clock className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        เวลาคงเหลือ (Remaining Time)
                      </span>
                      <span className="text-xl font-black font-mono tracking-wider text-amber-400">
                        {rental.status === 'returned' ? '00:00:00' : timer.label}
                      </span>
                    </div>
                  </div>

                  {isRentalActive && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleReturnEarly(rental)}
                      className="py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>คืนไอดี</span>
                    </motion.button>
                  )}
                </div>

                {/* Credentials View */}
                <div className="space-y-2.5 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs font-mono">
                  {/* Username */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800/80">
                    <span className="text-zinc-400 font-sans">ชื่อผู้ใช้:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-bold">{rental.credentials.username}</span>
                      <button
                        onClick={() => handleCopy(rental.credentials.username, `${rental.id}-u`)}
                        className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {copiedField === `${rental.id}-u` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800/80">
                    <span className="text-zinc-400 font-sans">รหัสผ่าน:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold">{rental.credentials.password}</span>
                      <button
                        onClick={() => handleCopy(rental.credentials.password, `${rental.id}-p`)}
                        className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        {copiedField === `${rental.id}-p` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* 2FA Key if exists */}
                  {rental.credentials.twoFactorKey && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-zinc-800/80">
                      <span className="text-zinc-400 font-sans">2FA Key:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-300 text-[11px]">{rental.credentials.twoFactorKey}</span>
                        <button
                          onClick={() => handleCopy(rental.credentials.twoFactorKey || '', `${rental.id}-2fa`)}
                          className="p-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                        >
                          {copiedField === `${rental.id}-2fa` ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Safety rules notice */}
                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>ห้ามนำไอดีไปเปิดโปรแกรมโกง หรือเปลี่ยนรหัสผ่านเด็ดขาด ระบบจะแบนอัตโนมัติ</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
