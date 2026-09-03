import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, ShoppingBag, ShieldCheck, Check, AlertCircle, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PurchaseModal: React.FC = () => {
  const { 
    openPurchaseModal, 
    setOpenPurchaseModal, 
    selectedProductForModal, 
    purchaseModalMode,
    buyAccountProduct,
    rentAccountProduct,
    user,
    setCurrentView,
    setOpenTopUpModal
  } = useApp();

  const [rentalHours, setRentalHours] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ type: 'buy' | 'rent'; orderId: string } | null>(null);

  if (!openPurchaseModal || !selectedProductForModal) return null;

  const isBuy = purchaseModalMode === 'buy';
  const pricePerHour = selectedProductForModal.rentPricePerHour || 15;
  const totalPrice = isBuy ? (selectedProductForModal.buyPrice || 0) : pricePerHour * rentalHours;
  const canAfford = user.walletBalance >= totalPrice;

  const handleConfirm = () => {
    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      if (isBuy) {
        const res = buyAccountProduct(selectedProductForModal.id);
        if (res.success && res.order) {
          setSuccessInfo({ type: 'buy', orderId: res.order.orderNumber });
        } else {
          setErrorMsg(res.error || 'เกิดข้อผิดพลาดในการซื้อ');
        }
      } else {
        const res = rentAccountProduct(selectedProductForModal.id, rentalHours);
        if (res.success && res.rental) {
          setSuccessInfo({ type: 'rent', orderId: res.rental.id });
        } else {
          setErrorMsg(res.error || 'เกิดข้อผิดพลาดในการเช่า');
        }
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleClose = () => {
    setOpenPurchaseModal(false);
    setSuccessInfo(null);
    setErrorMsg(null);
  };

  const handleFinishSuccess = () => {
    handleClose();
    if (successInfo?.type === 'rent') {
      setCurrentView('rentals');
    } else {
      setCurrentView('history');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#141517] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {successInfo ? (
          /* Success Screen */
          <div className="text-center space-y-4 py-4">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white font-prompt">
                {successInfo.type === 'buy' ? 'ซื้อไอดีสำเร็จเรียบร้อย!' : 'เช่าไอดีสำเร็จเรียบร้อย!'}
              </h3>
              <p className="text-xs text-neutral-400">
                รหัสคำสั่งซื้อ <span className="font-mono text-neutral-900 dark:text-white font-semibold">#{successInfo.orderId}</span>
              </p>
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {successInfo.type === 'buy' 
                ? 'ข้อมูลการเข้าสู่ระบบและรหัสผ่านถูกบันทึกไว้ในประวัติคำสั่งซื้อของคุณแล้ว'
                : 'คุณสามารถดูรหัสผ่านและเวลานับถอยหลังได้ที่หน้า "ไอดีที่กำลังเช่า" ได้ทันที'}
            </p>

            <button
              onClick={handleFinishSuccess}
              className="w-full py-3 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold text-xs transition-colors cursor-pointer shadow-sm"
            >
              {successInfo.type === 'rent' ? 'ไปดูไอดีที่กำลังเช่า' : 'ไปดูข้อมูลไอดีในประวัติ'}
            </button>
          </div>
        ) : (
          /* Purchase / Rent Form */
          <>
            <div className="flex items-center gap-2">
              {isBuy ? (
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
              ) : (
                <Clock className="w-5 h-5 text-blue-500" />
              )}
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white font-prompt">
                {isBuy ? 'ยืนยันการซื้อไอดีถาวร' : 'เลือกเวลาเช่าไอดี'}
              </h3>
            </div>

            {/* Product Summary - Borderless Soft Neutral */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60">
              <img
                src={selectedProductForModal.imageUrl}
                alt={selectedProductForModal.title}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                  {selectedProductForModal.title}
                </div>
                <div className="text-[11px] text-neutral-400">
                  {selectedProductForModal.gameName} · {selectedProductForModal.tag || 'ไอดีแท้'}
                </div>
              </div>
            </div>

            {/* Duration Selector for Rental */}
            {!isBuy && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  เลือกระยะเวลาการเช่า (ชั่วโมง)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 6, 12, 24].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setRentalHours(hrs)}
                      className={`py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                        rentalHours === hrs
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {hrs} ชม.
                    </button>
                  ))}
                </div>
                <div className="text-[11px] text-neutral-400">
                  อัตราค่าบริการ: ฿{pricePerHour}/ชม.
                </div>
              </div>
            )}

            {/* Price Breakdown - Borderless */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 space-y-2">
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>ยอดเงินในกระเป๋าของคุณ</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-white">
                  {formatCurrency(user.walletBalance)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                <span>ยอดชำระรายการนี้</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-neutral-400 pt-1">
                <span>คงเหลือหลังทำรายการ</span>
                <span className={`font-mono ${canAfford ? 'text-neutral-900 dark:text-white' : 'text-rose-500 font-bold'}`}>
                  {canAfford ? formatCurrency(user.walletBalance - totalPrice) : 'ยอดเงินไม่พอ'}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Security Guarantee Notice */}
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ส่งมอบรหัสผ่านทันที รับประกันไอดีโดย MINICLOUD</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>

              {canAfford ? (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isProcessing ? 'กำลังทำรายการ...' : (isBuy ? 'ยืนยันการซื้อ' : 'ยืนยันการเช่า')}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { handleClose(); setOpenTopUpModal(true); }}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>เติมเงินเข้ากระเป๋า</span>
                </button>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
};
