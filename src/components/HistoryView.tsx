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
      bg: 'bg-amber-500/10 border border-amber-500/20',
      color: 'text-amber-400'
    },
    {
      id: 'normal_product',
      title: 'ประวัติการซื้อสินค้าทั่วไป',
      subtitle: 'Shop History',
      icon: ShoppingCart,
      bg: 'bg-[#00e676]/10 border border-emerald-500/20',
      color: 'text-[#00e676]'
    },
    {
      id: 'key_usage',
      title: 'ประวัติการใช้คีย์',
      subtitle: 'Key Usage History',
      icon: Key,
      bg: 'bg-zinc-500/10 border border-[#1e1e1e]/20',
      color: 'text-zinc-400'
    },
    {
      id: 'topup_gift',
      title: 'ประวัติการเติมเงิน (อั่งเปา)',
      subtitle: 'True Money Wallet Gift History',
      icon: Gift,
      bg: 'bg-red-500/10 border border-red-500/20',
      color: 'text-red-400'
    },
    {
      id: 'topup_slip',
      title: 'ประวัติการเติมเงิน (ธนาคาร)',
      subtitle: 'Bank Slip History',
      icon: CreditCard,
      bg: 'bg-[#00e676]/10 border border-emerald-500/20',
      color: 'text-[#00e676]'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'success':
        return <span className="bg-neon-green/10 text-neon-green px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-neon-green/20 rounded-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-neon-green rounded-full"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-500 px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-amber-500/20 rounded-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full "></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-red-500/10 text-red-400 px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-red-500/20 rounded-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-[#050505] text-zinc-400 px-3 py-1 text-[10px] font-medium uppercase tracking-widest border border-[#1e1e1e] rounded-md flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></div>{status || 'สำเร็จ'}</span>;
    }
  };

  const getFilteredData = (categoryId: string) => {
    switch(categoryId) {
      case 'normal_product':
        return purchaseHistory.filter(p => !p.is_special).map(p => ({ ...p, type: 'normal_product', title: p.productName || 'ซื้อสินค้า', icon: ShoppingCart, color: 'text-[#00e676]', bg: 'bg-[#00e676]/10 border border-emerald-500/20', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'special_product':
        return purchaseHistory.filter(p => p.is_special).map(p => ({ ...p, type: 'special_product', title: p.productName || 'สินค้าพิเศษ', icon: Star, color: 'text-amber-400', bg: 'bg-amber-505/10 border border-amber-505/20', money: -(p.price || 0), date: p.date || p.timestamp }));
      case 'topup_gift':
        return topupHistory.filter(t => t.method?.toLowerCase().includes('gift') || t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_gift', title: 'TrueMoney Wallet (อังเปา)', icon: Gift, color: 'text-red-400', bg: 'bg-red-505/10 border border-red-550/20', money: t.amount, date: t.date || t.timestamp }));
      case 'topup_slip':
        return topupHistory.filter(t => !t.method?.toLowerCase().includes('gift') && !t.method?.toLowerCase().includes('อั่งเปา')).map(t => ({ ...t, type: 'topup_slip', title: 'ธนาคาร เช็คสลิป', icon: CreditCard, color: 'text-[#00e676]', bg: 'bg-cyan-505/10 border border-cyan-550/20', money: t.amount, date: t.date || t.timestamp }));
      case 'key_usage':
        return usedKeysHistory.map(k => ({ ...k, type: 'key_usage', title: 'เปิดใช้งานคีย์', icon: Key, color: 'text-zinc-400', bg: 'bg-purple-505/10 border border-purple-550/20', money: 0, date: k.used_at || k.date || new Date().toISOString(), productName: k.key || k.code }));
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
        <div className="bg-[#0b0b0c] border border-[#1e1e1e] p-4 transition-all hover:border-[#1e1e1e] flex flex-col gap-4 mx-1 rounded-md shadow-sm">
          <div className="flex gap-4 items-center w-full">
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-md ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <h3 className="text-white font-medium text-sm sm:text-base truncate tracking-wide">{item.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-semibold text-zinc-400">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                {item.money !== 0 ? (
                  <span className={`font-semibold font-mono text-sm sm:text-base ${item.money > 0 ? 'text-neon-green' : 'text-rose-500'}`}>
                    {item.money > 0 ? '+' : ''}{item.money} ฿
                  </span>
                ) : (
                  <span className="font-medium text-xs text-zinc-500">0 ฿</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-[#1e1e1e]/80 pt-3">
            <div className="flex items-center">
              {getStatusBadge(item.status || 'success')}
            </div>
            <button 
              onClick={() => setSelectedItem(item)}
              className="text-[11px] sm:text-xs font-medium text-zinc-300 bg-[#050505] px-4 py-2 hover:bg-[#0a0a0a] transition-all flex items-center gap-1 active:scale-95 border border-[#1e1e1e] rounded-md cursor-pointer"
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
            <div className="bg-[#070708] border border-[#1e1e1e] overflow-hidden mb-6 rounded-md shadow-md">
              <div className="p-6 md:p-8 border-b border-[#1e1e1e] bg-[#09090a]">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-neon-green/10 text-neon-green rounded-md border border-neon-green/20">
                    <History className="w-6 h-6 " />
                  </div>
                  <div>
                    <h2 className="text-xl font-medium text-white leading-none mb-1.5">ประวัติสั่งซื้อ</h2>
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
                      className="group flex items-center justify-between p-4 bg-[#0a0a0b] border border-[#1e1e1e] hover:border-neon-green/30 rounded-md cursor-pointer hover:-translate-y-0.5 transition-all duration-150"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center rounded-md transition-all ${cat.bg}`}>
                          <cat.icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${cat.color}`} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-sm font-medium text-white tracking-wide group-hover:text-neon-green transition-colors">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-tight mt-0.5">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-neon-green transition-colors" />
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
            <div className="bg-[#070708] border border-[#1e1e1e] overflow-hidden rounded-md shadow-md">
              <div className="p-4 sm:p-6 border-b border-[#1e1e1e] bg-[#09090a] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-[#050505] border border-[#1e1e1e] text-zinc-400 hover:bg-[#0a0a0a] hover:text-white transition-all mr-2 rounded-md cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-3 rounded-md flex items-center justify-center shrink-0 ${currentCategoryInfo?.bg}`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className={`w-6 h-6 ${currentCategoryInfo?.color}`} />}
                  </div>
                  <div className="text-left pl-1">
                    <h2 className="text-sm sm:text-base font-medium text-white leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-transparent min-h-[400px]">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-[#0b0b0c] border border-[#1e1e1e] p-4 flex flex-col gap-4 rounded-md ">
                        <div className="flex gap-4 items-center">
                          <Skeleton className="w-14 h-14 rounded-md" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-[#1e1e1e] flex justify-between">
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
                    <div className="w-16 h-16 bg-[#0a0a0b] border border-zinc-850 flex items-center justify-center mb-4 rounded-full">
                      <History className="w-8 h-8 text-zinc-500 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <h3 className="text-base font-medium text-white mb-1">ยังไม่มีประวัติ</h3>
                    <p className="text-xs font-semibold text-zinc-500">ยังไม่พบข้อมูลในหมวดหมู่นี้</p>
                    <button 
                      onClick={() => setCurrentCategory(null)}
                      className="mt-6 px-6 py-2.5 bg-[#050505] border border-[#1e1e1e] rounded-md text-white text-xs font-medium hover:bg-[#0a0a0a] transition-colors cursor-pointer"
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
