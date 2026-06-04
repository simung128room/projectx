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
        return <span className="bg-primary text-primary-foreground text-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-primary text-primary-foreground"></div>สำเร็จ</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-amber-100 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-amber-500"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-primary text-primary-foreground text-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-border border-2 flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-card brut-card"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-card text-muted-foreground px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-border border-2 flex items-center gap-1.5 brut-card"><div className="w-1.5 h-1.5 bg-zinc-400"></div>{status || 'สำเร็จ'}</span>;
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
        <div className="bg-card border border-border border-2 p-4 transition-all hover:border-white/20 flex flex-col gap-4 mx-1 brut-card">
          <div className="flex gap-4 items-center w-full">
            <div className={`w-14 h-14 shrink-0 flex items-center justify-center ${item.bg} ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            
            <div className="flex flex-col flex-1 min-w-0 justify-center">
              <h3 className="text-white font-bold text-sm sm:text-base truncate">{item.title}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-medium text-muted-foreground">{new Date(item.date).toLocaleDateString('th-TH')}</span>
                {item.money !== 0 ? (
                  <span className={`font-bold font-mono text-xs sm:text-sm ${item.money > 0 ? 'text-blue-500' : 'text-[#2563EB]'}`}>
                    {item.money > 0 ? '+' : ''}{item.money} ฿
                  </span>
                ) : (
                  <span className="font-bold text-xs text-muted-foreground">0 ฿</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-white/10/80 pt-3">
            <div className="flex items-center">
              {getStatusBadge(item.status || 'success')}
            </div>
            <button 
              onClick={() => setSelectedItem(item)}
              className="text-[11px] sm:text-xs font-bold text-muted-foreground bg-card px-4 py-2 hover:bg-zinc-200 transition-colors flex items-center gap-1 active:scale-95 brut-card"
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
            <div className="bg-card border border-border border-2 overflow-hidden mb-6 brut-card">
              <div className="p-6 md:p-8 border-b border-border border-2 bg-card brut-card">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary text-primary-foreground text-blue-600">
                    <History className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-none mb-1">ประวัติสั่งซื้อ</h2>
                    <p className="text-xs font-medium text-muted-foreground">เลือกหมวดหมู่ที่ต้องการตรวจสอบ</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-card brut-card">
                <div className="grid grid-cols-1 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCurrentCategory(cat.id)}
                      className="group flex items-center justify-between p-4 bg-card border border-border border-2 hover:border-[#3B82F6]/30 brut-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 flex items-center justify-center ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform`}>
                          <cat.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{cat.title}</h3>
                          <p className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-tight">{cat.subtitle}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-[#2563EB] transition-colors" />
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
            <div className="bg-card border border-border border-2 overflow-hidden brut-card">
              <div className="p-6 md:p-8 border-b border-border border-2 bg-card flex items-center justify-between brut-card">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setCurrentCategory(null)}
                    className="p-2.5 bg-card border border-border border-2 text-muted-foreground hover:bg-[#121212] hover:text-white transition-colors mr-2 brut-card"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className={`p-2.5 ${currentCategoryInfo?.bg} ${currentCategoryInfo?.color}`}>
                    {currentCategoryInfo && <currentCategoryInfo.icon className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none mb-1">{currentCategoryInfo?.title}</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">{currentCategoryInfo?.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 bg-card min-h-[400px] brut-card">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-card border border-border border-2 p-4 flex flex-col gap-4 brut-card">
                        <div className="flex gap-4 items-center">
                          <Skeleton className="w-14 h-14" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-4 w-1/4" />
                          </div>
                        </div>
                        <div className="pt-3 border-t border-border border-2 flex justify-between">
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
                    <div className="w-16 h-16 bg-card border border-border border-2 flex items-center justify-center mb-4 brut-card">
                      <History className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">ยังไม่มีประวัติ</h3>
                    <p className="text-xs font-medium text-muted-foreground">ยังไม่พบข้อมูลในหมวดหมู่นี้</p>
                    <button 
                      onClick={() => setCurrentCategory(null)}
                      className="mt-6 px-6 py-2 bg-card text-white text-xs font-bold hover:bg-[#1e1e1e] transition-colors brut-card"
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
