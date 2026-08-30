import React, { useState, useMemo } from 'react';
import { X, Eye, AlertCircle, ShoppingCart, Download, Copy } from 'lucide-react';

interface ReceiptModalProps {
  selectedItem: any;
  setSelectedItem: (item: any) => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ selectedItem, setSelectedItem }) => {
  const [showSecret, setShowSecret] = useState(false);

  if (!selectedItem) return null;
  
  const isPurchase = !selectedItem.type?.includes('topup');

  // Memoize the bill number so it doesn't regenerate on every re-render
  const billNumber = useMemo(() => {
    if (selectedItem.billNumber) return selectedItem.billNumber;
    const prefix = isPurchase ? 'P-' : 'T-';
    const rand = Math.floor(Math.random() * 1000000);
    return prefix + rand;
  }, [selectedItem.id, selectedItem.billNumber, isPurchase]);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 ">
      <div className="bg-[#0d0f15] border border-[#1f293d] w-full sm:max-w-[750px] sm:rounded-2xl relative overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh] shadow-2xl">
        
        {/* Header */}
        <div className="pt-6 px-6 pb-4 flex items-start justify-between relative bg-[#0d0f15] z-10 border-b border-[#1f293d]/50">
          <div>
            <h3 className="text-xl font-bold text-foreground tracking-tight">{isPurchase ? 'รายละเอียดการซื้อ' : 'รายละเอียดการเติมเงิน'}</h3>
            <p className="text-sm font-semibold text-muted-foreground mt-1">
              บิล: <span className="font-mono text-primary">{billNumber}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600/10 text-primary flex items-center justify-center rounded-xl border border-blue-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6 scrollbar-hide flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Column: Summary Info */}
            <div className="space-y-6">
              <div className="bg-card border border-[#1f293d] p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">ข้อมูลการทำรายการ</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">วันที่ทำรายการ</span>
                    <span className="text-foreground font-medium">{new Date(selectedItem.date || selectedItem.timestamp || new Date()).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">จำนวนรายการ</span>
                      <span className="text-foreground font-medium">1 รายการ</span>
                    </div>
                  )}
                  {!isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">ช่องทาง</span>
                      <span className="text-foreground font-medium">{selectedItem.method || 'ไม่ระบุ'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1f293d]">
                    <span className="text-foreground font-medium">ยอดรวมสุทธิ</span>
                    <span className="text-xl font-black text-primary font-mono">
                      ฿{(selectedItem.money || selectedItem.amount || selectedItem.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.isPreOrder && (
                <div className="bg-zinc-950/40 border border-[#1f293d] p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                     สถานะพรีออเดอร์ (Track Status)
                  </h4>
                  
                  <div className="space-y-3 pt-2 text-sm">
                    {/* Step 1: Paid */}
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="font-bold text-foreground text-xs">ชำระเงินแล้ว</p>
                        <p className="text-[10px] text-muted-foreground">บันทึกคำสั่งซื้อพรีออเดอร์สำเร็จ</p>
                      </div>
                    </div>
                    
                    {/* Step 2: Procuring */}
                    <div className="flex items-center gap-3">
                      {selectedItem.preOrderStatus === 'delivered' ? (
                        <span className="text-lg">✅</span>
                      ) : (
                        <span className="text-lg animate-pulse">⏳</span>
                      )}
                      <div>
                        <p className="font-bold text-foreground text-xs">กำลังจัดหาไอดี</p>
                        <p className="text-[10px] text-muted-foreground">แอดมินอยู่ระหว่างการจัดหาไอดีตามที่ท่านเลือก</p>
                      </div>
                    </div>
                    
                    {/* Step 3: Delivered */}
                    <div className="flex items-center gap-3">
                      {selectedItem.preOrderStatus === 'delivered' ? (
                        <span className="text-lg">✅</span>
                      ) : (
                        <span className="text-lg opacity-40">⬜</span>
                      )}
                      <div>
                        <p className="font-bold text-foreground text-xs flex items-center gap-1">ส่งข้อมูลแล้ว</p>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedItem.preOrderStatus === 'delivered' ? 'ท่านสามารถคัดลอกข้อมูลไอดีได้ที่คอลัมน์ขวา' : 'เมื่อจัดหาสำเร็จ คีย์/รหัสจะแสดงในข้อมูลลับด้านขวา'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.preOrderOption && (
                    <div className="mt-4 pt-3 border-t border-[#1f293d] border-dashed text-xs flex items-center justify-between text-muted-foreground">
                      <span>ประเภทที่เลือก:</span>
                      <span className="bg-blue-500/10 text-primary border border-blue-500/20 px-2 py-0.5 rounded font-bold">{selectedItem.preOrderOption}</span>
                    </div>
                  )}
                </div>
              )}

              {!isPurchase && selectedItem.status && (
                <div className="flex justify-between items-center bg-card border border-[#1f293d] p-4 rounded-2xl">
                   <span className="text-sm font-medium text-muted-foreground">สถานะรายการ</span>
                   {selectedItem.status === 'success' ? (
                     <span className="text-xs font-bold text-emerald-400 bg-cardmerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1">สำเร็จ</span>
                   ) : (
                     <span className="text-xs font-bold text-muted-foreground bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1">{selectedItem.status}</span>
                   )}
                </div>
              )}
            </div>

            {/* Right Column: Product Items / Secrets */}
            <div className="space-y-4">
              <div className="bg-card border border-[#1f293d] p-5 rounded-2xl hover:border-blue-500/20 transition-colors">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{isPurchase ? 'รายการสินค้า' : 'รายละเอียดการเติมเงิน'}</h4>
                <div className="flex gap-4 relative mb-4">
                  <div className="w-16 h-16 bg-[#0d0f15] border border-[#1f293d] rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedItem.image ? (
                      <img loading="lazy" src={selectedItem.image} alt="product" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 pr-2">
                    <h5 className="text-sm font-bold text-zinc-300 line-clamp-2 leading-tight mb-1">
                      {isPurchase ? (selectedItem.productName || selectedItem.key || 'สินค้าไม่ทราบชื่อ') : (selectedItem.method || 'เติมเงินเข้าระบบ')}
                    </h5>
                    <span className="text-xs font-bold text-primary font-mono">
                      ฿{(selectedItem.money || selectedItem.price || selectedItem.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {isPurchase && selectedItem.secretData && (
                  <div className="mt-4 pt-4 border-t border-[#1f293d]">
                    {!showSecret ? (
                      <button 
                        onClick={() => setShowSecret(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-foreground text-xs font-bold transition-all rounded-xl cursor-pointer outline-none shadow-md"
                      >
                        <Eye className="w-4 h-4" /> ดูข้อมูลลับ / คีย์ที่ได้รับ
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ข้อมูลลับ</span>
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
                                className="text-[10px] font-bold text-background bg-primary hover:bg-primary/90 px-3 py-1.5 transition-colors rounded-lg flex items-center gap-1.5 cursor-pointer outline-none"
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
                                className="text-[10px] font-bold text-muted-foreground bg-zinc-800 hover:bg-zinc-700 hover:text-foreground px-3 py-1.5 transition-colors rounded-lg flex items-center gap-1.5 cursor-pointer outline-none"
                             >
                               <Download className="w-3 h-3" /> ดาวน์โหลด
                             </button>
                           </div>
                        </div>
                        <div className="bg-black border border-[#1f293d] p-4 text-[13px] font-mono text-emerald-400 whitespace-pre-wrap max-h-40 overflow-y-auto w-full break-all rounded-xl shadow-inner">
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
        <div className="px-6 pb-6 pt-4 bg-[#0d0f15] relative z-10 border-t border-[#1f293d]">
          <button 
            onClick={() => setSelectedItem(null)}
            className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 text-foreground text-[15px] font-bold rounded-xl transition-all active:scale-[0.98] cursor-pointer outline-none"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
