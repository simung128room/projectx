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
      color: 'text-blue-600'
    },
    {
      id: 'topup_gift',
      title: 'ประวัติการเติมเงิน (อังเปา)',
      subtitle: 'True Money Wallet Gift History',
      icon: Gift,
      bg: 'bg-purple-600/10',
      color: 'text-[#2563EB]'
    },
    {
      id: 'topup_slip',
      title: 'ประวัติการเติมเงิน (ธนาคาร)',
      subtitle: 'Bank Slip History',
      icon: CreditCard,
      bg: 'bg-emerald-50',
      color: 'text-blue-500'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="bg-blue-600/10 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-purple-600/10 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gray-200 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400"></div>{status || 'สำเร็จ'}</span>;
    }
  };

  const getFilteredData = (categoryId: string) => {
    switch(categoryId) {
      case 'normal_product':
        return purchaseHistory.filter(p => !p.is_special).map(p => ({ ...p, type: 'normal_product', title: p.productName || 'ซื้อสินค้า', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'special_product':
        return purchaseHistory.filter(p => p.is_special).map(p => ({ ...p, type: 'special_product', title: p.productName || 'สินค้าพิเศษ', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'topup_gift':
        return topupHistory.filter(t => t.method?.toLowerCase().includes('gift') || t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_gift', title: 'TrueMoney Wallet (อังเปา)', icon: Gift, color: 'text-[#2563EB]', bg: 'bg-purple-600/10', money: t.amount, date: t.date || t.timestamp }));
      case 'topup_slip':
        return topupHistory.filter(t => !t.method?.toLowerCase().includes('gift') && !t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_slip', title: 'ธนาคาร เช็คสลิป', icon: CreditCard, color: 'text-blue-500', bg: 'bg-emerald-50', money: t.amount, date: t.date || t.timestamp }));
      case 'key_usage':
        return usedKeysHistory.map(k => ({ ...k, type: 'key_usage', title: 'ใช้งานคีย์', icon: Key, color: 'text-blue-600', bg: 'bg-purple-50', money: 0, date: k.used_at || k.date || new Date().toISOString(), productName: k.key || k.code }));
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
        <div className="bg-[#0B0D0F] rounded-xl border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-md hover:shadow-black/5 flex flex-col gap-4 mx-1">
          <div className="flex gap-4 items-center w-full">
            <div className={`w-14 h-14 shrink-0 rounded-[1.25rem] flex items-center justify-center ${item.bg} ${item.color} shadow-inner`}>
              <item.icon className="w-6 h-6" />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <h3 className="text-gray-900 font-bold text-sm sm:text-base truncate">{item.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-medium text-gray-500">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                {item.money !== 0 ? (
                  <span className={`font-bold font-mono text-xs sm:text-sm ${item.money > 0 ? 'text-blue-500' : 'text-[#2563EB]'}`}>
                    {item.money > 0 ? '+' : ''}{item.money} ฿
                  </span>
                ) : (
                  <span className="font-bold text-xs text-gray-600">0 ฿</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-gray-200/80 pt-3">
            <div className="flex items-center">
              {getStatusBadge(item.status || 'success')}
            </div>
            <button 
              onClick={() => setSelectedItem(item)}
              className="text-[11px] sm:text-xs font-bold text-gray-600 bg-gray-100 px-4 py-2 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-1 active:scale-95"
            >
              ดูรายละเอียด <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="bg-[#0B0D0F] rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
              <div className="p-6 md:p-8 border-b border-gray-200 bg-gray-100/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-600/20 text-blue-600 rounded-xl">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 leading-none mb-1">ประวัติสั่งซื้อ</h2>
                    <p className="text-xs font-medium text-gray-500">เลือกหมวดหมู่ที่ต้องการตรวจสอบ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-gray-100/20">
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="group flex items-center justify-between p-4 bg-[#0B0D0F] border border-gray-200 rounded-xl hover:border-[#3B82F6]/30 hover:shadow-md hover:shadow-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-medium text-gray-600 uppercase tracking-tight">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-[#2563EB] transition-colors" />
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
            <div className="bg-[#0B0D0F] rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-gray-200 bg-gray-100/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-[#0B0D0F] border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors mr-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-2.5 ${currentCategoryInfo?.bg} ${currentCategoryInfo?.color} rounded-xl`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-gray-100/30 min-h-[400px]">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#0B0D0F] rounded-xl border border-gray-200 p-4 flex flex-col gap-4">
                        <div className="flex gap-4 items-center">
                          <Skeleton className="w-14 h-14 rounded-[1.25rem]" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-gray-200 flex justify-between">
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-8 w-24 rounded-xl" />
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
                    <div className="w-16 h-16 bg-[#0B0D0F] border border-gray-200 shadow-sm rounded-xl flex items-center justify-center mb-4">
                      <History className="w-8 h-8 text-gray-800" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-1">ยังไม่มีประวัติ</h3>
                    <p className="text-xs font-medium text-gray-500">ยังไม่พบข้อมูลในหมวดหมู่นี้</p>
                    <button 
                      onClick={() => setCurrentCategory(null)}
                      className="mt-6 px-6 py-2 bg-gray-50 text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
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
