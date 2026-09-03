import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Wallet, 
  Gift, 
  QrCode, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  Coins,
  Copy,
  Check,
  CreditCard,
  History
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import Swal from 'sweetalert2';

export const WalletView: React.FC = () => {
  const { user, transactions, topupTrueMoney, topupPromptPay, theme } = useStore();

  const [topupTab, setTopupTab] = useState<'promptpay' | 'truemoney'>('promptpay');
  const [truemoneyLink, setTruemoneyLink] = useState('');
  const [promptpayAmount, setPromptpayAmount] = useState<number>(300);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const PRESET_AMOUNTS = [100, 200, 300, 500, 1000, 2000];

  const handleTrueMoneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!truemoneyLink.trim()) return;

    setIsProcessing(true);
    const result = await topupTrueMoney(truemoneyLink);
    setIsProcessing(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'เติมเงินสำเร็จ!',
        text: `ระบบเติมเงินเข้ากระเป๋าจำนวน ฿${result.amount?.toLocaleString()} เรียบร้อยแล้ว`,
        timer: 2000,
        showConfirmButton: false,
        background: theme === 'dark' ? '#121216' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
      setTruemoneyLink('');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ทำรายการไม่สำเร็จ',
        text: result.message || 'ลิงก์ซองของขวัญไม่ถูกต้องหรือถูกใช้งานไปแล้ว',
        confirmButtonColor: '#ef4444',
        background: theme === 'dark' ? '#121216' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
    }
  };

  const handleConfirmPromptPayPayment = async () => {
    setIsProcessing(true);
    const result = await topupPromptPay(promptpayAmount);
    setIsProcessing(false);
    setShowQrModal(false);

    if (result.success) {
      Swal.fire({
        icon: 'success',
        title: 'ชำระเงินสำเร็จ!',
        text: `ได้รับยอดเงิน ฿${promptpayAmount.toLocaleString()} เข้ากระเป๋าเรียบร้อยแล้ว`,
        timer: 2000,
        showConfirmButton: false,
        background: theme === 'dark' ? '#121216' : '#ffffff',
        color: theme === 'dark' ? '#ffffff' : '#000000'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner: User Balance & Points Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Main Card */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 border border-emerald-500/30 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Wallet className="w-4 h-4" />
                <span>NEXUS Wallet Balance</span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                พร้อมใช้งาน 24 ชม.
              </span>
            </div>

            <div>
              <span className="text-xs font-medium text-zinc-400 block mb-1">ยอดเงินคงเหลือปัจจุบัน</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
                  ฿{user?.balance.toLocaleString() || '0'}
                </span>
                <span className="text-sm font-bold text-zinc-400">บาท (THB)</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>คะแนนสะสม: <b className="text-zinc-200 font-mono">{user?.points || 0} Points</b></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ยอดใช้จ่ายสะสม: <b className="text-zinc-200 font-mono">฿{user?.totalSpent.toLocaleString() || 0}</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Member Level / VIP Perk */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-400 uppercase">ระดับสมาชิก</span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-gradient-to-r from-amber-500 to-yellow-300 text-black shadow-md shadow-amber-500/20">
              VIP MEMBER
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-zinc-200">สิทธิพิเศษระดับ VIP:</h4>
            <ul className="text-xs text-zinc-400 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>รับ Cashback 5% ทุกยอดการสั่งซื้อ/เช่า</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>สิทธิ์จองไอดีเกมลิมิเต็ดก่อนใคร</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ระบบช่วยเหลือด่วนผ่านทีมงาน 24/7</span>
              </li>
            </ul>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-400 text-center">
            ยิ่งเติม ยิ่งเช่า ยิ่งได้รับพอยท์แลกส่วนลด
          </div>
        </div>
      </div>

      {/* Top-up Channels & Transaction History Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top-up Methods (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#0f1015] border border-zinc-800 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">ช่องทางการเติมเงิน (Top-up)</h3>
                <p className="text-xs text-zinc-400">เงินเข้าอัตโนมัติภายใน 5-15 วินาที</p>
              </div>
            </div>

            {/* Channels Switcher */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTopupTab('promptpay')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  topupTab === 'promptpay'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">พร้อมเพย์ QR Code</h4>
                  <span className="text-[11px] text-zinc-400">สแกนจ่ายได้ทุกธนาคาร ฟรีค่าธรรมเนียม</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTopupTab('truemoney')}
                className={`p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                  topupTab === 'truemoney'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10'
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-zinc-100">ซองของขวัญ TrueMoney</h4>
                  <span className="text-[11px] text-zinc-400">กรอกลิงก์ซองของขวัญ เติมเงินทันที</span>
                </div>
              </button>
            </div>

            {/* Tab: PromptPay QR */}
            {topupTab === 'promptpay' && (
              <div className="space-y-4 pt-2">
                <label className="text-xs font-bold text-zinc-300 block">เลือกจำนวนเงินที่ต้องการเติม (บาท):</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setPromptpayAmount(amt)}
                      className={`py-2.5 px-3 rounded-xl font-mono text-sm font-bold border transition-all cursor-pointer ${
                        promptpayAmount === amt
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      ฿{amt}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-2">
                  <label className="text-xs font-semibold text-zinc-400">หรือระบุจำนวนเงินเอง:</label>
                  <input
                    type="number"
                    value={promptpayAmount}
                    onChange={(e) => setPromptpayAmount(Number(e.target.value))}
                    min={10}
                    max={50000}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <QrCode className="w-4 h-4" />
                  <span>สร้าง QR Code ชำระเงิน (฿{promptpayAmount.toLocaleString()})</span>
                </motion.button>
              </div>
            )}

            {/* Tab: TrueMoney Gift Link */}
            {topupTab === 'truemoney' && (
              <form onSubmit={handleTrueMoneySubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    วางลิงก์ซองของขวัญ TrueMoney (Voucher Link):
                  </label>
                  <input
                    type="text"
                    value={truemoneyLink}
                    onChange={(e) => setTruemoneyLink(e.target.value)}
                    placeholder="https://gift.truemoney.com/campaign/?v=xxxxxx"
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[11px] text-zinc-500">
                    * สร้างซองของขวัญในแอป TrueMoney Wallet แบบแบ่งจำนวนเงินเท่ากัน 1 คน แล้วคัดลอกลิงก์มากรอก
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isProcessing || !truemoneyLink}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>ตรวจสอบและรับเงินเข้ากระเป๋า</span>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </div>
        </div>

        {/* Transaction History Log (1 Col) */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#0f1015] border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-white">ประวัติการทำรายการล่าสุด</h3>
              </div>
            </div>

            {transactions.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">ยังไม่มีประวัติการทำรายการ</p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.amount > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span className="font-bold text-zinc-200 line-clamp-1">{tx.description}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono block">{tx.timestamp}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`font-mono font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.amount > 0 ? `+฿${tx.amount.toLocaleString()}` : `-฿${Math.abs(tx.amount).toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PromptPay QR Simulation Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm p-6 rounded-2xl bg-[#0f1015] border border-zinc-800 text-center space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-white">สแกนชำระผ่านพร้อมเพย์</h3>
              <button onClick={() => setShowQrModal(false)} className="text-zinc-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Simulated Thai QR Code */}
            <div className="p-4 rounded-xl bg-white text-black inline-block shadow-lg mx-auto">
              <div className="w-48 h-48 bg-zinc-100 flex flex-col items-center justify-center border-4 border-black relative">
                <QrCode className="w-36 h-36 text-black" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="px-2 py-0.5 rounded bg-blue-900 text-white text-[9px] font-black uppercase">
                    PROMPTPAY
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-zinc-400">ยอดเงินที่ต้องชำระ:</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">
                ฿{promptpayAmount.toLocaleString()}
              </div>
              <p className="text-[11px] text-zinc-500">จำลองการสแกน QR Code เพื่อทดสอบการเติมเงิน</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="py-2.5 rounded-xl text-xs font-bold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              >
                ยกเลิก
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmPromptPayPayment}
                className="py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-1 shadow-md"
              >
                {isProcessing ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <span>ยืนยันชำระเงิน</span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
