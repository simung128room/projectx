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
  const [showConfirmPurchase, setShowConfirmPurchase] = useState<boolean | 'loading'>(false);
  const { addToast } = useToastStore();

  const calculateDiscount = (originalPrice?: number, price?: number) => {
    if (!originalPrice || !price || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-4 py-6 text-foreground">
      {/* Sleek Breadcrumbs & Back Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button 
          onClick={onBack} 
          className="group text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2 font-semibold text-xs uppercase tracking-wider bg-card hover:bg-border px-4 py-2.5 rounded-lg border border-border cursor-pointer outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>กลับสู่หน้าหลัก</span>
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground/80 font-mono">
          <span>PORTAL</span>
          <ChevronRight className="w-3 h-3 text-foreground/[0.08]" />
          <span>CATALOG</span>
          <ChevronRight className="w-3 h-3 text-foreground/[0.08]" />
          <span className="text-muted-foreground truncate max-w-[180px]">{formatProductName(product.name)}</span>
        </div>
      </div>

      {/* Main Details Container */}
      <div className="relative bg-card border border-border rounded-lg overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-0">
        
        {/* Subtle Backdrop */}

        {/* Left Side: Product Image (5 Columns) */}
        <div className="md:col-span-5 p-6 md:p-8 flex flex-col justify-start border-b md:border-b-0 md:border-r border-border relative z-10 bg-background">
          <motion.div
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full aspect-square relative overflow-hidden rounded-lg bg-card border border-border flex items-center justify-center group p-4 cursor-zoom-in"
          >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            
            <img 
              loading="lazy" 
              src={product.imageUrl || undefined} 
              alt={formatProductName(product.name)}
              className="w-full h-full object-contain z-10 transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = "https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png";
              }}
            />

            {/* Float tags */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-1.5 items-start">
              {discount && (
                <span className="bg-[#FF3333] text-foreground text-[10px] font-bold px-2.5 py-1 rounded shadow-lg uppercase tracking-wider">
                  -{discount}% OFF
                </span>
              )}
              {product.tag && (
                <span className="bg-primary text-primary-foreground text-[9px] font-bold px-2.5 py-1 rounded shadow-lg uppercase tracking-wider">
                  {product.tag}
                </span>
              )}
            </div>
          </motion.div>

          {/* Quick status notes underneath logo/image */}
          <div className="mt-4 flex flex-col gap-2.5 bg-secondary p-4 rounded-lg border border-border">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted-foreground/80 uppercase tracking-widest">SECURE PAYMENT</span>
              <span className="text-foreground font-mono">100% AES-256 SECURED</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-muted-foreground/80 uppercase tracking-widest">DELIVERY METHOD</span>
              <span className="text-foreground font-mono">INSTANT ENCRYPTION</span>
            </div>
          </div>
        </div>

        {/* Right Side: Product Details & Purchase Controls (7 Columns) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between relative z-10 bg-card">
          <div>
            {/* Header / Type / stock Tag */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-border text-foreground border border-border text-[10px] font-mono rounded tracking-widest uppercase">
                PRODUCT ID
              </span>
              {product.isPreOrder ? (
                <span className="px-2 py-0.5 bg-border text-foreground border border-border text-[10px] font-mono rounded tracking-wider flex items-center gap-1.5">
                  PRE-ORDER
                </span>
              ) : product.stock > 0 ? (
                <span className="px-2 py-0.5 bg-border text-foreground border border-border text-[10px] font-semibold rounded tracking-wider flex items-center gap-1.5">
                  พร้อมส่งทันที
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-border/50 text-muted-foreground/80 border border-white/[0.04] text-[10px] font-mono rounded tracking-wider">
                  OUT OF STOCK
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground leading-tight tracking-tight mb-4 select-all">
              {formatProductName(product.name)}
            </h1>

            {/* Premium Pricing Panel */}
            <div className="bg-secondary rounded-lg p-5 border border-border mb-6 flex items-baseline justify-[#1a1a1c] select-none">
              <div className="flex-1">
                <span className="text-[10px] font-mono text-muted-foreground tracking-widest block mb-1 uppercase">OFFER PRICE</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-semibold text-foreground font-mono tracking-tight leading-none">
                    ฿{(product.price || 0).toLocaleString()}
                  </span>
                  {product.originalPrice && product.price && product.originalPrice > product.price && (
                    <span className="text-sm sm:text-base font-medium text-muted-foreground/80 line-through font-mono">
                      ฿{(product.originalPrice || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {discount && (
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] font-mono text-muted-foreground block mb-1 uppercase tracking-widest">YOU SAVE</span>
                  <span className="text-xs font-semibold text-foreground font-mono bg-border border border-border px-2.5 py-1.5 rounded">
                    ฿{((product.originalPrice || 0) - (product.price || 0)).toLocaleString()} ({discount}%)
                  </span>
                </div>
              )}
            </div>

            {/* Stock / Sold count Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary border border-border p-4 rounded-lg">
                <div className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-foreground" />
                  คงเหลือในคลัง
                </div>
                <div className="text-base sm:text-lg font-semibold text-foreground font-mono tracking-tight">
                  {product.isPreOrder ? 'เปิดรับ PRE-ORDER' : product.stock >= 999999 ? 'UNLIMITED' : `${product.stock} ชิ้น`}
                </div>
              </div>
              <div className="bg-secondary border border-border p-4 rounded-lg">
                <div className="text-muted-foreground text-[10px] font-mono tracking-widest uppercase mb-1 flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5 text-foreground" />
                  ขายออกไปแล้ว
                </div>
                <div className="text-base sm:text-lg font-semibold text-foreground font-mono tracking-tight">
                  {(product.soldCount || 0).toLocaleString()} ครั้ง
                </div>
              </div>
            </div>

            {/* Description Tab & Details */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-foreground" />
                  <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">รายละเอียดสินค้า</span>
                </div>
                
                {/* Share Product Button */}
                <button 
                  onClick={() => {
                    const shareUrl = `${window.location.origin}/?product=${product.id}`;
                    navigator.clipboard.writeText(shareUrl).then(() => {
                      addToast({ title: "คัดลอกลิงก์แล้ว", message: "แชร์ลิงก์นี้ให้เพื่อนสิ!", type: "success" });
                    });
                  }}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 bg-secondary hover:bg-border border border-border px-3 py-1.5 rounded active:scale-95 cursor-pointer outline-none"
                >
                  <Share2 className="w-3 h-3 text-foreground" /> 
                  <span>แชร์สินค้านี้</span>
                </button>
              </div>

              {/* description text body */}
              <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap bg-secondary p-5 border border-border rounded-lg min-h-[110px] max-h-56 overflow-y-auto no-scrollbar font-normal">
                {product.description || "ไม่มีรายละเอียดสินค้าเพิ่มเติมนอกจากชื่อสินค้า"}
              </div>
            </div>
          </div>

          {/* Quantity Controls & Dynamic Ordering Action */}
          <div className="border-t border-border pt-6 mt-2">
            {!showConfirmPurchase ? (
              <div className="space-y-4 font-sans">
                <div className="flex flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-muted-foreground tracking-widest uppercase">เลือกจำนวน</span>
                  </div>
                  
                  {/* Digital stepper widget */}
                  <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg border border-border">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      className="w-10 h-10 bg-card hover:bg-border flex items-center justify-center font-bold text-sm rounded border border-border text-foreground cursor-pointer outline-none"
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
                      className="w-14 h-10 bg-transparent text-center font-bold text-sm text-foreground outline-none font-mono"
                      disabled={!product.isPreOrder && product.stock === 0}
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(product.isPreOrder ? 999 : (product.stock >= 999999 ? 999 : product.stock), purchaseQuantity + 1))}
                      className="w-10 h-10 bg-card hover:bg-border flex items-center justify-center font-bold text-sm rounded border border-border text-foreground cursor-pointer outline-none"
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
                        confirmButtonColor: '#000000',
                        cancelButtonColor: '#f1f5f9',
                        background: '#0F0F0F',
                        color: '#ffffff'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setActiveView('login');
                        }
                      });
                      return;
                    }
                    if (!product.isPreOrder && product.stock <= 0) {
                      Swal.fire({
                        title: 'แจ้งเตือนเมื่อมีสินค้า',
                        text: `เราจะส่งข้อความแจ้งเตือนเมื่อ ${product.name} กลับมามีสต็อกอีกครั้ง`,
                        icon: 'success',
                        confirmButtonText: 'ตกลง',
                        background: '#0F0F0F',
                        color: '#fff',
                        confirmButtonColor: '#ffffff'
                      });
                      return;
                    }
                    setShowConfirmPurchase(true);
                  }}
                  className={`w-full py-3 text-xs font-bold tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 rounded-lg outline-none ${
                    product.isPreOrder || product.stock > 0 
                      ? 'bg-primary text-primary-foreground hover:opacity-90 cursor-pointer active:scale-[0.98]' 
                      : 'bg-secondary text-muted-foreground border border-border cursor-pointer'
                  }`}
                >
                  {product.isPreOrder ? (
                    <><ShoppingCart className="w-4 h-4" /> สั่งซื้อ PRE-ORDER</>
                  ) : product.stock > 0 ? (
                    <><ShoppingCart className="w-4 h-4" /> ยืนยันสั่งซื้อสินค้า</>
                  ) : (
                    <><AlertCircle className="w-4 h-4 text-muted-foreground" /> แจ้งเตือนเมื่อมาใหม่</>
                  )}
                </button>
              </div>
            ) : (
              /* Transaction validation view */
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary text-zinc-300 border border-border p-5 rounded-lg font-sans animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-9 h-9 flex items-center justify-center bg-border text-foreground rounded border border-border shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-0.5">CONFIRM CHECKOUT</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      โปรดยืนยันการสั่งซื้อสินค้า <span className="font-bold text-foreground">{formatProductName(product.name)}</span> จำนวน <span className="font-semibold text-foreground">{purchaseQuantity}</span> ชิ้น ราคารวม <span className="font-semibold text-foreground font-mono">฿{(product.price * purchaseQuantity).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => setShowConfirmPurchase(false)}
                    className="flex-1 py-2 bg-transparent hover:bg-border text-muted-foreground hover:text-foreground font-semibold transition-all rounded-lg text-xs active:scale-95 border border-border cursor-pointer outline-none"
                  >
                    ยกเลิกขั้นตอนชำระเงิน
                  </button>
                  <button 
                    disabled={showConfirmPurchase === 'loading'}
                    onClick={async () => {
                      setShowConfirmPurchase('loading');
                      try {
                        await handlePurchase(product, purchaseQuantity);
                      } finally {
                        setShowConfirmPurchase(false);
                      }
                    }}
                    className="flex-1 py-2 bg-foreground hover:opacity-90 text-background font-semibold transition-all rounded-lg text-xs disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 border-none cursor-pointer text-center outline-none"
                  >
                    {showConfirmPurchase === 'loading' ? (
                      <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/50 border-t-primary-foreground rounded-full animate-spin"></div> <span>กำลังทำรายการคอยสักครู่...</span></>
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
