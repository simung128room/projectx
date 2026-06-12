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
    <div className="fixed inset-0 bg-card flex items-center justify-center p-4 z-[70] font-sans animate-in zoom-in-95 duration-200 overflow-y-auto ">
      <div className="bg-card border-border  border border-[#10b981]/25 p-6 sm:p-8 max-w-lg w-full relative overflow-hidden my-8 ">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary text-primary-foreground pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 border border-[#10b981]/20">
              <Crown className="w-8 h-8 text-[#10b981]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">VIP MEMBER</h2>
            <div className="text-sm text-muted-foreground mb-6 space-y-2">
                <p>สิทธิพิเศษระดับพรีเมียม:</p>
                <ul className="text-left inline-block space-y-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10b981]" /> ตรวจสอบไอดีไม่จำกัด (Unlimited Checks)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10b981]" /> Bypass DataDome ความเร็วสูง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10b981]" /> บันทึกประวัติการตรวจสอบย้อนหลัง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#10b981]" /> ไม่ต้องติด Captcha (Turnstile)</li>
                </ul>
            </div>
            <a href="https://discord.gg/yourlink" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-card hover:bg-[#4752C4] text-white text-sm font-bold transition-all hover:scale-105 ">
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
                  <label className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-2 block">คีย์สำหรับรายเดือน/รายปี (Key)</label>
                  <div className="relative">
                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input required name="key" type="text" className="w-full bg-card border border-border  py-3 pl-10 pr-4 text-sm focus:border-[#10b981] outline-none text-white transition-all placeholder:text-zinc-400 " placeholder="APEXSTORE-XXXXX-XXXXX" />
                  </div>
              </div>
              <button type="submit" className="w-full from-[#10b981] to-emerald-700 hover:from-emerald-400 hover:to-emerald-600 text-white font-bold py-3.5 transition-all mt-4">
                เปิดใช้งาน
              </button>
            </form>
          )}
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors bg-card hover:bg-[#1e1e1e] p-2 z-20 ">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
