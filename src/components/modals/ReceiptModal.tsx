import React, { useState } from 'react';
import { X, Eye, AlertCircle, ShoppingCart, Download, Copy } from 'lucide-react';

interface ReceiptModalProps {
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ selectedItem, setSelectedItem }) => {
  const [showSecret, setShowSecret] = useState(false);

  if (!selectedItem) return null;
  
  const isPurchase = !selectedItem.type?.includes('topup');

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0B0F14] w-full sm:max-w-[750px] rounded-t-3xl sm:rounded-3xl shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="pt-6 px-6 pb-4 flex items-start justify-between relative bg-[#0B0F14] z-10 rounded-t-3xl">
          <div>
            <h3 className="text-xl font-bold text-[#1E90FF] tracking-tight">{isPurchase ? 'รายละเอียดการซื้อ' : 'รายละเอียดการเติมเงิน'}</h3>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              บิล: {selectedItem.billNumber || (isPurchase ? 'P-' : 'T-') + Math.floor(Math.random()*1000000)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#1E90FF]/10 flex items-center justify-center text-[#1a7fe6]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 rounded-full bg-[#121820] flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6 scrollbar-hide flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Column: Summary Info */}
            <div className="space-y-6">
              <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-5 shadow-sm">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">ข้อมูลการทำรายการ</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400 font-medium">วันที่ทำรายการ</span>
                    <span className="text-white font-bold">{new Date(selectedItem.date || selectedItem.timestamp || new Date()).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-medium">จำนวนรายการ</span>
                      <span className="text-white font-bold">1 รายการ</span>
                    </div>
                  )}
                  {!isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400 font-medium">ช่องทาง</span>
                      <span className="text-white font-bold">{selectedItem.method || 'ไม่ระบุ'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-white font-bold">ยอดรวมสุทธิ</span>
                    <span className="text-xl font-black text-[#1E90FF]">
                      ฿{(selectedItem.money || selectedItem.amount || selectedItem.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {!isPurchase && selectedItem.status && (
                <div className="flex justify-between items-center bg-[#0a0d12] border border-white/5 rounded-2xl p-4 shadow-sm">
                   <span className="text-sm font-bold text-zinc-500">สถานะรายการ</span>
                   {selectedItem.status === 'success' ? (
                     <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">สำเร็จ</span>
                   ) : (
                     <span className="text-xs font-bold text-zinc-400 bg-white/5 px-3 py-1 rounded-full">{selectedItem.status}</span>
                   )}
                </div>
              )}
            </div>

            {/* Right Column: Product Items / Secrets */}
            <div className="space-y-4">
              <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-5 shadow-sm hover:border-[#1E90FF]/30 transition-colors">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">{isPurchase ? 'รายการสินค้า' : 'รายละเอียดการเติมเงิน'}</h4>
                <div className="flex gap-4 relative mb-4">
                  <div className="w-16 h-16 rounded-xl bg-[#121820] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedItem.image ? (
                      <img src={selectedItem.image} alt="product" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 pr-2">
                    <h5 className="text-sm font-bold text-zinc-200 line-clamp-2 leading-tight mb-1">
                      {isPurchase ? (selectedItem.productName || selectedItem.key || 'สินค้าไม่ทราบชื่อ') : (selectedItem.method || 'เติมเงินเข้าระบบ')}
                    </h5>
                    <span className="text-xs font-bold text-[#1E90FF]">
                      ฿{(selectedItem.money || selectedItem.price || selectedItem.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {isPurchase && selectedItem.secretData && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {!showSecret ? (
                      <button 
                        onClick={() => setShowSecret(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-[#1E90FF]/10 text-[#1E90FF] rounded-xl text-xs font-black hover:bg-[#1E90FF]/20 transition-colors uppercase tracking-wider"
                      >
                        <Eye className="w-4 h-4" /> ดูข้อมูลลับ / คีย์ที่ได้รับ
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ข้อมูลลับ</span>
                           <div className="flex gap-2">
                             <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedItem.secretData);
                                  const btn = document.getElementById('copy-secret-btn-mobile');
                                  if (btn) {
                                    btn.innerText = 'คัดลอกสำเร็จ!';
                                    setTimeout(() => { if (btn) btn.innerText = 'คัดลอก'; }, 2000);
                                  }
                                }}
                                id="copy-secret-btn-mobile"
                                className="text-[10px] font-black text-[#1E90FF] bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                             >
                               <Copy className="w-3 h-3" /> คัดลอก
                             </button>
                             <button 
                                onClick={() => {
                                  const blob = new Blob([selectedItem.secretData], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `keys_${(selectedItem.productName || 'product').replace(/[^\wก-๙]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                }}
                                className="text-[10px] font-bold text-zinc-400 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                             >
                               <Download className="w-3 h-3" /> ดาวน์โหลด
                             </button>
                           </div>
                        </div>
                        <div className="bg-[#0b0f14] border border-white/5 rounded-xl p-4 text-[13px] font-mono text-emerald-500 whitespace-pre-wrap max-h-40 overflow-y-auto w-full break-all shadow-inner">
                          {selectedItem.secretData}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 pb-6 pt-2 bg-[#0B0F14] relative z-10 border-t border-white/5">
          <button 
            onClick={() => setSelectedItem(null)}
            className="w-full py-4 bg-[#1E90FF] hover:bg-[#166bcc] text-white rounded-2xl text-[15px] font-black transition-all active:scale-[0.98] shadow-lg shadow-[#1E90FF]/25 uppercase tracking-wider"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
