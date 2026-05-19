import React, { useState } from 'react';
import { ShoppingCart, Key, CreditCard, Gift, Star, History, ChevronRight, ChevronLeft } from 'lucide-react';
import { ReceiptModal } from './modals/ReceiptModal';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

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
      title: 'ประวัติการเติมเงิน (อังเปา)',
      subtitle: 'True Money Wallet Gift History',
      icon: Gift,
      bg: 'bg-[#1E90FF]/10',
      color: 'text-[#1a7fe6]'
    },
    {
      id: 'topup_slip',
      title: 'ประวัติการเติมเงิน (ธนาคาร)',
      subtitle: 'Bank Slip History',
      icon: CreditCard,
      bg: 'bg-emerald-50',
      color: 'text-emerald-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-[#1E90FF]/10 text-[#1E90FF] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#1a7fe6]"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-[#121820] text-zinc-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>{status || 'สำเร็จ'}</span>;
    }
  };

  const getFilteredData = (categoryId: string) => {
    switch(categoryId) {
      case 'normal_product':
        return purchaseHistory.filter(p => !p.is_special).map(p => ({ ...p, type: 'normal_product', title: p.productName || 'ซื้อสินค้า', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'special_product':
        return purchaseHistory.filter(p => p.is_special).map(p => ({ ...p, type: 'special_product', title: p.productName || 'สินค้าพิเศษ', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'topup_gift':
        return topupHistory.filter(t => t.method?.toLowerCase().includes('gift') || t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_gift', title: 'TrueMoney Wallet (อังเปา)', icon: Gift, color: 'text-[#1a7fe6]', bg: 'bg-[#1E90FF]/10', money: t.amount, date: t.date || t.timestamp }));
      case 'topup_slip':
        return topupHistory.filter(t => !t.method?.toLowerCase().includes('gift') && !t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_slip', title: 'ธนาคาร เช็คสลิป', icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-50', money: t.amount, date: t.date || t.timestamp }));
      case 'key_usage':
        return usedKeysHistory.map(k => ({ ...k, type: 'key_usage', title: 'ใช้งานคีย์', icon: Key, color: 'text-purple-500', bg: 'bg-purple-50', money: 0, date: k.used_at || k.date || new Date().toISOString(), productName: k.key || k.code }));
      default:
        return [];
    }
  };

  const currentCategoryData = currentCategory ? getFilteredData(currentCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const currentCategoryInfo = categories.find(c => c.id === currentCategory);

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-4xl mx-auto mt-6 font-sans px-4 pb-12">
        <AnimatePresence mode="wait">
        {!currentCategory ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-[#0B0F14] rounded-3xl border border-white/10 shadow-sm overflow-hidden mb-6">
              <div className="p-6 md:p-8 border-b border-white/5 bg-[#0a0d12]/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#1E90FF]/20 text-[#1E90FF] rounded-xl">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">ประวัติสั่งซื้อ</h2>
                    <p className="text-xs font-medium text-zinc-500">เลือกหมวดหมู่ที่ต้องการตรวจสอบ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-[#0a0d12]/20">
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="group flex items-center justify-between p-4 bg-[#0B0F14] border border-white/10 rounded-[1.5rem] hover:border-[#1E90FF]/30 hover:shadow-md hover:shadow-[#1a7fe6]/5 transition-all text-left active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-medium text-zinc-400 uppercase tracking-tight">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-[#1a7fe6] transition-colors" />
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
            <div className="bg-[#0B0F14] rounded-3xl border border-white/10 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-white/5 bg-[#0a0d12]/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-[#0B0F14] border border-white/10 text-zinc-500 rounded-xl hover:bg-[#121820] hover:text-white transition-colors mr-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-2.5 ${currentCategoryInfo?.bg} ${currentCategoryInfo?.color} rounded-xl`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-[#0a0d12]/30">
                {currentCategoryData.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {currentCategoryData.map((item, idx) => (
                      <div key={idx} className="bg-[#0B0F14] rounded-3xl border border-white/10 p-4 transition-all hover:border-white/20 hover:shadow-md hover:shadow-black/5 flex flex-col gap-4">
                        <div className="flex gap-4 items-center w-full">
                          <div className={`w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center ${item.bg} ${item.color} shadow-inner`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex flex-col flex-1 min-w-0 justify-center">
                            <h3 className="text-white font-bold text-sm sm:text-base truncate">{item.title}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs font-medium text-zinc-500">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                              {item.money !== 0 ? (
                                <span className={`font-bold font-mono text-xs sm:text-sm ${item.money > 0 ? 'text-emerald-500' : 'text-[#1a7fe6]'}`}>
                                  {item.money > 0 ? '+' : ''}{item.money} ฿
                                </span>
                              ) : (
                                <span className="font-bold text-xs text-zinc-400">0 ฿</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-white/5/80 pt-3">
                          <div className="flex items-center">
                            {getStatusBadge(item.status || 'success')}
                          </div>
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="text-[11px] sm:text-xs font-bold text-zinc-700 bg-[#121820] px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1 active:scale-95"
                          >
                            ดูรายละเอียด <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#0B0F14] border border-white/10 shadow-sm rounded-[1.5rem] flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-zinc-200" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">ยังไม่มีประวัติ</h3>
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

      {/* Stunning Receipt-Style Modal */}
      <ReceiptModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </div>
    </AnimatedScroll>
  );
};
