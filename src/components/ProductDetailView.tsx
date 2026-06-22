import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ArrowLeft, Box, CheckCircle2, ChevronRight, FileText, ShoppingCart, AlertCircle, Share2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useToastStore } from '../lib/toastStore';
import { formatProductName } from '../utils';

interface ProductDetailViewProps {
  product: Product;
  user: any;
  onBack: () => void;
  handlePurchase: (product: Product, quantity: number) => Promise<void>;
  setActiveView: (view: any) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ product, user, onBack, handlePurchase, setActiveView }) => {
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [showConfirmPurchase, setShowConfirmPurchase] = useState(false);
  const { addToast } = useToastStore();

  const calculateDiscount = (originalPrice?: number, price?: number) => {
    if (!originalPrice || !price || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-4 py-6 text-[#1e1e20]">
      {/* Sleek Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button 
          onClick={onBack} 
          className="group text-muted-foreground hover:text-[#1e1e20] transition-colors duration-200 flex items-center gap-2 font-bold text-xs uppercase tracking-wider bg-white hover:bg-slate-50 px-4 py-2.5 rounded-xl border border-[#e2e8f0] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>กลับสู่หน้าหลัก</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-semibold">
          <span>PORTAL</span>
          <ChevronRight className="w-3 h-3 text-[#e2e8f0]" />
          <span>CATALOG</span>
          <ChevronRight className="w-3 h-3 text-[#e2e8f0]" />
          <span className="text-muted-foreground truncate max-w-[180px]">{formatProductName(product.name)}</span>
        </div>
      </div>

      {/* Main Details Container with Glowing Backdrop */}
      <div className="relative bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Subtle Warm Backdrop */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-500/5 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-blue-500/5 pointer-events-none" />

        {/* Left Side: Product Image (5 Columns) */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-start border-b md:border-b-0 md:border-r border-zinc-150 relative z-10 bg-slate-50/10">
          <motion.div
            whileHover={{ scale: 1.015, ...({} as any) }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full aspect-square relative overflow-hidden rounded-2xl bg-white border border-zinc-200/80 flex items-center justify-center group shadow-[0_4px_16px_-4px_rgba(0,0,0,0.03)] p-4 cursor-zoom-in"
          >
            <div className="absolute inset-0 bg-white/10 pointer-events-none" />
            
            <img 
              loading="lazy" 
              src={product.imageUrl || undefined} 
              alt={formatProductName(product.name)}
              className="w-full h-full object-contain z-10 transition-transform duration-[600px] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png";
              }}
            />

            {/* Float tags */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
              {discount && (
                <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
                  -{discount}% OFF
                </span>
              )}
              {product.tag && (
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-lg shadow-lg uppercase tracking-wider">
                  {product.tag}
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick status notes underneath logo/image */}
          <div className="mt-4 flex flex-col gap-2.5 bg-slate-50/70 p-4 rounded-xl border border-zinc-150">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-zinc-400 uppercase tracking-widest">SECURE PAYMENT</span>
              <span className="text-blue-600 font-mono">100% AES-256 SECURED</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-zinc-400 uppercase tracking-widest">DELIVERY METHOD</span>
              <span className="text-[#10b981] font-mono">INSTANT ENCRYPTION</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls (7 Columns) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative z-10 bg-white">
          <div>
            {/* Header / Type / stock Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 border border-blue-100 text-[10px] font-black rounded-lg tracking-widest uppercase">
                PRODUCT ID
              </span>
              {product.isPreOrder ? (
                <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[10px] font-black rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                  PRE-ORDER
                </span>
              ) : product.stock > 0 ? (
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-black rounded-lg tracking-wider flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  พร้อมส่งทันที
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-black rounded-lg tracking-wider">
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a1a1c] leading-tight tracking-tight mb-4 select-all">
              {formatProductName(product.name)}
            </h1>

            {/* Premium Pricing Panel */}
            <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl p-5 border border-zinc-150 mb-6 flex items-baseline justify-[#1a1a1c] select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)]">
              <div className="flex-1">
                <span className="text-[10px] font-black text-zinc-400 tracking-widest block mb-1 uppercase">OFFER PRICE</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-blue-600 font-mono tracking-tight leading-none">
                    ฿{(product.price || 0).toLocaleString()}
                  </span>
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base font-bold text-rose-500/80 line-through font-mono">
                      ฿{(product.originalPrice || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {discount && (
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-black text-blue-600 block mb-1 uppercase tracking-widest">YOU SAVE</span>
                  <span className="text-xs font-black text-blue-600 font-mono bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 rounded-lg shadow-sm">
                    ฿{((product.originalPrice || 0) - (product.price || 0)).toLocaleString()} ({discount}%)
                  </span>
                </div>
              )}
            </div>

            {/* Stock / Sold count Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] bg-gradient-to-br from-slate-50 to-white">
                <div className="text-zinc-400 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-blue-600" />
                  คงเหลือในคลัง
                </div>
                <div className="text-base sm:text-lg font-black text-[#1a1a1c] font-mono tracking-tight">
                  {product.isPreOrder ? 'เปิดรับ PRE-ORDER' : product.stock >= 999999 ? 'UNLIMITED' : `${product.stock} ชิ้น`}
                </div>
              </div>
              <div className="bg-white border border-zinc-150 p-4 rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] bg-gradient-to-br from-slate-50 to-white">
                <div className="text-zinc-400 text-[10px] font-black tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                  ขายออกไปแล้ว
                </div>
                <div className="text-base sm:text-lg font-black text-[#1a1a1c] font-mono tracking-tight">
                  {(product.soldCount || 0).toLocaleString()} ครั้ง
                </div>
              </div>
            </div>

            {/* Description Tab & Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">รายละเอียดสินค้า</span>
                </div>
                
                {/* Share Product Button */}
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?product=${product.id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      addToast({ title: "คัดลอกลิงก์แล้ว", message: "แชร์ลิงก์นี้ให้เพื่อนสิ!", type: "success" });
                    });
                  }}
                  className="text-[10px] font-black text-zinc-400 hover:text-zinc-800 transition-colors flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-zinc-200 px-3 py-1.5 rounded-lg active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-blue-600" /> 
                  <span>แชร์สินค้านี้</span>
                </button>
              </div>

              {/* description text body */}
              <div className="text-zinc-600 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 p-5 border border-zinc-150 rounded-xl min-h-[110px] max-h-56 overflow-y-auto no-scrollbar font-normal">
                {product.description || "ไม่มีรายละเอียดสินค้าเพิ่มเติมนอกจากชื่อสินค้า"}
              </div>
            </div>
          </div>

          {/* Quantity Controls & Dynamic Ordering Action */}
          <div className="border-t border-zinc-150 pt-6 mt-2">
            {!showConfirmPurchase ? (
              <div className="space-y-4 font-sans">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-zinc-400 tracking-widest uppercase">เลือกจำนวน</span>
                  </div>
                  
                  {/* Digital stepper widget */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-zinc-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      className="w-10 h-10 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-sm rounded-lg hover:text-blue-600 shadow-sm transition-all disabled:opacity-30 active:scale-90 text-[#1a1a1c] cursor-pointer"
                      disabled={purchaseQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.isPreOrder ? 999 : (product.stock >= 999999 ? 999 : product.stock)}
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setPurchaseQuantity(Math.min(product.isPreOrder ? 999 : (product.stock >= 999999 ? 999 : product.stock), Math.max(1, val)));
                      }}
                      className="w-14 h-10 bg-transparent text-center font-black text-sm text-[#1a1a1c] outline-none font-mono"
                      disabled={!product.isPreOrder && product.stock === 0}
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(product.isPreOrder ? 999 : (product.stock >= 999999 ? 999 : product.stock), purchaseQuantity + 1))}
                      className="w-10 h-10 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-sm rounded-lg hover:text-blue-600 shadow-sm transition-all disabled:opacity-30 active:scale-90 text-[#1a1a1c] cursor-pointer"
                      disabled={!product.isPreOrder && (product.stock === 0 || purchaseQuantity >= product.stock)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Confirm purchase btn */}
                <button 
                  onClick={() => {
                    if (!user) {
                      Swal.fire({ 
                        title: 'กรุณาเข้าสู่ระบบ', 
                        text: 'คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้าในแพลตฟอร์ม', 
                        icon: 'warning', 
                        confirmButtonText: 'เข้าสู่ระบบ',
                        showCancelButton: true,
                        cancelButtonText: 'ปิดหน้านี้',
                        confirmButtonColor: '#2563eb',
                        cancelButtonColor: '#f1f5f9',
                        background: '#ffffff',
                        color: '#1a1a1c'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setActiveView('login');
                        }
                      });
                      return;
                    }
                    if (!product.isPreOrder && product.stock <= 0) return;
                    setShowConfirmPurchase(true);
                  }}
                  disabled={!product.isPreOrder && product.stock <= 0}
                  className={`w-full py-4 text-xs font-black tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 rounded-xl shadow-sm border ${
                    product.isPreOrder || product.stock > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent cursor-pointer active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-lg' 
                      : 'bg-slate-50 text-[#94a3b8] border-zinc-200 cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-white" />
                  {product.isPreOrder ? 'สั่งซื้อ PRE-ORDER' : product.stock > 0 ? 'ยืนยันสั่งชื้อสินค้า' : 'สินค้าหมดชั่วคราว'}
                </button>
              </div>
            ) : (
              /* Transaction validation view */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/5 text-emerald-700 border border-emerald-500/20 p-5 rounded-xl font-sans shadow-[0_4px_16px_rgba(16,185,129,0.04)] animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-9 h-9 flex items-center justify-center bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/20 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider mb-0.5">CONFIRM CHECKOUT</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                      โปรดยืนยันการสั่งซื้อสินค้า <span className="font-bold text-[#1a1a1c]">{formatProductName(product.name)}</span> จำนวน <span className="font-black text-[#1a1a1c]">{purchaseQuantity}</span> ชิ้น ราคารวม <span className="font-black text-blue-600 font-mono">฿{(product.price * purchaseQuantity).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => setShowConfirmPurchase(false)}
                    className="flex-1 py-3 bg-white hover:bg-slate-50 text-zinc-500 hover:text-[#1a1a1c] font-bold transition-all rounded-xl text-xs active:scale-95 border border-zinc-150 cursor-pointer"
                  >
                    ยกเลิกขั้นตอนชำระเงิน
                  </button>
                  <button 
                    disabled={showConfirmPurchase === 'loading' as any}
                    onClick={async () => {
                      setShowConfirmPurchase('loading' as any);
                      try {
                        await handlePurchase(product, purchaseQuantity);
                      } finally {
                        setShowConfirmPurchase(false);
                      }
                    }}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border-none shadow-md shadow-blue-500/10 cursor-pointer text-center"
                  >
                    {showConfirmPurchase === 'loading' as any ? (
                      <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> <span>กำลังทำรายการคอยสักครู่...</span></>
                    ) : 'ชำระเงินทันที'}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
