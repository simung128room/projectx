import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { ArrowLeft, Box, CheckCircle2, ChevronRight, FileText, ShoppingCart, AlertCircle, Download } from 'lucide-react';
import Swal from 'sweetalert2';

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

  const calculateDiscount = (originalPrice?: number, price?: number) => {
    if (!originalPrice || !price || originalPrice <= price) return null;
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const discount = calculateDiscount(product.originalPrice, product.price);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={onBack} className="text-zinc-500 hover:text-[#1E90FF] transition-colors flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" />
          กลับสู่หน้าหลัก
        </button>
        <ChevronRight className="w-4 h-4 text-zinc-300" />
        <span className="text-white font-bold truncate">{product.name}</span>
      </div>

      <div className="bg-[#0B0F14] rounded-[2rem] border border-white/10 overflow-hidden shadow-sm flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="w-full md:w-5/12 lg:w-1/2 p-6 md:p-8 flex items-center justify-center bg-[#0a0d12]/50">
          <motion.div
            className="w-full aspect-square relative rounded-2xl overflow-hidden group shadow-lg"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img 
              src={product.imageUrl || undefined} 
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-700 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x600/png?text=No+Image";
              }}
            />
            {discount && (
              <div className="absolute top-4 left-4 z-20 bg-[#1E90FF] text-white font-black px-3 py-1.5 rounded-xl shadow-lg border border-[#1a7fe6]/50 text-sm">
                -{discount}%
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Side: Details & Actions */}
        <div className="w-full md:w-7/12 lg:w-1/2 p-6 md:p-8 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
             <span className="px-3 py-1 bg-[#1E90FF]/10 text-[#1E90FF] font-bold text-xs rounded-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-widest">
                <Box className="w-3 h-3" /> Product
             </span>
             {product.stock > 0 ? (
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 font-bold text-xs rounded-lg border border-emerald-100 flex items-center gap-1.5 uppercase tracking-widest">
                 <CheckCircle2 className="w-3.5 h-3.5" /> INSTOCK
               </span>
             ) : (
               <span className="px-3 py-1 bg-[#121820] text-zinc-400 font-bold text-xs rounded-lg border border-white/10 flex items-center gap-1.5 uppercase tracking-widest">
                 <Box className="w-3.5 h-3.5" /> OUT OF STOCK
               </span>
             )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{product.name}</h1>
          
          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl md:text-5xl font-black text-[#1E90FF] tracking-tight">฿{(product.price || 0).toLocaleString()}</span>
            {product.originalPrice && product.price && product.originalPrice > product.price && (
              <span className="text-xl md:text-2xl font-bold text-zinc-400 line-through mb-1">
                ฿{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-4">
               <div className="text-zinc-500 text-xs font-bold mb-1 flex items-center gap-1"><Box className="w-3.5 h-3.5"/> สถานะสต๊อก</div>
               <div className={`text-xl font-black ${product.stock > 0 ? 'text-white' : 'text-[#1a7fe6]'}`}>
                 {product.stock >= 999999 ? '∞' : `${product.stock} ชิ้น`}
               </div>
            </div>
            <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-4">
               <div className="text-zinc-500 text-xs font-bold mb-1 flex items-center gap-1"><ShoppingCart className="w-3.5 h-3.5"/> สั่งซื้อไปแล้ว</div>
               <div className="text-xl font-black text-white">{product.soldCount !== undefined ? product.soldCount : Math.floor(Math.random() * 50) + 10} ครั้ง</div>
            </div>
          </div>

          <div className="mb-8 flex-1">
            <div className="flex items-center justify-between mb-3 pr-2">
              <h4 className="font-bold text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1a7fe6]" />
                รายละเอียดสินค้า
              </h4>
              <button 
                onClick={() => {
                  const content = `[PRODUCT INFORMATION]\nProduct Name: ${product.name}\nPrice: ฿${product.price}\nStock: ${product.stock >= 999999 ? 'Unlimited' : product.stock}\n\n[DESCRIPTION]\n${product.description || 'No description available.'}`;
                  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${product.name.replace(/[^\wก-๙]/g, '_')}_details.txt`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-[10px] font-bold text-zinc-500 hover:text-[#1E90FF] transition-colors flex items-center gap-1.5 bg-[#0B0F14] border border-white/10 px-3 py-1.5 rounded-xl shadow-sm active:scale-95"
              >
                <Download className="w-3.5 h-3.5" /> DOWNLOAD .TXT
              </button>
            </div>
            <div className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap bg-[#0a0d12]/50 p-5 rounded-2xl border border-white/5 min-h-[120px]">
              {product.description || "ไม่มีรายละเอียดสินค้าระบุไว้"}
            </div>
          </div>

          <div className="mt-auto">
            {!showConfirmPurchase ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-white text-sm">จำนวน</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      className="w-12 h-12 rounded-xl bg-[#121820] flex items-center justify-center font-black text-xl hover:bg-zinc-200 transition-colors"
                      disabled={purchaseQuantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stock >= 999999 ? 999 : product.stock}
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) setPurchaseQuantity(Math.min(product.stock >= 999999 ? 999 : product.stock, Math.max(1, val)));
                      }}
                      className="flex-1 h-12 bg-[#0B0F14] border-2 border-white/10 rounded-xl text-center font-black text-xl outline-none focus:border-[#1a7fe6] transition-colors appearance-none m-0"
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      disabled={product.stock === 0}
                    />
                    <button
                      onClick={() => setPurchaseQuantity(Math.min(product.stock >= 999999 ? 999 : product.stock, purchaseQuantity + 1))}
                      className="w-12 h-12 rounded-xl bg-[#121820] flex items-center justify-center font-black text-xl hover:bg-zinc-200 transition-colors"
                      disabled={product.stock === 0 || purchaseQuantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button 
                   onClick={() => {
                     if (!user) {
                        Swal.fire({ 
                          title: 'กรุณาเข้าสู่ระบบ', 
                          text: 'คุณต้องเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า', 
                          icon: 'warning', 
                          confirmButtonText: 'เข้าสู่ระบบ',
                          showCancelButton: true,
                          cancelButtonText: 'ปิด'
                        }).then((result) => {
                          if (result.isConfirmed) {
                             setActiveView('login');
                          }
                        });
                        return;
                     }
                     if (product.stock <= 0) return;
                     setShowConfirmPurchase(true);
                   }}
                   disabled={product.stock <= 0}
                   className={`w-full py-4 rounded-xl text-base font-black transition-all flex items-center justify-center gap-2 shadow-lg ${
                     product.stock > 0 
                     ? 'bg-[#1E90FF] hover:bg-[#166bcc] text-white shadow-[#1E90FF]/20 active:scale-[0.98]' 
                     : 'bg-zinc-200 text-zinc-500 cursor-not-allowed shadow-none'
                   }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock > 0 ? 'สั่งชื้อเลย' : 'สินค้าหมดชั่วคราว'}
                </button>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1E90FF]/10 border-2 border-[#1E90FF]/30 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4 mb-4">
                   <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1E90FF]/20 text-[#1E90FF] shrink-0">
                     <AlertCircle className="w-5 h-5" />
                   </div>
                   <div>
                     <h3 className="font-black text-lg text-white mb-1">ยืนยันการสั่งซื้อ</h3>
                     <p className="text-[#166bcc] text-sm leading-relaxed">
                       คุณกำลังสั่งซื้อ {product.name} จำนวน {purchaseQuantity} ชิ้น ในราคารวม <span className="font-black">฿{(product.price * purchaseQuantity).toLocaleString()}</span> หักจากยอดเงินคงเหลือของคุณ
                     </p>
                   </div>
                </div>
                
                <div className="flex items-center gap-3 w-full">
                   <button 
                     onClick={() => setShowConfirmPurchase(false)}
                     className="flex-1 py-3 bg-[#0B0F14] border border-[#1E90FF]/30 hover:bg-[#1E90FF]/10 text-[#166bcc] font-bold rounded-xl transition-colors text-sm"
                   >
                     ยกเลิก
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
                     className="flex-1 py-3 bg-[#1E90FF] hover:bg-[#166bcc] text-white font-bold rounded-xl transition-colors text-sm shadow-md shadow-[#1E90FF]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                   >
                     {showConfirmPurchase === 'loading' as any ? (
                       <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> กำลังทำรายการ...</>
                     ) : 'ยืนยันการชำระเงิน'}
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
