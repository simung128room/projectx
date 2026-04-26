import React from 'react';
import { Crown, Check, ShoppingCart, Key as KeyIcon, X } from 'lucide-react';

interface KeyModalProps {
  show: boolean;
  onClose: () => void;
  vipTab: 'key';
  redeemKey: (key: string, email: string) => void;
  userEmail?: string;
}

export const KeyModal: React.FC<KeyModalProps> = ({ show, onClose, vipTab, redeemKey, userEmail }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-[70] backdrop-blur-md font-sans animate-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="bg-[#151518] border border-amber-500/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden my-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Crown className="w-8 h-8 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">VIP MEMBER</h2>
            <div className="text-sm text-zinc-400 mb-6 space-y-2">
                <p>สิทธิพิเศษระดับพรีเมียม:</p>
                <ul className="text-left inline-block space-y-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> ตรวจสอบไอดีไม่จำกัด (Unlimited Checks)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Bypass DataDome ความเร็วสูง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> บันทึกประวัติการตรวจสอบย้อนหลัง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> ไม่ต้องติด Captcha (Turnstile)</li>
                </ul>
            </div>
            <a href="https://discord.gg/yourlink" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105">
              <ShoppingCart className="w-4 h-4" /> ซื้อคีย์ได้ที่ Discord
            </a>
        </div>

        <div className="relative z-10">
          {vipTab === 'key' && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const key = formData.get('key') as string;
                if (key) redeemKey(key, userEmail || 'ผู้ใช้งานทั่วไป');
              }} className="space-y-4">
              <div>
                  <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">คีย์สำหรับรายเดือน/รายปี (Key)</label>
                  <div className="relative">
                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input required name="key" type="text" className="w-full bg-[#09090b] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-amber-500 outline-none text-white transition-all placeholder:text-zinc-600" placeholder="APEX-XXXXX-XXXXX" />
                  </div>
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] transition-all mt-4">
                เปิดใช้งาน
              </button>
            </form>
          )}
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full z-20">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
