import React, { useState, useEffect } from 'react';
import { ShoppingCart, Key, CreditCard, Gift, Star, History, ChevronRight, ChevronLeft } from 'lucide-react';
import { ReceiptModal } from './modals/ReceiptModal';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';
import { Skeleton } from './ui/Skeleton';
import { FixedSizeList as List } from 'react-window';

interface HistoryViewProps {
  purchaseHistory?: any[];
  topupHistory?: any[];
  usedKeysHistory?: any[];
  defaultTab?: string | null;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ purchaseHistory = [], topupHistory = [], usedKeysHistory = [], defaultTab = null }) => {
  const [currentCategory, setCurrentCategory] = useState<string | null>(defaultTab);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentCategory) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 150);
      return () => clearTimeout(timer);
    }
  }, [currentCategory]);

  const categories = [
    {
      id: 'special_product',
      title: 'ประวัติการสุ่มสินค้า',
      subtitle: 'Random Item History',
      icon: Star,
      bg: 'bg-amber-50 border border-amber-100 shadow-sm',
      color: 'text-amber-600'
    },
    {
      id: 'normal_product',
      title: 'ประวัติการซื้อสินค้าทั่วไป',
      subtitle: 'Shop History',
      icon: ShoppingCart,
      bg: 'bg-blue-50 border border-blue-100 shadow-sm',
      color: 'text-blue-600'
    },
    {
      id: 'key_usage',
      title: 'ประวัติการใช้คีย์',
      subtitle: 'Key Usage History',
      icon: Key,
      bg: 'bg-indigo-50 border border-indigo-100 shadow-sm',
      color: 'text-indigo-600'
    },
    {
      id: 'topup_gift',
      title: 'ประวัติการเติมเงิน (อั่งเปา)',
      subtitle: 'True Money Wallet Gift History',
      icon: Gift,
      bg: 'bg-rose-50 border border-rose-100 shadow-sm',
      color: 'text-rose-600'
    },
    {
      id: 'topup_slip',
      title: 'ประวัติการเติมเงิน (ธนาคาร)',
      subtitle: 'Bank Slip History',
      icon: CreditCard,
      bg: 'bg-emerald-50 border border-emerald-100 shadow-sm',
      color: 'text-emerald-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="bg-emerald-50 text-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 rounded-lg flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-50 text-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-amber-100 rounded-lg flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-red-50 text-red-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-red-100 rounded-lg flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-slate-50 text-zinc-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-slate-200 rounded-lg flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-[#cbd5e1] rounded-full"></div>{status || 'สำเร็จ'}</span>;
    }
  };

  const getFilteredData = (categoryId: string) => {
    switch(categoryId) {
      case 'normal_product':
        return purchaseHistory.filter(p => !p.is_special).map(p => ({ ...p, type: 'normal_product', title: p.productName || 'ซื้อสินค้า', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-100 shadow-sm', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'special_product':
        return purchaseHistory.filter(p => p.is_special).map(p => ({ ...p, type: 'special_product', title: p.productName || 'สินค้าพิเศษ', icon: Star, color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-105 shadow-sm', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'topup_gift':
        return topupHistory.filter(t => t.method?.toLowerCase().includes('gift') || t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_gift', title: 'TrueMoney Wallet (อั่งเปา)', icon: Gift, color: 'text-rose-600', bg: 'bg-rose-50 border border-rose-100 shadow-sm', money: t.amount, date: t.date || t.timestamp }));
      case 'topup_slip':
        return topupHistory.filter(t => !t.method?.toLowerCase().includes('gift') && !t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_slip', title: 'ธนาคาร เช็คสลิป', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-100 shadow-sm', money: t.amount, date: t.date || t.timestamp }));
      case 'key_usage':
        return usedKeysHistory.map(k => ({ ...k, type: 'key_usage', title: 'เปิดใช้งานคีย์', icon: Key, color: 'text-indigo-600', bg: 'bg-indigo-50 border border-indigo-100 shadow-sm', money: 0, date: k.used_at || k.date || new Date().toISOString(), productName: k.key || k.code }));
      default:
        return [];
    }
  };

  const currentCategoryData = currentCategory ? getFilteredData(currentCategory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [];
  const currentCategoryInfo = categories.find(c => c.id === currentCategory);

  const Row = ({ index, style }: { index: number, style: React.CSSProperties }) => {
    const item = currentCategoryData[index];
    if (!item) return null;
    
    return (
      <div style={{ ...style, paddingTop: '12px' }}>
        <div className="bg-white border border-zinc-200 p-5 transition-all hover:shadow-md hover:border-zinc-350 flex flex-col gap-4 mx-1 rounded-2xl shadow-sm">
          <div className="flex gap-4 items-center w-full">
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <h3 className="text-zinc-900 font-bold text-sm sm:text-base truncate tracking-wide">{item.title}</h3>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs font-bold text-zinc-400">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                {item.money !== 0 ? (
                  <span className={`font-extrabold font-mono text-sm sm:text-base ${item.money > 0 ? 'text-emerald-605' : 'text-rose-600'}`}>
                    {item.money > 0 ? '+' : ''}{item.money} ฿
                  </span>
                ) : (
                  <span className="font-bold text-xs text-zinc-400">0 ฿</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
            <div className="flex items-center">
              {getStatusBadge(item.status || 'success')}
            </div>
            <button 
              onClick={() => setSelectedItem(item)}
              className="text-[11px] sm:text-xs font-bold text-zinc-700 bg-white px-4 py-2 hover:bg-slate-50 hover:text-zinc-900 transition-all flex items-center gap-1 active:scale-95 border border-zinc-200 rounded-xl cursor-pointer shadow-sm"
            >
              ดูรายละเอียด <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="w-full max-w-6xl mx-auto mt-6 font-sans px-4 pb-12 text-zinc-805">
        <AnimatePresence mode="wait">
        {!currentCategory ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-white border border-zinc-200 overflow-hidden mb-6 rounded-3xl shadow-sm">
              <div className="p-6 md:p-8 border-b border-zinc-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 shadow-sm flex items-center justify-center shrink-0">
                    <History className="w-6 h-6 " />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 leading-none mb-1.5">ประวัติสั่งซื้อ</h2>
                    <p className="text-xs font-semibold text-zinc-400">เลือกหมวดหมู่ที่ต้องการตรวจสอบ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-transparent">
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="group flex items-center justify-between p-4 bg-white border border-zinc-200 hover:border-blue-400 rounded-2xl cursor-pointer hover:-translate-y-0.5 transition-all duration-150 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all ${cat.bg}`}>
                          <cat.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${cat.color}`} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-bold text-zinc-900 tracking-wide group-hover:text-blue-600 transition-colors">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-tight mt-0.5">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-blue-605 transition-colors" />
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
            <div className="bg-white border border-zinc-200 overflow-hidden rounded-3xl shadow-sm">
              <div className="p-4 sm:p-6 border-b border-zinc-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-white border border-zinc-200 text-zinc-600 hover:bg-slate-50 hover:text-zinc-900 transition-all mr-2 rounded-xl cursor-pointer shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${currentCategoryInfo?.bg}`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className={`w-6 h-6 ${currentCategoryInfo?.color}`} />}
                  </div>
                  <div className="text-left pl-1">
                    <h2 className="text-sm sm:text-base font-extrabold text-zinc-900 leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-transparent min-h-[400px]">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white border border-zinc-200 p-5 flex flex-col gap-4 rounded-2xl shadow-sm">
                        <div className="flex gap-4 items-center">
                          <Skeleton className="w-14 h-14 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-zinc-100 flex justify-between">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentCategoryData.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <List
                        height={600}
                        itemCount={currentCategoryData.length}
                        itemSize={165}
                        width="100%"
                        className="scrollbar-hide"
                    >
                        {Row}
                    </List>
                  </div>
                ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 border border-zinc-200 flex items-center justify-center mb-4 rounded-full">
                      <History className="w-8 h-8 text-zinc-400 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <h3 className="text-base font-extrabold text-zinc-900 mb-1">ยังไม่มีประวัติ</h3>
                    <p className="text-xs font-bold text-zinc-400">ยังไม่พบข้อมูลในหมวดหมู่นี้</p>
                    <button 
                      onClick={() => setCurrentCategory(null)}
                      className="mt-6 px-6 py-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-700 text-xs font-bold hover:bg-slate-50 hover:text-zinc-900 transition-all cursor-pointer shadow-sm"
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

        <ReceiptModal selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </div>
    </AnimatedScroll>
  );
};
