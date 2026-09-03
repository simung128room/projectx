import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Gift, 
  Ticket, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const WalletView: React.FC = () => {
  const { 
    user, 
    transactions, 
    setOpenTopUpModal, 
    redeemVoucher,
    redeemTrueMoneyGift, 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'history' | 'redeem_code' | 'gift'>('history');

  const [voucherInput, setVoucherInput] = useState<string>('');
  const [voucherStatus, setVoucherStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const [truemoneyInput, setTruemoneyInput] = useState<string>('');
  const [truemoneyStatus, setTruemoneyStatus] = useState<{ success: boolean; msg: string } | null>(null);

  const handleRedeemVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setVoucherStatus(null);
    const res = redeemVoucher(voucherInput);
    if (res.success) {
      setVoucherStatus({ success: true, msg: `เติมเงินสำเร็จ! ได้รับ +฿${res.amount?.toFixed(2)} เข้ากระเป๋าแล้ว` });
      setVoucherInput('');
      setTimeout(() => setVoucherStatus(null), 4000);
    } else {
      setVoucherStatus({ success: false, msg: res.error || 'โค้ดไม่ถูกต้อง' });
    }
  };

  const handleRedeemTrueMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setTruemoneyStatus(null);
    const res = redeemTrueMoneyGift(truemoneyInput);
    if (res.success) {
      setTruemoneyStatus({ success: true, msg: `รับเงินจากซองสำเร็จ! ได้รับ +฿${res.amount?.toFixed(2)}` });
      setTruemoneyInput('');
      setTimeout(() => setTruemoneyStatus(null), 4000);
    } else {
      setTruemoneyStatus({ success: false, msg: res.error || 'ลิงก์ไม่ถูกต้อง' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 animate-in fade-in duration-150">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white tracking-tight font-prompt">
          กระเป๋าเงิน & เติมเงิน
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          จัดการยอดเงินคงเหลือ เติมเงินผ่าน PromptPay และตรวจสอบประวัติธุรกรรม
        </p>
      </div>

      {/* Main Balance Card */}
      <div className="bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="text-xs text-neutral-400">ยอดเงินคงเหลือในกระเป๋า</div>
          <div className="text-3xl sm:text-4xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
            {formatCurrency(user.walletBalance)}
          </div>
        </div>

        <button
          onClick={() => setOpenTopUpModal(true)}
          className="px-5 py-3 rounded-2xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>เติมเงินด้วย PromptPay QR</span>
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 w-fit">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          ประวัติธุรกรรม ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('redeem_code')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'redeem_code'
              ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>แลกโค้ดเติมเงิน</span>
        </button>

        <button
          onClick={() => setActiveTab('gift')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gift'
              ? 'bg-white dark:bg-[#141517] text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-amber-500" />
          <span>ซองของขวัญ TrueMoney</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-[#141517] rounded-3xl p-3 shadow-sm divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {transactions.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-xs">
              ยังไม่มีประวัติธุรกรรม
            </div>
          ) : (
            transactions.map((tx) => {
              const isPlus = tx.amount > 0;
              return (
                <div key={tx.id} className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs shrink-0 ${
                      isPlus 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {isPlus ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-neutral-900 dark:text-white truncate font-prompt">
                        {tx.description}
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate">
                        {new Date(tx.timestamp).toLocaleString('th-TH')} · {tx.paymentMethod || 'Wallet'}
                      </div>
                    </div>
                  </div>

                  <div className={`text-xs font-bold font-mono shrink-0 ${
                    isPlus ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-900 dark:text-white'
                  }`}>
                    {isPlus ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'redeem_code' && (
        <div className="bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-8 shadow-sm max-w-md space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              แลกโค้ดส่วนลด / โค้ดเติมเงิน
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              กรอกโค้ดจากกิจกรรม เพื่อรับเครดิตฟรีเข้ากระเป๋า
            </p>
          </div>

          <form onSubmit={handleRedeemVoucher} className="space-y-3">
            <input
              type="text"
              value={voucherInput}
              onChange={(e) => setVoucherInput(e.target.value)}
              placeholder="กรอกรหัสโค้ด เช่น MINICLOUD50"
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs font-mono text-neutral-900 dark:text-white outline-none uppercase"
            />

            {voucherStatus && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                voucherStatus.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}>
                {voucherStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{voucherStatus.msg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 transition-colors cursor-pointer shadow-xs"
            >
              ยืนยันการแลกโค้ด
            </button>
          </form>
        </div>
      )}

      {activeTab === 'gift' && (
        <div className="bg-white dark:bg-[#141517] rounded-3xl p-6 sm:p-8 shadow-sm max-w-md space-y-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              รับเงินจากซองของขวัญ TrueMoney
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              วางลิงก์ซองของขวัญทรูมันนี่ เพื่อรับเงินเข้าบัญชีทันที
            </p>
          </div>

          <form onSubmit={handleRedeemTrueMoney} className="space-y-3">
            <input
              type="url"
              value={truemoneyInput}
              onChange={(e) => setTruemoneyInput(e.target.value)}
              placeholder="https://gift.truemoney.com/campaign/?v=..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white outline-none"
            />

            {truemoneyStatus && (
              <div className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                truemoneyStatus.success 
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
              }`}>
                {truemoneyStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{truemoneyStatus.msg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 transition-colors cursor-pointer shadow-xs"
            >
              รับเงินจากซอง
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
