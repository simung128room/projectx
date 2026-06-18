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
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto px-4 py-2">
      {/* Sleek Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button 
          onClick={onBack} 
          className="group text-zinc-400 hover:text-white transition-colors duration-200 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider bg-[#050505]/45 hover:bg-[#050505]/80 px-4 py-2.5 rounded-md border border-[#1e1e1e]"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>กลับสู่หน้าหลัก</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <span>PORTAL</span>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span>CATALOG</span>
          <ChevronRight className="w-3 h-3 text-zinc-700" />
          <span className="text-zinc-400 truncate max-w-[180px]">{formatProductName(product.name)}</span>
        </div>
      </div>

      {/* Main Details Container with Glowing Backdrop */}
      <div className="relative bg-[#000000]/90 backdrop- border border-[#1e1e1e] rounded-md overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Glow Effects in Backdrop */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-[#00e676]/5  pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-[#00e676]/5  pointer-events-none" />

        {/* Left Side: Product Image (5 Columns) */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-start border-b md:border-b-0 md:border-r border-[#1e1e1e] relative z-10">
          <motion.div
            className="w-full aspect-square relative overflow-hidden rounded-md bg-zinc-950 border border-[#1e1e1e] flex items-center justify-center group shadow-inner p-4"
            
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className="absolute inset-0 bg-[#09090b] z-10 pointer-events-none" />
            
            <img 
              loading="lazy" 
              src={product.imageUrl || undefined} 
              alt={formatProductName(product.name)}
              className="w-full h-full object-contain z-10 transition-transform duration-700 ease-out group-"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png";
              }}
            />

            {/* Float tags */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
              {discount && (
                <span className="bg-[#00e676] text-black text-[10px] font-semibold font-mono px-2.5 py-1 rounded-md tracking-wider border border-emerald-400/20 shadow-md uppercase">
                  -{discount}% OFF
                </span>
              )}
              {product.tag && (
                <span className="bg-[#09090b] text-white text-[9px] font-semibold font-mono px-2.5 py-1 rounded-md tracking-wider border border-[#1e1e1e] shadow-md uppercase">
                  {product.tag}
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick status notes underneath logo/image */}
          <div className="mt-4 flex flex-col gap-2.5 bg-black/30 p-4 rounded-md border border-[#1e1e1e]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-mono">ENCRYPTION KEY</span>
              <span className="text-[#00e676] font-mono font-medium">AES-256 SECURED</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 font-mono">DELIVERY SYSTEM</span>
              <span className="text-[#00e676] font-mono font-medium">INSTANT / AUTO</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls (7 Columns) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative z-10">
          <div>
            {/* Header / Type / stock Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2.5 py-0.75 bg-[#00e676]/10 text-[#00e676] border border-emerald-500/25 text-[10px] font-mono font-semibold rounded-md tracking-widest uppercase">
                PRODUCT
              </span>
              {product.isPreOrder ? (
                <span className="px-2.5 py-0.75 bg-[#00e676]/10 text-[#00e676] border border-emerald-500/20 text-[10px] font-mono font-semibold rounded-md tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-ping" />
                  PRE-ORDER
                </span>
              ) : product.stock > 0 ? (
                <span className="px-2.5 py-0.75 bg-[#00e676]/10 text-[#00e676] border border-emerald-500/20 text-[10px] font-mono font-semibold rounded-md tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#00e676] rounded-full animate-ping" />
                  INSTOCK
                </span>
              ) : (
                <span className="px-2.5 py-0.75 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono font-semibold rounded-md tracking-wider">
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-white leading-tight tracking-tight mb-4 select-all">
              {formatProductName(product.name)}
            </h1>

            {/* Premium Pricing Panel */}
            <div className="bg-[#09090b] rounded-md p-5 border border-[#1e1e1e] mb-6 flex items-baseline justify-between select-none">
              <div>
                <span className="text-[10px] font-semibold font-mono text-zinc-500 tracking-widest block mb-1">CURRENT OFFER</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-semibold text-[#00e676] font-mono tracking-tight">
                    ฿{(product.price || 0).toLocaleString()}
                  </span>
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base font-medium text-zinc-500 line-through font-mono">
                      ฿{(product.originalPrice || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {discount && (
                <div className="text-right">
                  <span className="text-[10px] font-semibold font-mono text-[#00e676]/60 block mb-1">YOU SAVE</span>
                  <span className="text-sm font-semibold text-[#00e676] font-mono bg-[#00e676]/10 border border-emerald-400/20 px-2 py-1 rounded-md">
                    ฿{((product.originalPrice || 0) - (product.price || 0)).toLocaleString()} ({discount}%)
                  </span>
                </div>
              )}
            </div>

            {/* Stock / Sold count Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/20 border border-[#1e1e1e] p-4 rounded-md">
                <div className="text-zinc-500 text-[10px] font-medium font-mono tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-[#00e676]/60" />
                  คงเหลือในคลัง
                </div>
                <div className="text-lg font-semibold text-white font-mono">
                  {product.isPreOrder ? 'เปิดรับ PRE-ORDER' : product.stock >= 999999 ? 'UNLIMITED' : `${product.stock} ชิ้น`}
                </div>
              </div>
              <div className="bg-black/20 border border-[#1e1e1e] p-4 rounded-md">
                <div className="text-zinc-500 text-[10px] font-medium font-mono tracking-wider uppercase mb-1 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#00e676]/60" />
                  ขายออกไปแล้ว
                </div>
                <div className="text-lg font-semibold text-white font-mono">
                  {(product.soldCount || 0).toLocaleString()} ครั้ง
                </div>
              </div>
            </div>

            {/* Description Tab & Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#00e676]" />
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest font-mono">รายละเอียดสินค้า</span>
                </div>
                
                {/* Share Product Button */}
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?product=${product.id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      addToast({ title: "คัดลอกลิงก์แล้ว", message: "แชร์ลิงก์นี้ให้เพื่อนสิ!", type: "success" });
                    });
                  }}
                  className="text-[10px] font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 bg-[#050505]/40 hover:bg-[#050505]/90 border border-[#1e1e1e] px-3 py-1.5 rounded-md active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-3 h-3 text-[#00e676]" /> 
                  <span>แชร์สินค้านี้</span>
                </button>
              </div>

              {/* Glowing description text body */}
              <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-zinc-950/40 p-5 border border-[#1e1e1e] rounded-md min-h-[110px] max-h-56 overflow-y-auto no-scrollbar font-normal">
                {product.description || "ไม่มีรายละเอียดสินค้าเพิ่มเติมนอกจากชื่อสินค้า"}
              </div>
            </div>
          </div>

          {/* Quantity Controls & Dynamic Ordering Action */}
          <div className="border-t border-[#1e1e1e] pt-6 mt-2">
            {!showConfirmPurchase ? (
              <div className="space-y-4 font-sans">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-zinc-400 font-mono tracking-widest uppercase">เลือกจำนวน</span>
                  </div>
                  
                  {/* Digital stepper widget */}
                  <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-md border border-[#1e1e1e]">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      className="w-10 h-10 bg-[#050505]/40 hover:bg-[#050505] flex items-center justify-center font-semibold text-sm rounded-md hover:text-[#00e676] transition-colors disabled:opacity-30 active:scale-95 text-white cursor-pointer"
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
                      className="w-14 h-10 bg-transparent text-center font-semibold text-sm text-white outline-none font-mono"
                      disabled={!product.isPreOrder && product.stock === 0}
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(product.isPreOrder ? 999 : (product.stock >= 999999 ? 999 : product.stock), purchaseQuantity + 1))}
                      className="w-10 h-10 bg-[#050505]/40 hover:bg-[#050505] flex items-center justify-center font-semibold text-sm rounded-md hover:text-[#00e676] transition-colors disabled:opacity-30 active:scale-95 text-white cursor-pointer"
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
                        confirmButtonColor: '#00e676',
                        cancelButtonColor: '#1f1f2e',
                        background: '#09090b',
                        color: '#fff'
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
                  className={`w-full py-4 text-sm font-semibold tracking-widest uppercase transition-colors duration-200 flex items-center justify-center gap-2 rounded-md shadow-sm border ${
                    product.isPreOrder || product.stock > 0 
                      ? 'bg-[#00e676] hover:bg-[#00e676] text-black border-emerald-400/20 cursor-pointer active:scale-98 shadow-emerald-500/10 font-medium' 
                      : 'bg-[#050505] text-zinc-500 border-[#1e1e1e] cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-black" />
                  {product.isPreOrder ? 'สั่งซื้อ PRE-ORDER' : product.stock > 0 ? 'ยืนยันสั่งชื้อสินค้า' : 'สินค้าหมดชั่วคราว'}
                </button>
              </div>
            ) : (
              /* Transaction validation view */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-950/20 text-emerald-100 border border-emerald-500/15 p-5 rounded-md font-sans"
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-9 h-9 flex items-center justify-center bg-[#00e676]/10 text-[#00e676] rounded-md border border-emerald-500/20 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white uppercase tracking-wider mb-0.5 font-mono">CONFIRM CHECKOUT LIST</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      โปรดยืนยันการซื้อ <span className="font-medium text-white">{formatProductName(product.name)}</span> จำนวน <span className="font-semibold text-white">{purchaseQuantity}</span> ชิ้น ราคารวม <span className="font-semibold text-[#00e676] font-mono">฿{(product.price * purchaseQuantity).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => setShowConfirmPurchase(false)}
                    className="flex-1 py-3 bg-[#050505] hover:bg-[#0a0a0a] text-zinc-300 font-medium transition-all rounded-md text-xs active:scale-95 border border-[#1e1e1e] cursor-pointer"
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
                    className="flex-1 py-3 bg-[#00e676] hover:bg-[#00e676] text-black font-semibold transition-all rounded-md text-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border border-emerald-400/20 shadow-sm shadow-emerald-500/5 cursor-pointer"
                  >
                    {showConfirmPurchase === 'loading' as any ? (
                      <><div className="w-3.5 h-3.5  border-black border-t-transparent rounded-full animate-spin"></div> <span>กำลังทำรายการคอยสักครู่...</span></>
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
