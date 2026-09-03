import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Gift, Sparkles, Check, AlertCircle, ArrowRight, Tag } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RedeemView: React.FC = () => {
  const { redeemVoucher, redeemTrueMoneyGift, user, isLoggedIn, setAuthModalMode, setCurrentView } = useApp();

  const [promoCode, setPromoCode] = useState('');
  const [giftLink, setGiftLink] = useState('');
  const [activeTab, setActiveTab] = useState<'voucher' | 'truemoney'>('voucher');
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

  const sampleCodes = [
    { code: 'MINICLOUD', reward: '฿50.00 เครดิตต้อนรับ' },
    { code: 'VIP2026', reward: '฿100.00 เครดิตพิเศษ VIP' },
    { code: 'ROBLOX100', reward: '฿100.00 แพ็กเกจฟาร์ม Roblox' },
    { code: 'FREE10', reward: '฿10.00 ทดลองรัน AFK ฟรี' }
  ];

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthModalMode('login');
      setCurrentView('auth');
      return;
    }
    const res = redeemVoucher(promoCode);
    if (res.success) {
      setResultMessage({ success: true, text: `แลกรับสำเร็จ! ได้รับเครดิตเพิ่ม ฿${res.amount?.toFixed(2)} เรียบร้อยแล้ว` });
      setPromoCode('');
    } else {
      setResultMessage({ success: false, text: res.error || 'เกิดข้อผิดพลาดในการแลกโค้ด' });
    }
  };

  const handleRedeemTrueMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthModalMode('login');
      setCurrentView('auth');
      return;
    }
    const res = redeemTrueMoneyGift(giftLink);
    if (res.success) {
      setResultMessage({ success: true, text: `รับเงินจากซองสำเร็จ! เติมเข้ากระเป๋า ฿${res.amount?.toFixed(2)} เรียบร้อย` });
      setGiftLink('');
    } else {
      setResultMessage({ success: false, text: res.error || 'ลิงก์ไม่ถูกต้อง' });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      
      {/* Header Banner - Borderless */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-[#141517] shadow-xs text-neutral-700 dark:text-neutral-300">
          <Gift className="w-4 h-4 text-emerald-500" />
          <span>ศูนย์แลกรับสิทธิ์ & โค้ดของขวัญ</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 dark:text-white tracking-tight font-prompt">
          แลกโค้ดโปรโมชั่น & ซองของขวัญ
        </h1>
        <p className="text-xs text-neutral-400 max-w-md mx-auto">
          กรอกโค้ดสิทธิ์ หรือนำลิงก์ซองของขวัญทรูมันนี่มารับเครดิตเพื่อใช้บริการ Cloud AFK และเช่าซื้อไอดีได้ทันที
        </p>
      </div>

      {/* Main Container - Borderless */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#141517] shadow-sm space-y-6">
        
        {/* Toggle Mode */}
        <div className="flex p-1.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/70">
          <button
            onClick={() => { setActiveTab('voucher'); setResultMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'voucher'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            โค้ดโปรโมชั่น / คีย์ส่วนลด
          </button>
          <button
            onClick={() => { setActiveTab('truemoney'); setResultMessage(null); }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'truemoney'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            ซองของขวัญ TrueMoney
          </button>
        </div>

        {/* Feedback Message */}
        {resultMessage && (
          <div
            className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 ${
              resultMessage.success
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          >
            {resultMessage.success ? (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        {/* Voucher Form */}
        {activeTab === 'voucher' ? (
          <form onSubmit={handleRedeemVoucher} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                กรอกโค้ดโปรโมชั่น (Promo Key / Gift Code)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="เช่น MINICLOUD หรือ VIP2026"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 uppercase transition-all"
                />
                <button
                  type="submit"
                  disabled={!promoCode.trim()}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    promoCode.trim()
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>แลกรับสิทธิ์</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Codes List */}
            <div className="pt-4 space-y-2">
              <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                <span>โค้ดโปรโมชั่นพิเศษที่ใช้ได้ตอนนี้ (คลิกเพื่อใส่โค้ด)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sampleCodes.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => setPromoCode(c.code)}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-left transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                        {c.code}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {c.reward}
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                ))}
              </div>
            </div>
          </form>
        ) : (
          /* TrueMoney Gift Link Form */
          <form onSubmit={handleRedeemTrueMoney} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                วางลิงก์ซองของขวัญ TrueMoney Wallet
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="https://gift.truemoney.com/campaign/?v=..."
                  value={giftLink}
                  onChange={(e) => setGiftLink(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 outline-none focus:bg-neutral-200/60 dark:focus:bg-neutral-800 transition-all"
                />
                <button
                  type="submit"
                  disabled={!giftLink.trim()}
                  className={`px-6 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    giftLink.trim()
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>รับซองทันที</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/50 space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                วิธีสร้างซองของขวัญ TrueMoney:
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>เปิดแอป TrueMoney Wallet แล้วเลือกเมนู <strong>"โอนเงิน/ส่งซองของขวัญ"</strong></li>
                <li>ใส่จำนวนเงินที่ต้องการเติม และเลือกประเภทซองเป็น <strong>"แบ่งเท่ากัน" (1 คน)</strong></li>
                <li>คัดลอกลิงก์ซองของขวัญ นำมาวางในช่องด้านบน แล้วกดปุ่มรับซอง</li>
              </ol>
            </div>
          </form>
        )}

      </div>

      {/* User Balance Card - Borderless */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#141517] shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs text-neutral-400">ยอดเงินในกระเป๋าปัจจุบัน</div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
            {formatCurrency(user.walletBalance)}
          </div>
        </div>

        <button
          onClick={() => setCurrentView('wallet')}
          className="px-4 py-2 rounded-2xl text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white transition-colors cursor-pointer"
        >
          ไปที่กระเป๋าเงิน
        </button>
      </div>

    </div>
  );
};
