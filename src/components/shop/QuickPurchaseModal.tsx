import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShoppingCart, 
  Clock, 
  Wallet, 
  Check, 
  Copy, 
  ShieldCheck, 
  AlertCircle, 
  ArrowRight,
  Key,
  Lock,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import Swal from 'sweetalert2';

export const QuickPurchaseModal: React.FC = () => {
  const { 
    purchaseModalProduct, 
    purchaseModalMode, 
    closePurchaseModal, 
    user, 
    buyProduct, 
    rentProduct,
    theme 
  } = useStore();

  const [selectedDuration, setSelectedDuration] = useState<number>(
    purchaseModalProduct?.rentalOptions?.[0]?.durationHours || 1
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchasedCredentials, setPurchasedCredentials] = useState<{
    username: string;
    password?: string;
    twoFactorKey?: string;
    instructions?: string;
  } | null>(null);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync selected duration when product changes
  React.useEffect(() => {
    if (purchaseModalProduct?.rentalOptions && purchaseModalProduct.rentalOptions.length > 0) {
      setSelectedDuration(purchaseModalProduct.rentalOptions[0].durationHours);
    }
    setPurchaseSuccess(false);
    setPurchasedCredentials(null);
  }, [purchaseModalProduct]);

  if (!purchaseModalProduct) return null;

  const currentRentalOption = purchaseModalProduct.rentalOptions?.find(
    opt => opt.durationHours === selectedDuration
  ) || purchaseModalProduct.rentalOptions?.[0];

  const finalPrice = purchaseModalMode === 'buy' 
    ? (purchaseModalProduct.buyPrice || 0)
    : (currentRentalOption?.price || 0);

  const userBalance = user?.balance || 0;
  const isBalanceEnough = userBalance >= finalPrice;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmAction = async () => {
    if (!user) return;
    if (!isBalanceEnough) return;

    setIsProcessing(true);

    try {
      if (purchaseModalMode === 'buy') {
        const success = await buyProduct(purchaseModalProduct.id);
        if (success) {
          setPurchasedCredentials({
            username: purchaseModalProduct.credentials.username,
            password: purchaseModalProduct.credentials.password,
            twoFactorKey: purchaseModalProduct.credentials.twoFactorKey,
            instructions: 'สามารถเปลี่ยนอีเมลและรหัสผ่านผ่านระบบเกมต้นฉบับได้ทันที'
          });
          setPurchaseSuccess(true);
        }
      } else {
        const success = await rentProduct(
          purchaseModalProduct.id, 
          selectedDuration, 
          finalPrice
        );
        if (success) {
          setPurchasedCredentials({
            username: purchaseModalProduct.credentials.username,
            password: purchaseModalProduct.credentials.password || 'Rent#AutoPass2026',
            twoFactorKey: purchaseModalProduct.credentials.twoFactorKey,
            instructions: `ระยะเวลาการเช่า ${selectedDuration} ชั่วโมง ห้ามเปิดโปรแกรมช่วยเล่นโดยเด็ดขาด`
          });
          setPurchaseSuccess(true);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closePurchaseModal}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`relative w-full max-w-[500px] rounded-2xl border shadow-2xl overflow-hidden z-10 ${
            theme === 'dark'
              ? 'bg-[#0f1015] border-zinc-800 text-white shadow-black/80'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
          }`}
        >
          {/* Header */}
          <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {purchaseSuccess ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </div>
              ) : purchaseModalMode === 'buy' ? (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold">
                  {purchaseSuccess 
                    ? 'รับข้อมูลไอดีเกมเรียบร้อย!' 
                    : purchaseModalMode === 'buy' 
                    ? 'ยืนยันการซื้อไอดีเกม (Instant Buy)' 
                    : 'ยืนยันการเช่าไอดีเกม (Rent System)'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {purchaseSuccess ? 'กรุณาบันทึกข้อมูลเพื่อความปลอดภัย' : 'จัดส่งรหัสและข้อมูลทันทีผ่านระบบอัตโนมัติ'}
                </p>
              </div>
            </div>

            <button
              onClick={closePurchaseModal}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!purchaseSuccess ? (
            <div className="p-6 space-y-4">
              {/* Product Brief Card */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex gap-3.5 items-center">
                <img
                  src={purchaseModalProduct.imageUrl}
                  alt={purchaseModalProduct.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-zinc-700"
                />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    {purchaseModalProduct.gameName}
                  </span>
                  <h4 className="text-sm font-bold text-zinc-200 truncate mt-1">
                    {purchaseModalProduct.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                    <span>แรงค์: <b className="text-zinc-200">{purchaseModalProduct.rank || 'N/A'}</b></span>
                    <span>•</span>
                    <span>สกิน: <b className="text-zinc-200">{purchaseModalProduct.skinsCount} ชิ้น</b></span>
                  </div>
                </div>
              </div>

              {/* Rental Duration Selector (If Rent Mode) */}
              {purchaseModalMode === 'rent' && purchaseModalProduct.rentalOptions && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
                    <span>เลือกระยะเวลาการเช่า (Rental Duration)</span>
                    <span className="text-[11px] text-amber-400">นับเวลาหลังทำรายการทันที</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {purchaseModalProduct.rentalOptions.map((opt) => (
                      <button
                        key={opt.durationHours}
                        type="button"
                        onClick={() => setSelectedDuration(opt.durationHours)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                          selectedDuration === opt.durationHours
                            ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                            : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <span className="text-xs font-bold block text-zinc-200">{opt.label}</span>
                        <span className="text-sm font-black text-amber-400 font-mono">฿{opt.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Balance & Payment Summary */}
              <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                    ยอดเงินในกระเป๋าของคุณ
                  </span>
                  <span className="font-mono font-bold text-zinc-200">
                    ฿{userBalance.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm font-bold pt-2 border-t border-zinc-800">
                  <span>ยอดชำระสุทธิ ({purchaseModalMode === 'buy' ? 'ซื้อขาด' : `เช่า ${selectedDuration} ชม.`})</span>
                  <span className="font-mono text-base text-emerald-400">
                    ฿{finalPrice.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>ยอดเงินคงเหลือหลังทำรายการ</span>
                  <span className={`font-mono font-bold ${isBalanceEnough ? 'text-zinc-300' : 'text-rose-400'}`}>
                    ฿{(userBalance - finalPrice).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Warning if balance not enough */}
              {!isBalanceEnough && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>ยอดเงินของคุณไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการสั่งซื้อ</span>
                </div>
              )}

              {/* Confirm Action Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirmAction}
                disabled={isProcessing || !isBalanceEnough}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isBalanceEnough
                    ? purchaseModalMode === 'buy'
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                    : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {purchaseModalMode === 'buy'
                        ? `ยืนยันการซื้อ (ตัดยอด ฿${finalPrice})`
                        : `ยืนยันการเช่าไอดี (ตัดยอด ฿${finalPrice})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          ) : (
            /* Success Screen with Credentials Revealed */
            <div className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ทำรายการสำเร็จ! ระบบได้ตัดยอดเงินและส่งมอบข้อมูลไอดีเรียบร้อย</span>
              </div>

              {/* Credentials Box */}
              <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 font-mono">
                {/* Username */}
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 block font-sans">ชื่อผู้ใช้ (ID / Username)</span>
                  <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-black/60 border border-zinc-800">
                    <span className="text-sm font-bold text-zinc-100 select-all">
                      {purchasedCredentials?.username}
                    </span>
                    <button
                      onClick={() => handleCopy(purchasedCredentials?.username || '', 'username')}
                      className="p-1 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'username' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'username' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                    </button>
                  </div>
                </div>

                {/* Password */}
                {purchasedCredentials?.password && (
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 block font-sans">รหัสผ่าน (Password)</span>
                    <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-black/60 border border-zinc-800">
                      <span className="text-sm font-bold text-amber-300 select-all">
                        {purchasedCredentials.password}
                      </span>
                      <button
                        onClick={() => handleCopy(purchasedCredentials.password || '', 'password')}
                        className="p-1 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === 'password' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'password' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 2FA Key if available */}
                {purchasedCredentials?.twoFactorKey && (
                  <div>
                    <span className="text-[11px] font-bold text-zinc-400 block font-sans">รหัสสำรอง / 2FA Secret Key</span>
                    <div className="flex items-center justify-between mt-1 p-2 rounded-lg bg-black/60 border border-zinc-800">
                      <span className="text-xs text-zinc-300 select-all">
                        {purchasedCredentials.twoFactorKey}
                      </span>
                      <button
                        onClick={() => handleCopy(purchasedCredentials.twoFactorKey || '', '2fa')}
                        className="p-1 text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedField === '2fa' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === '2fa' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                <div className="font-bold text-zinc-200">คำแนะนำการใช้งาน:</div>
                <p>• สามารถเข้าดูประวัติและข้อมูลไอดีทั้งหมดได้ตลอดเวลาที่เมนู <b>"ประวัติคำสั่งซื้อ"</b></p>
                {purchaseModalMode === 'rent' && (
                  <p>• สำหรับไอดีเช่า สามารถตรวจสอบเวลานับถอยหลังและกดคืนไอดีได้ที่เมนู <b>"คลังไอดีที่เช่า"</b></p>
                )}
              </div>

              {/* Done Button */}
              <button
                onClick={closePurchaseModal}
                className="w-full py-3 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black transition-colors cursor-pointer"
              >
                เข้าใจแล้ว ปิดหน้าต่าง
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
