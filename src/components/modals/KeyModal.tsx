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
    <div className="fixed inset-0 bg-gray-50/90 flex items-center justify-center p-4 z-[70]  font-sans animate-in zoom-in-95 duration-200 overflow-y-auto">
      <div className="bg-gray-50 border-gray-200 border border-[#3B82F6]/25 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-lg relative overflow-hidden my-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5  rounded-full pointer-events-none"></div>

        <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#3B82F6]/20">
              <Crown className="w-8 h-8 text-blue-600 drop-shadow-lg" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">VIP MEMBER</h2>
            <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p>สิทธิพิเศษระดับพรีเมียม:</p>
                <ul className="text-left inline-block space-y-1">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> ตรวจสอบไอดีไม่จำกัด (Unlimited Checks)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Bypass DataDome ความเร็วสูง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> บันทึกประวัติการตรวจสอบย้อนหลัง</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> ไม่ต้องติด Captcha (Turnstile)</li>
                </ul>
            </div>
            <a href="https://discord.gg/yourlink" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-gray-900 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105">
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
                  <label className="text-[11px] text-gray-600 font-bold uppercase tracking-wider mb-2 block">คีย์สำหรับรายเดือน/รายปี (Key)</label>
                  <div className="relative">
                    <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required name="key" type="text" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-[#3B82F6] outline-none text-gray-900 transition-all placeholder:text-gray-600" placeholder="APEXSTORE-XXXXX-XXXXX" />
                  </div>
              </div>
              <button type="submit" className="w-full from-[#3B82F6] to-blue-700 hover:from-blue-400 hover:to-blue-600 text-gray-900 font-bold py-3.5 rounded-xl shadow-lg transition-all mt-4">
                เปิดใช้งาน
              </button>
            </form>
          )}
        </div>

        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-full z-20">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
