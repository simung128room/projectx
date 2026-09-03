import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, QrCode, Gift, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const TopUpModal: React.FC = () => {
  const { 
    openTopUpModal, 
    setOpenTopUpModal, 
    topUpWallet, 
    redeemTrueMoneyGift, 
    user 
  } = useApp();

  const [activeMethod, setActiveMethod] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [amount, setAmount] = useState<number>(100);
  const [truemoneyLink, setTruemoneyLink] = useState<string>('');
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!openTopUpModal) return null;

  const quickAmounts = [50, 100, 150, 300, 500, 1000];

  const handlePromptPayPay = () => {
    setIsProcessing(true);
    setStatusMsg(null);
    setTimeout(() => {
      topUpWallet(amount, 'PromptPay QR');
      setIsProcessing(false);
      setStatusMsg({ success: true, text: `เติมเงินสำเร็จ! ได้รับ +฿${amount.toFixed(2)} เข้ากระเป๋าแล้ว` });
      setTimeout(() => {
        setOpenTopUpModal(false);
        setStatusMsg(null);
      }, 1800);
    }, 1200);
  };

  const handleTrueMoneyRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsProcessing(true);
    setTimeout(() => {
      const res = redeemTrueMoneyGift(truemoneyLink);
      setIsProcessing(false);
      if (res.success) {
        setStatusMsg({ success: true, text: `รับเงินจากซองสำเร็จ! ได้รับ +฿${res.amount?.toFixed(2)}` });
        setTruemoneyLink('');
        setTimeout(() => {
          setOpenTopUpModal(false);
          setStatusMsg(null);
        }, 1800);
      } else {
        setStatusMsg({ success: false, text: res.error || 'ลิงก์ไม่ถูกต้อง' });
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header - Borderless */}
        <div className="flex items-center justify-between pb-1">
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white font-prompt">
              เติมเงินเข้ากระเป๋า (Top Up)
            </h3>
            <p className="text-[11px] text-neutral-400">
              ยอดคงเหลือปัจจุบัน: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(user.walletBalance)}</span>
            </p>
          </div>

          <button
            onClick={() => {
              setOpenTopUpModal(false);
              setStatusMsg(null);
            }}
            className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher - Borderless */}
        <div className="grid grid-cols-2 gap-2 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveMethod('promptpay');
              setStatusMsg(null);
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMethod === 'promptpay'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>PromptPay QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMethod('truemoney');
              setStatusMsg(null);
            }}
            className={`py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMethod === 'truemoney'
                ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>TrueMoney Gift</span>
          </button>
        </div>

        {/* PROMPTPAY TAB */}
        {activeMethod === 'promptpay' && (
          <div className="space-y-4 animate-in fade-in text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                เลือกจำนวนเงินที่ต้องการเติม
              </label>
              <div className="grid grid-cols-3 gap-2">
                {quickAmounts.map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2.5 rounded-2xl text-center font-bold font-mono transition-all cursor-pointer ${
                      amount === val
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    ฿{val}
                  </button>
                ))}
              </div>
            </div>

            {/* QR Code Canvas Representation - Borderless */}
            <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900/70 text-center space-y-3">
              <div className="w-36 h-36 mx-auto bg-white rounded-2xl p-2 shadow-sm flex flex-col items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY_PAYMENT_${amount}_THB_MINICLOUD`} 
                  alt="PromptPay QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-0.5">
                <div className="text-[11px] text-neutral-400">สแกนชำระผ่านแอปธนาคารทุกแห่ง</div>
                <div className="text-sm font-bold font-mono text-neutral-900 dark:text-white">
                  ยอดชำระ: {formatCurrency(amount)}
                </div>
              </div>
            </div>

            <button
              onClick={handlePromptPayPay}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'กำลังตรวจสอบยอดเงิน...' : `ยืนยันการสแกนจ่าย ฿${amount.toFixed(2)}`}
            </button>
          </div>
        )}

        {/* TRUEMONEY TAB */}
        {activeMethod === 'truemoney' && (
          <form onSubmit={handleTrueMoneyRedeem} className="space-y-4 animate-in fade-in text-xs">
            <div className="p-4 rounded-3xl bg-neutral-50 dark:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>วิธีรับเงินจากซองทรูมันนี่</span>
              </div>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                1. เปิดแอป TrueMoney &gt; ส่งซองของขวัญ &gt; สุ่มจำนวนเงิน<br/>
                2. คัดลอกลิงก์ซองมาวางในช่องด้านล่าง แล้วกด "รับเงินเข้ากระเป๋า"
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-800 dark:text-neutral-200">
                ลิงก์ซองของขวัญ (TrueMoney Gift Link)
              </label>
              <input
                type="text"
                required
                value={truemoneyLink}
                onChange={e => setTruemoneyLink(e.target.value)}
                placeholder="https://gift.truemoney.com/campaign/?v=..."
                className="w-full px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono outline-none text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !truemoneyLink.trim()}
              className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? 'กำลังตรวจสอบซอง...' : 'รับเงินเข้ากระเป๋าทันที'}
            </button>
          </form>
        )}

        {statusMsg && (
          <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 animate-in fade-in ${
            statusMsg.success 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
          }`}>
            {statusMsg.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

      </div>
    </div>
  );
};
