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
          colorClass: 'text-[#10b981] bg-[#10b981]/10 border-emerald-500/10'
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
          colorClass: 'text-[#10b981] bg-[#10b981]/10 border-emerald-500/10'
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
          <span className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 text-[10px] font-semibold uppercase border border-emerald-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
            สำเร็จ
          </span>
        );
      case 'preorder':
        return (
          <span className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 text-[10px] font-semibold uppercase border border-emerald-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full "></div>
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
          <span className="bg-[#10b981]/10 text-[#10b981] px-3 py-1 text-[10px] font-semibold uppercase border border-emerald-500/20 rounded-md flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#10b981] rounded-full"></div>
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8 select-none">
      
      {/* Header Panel */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-white flex items-center gap-3 tracking-tight">
            <Receipt className="w-8 h-8 text-neon-green" />
            ประวัติการสั่งซื้อและเติมเงิน
          </h1>
          <p className="text-xs text-zinc-400 mt-2 font-medium">
            ข้อมูลการซื้อสินค้า คีย์พรีเมี่ยม และรายรับ-รายจ่าย ทั้งหมดในบัญชีของคุณ
          </p>
        </div>
        <div className="bg-[#0b0b0c] border border-white/[0.04] rounded-md px-4 py-2.5 flex items-center gap-2 max-w-max">
          <ShieldCheck className="w-4 h-4 text-neon-green" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            บล็อกเชนเกตเวย์ความปลอดภัยสูง
          </span>
        </div>
      </div>

      {/* Tabs navigation - Horizontal grid cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { id: 'normal', label: 'ซื้อสินค้าทั่วไป', count: normalPurchases.length, icon: ShoppingCart, color: 'text-[#10b981]' },
          { id: 'special', label: 'ซื้อสินค้าพิเศษ', count: specialPurchases.length, icon: Star, color: 'text-amber-400' },
          { id: 'angpao', label: 'เติมเงินซองอั่งเปา', count: angpaoTopups.length, icon: Gift, color: 'text-rose-400' },
          { id: 'slip', label: 'เติมเงินแนบสลิป', count: slipTopups.length, icon: CreditCard, color: 'text-[#10b981]' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-md border text-left flex flex-col justify-between transition-all relative overflow-hidden group cursor-pointer ${
                isActive 
                  ? 'bg-white/[0.06] border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                  : 'bg-[#000000] border-zinc-850 hover:bg-white/[0.04] hover:border-zinc-800'
              }`}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-neon-green " />
              )}
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${tab.color} ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-all`} />
                <span className="text-[10px] font-mono font-bold text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.04]">
                  {tab.count} รายการ
                </span>
              </div>
              <span className={`text-[11px] sm:text-xs font-semibold mt-4 transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Container of Horizontal Cards */}
      <div className="space-y-3.5">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {currentList.length === 0 ? (
              <div className="border border-zinc-850 bg-[#000000] rounded-md py-16 px-4 text-center">
                <ShoppingBag className="w-12 h-12 text-zinc-700 stroke-[1.5px] mx-auto mb-4" />
                <p className="font-bold text-zinc-400 text-sm">ไม่พบประวัติการทำรายการ</p>
                <p className="text-[11px] text-zinc-650 mt-1">คุณยังไม่มีการทำราการในหมวดหมู่นี้</p>
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
                    className="group bg-[#000000] border border-zinc-850 hover:border-zinc-800 rounded-md p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 shadow-sm hover:shadow-md relative overflow-hidden"
                  >
                    {/* Horizontal Card Main Body */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Left Icon Block */}
                      <div className={`w-12 h-12 rounded-md border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 ${item.colorClass}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Middle Texts */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs sm:text-sm font-semibold text-white truncate max-w-[220px] sm:max-w-md">
                            {item.displayTitle}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-3.5 mt-1.5 flex-wrap">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-zinc-500">
                            <span>บิลไอดี:</span>
                            <span className="text-zinc-400">{displayId}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-550">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{dateStr}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Price details and Status badges */}
                    <div className="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-white/[0.04] pt-3 md:pt-0 shrink-0">
                      <div className="flex flex-col md:items-end gap-1">
                        <div className="text-[9px] text-zinc-650 font-semibold uppercase tracking-wider">
                          {item.isExpense ? 'ยอดชำระสุทธิ' : 'ยอดเติมเงิน'}
                        </div>
                        <span className={`text-sm font-semibold font-mono tracking-tight ${
                          item.isExpense ? 'text-rose-400' : 'text-[#10b981]'
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
                          className="w-8 h-8 rounded-md bg-white/[0.06] hover:bg-neon-green hover:text-black border border-white/[0.06] text-zinc-400 flex items-center justify-center transition-all duration-200 cursor-pointer"
                          title="ดูบิลฉบับเต็ม"
                        >
                          <Eye className="w-4 h-4" />
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
        <div className="mt-6 bg-[#000000] border border-zinc-850 rounded-md p-4 flex gap-3.5 items-start">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-zinc-200">ข้อตกลงเกี่ยวกับการส่งมอบสินค้าพิเศษและแรนดอม</p>
            <p className="text-[10px] sm:text-[11px] text-zinc-500 leading-relaxed font-semibold">
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
