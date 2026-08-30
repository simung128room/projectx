import React, { useState } from 'react';
import { 
  Eye, 
  Package, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  Info,
  ShoppingCart,
  Star,
  Gift,
  CreditCard,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './modals/ReceiptModal';

interface MyOrdersViewProps {
  purchaseHistory?: any[];
  topupHistory?: any[];
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ 
  purchaseHistory = [], 
  topupHistory = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'normal' | 'special' | 'angpao' | 'slip'>('normal');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Filter histories based on rules
  const normalPurchases = purchaseHistory.filter(p => !p.is_special);
  const specialPurchases = purchaseHistory.filter(p => p.is_special || p.isPreOrder || p.isPreorder || p.status?.toLowerCase() === 'preorder');
  
  const angpaoTopups = topupHistory.filter(t => 
    t.method?.toLowerCase().includes('gift') || 
    t.method?.toLowerCase().includes('อั่งเปา') || 
    t.method?.toLowerCase().includes('truewallet')
  );
  
  const slipTopups = topupHistory.filter(t => 
    !t.method?.toLowerCase().includes('gift') && 
    !t.method?.toLowerCase().includes('อั่งเปา') && 
    !t.method?.toLowerCase().includes('truewallet')
  );

  const getActiveList = () => {
    switch (activeTab) {
      case 'normal':
        return normalPurchases.map(p => ({
          ...p,
          type: 'normal_product',
          displayTitle: p.productName || 'ซื้อสินค้าทั่วไป',
          displayPrice: p.price || p.money || 0,
          isExpense: true,
          icon: ShoppingCart,
          colorClass: 'text-[#3b82f6] bg-[#3b82f6]/10 border-blue-500/10'
        }));
      case 'special':
        return specialPurchases.map(p => ({
          ...p,
          type: 'special_product',
          displayTitle: p.productName || 'ซื้อสินค้าพิเศษ',
          displayPrice: p.price || p.money || 0,
          isExpense: true,
          icon: Star,
          colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/10'
        }));
      case 'angpao':
        return angpaoTopups.map(t => ({
          ...t,
          type: 'topup_gift',
          displayTitle: t.title || 'เติมเงินซองของขวัญ (TrueMoney)',
          displayPrice: t.amount || t.money || 0,
          isExpense: false,
          icon: Gift,
          colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/10'
        }));
      case 'slip':
        return slipTopups.map(t => ({
          ...t,
          type: 'topup_slip',
          displayTitle: t.title || 'เติมเงินแนบสลิปธนาคาร',
          displayPrice: t.amount || t.money || 0,
          isExpense: false,
          icon: CreditCard,
          colorClass: 'text-[#3b82f6] bg-[#3b82f6]/10 border-blue-500/10'
        }));
      default:
        return [];
    }
  };

  const currentList = getActiveList().sort((a, b) => {
    const timeA = new Date(a.date || a.timestamp || 0).getTime();
    const timeB = new Date(b.date || b.timestamp || 0).getTime();
    return timeB - timeA;
  });

  const getStatusBadge = (status: string, isPreOrder?: boolean) => {
    const finalStatus = status || (isPreOrder ? 'preorder' : 'success');
    switch (finalStatus?.toLowerCase()) {
      case 'success':
      case 'completed':
        return (
          <span className="bg-[#3b82f6]/10 text-[#3b82f6] px-3 py-1 text-[10px] font-semibold uppercase border border-blue-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></div>
            สำเร็จ
          </span>
        );
      case 'preorder':
        return (
          <span className="bg-[#3b82f6]/10 text-[#3b82f6] px-3 py-1 text-[10px] font-semibold uppercase border border-blue-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full "></div>
            พรีออเดอร์
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-500/10 text-amber-400 px-3 py-1 text-[10px] font-semibold uppercase border border-amber-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full "></div>
            รอดำเนินการ
          </span>
        );
      case 'failed':
        return (
          <span className="bg-rose-500/10 text-rose-400 px-3 py-1 text-[10px] font-semibold uppercase border border-rose-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
            ล้มเหลว
          </span>
        );
      default:
        return (
          <span className="bg-[#3b82f6]/10 text-[#3b82f6] px-3 py-1 text-[10px] font-semibold uppercase border border-blue-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#3b82f6] rounded-full"></div>
            สำเร็จ
          </span>
        );
    }
  };

  const formatDate = (dateString: string | number) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    } catch {
      return String(dateString);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 select-none">
      
      {/* Header Panel */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5 bg-[#1c1c1e]/40 backdrop-blur-2xl border border-white/[0.05] p-6 rounded-[28px] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3b82f6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 rounded-[16px] bg-[#3b82f6]/15 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6 text-[#3b82f6]" />
            </div>
            ประวัติการสั่งซื้อและเติมเงิน
          </h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium ml-1">
            ข้อมูลการซื้อสินค้า คีย์พรีเมี่ยม และรายรับ-รายจ่าย ทั้งหมดในบัญชีของคุณ
          </p>
        </div>
        <div className="bg-[#2c2c2e]/60 border border-white/[0.05] rounded-full px-5 py-2.5 flex items-center gap-2 max-w-max relative z-10 shadow-sm shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#3b82f6]" />
          <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider">
            บล็อกเชนเกตเวย์ความปลอดภัยสูง
          </span>
        </div>
      </div>

      {/* Tabs navigation - Horizontal grid cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { id: 'normal', label: 'ซื้อสินค้าทั่วไป', count: normalPurchases.length, icon: ShoppingCart, color: 'text-[#3b82f6]', bgInfo: 'bg-[#3b82f6]' },
          { id: 'special', label: 'ซื้อสินค้าพิเศษ', count: specialPurchases.length, icon: Star, color: 'text-amber-400', bgInfo: 'bg-amber-400' },
          { id: 'angpao', label: 'เติมเงินซองอั่งเปา', count: angpaoTopups.length, icon: Gift, color: 'text-rose-400', bgInfo: 'bg-rose-400' },
          { id: 'slip', label: 'เติมเงินแนบสลิป', count: slipTopups.length, icon: CreditCard, color: 'text-[#0ea5e9]', bgInfo: 'bg-[#0ea5e9]' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-5 rounded-[24px] border text-left flex flex-col justify-between transition-all duration-300 relative overflow-hidden group cursor-pointer shadow-md ${
                isActive 
                  ? 'bg-[#2c2c2e]/80 border-white/[0.1] shadow-lg scale-[1.02]' 
                  : 'bg-[#1c1c1e]/40 border-white/[0.02] hover:bg-[#2c2c2e]/50 hover:border-white/[0.05]'
              }`}
            >
              {/* Highlight blur */}
              {isActive && (
                <div className={`absolute -top-10 -right-10 w-24 h-24 ${tab.bgInfo}/20 rounded-full blur-2xl pointer-events-none`} />
              )}
              <div className="flex items-center justify-between relative z-10">
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${isActive ? `${tab.bgInfo}/20` : 'bg-card/[0.05]'} transition-colors`}>
                  <Icon className={`w-5 h-5 ${tab.color} ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform`} />
                </div>
                <span className="text-xs font-bold font-mono text-muted-foreground bg-black/30 px-3 py-1 rounded-full border border-white/[0.05]">
                  {tab.count}
                </span>
              </div>
              <span className={`text-sm font-bold mt-4 transition-colors relative z-10 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-zinc-200'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Container of Horizontal Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="space-y-4"
          >
            {currentList.length === 0 ? (
              <div className="border border-white/[0.02] bg-[#1c1c1e]/40 backdrop-blur-xl rounded-[28px] py-16 px-4 text-center shadow-lg">
                <div className="w-20 h-20 bg-card/[0.02] rounded-[24px] flex items-center justify-center mx-auto mb-5 shadow-inner">
                  <ShoppingBag className="w-10 h-10 text-zinc-600 stroke-[1.5px]" />
                </div>
                <p className="font-bold text-gray-700 text-lg">ไม่พบประวัติการทำรายการ</p>
                <p className="text-sm text-muted-foreground mt-2 font-medium">คุณยังไม่มีการทำรายการในหมวดหมู่นี้</p>
              </div>
            ) : (
              currentList.map((item, idx) => {
                const Icon = item.icon;
                const dateStr = formatDate(item.date || item.timestamp);
                const displayId = item.id ? item.id.substring(0, 8).toUpperCase() : `BILL-${idx + 1}`;
                const isPre = !!(item.isPreOrder || item.isPreorder);
                const status = item.status || (isPre ? 'preorder' : 'success');

                return (
                  <div
                    key={item.id || idx}
                    className="group bg-[#1c1c1e]/40 backdrop-blur-md border border-white/[0.03] hover:border-white/[0.08] hover:bg-[#2c2c2e]/60 rounded-[24px] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-all duration-300 shadow-md hover:shadow-xl relative overflow-hidden"
                  >
                    {/* Horizontal Card Main Body */}
                    <div className="flex items-center gap-5 min-w-0 flex-1">
                      {/* Left Icon Block */}
                      <div className={`w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-inner border border-white/[0.05] ${item.colorClass}`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      {/* Middle Texts */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-foreground truncate max-w-[220px] sm:max-w-md tracking-tight">
                            {item.displayTitle}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-muted-foreground">
                            <span>ID:</span>
                            <span className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md border border-white/[0.05]">{displayId}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Price details and Status badges */}
                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/[0.05] pt-4 md:pt-0 shrink-0">
                      <div className="flex flex-col md:items-end gap-1.5">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                          {item.isExpense ? 'ยอดชำระสุทธิ' : 'ยอดเติมเงิน'}
                        </div>
                        <span className={`text-lg font-bold font-mono tracking-tight ${
                          item.isExpense ? 'text-rose-400' : 'text-[#3b82f6]'
                        }`}>
                          {item.isExpense ? '-' : '+'}{Math.floor(item.displayPrice).toLocaleString()} ฿
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        {getStatusBadge(status, isPre)}
                        
                        {/* Action trigger receipt detail modal */}
                        <button
                          onClick={() => setSelectedItem({
                            ...item,
                            isPreOrder: isPre,
                            productName: item.displayTitle,
                            date: item.date || item.timestamp,
                            key: item.displayTitle,
                            secretData: item.secretData || item.key || item.code || 'อยู่ระหว่างการประมวลผลระบบ...',
                          })}
                          className="w-10 h-10 rounded-[14px] bg-card/[0.05] hover:bg-[#3b82f6] hover:text-foreground hover:scale-105 active:scale-95 text-muted-foreground flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
                          title="ดูบิลฉบับเต็ม"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Info notification */}
      {activeTab === 'special' && (
        <div className="mt-8 bg-amber-500/10 border border-amber-500/20 backdrop-blur-xl rounded-[24px] p-5 flex gap-4 items-start shadow-md">
          <Info className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-amber-400">ข้อตกลงเกี่ยวกับการส่งมอบสินค้าพิเศษและแรนดอม</p>
            <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
              ออเดอร์สินค้าพิเศษจะถูกเตรียมรหัสอัตโนมัติภายใน 5-15 นาที ท่านสามารถกดปุ่มรูปดวงตาด้านหลังรายการเพื่อแสดงข้อมูลรหัสไอดี, คีย์กิฟท์การ์ด, หรือลิงก์รับสินค้าได้ทันทีเมื่อสถานะเปลี่ยนเป็น สำเร็จ
            </p>
          </div>
        </div>
      )}

      {/* Full dynamic invoice receipt modal */}
      <AnimatePresence>
        {selectedItem && (
          <ReceiptModal
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
