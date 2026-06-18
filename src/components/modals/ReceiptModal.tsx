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
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#09090b] animate-in fade-in duration-200 ">
      <div className="bg-[#09090b] w-full sm:max-w-[750px] sm:rounded-md relative overflow-hidden animate-in slide-in-from-bottom-full sm:zoom-in-95 duration-300 flex flex-col max-h-[95vh] ">
        
        {/* Header */}
        <div className="pt-6 px-6 pb-4 flex items-start justify-between relative bg-[#09090b] z-10 ">
          <div>
            <h3 className="text-xl font-medium text-[#00e676] tracking-tight">{isPurchase ? 'รายละเอียดการซื้อ' : 'รายละเอียดการเติมเงิน'}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">
              บิล: {selectedItem.billNumber || (isPurchase ? 'P-' : 'T-') + Math.floor(Math.random()*1000000)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center text-[#00e676]">
              <AlertCircle className="w-4 h-4" />
            </div>
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-8 h-8 bg-[#09090b] flex items-center justify-center text-muted-foreground hover:bg-zinc-200 transition-colors "
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-6 scrollbar-hide flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left Column: Summary Info */}
            <div className="space-y-6">
              <div className="bg-[#09090b] border border-[#1e1e1e]  p-5 ">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">ข้อมูลการทำรายการ</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">วันที่ทำรายการ</span>
                    <span className="text-white font-medium">{new Date(selectedItem.date || selectedItem.timestamp || new Date()).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  {isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">จำนวนรายการ</span>
                      <span className="text-white font-medium">1 รายการ</span>
                    </div>
                  )}
                  {!isPurchase && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">ช่องทาง</span>
                      <span className="text-white font-medium">{selectedItem.method || 'ไม่ระบุ'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-3 border-t border-[#1e1e1e] ">
                    <span className="text-white font-medium">ยอดรวมสุทธิ</span>
                    <span className="text-xl font-semibold text-[#00e676]">
                      ฿{(selectedItem.money || selectedItem.amount || selectedItem.price || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {selectedItem.isPreOrder && (
                <div className="bg-zinc-950/40 border border-[#1e1e1e]  p-5 rounded-md space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00e676] " />
                     สถานะพรีออเดอร์ (Track Status)
                  </h4>
                  
                  <div className="space-y-3 pt-2 text-sm">
                    {/* Step 1: Paid */}
                    <div className="flex items-center gap-3">
                      <span className="text-lg">✅</span>
                      <div>
                        <p className="font-medium text-white text-xs">ชำระเงินแล้ว</p>
                        <p className="text-[10px] text-muted-foreground">บันทึกคำสั่งซื้อพรีออเดอร์สำเร็จ</p>
                      </div>
                    </div>
                    
                    {/* Step 2: Procuring */}
                    <div className="flex items-center gap-3">
                      {selectedItem.preOrderStatus === 'delivered' ? (
                        <span className="text-lg">✅</span>
                      ) : (
                        <span className="text-lg ">⏳</span>
                      )}
                      <div>
                        <p className="font-medium text-white text-xs">กำลังจัดหาไอดี</p>
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
                        <p className="font-medium text-white text-xs flex items-center gap-1">ส่งข้อมูลแล้ว</p>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedItem.preOrderStatus === 'delivered' ? 'ท่านสามารถคัดลอกข้อมูลไอดีได้ที่คอลัมน์ขวาขวา' : 'เมื่อจัดหาสำเร็จ คีย์/รหัสจะแสดงในข้อมูลลับด้านขวา'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.preOrderOption && (
                    <div className="mt-4 pt-3 border-t border-[#1e1e1e] border-dashed text-xs flex items-center justify-between text-zinc-400">
                      <span>ประเภทที่เลือก:</span>
                      <span className="bg-[#00e676]/10 text-[#00e676] px-2 py-0.5 rounded font-semibold">{selectedItem.preOrderOption}</span>
                    </div>
                  )}
                </div>
              )}

              {!isPurchase && selectedItem.status && (
                <div className="flex justify-between items-center bg-[#09090b] border border-[#1e1e1e]  p-4 ">
                   <span className="text-sm font-medium text-muted-foreground">สถานะรายการ</span>
                   {selectedItem.status === 'success' ? (
                     <span className="text-xs font-medium text-[#00e676] bg-primary text-primary-foreground px-3 py-1">สำเร็จ</span>
                   ) : (
                     <span className="text-xs font-medium text-muted-foreground bg-[#09090b] px-3 py-1 ">{selectedItem.status}</span>
                   )}
                </div>
              )}
            </div>

            {/* Right Column: Product Items / Secrets */}
            <div className="space-y-4">
              <div className="bg-[#09090b] border border-[#1e1e1e]  p-5 hover:border-[#00e676]/30 transition-colors ">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">{isPurchase ? 'รายการสินค้า' : 'รายละเอียดการเติมเงิน'}</h4>
                <div className="flex gap-4 relative mb-4">
                  <div className="w-16 h-16 bg-[#09090b] border border-[#1e1e1e]  flex items-center justify-center shrink-0 overflow-hidden ">
                    {selectedItem.image ? (
                      <img loading="lazy" src={selectedItem.image} alt="product" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingCart className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 pr-2">
                    <h5 className="text-sm font-medium text-muted-foreground line-clamp-2 leading-tight mb-1">
                      {isPurchase ? (selectedItem.productName || selectedItem.key || 'สินค้าไม่ทราบชื่อ') : (selectedItem.method || 'เติมเงินเข้าระบบ')}
                    </h5>
                    <span className="text-xs font-medium text-[#00e676]">
                      ฿{(selectedItem.money || selectedItem.price || selectedItem.amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {isPurchase && selectedItem.secretData && (
                  <div className="mt-4 pt-4 border-t border-[#1e1e1e] ">
                    {!showSecret ? (
                      <button 
                        onClick={() => setShowSecret(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-[#00e676] text-xs font-semibold hover:bg-zinc-600/20 transition-colors uppercase tracking-wider"
                      >
                        <Eye className="w-4 h-4" /> ดูข้อมูลลับ / คีย์ที่ได้รับ
                      </button>
                    ) : (
                      <div className="animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">ข้อมูลลับ</span>
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
                                className="text-[10px] font-semibold text-[#00e676] bg-primary text-primary-foreground hover:bg-zinc-600/20 px-3 py-1.5 transition-colors flex items-center gap-1.5"
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
                                className="text-[10px] font-medium text-muted-foreground bg-[#09090b] hover:bg-white/10 px-3 py-1.5 transition-colors flex items-center gap-1.5 "
                             >
                               <Download className="w-3 h-3" /> ดาวน์โหลด
                             </button>
                           </div>
                        </div>
                        <div className="bg-[#09090b] border border-[#1e1e1e]  p-4 text-[13px] font-mono text-[#00e676] whitespace-pre-wrap max-h-40 overflow-y-auto w-full break-all ">
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
        <div className="px-6 pb-6 pt-2 bg-[#09090b] relative z-10 border-t border-[#1e1e1e]  ">
          <button 
            onClick={() => setSelectedItem(null)}
            className="w-full py-4 bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-white text-[15px] font-semibold transition-all active:scale-[0.98] uppercase tracking-wider"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
