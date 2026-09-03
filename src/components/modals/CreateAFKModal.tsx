import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Gamepad2, ArrowRight, AlertCircle, Play } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CreateAFKModal: React.FC = () => {
  const { 
    openCreateModal, 
    setOpenCreateModal, 
    games, 
    selectedGameForModal, 
    setSelectedGameForModal, 
    createAFKSession,
    user,
    setCurrentView,
    setOpenTopUpModal
  } = useApp();

  const [selectedGameId, setSelectedGameId] = useState<string>(selectedGameForModal?.id || games[0]?.id || 'blox-fruits');
  const [username, setUsername] = useState<string>('SiamGamer_Pro');
  const [durationHours, setDurationHours] = useState<number>(6);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!openCreateModal) return null;

  const activeGame = games.find(g => g.id === selectedGameId) || games[0];
  const totalPrice = (activeGame?.pricePerHour || 5) * durationHours;
  const isBalanceEnough = user.walletBalance >= totalPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim()) {
      setErrorMsg('กรุณากรอกชื่อตัวละคร Roblox');
      return;
    }

    if (!isBalanceEnough) {
      setErrorMsg(`ยอดเงินในกระเป๋าไม่พอ (ต้องการ ฿${totalPrice.toFixed(2)})`);
      return;
    }

    const res = createAFKSession(selectedGameId, username, durationHours);
    if (res.success) {
      setOpenCreateModal(false);
      setSelectedGameForModal(null);
      setCurrentView('dashboard');
    } else {
      setErrorMsg(res.error || 'เกิดข้อผิดพลาดในการสร้างเซสชัน');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        
        {/* Header - Borderless */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-prompt">
                เริ่มรัน Cloud AFK ใหม่
              </h3>
              <p className="text-[11px] text-neutral-400">
                เลือกเกม กรอกชื่อผู้ใช้ และตั้งค่าระยะเวลาการทำงาน
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setOpenCreateModal(false);
              setSelectedGameForModal(null);
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Game Selection - Borderless pills */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200">
              เลือกเกมและโหมดที่ต้องการฟาร์ม
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {games.map(g => {
                const isSelected = selectedGameId === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGameId(g.id)}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{g.thumbnail}</span>
                      <span className="text-[10px] font-mono font-bold">฿{g.pricePerHour}/h</span>
                    </div>
                    <div className="font-bold text-xs mt-1 truncate">{g.name}</div>
                    <div className="text-[10px] opacity-70 truncate">{g.mapName.split('·')[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Username */}
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800 dark:text-neutral-200">
              ชื่อผู้ใช้ Roblox (Roblox Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="กรอกชื่อตัวละคร เช่น SiamGamer_Pro99"
              className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono outline-none"
            />
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                ระยะเวลาที่ต้องการรัน AFK
              </label>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {durationHours} ชั่วโมง
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {[1, 3, 6, 12, 24, 48].map(hrs => (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setDurationHours(hrs)}
                  className={`py-2 rounded-xl text-center font-bold font-mono transition-all cursor-pointer ${
                    durationHours === hrs
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {hrs}h
                </button>
              ))}
            </div>
          </div>

          {/* Summary Box - Borderless */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 space-y-2">
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>อัตราค่าบริการ ({activeGame?.name}):</span>
              <span className="font-mono font-medium">฿{activeGame?.pricePerHour.toFixed(2)} / ชม.</span>
            </div>
            <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
              <span>ยอดเงินในกระเป๋าปัจจุบัน:</span>
              <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(user.walletBalance)}</span>
            </div>
            <div className="pt-2 flex items-center justify-between font-bold text-neutral-900 dark:text-white">
              <span>ยอดรวมที่ต้องชำระ:</span>
              <span className="text-base font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {!isBalanceEnough ? (
              <button
                type="button"
                onClick={() => {
                  setOpenCreateModal(false);
                  setOpenTopUpModal(true);
                }}
                className="col-span-2 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>ยอดเงินไม่พอ · ไปหน้าเติมเงิน (PromptPay / TrueMoney)</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setOpenCreateModal(false)}
                  className="py-3 rounded-2xl font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-3 rounded-2xl font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>เริ่มรัน AFK ทันที</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
