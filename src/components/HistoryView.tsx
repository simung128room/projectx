import React, { useState } from 'react';
import { History, Key, CreditCard, ShoppingCart, ChevronRight, X, Star, Gift, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryViewProps {
  purchaseHistory?: any[];
  topupHistory?: any[];
  usedKeysHistory?: any[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ purchaseHistory = [], topupHistory = [], usedKeysHistory = [] }) => {
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const categories = [
    {
      id: 'special_product',
      title: 'ประวัติการซื้อสินค้าพิเศษ',
      subtitle: 'Member Point History',
      icon: Star,
      bg: 'bg-amber-50',
      color: 'text-amber-500'
    },
    {
      id: 'normal_product',
      title: 'ประวัติการซื้อสินค้าทั่วไป',
      subtitle: 'Shop History',
      icon: ShoppingCart,
      bg: 'bg-blue-50',
      color: 'text-blue-500'
    },
    {
      id: 'key_usage',
      title: 'ประวัติการใช้คีย์',
      subtitle: 'Key Usage History',
      icon: Key,
      bg: 'bg-purple-50',
      color: 'text-purple-500'
    },
    {
      id: 'topup_gift',
      title: 'ประวัติการเติมเงินซองอั่งเปา',
      subtitle: 'True Money Wallet Gift History',
      icon: Gift,
      bg: 'bg-red-50',
      color: 'text-red-500'
    },
    {
      id: 'topup_slip',
      title: 'ประวัติการเติมเงินสลิป',
      subtitle: 'Bank Slip History',
      icon: CreditCard,
      bg: 'bg-emerald-50',
      color: 'text-emerald-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>{status || 'สำเร็จ'}</span>;
    }
  };

  const getFilteredData = (categoryId: string) => {
    switch(categoryId) {
      case 'normal_product':
        return purchaseHistory.filter(p => !p.is_special).map(p => ({ ...p, type: 'normal_product', title: p.productName || 'ซื้อสินค้า', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'special_product':
        return purchaseHistory.filter(p => p.is_special).map(p => ({ ...p, type: 'special_product', title: p.productName || 'สินค้าพิเศษ', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'topup_gift':
        return topupHistory.filter(t => t.method?.toLowerCase().includes('gift') || t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_gift', title: 'เติมเงินซองอั่งเปา', icon: Gift, color: 'text-red-500', bg: 'bg-red-50', money: t.amount, date: t.date || t.timestamp }));
      case 'topup_slip':
        return topupHistory.filter(t => !t.method?.toLowerCase().includes('gift') && !t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_slip', title: 'เติมเงินสลิป', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', money: t.amount, date: t.date || t.timestamp }));
      case 'key_usage':
        return usedKeysHistory.map(k => ({ ...k, type: 'key_usage', title: 'ใช้งานคีย์', icon: Key, color: 'text-purple-500', bg: 'bg-purple-50', money: 0, date: k.used_at || k.date || new Date().toISOString(), productName: k.key || k.code }));
      default:
        return [];
    }
  };

  const currentCategoryData = currentCategory ? getFilteredData(currentCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const currentCategoryInfo = categories.find(c => c.id === currentCategory);

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 animate-in fade-in duration-500 font-sans px-4 pb-12">
      <AnimatePresence mode="wait">
        {!currentCategory ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6 md:p-8 border-b border-zinc-100 bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900 leading-none mb-1">ประวัติการใช้งาน</h2>
                    <p className="text-xs font-medium text-zinc-500">เลือกหมวดหมู่ที่ต้องการตรวจสอบ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-zinc-50/20">
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="group flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-[1.5rem] hover:border-red-200 hover:shadow-md hover:shadow-red-500/5 transition-all text-left active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-tight">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-red-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-white border border-zinc-200 text-zinc-500 rounded-xl hover:bg-zinc-100 hover:text-zinc-900 transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-2.5 ${currentCategoryInfo?.bg} ${currentCategoryInfo?.color} rounded-xl`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-zinc-50/30">
                {currentCategoryData.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {currentCategoryData.map((item, idx) => (
                      <div key={idx} className="bg-white rounded-3xl border border-zinc-200 p-4 transition-all hover:border-zinc-300 hover:shadow-md hover:shadow-black/5 flex flex-col gap-4">
                        <div className="flex gap-4 items-center w-full">
                          <div className={`w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center ${item.bg} ${item.color} shadow-inner`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h3 className="text-zinc-900 font-bold text-sm sm:text-base truncate">{item.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-medium text-zinc-500">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                              {item.money !== 0 ? (
                                <span className={`font-bold font-mono text-xs sm:text-sm ${item.money > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {item.money > 0 ? '+' : ''}{item.money} ฿
                                </span>
                              ) : (
                                <span className="font-bold text-xs text-zinc-400">0 ฿</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-zinc-100/80 pt-3">
                          <div className="flex items-center">
                            {getStatusBadge(item.status || 'success')}
                          </div>
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="text-[11px] sm:text-xs font-bold text-zinc-700 bg-zinc-100 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1 active:scale-95"
                          >
                            ดูรายละเอียด <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white border border-zinc-200 shadow-sm rounded-[1.5rem] flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-zinc-200" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 mb-1">ยังไม่มีประวัติ</h3>
                    <p className="text-xs font-medium text-zinc-500">ยังไม่พบข้อมูลในหมวดหมู่นี้</p>
                    <button 
                      onClick={() => setCurrentCategory(null)}
                      className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-colors"
                    >
                      ย้อนกลับ
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Minimal Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className={`h-24 ${selectedItem.bg} w-full absolute top-0 left-0 right-0 opacity-50`}></div>
            
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-md rounded-full text-zinc-500 hover:text-zinc-900 hover:bg-white transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="pt-8 px-6 pb-6 relative z-10 flex flex-col">
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mb-4 ${selectedItem.bg} ${selectedItem.color} border-4 border-white shadow-sm mx-auto`}>
                <selectedItem.icon className="w-7 h-7" />
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">{selectedItem.title}</h3>
                <p className="text-xs font-medium text-zinc-500">{new Date(selectedItem.date).toLocaleString('th-TH')}</p>
              </div>

              <div className="space-y-1 bg-zinc-50 rounded-2xl p-2 border border-zinc-100">
                <div className="flex items-center justify-between p-3">
                  <span className="text-xs font-medium text-zinc-500">หมายเลขบิล</span>
                  <span className="text-xs font-bold font-mono text-zinc-900 bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                    {selectedItem.billNumber || (selectedItem.type.includes('topup') ? 'T-' : 'P-') + Math.floor(Math.random()*1000000)}
                  </span>
                </div>
                
                {selectedItem.type.includes('topup') ? (
                  <div className="flex items-center justify-between p-3 border-t border-zinc-100/80">
                    <span className="text-xs font-medium text-zinc-500">ช่องทาง</span>
                    <span className="text-xs font-bold text-zinc-900 flex items-center gap-2">
                       {selectedItem.method || 'ไม่ระบุ'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 border-t border-zinc-100/80">
                    <span className="text-xs font-medium text-zinc-500">รายการ</span>
                    <span className="text-xs font-bold text-zinc-900 max-w-[150px] truncate text-right">
                      {selectedItem.productName || selectedItem.key || 'ไม่ระบุ'}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 border-t border-zinc-100/80">
                  <span className="text-xs font-medium text-zinc-500">จำนวนเงิน</span>
                  <span className={`text-sm font-bold font-mono ${selectedItem.money > 0 ? 'text-emerald-500' : selectedItem.money < 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                    {selectedItem.money > 0 ? '+' : ''}{selectedItem.money} ฿
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 border-t border-zinc-100/80">
                  <span className="text-xs font-medium text-zinc-500">สถานะ</span>
                  <div>{getStatusBadge(selectedItem.status || 'success')}</div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-sm font-bold transition-all active:scale-[0.98] shadow-md shadow-zinc-900/20"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
