import React, { useState } from 'react';
import { 
  History, 
  Key, 
  Activity, 
  ArrowRight, 
  Clock, 
  Monitor, 
  Wallet, 
  ShoppingCart, 
  Copy, 
  Check, 
  Package, 
  Crown, 
  X,
  Calendar,
  Layers,
  FileCheck2,
  Trash2,
  ChevronRight,
  Info,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';

interface HistoryLogsViewProps {
  usedKeysHistory?: any[];
  purchaseHistory?: any[];
  topupHistory?: any[];
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({ 
  usedKeysHistory = [], 
  purchaseHistory = [], 
  topupHistory = [] 
}) => {
  const [filter, setFilter] = useState<'key_purchase' | 'keys' | 'topup' | 'general_purchase' | 'special_purchase'>('key_purchase');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{details: any, type: string} | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกสำเร็จ!',
      showConfirmButton: false,
      timer: 1500,
      background: '#09090b',
      color: '#ffffff',
      customClass: {
        popup: 'border border-gray-200'
      }
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const keyPurchases = purchaseHistory.filter(p => p.productName.includes('คีย์'));
  const specialPurchases = purchaseHistory.filter(p => !p.productName.includes('คีย์') && p.price >= 500);
  const generalPurchases = purchaseHistory.filter(p => !p.productName.includes('คีย์') && p.price < 500);

  const StatusBadge = ({ status = 'SUCCESS' }: { status?: string }) => (
    <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-1 bg-[#3b82f6]/10 text-[#3b82f6] border border-#3b82f6/25 select-none font-mono">
      {status}
    </span>
  );

  const CopyBox = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center justify-between gap-3 bg-[#121214] border border-[#222225] py-2 px-3 w-full">
      <span className="font-mono text-gray-700 font-semibold text-xs truncate select-all">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-gray-500 hover:text-black transition-colors shrink-0 p-1 bg-gray-100 border border-gray-200 rounded hover:border-gray-300 cursor-pointer"
        title="คัดลอกโค้ด"
      >
        {copiedId === id ? <Check className="w-3.5 h-3.5 text-[#3b82f6]"/> : <Copy className="w-3.5 h-3.5"/>}
      </button>
    </div>
  );

  const DetailsModal = () => {
    const [showSecret, setShowSecret] = useState(false);
    if (!selectedItem) return null;
    const { details: item, type } = selectedItem;
    const isPurchase = ['key_purchase', 'general_purchase', 'special_purchase'].includes(type);

    if (isPurchase) {
      return (
        <div 
          className="fixed inset-0 bg-white/60 backdrop-blur-3xl saturate-150 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="bg-white border border-gray-200 w-full max-w-sm overflow-hidden relative shadow-2xl transition-all"
            onClick={e => e.stopPropagation()}
          >
            {/* Upper Decorative Cyber Lines */}
            <div className="h-1 bg-gradient-to-r from-#3b82f6 via-#3b82f6 to-[#7c3aed]" />
            
            {/* Header section designed as high quality digital receipt */}
            <div className="p-6 pb-4 relative">
              <button 
                onClick={() => setSelectedItem(null)} 
                className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors p-1 bg-gray-100 border border-gray-200 hover:border-zinc-750 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="text-[10px] font-mono font-black text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/10 px-2 py-0.5 border border-#3b82f6/20">
                DIGITAL RECEIPT
              </span>
              <h3 className="text-xl font-bold text-black mt-3.5 mb-1 tracking-tight">
                รายละเอียดคำสั่งซื้อ
              </h3>
              <p className="text-gray-600 text-xs font-mono">
                ID: <span className="text-[#3b82f6]">BILL-{item.id?.toUpperCase()}</span>
              </p>
            </div>

            {/* Receipt container content */}
            <div className="px-6 space-y-4">
              <div className="bg-[#121214] border border-[#222225] p-5 relative overflow-hidden">
                <div className="absolute top-4 right-4 w-12 h-12 bg-gray-100/40 rounded-full border border-gray-200 flex items-center justify-center pointer-events-none opacity-20">
                  <FileCheck2 className="w-5 h-5 text-black" />
                </div>
                
                <div className="flex justify-between items-center mb-3 relative z-10 text-xs font-medium">
                  <span className="text-gray-600 select-none">ทำรายการเมื่อวันที่</span>
                  <span className="text-zinc-200 font-mono">
                    {new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mb-3 relative z-10 text-xs font-medium">
                  <span className="text-gray-600 select-none">จำนวนจัดจำหน่าย</span>
                  <span className="text-zinc-200 font-mono">1 ชิ้น</span>
                </div>
                
                {/* Dashed separation line matching genuine digital tickets */}
                <div className="border-t border-dashed border-gray-200 my-4 relative z-10" />
                
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-xs font-bold text-gray-600 uppercase select-none">ยอดชำระสุทธิ</span>
                  <span className="text-lg font-bold text-[#3b82f6] font-mono">฿{item.price?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* Product item breakdown info */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-[#3b82f6] pl-0.5 select-none">ข้อมูลใบส่งมอบสินค้า</h4>
                <div className="bg-[#121214] border border-[#222225] p-4 flex flex-col gap-4">
                  <div className="flex gap-3.5 items-center">
                    <div className="w-12 h-12 bg-gray-100 border border-zinc-850 flex items-center justify-center shrink-0 text-gray-600">
                      <Package className="w-6 h-6 text-gray-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none block mb-1">ชื่อสล๊อตสินค้า</span>
                      <h5 className="font-semibold text-black text-xs sm:text-sm truncate leading-tight">
                        {item.productName}
                      </h5>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    className="w-full py-2 bg-gray-100 hover:bg-zinc-850 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    {showSecret ? 'ซ่อนกุญแจความลับ' : 'เปิดข้อมูลสินค้า / รหัสผลิตภัณฑ์'}
                  </button>

                  <AnimatePresence>
                    {showSecret && item.secretData && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pt-2 border-t border-gray-200"
                      >
                        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5 block">
                          โค้ดลิขสิทธิ์ / ข้อมูลผลิตภัณฑ์
                        </span>
                        <CopyBox text={item.secretData} id={item.id} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="p-6">
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-3 bg-[#3b82f6] hover:bg-[#0d9668] text-black text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
              >
                เสร็จสิ้นนำเสนอรายละเอียด
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        className="fixed inset-0 bg-white/60 backdrop-blur-3xl saturate-150 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
        onClick={() => setSelectedItem(null)}
      >
        <div 
          className="bg-white border border-gray-200 w-full max-w-sm overflow-hidden relative shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="h-1 bg-gradient-to-r from-#3b82f6 to-[#7c3aed]" />
          
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="font-bold text-base text-black tracking-tight">รายละเอียดแบบจำแนก</h3>
            <button 
              onClick={() => setSelectedItem(null)} 
              className="p-1 bg-gray-100 border border-gray-200 text-gray-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-4 h-4"/>
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">หมายเลขรายการ</span>
              <span className="font-mono font-bold text-xs bg-[#121214] border border-gray-200 px-2 py-0.5 text-[#3b82f6]">
                BILL-{item.id?.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">เวลาการบันทึก</span>
              <span className="text-xs text-black font-mono font-semibold">
                {new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}
              </span>
            </div>

            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">สถานะเครือข่าย</span>
              <StatusBadge status="SUCCESS" />
            </div>

            {type === 'topup' && (
              <div className="bg-[#121214] border border-[#222225] p-4 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">ช่องทางการทำรายการ</span>
                  <span className="text-black font-semibold">เติมเงิน ({item.type || 'ผ่านระบบ'})</span>
                </div>
                <div className="border-t border-gray-200 my-1 pb-1" />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-xs">จำนวนเงินเครดิต</span>
                  <span className="text-lg font-bold text-[#3b82f6] font-mono">
                    +{item.amount?.toLocaleString() || 0} ฿
                  </span>
                </div>
              </div>
            )}

            {type === 'key_use' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-semibold uppercase tracking-wider">ประเภทรายการ</span>
                  <span className="text-black font-medium">ใช้งานคีย์แลกของรางวัล (Redeem)</span>
                </div>
                <div className="bg-[#121214] border border-[#222225] p-4 space-y-1.5">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none block">
                    รายละเอียดคีย์ลิขสิทธิ์
                  </span>
                  <CopyBox text={item.key} id={item.id} />
                </div>
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-gray-100 hover:bg-zinc-850 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
            >
              ปิดบันทึกรายละเอียด
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (item: any, type: string) => {
    let title = "";
    let amountNode = null;
    let dateStr = new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    let displayId = item.id.toUpperCase();
    let cardLeftStroke = "bg-zinc-800"; // default fallback

    if (type === 'topup') {
      title = `ยอดเติมเงินเข้าบัญชี (${item.type || 'บัญชีเปรียบสระ'})`;
      amountNode = <span className="font-bold text-[#3b82f6] text-base font-mono">+{Number(item.amount || item.money || 0).toLocaleString()} ฿</span>;
      cardLeftStroke = "bg-[#3b82f6]";
    } else if (type === 'key_use') {
      title = "ประมวลผลใช้งานคีย์ลิขสิทธิ์ (Redeem)";
      amountNode = <span className="font-semibold text-gray-500 text-sm font-mono">-</span>;
      displayId = item.id.substring(0, 8).toUpperCase();
      cardLeftStroke = "bg-zinc-650";
    } else {
      title = item.productName;
      amountNode = <span className="font-bold text-rose-500 text-base font-mono">-{Number(item.price || 0).toLocaleString()} ฿</span>;
      
      if (type === 'special_purchase') {
        cardLeftStroke = "bg-[#7c3aed]";
      } else {
        cardLeftStroke = "bg-fuchsia-500";
      }
    }

    return (
      <div 
        key={item.id} 
        className="bg-white/80 border border-gray-200 p-5 hover:border-[#1f2937 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden"
      >
        {/* Glow-highlight bar on the left indicating status */}
        <div className={`absolute top-0 left-0 w-1 h-full ${cardLeftStroke} opacity-40 group-hover:opacity-100 transition-all duration-350`} />
        
        <div className="flex flex-col gap-2 flex-1 pl-2">
          <div className="flex items-center gap-3 flex-wrap">
             <span className="font-bold text-black text-base tracking-tight leading-tight group-hover:text-[#3b82f6] transition-colors">
               {title}
             </span>
             <StatusBadge status="SUCCESS" />
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 font-mono font-semibold">
            <span># BILL-{displayId}</span>
            <span className="border-l border-gray-200 h-3" />
            <span>{dateStr}</span>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center justify-between md:items-center gap-4 border-t md:border-t-0 border-gray-200 pt-4 md:pt-0 pl-2 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-full md:w-auto font-mono">
            <span className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-0.5 md:hidden select-none">จำนวนเงิน</span>
            {amountNode}
          </div>
          
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-5 py-2.5 bg-gray-100 hover:bg-zinc-850 hover:text-black border border-zinc-850 hover:border-gray-300 text-gray-600 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 w-full md:w-auto cursor-pointer"
          >
            ดูรายละเอียด
          </button>
        </div>
      </div>
    );
  };

  const renderPurchaseList = (list: any[], type: string, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-200 bg-white/40 relative overflow-hidden select-none">
          <ShoppingCart className="w-8 h-8 mb-3.5 text-zinc-650 opacity-40" />
          <p className="font-semibold text-xs tracking-wide uppercase">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        {list.map((item) => renderCard(item, type))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-black pb-20 relative">
      
      {/* Glow decorative graphics */}
      <div className="absolute top-[-5%] left-[20%] w-[250px] h-[250px] bg-[#3b82f6]/5 rounded-full blur-[70px] pointer-events-none select-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-[#7c3aed]/5 rounded-full blur-[80px] pointer-events-none select-none" />

      {/* Header with exquisite clean layout */}
      <div className="mb-8 pl-1 relative">
        <div className="flex items-center gap-3 mb-2.5">
          <div className="w-10 h-10 bg-[#3b82f6]/10 text-[#3b82f6] border border-#3b82f6/25 flex items-center justify-center relative shadow-sm shrink-0">
            <History className="w-5 h-5" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight leading-none">
            ประวัติการทำรายการ
          </h1>
        </div>
        <p className="text-xs font-semibold text-gray-600 tracking-wide">
          ตรวจสอบประวัติการซื้อ คีย์ และรายการเติมเงินของคุณได้อย่างละเอียดอัปเดตแบบเรียลไทม์
        </p>
      </div>

      {/* High impact Filter Tabs - Smooth horizontal responsive rail */}
      <div className="overflow-x-auto pb-4 mb-6 scrollbar-none w-full">
        <div className="flex bg-white/80 border border-gray-200 p-1 gap-1.5 w-fit min-w-max select-none">
          {[
            { id: 'key_purchase', label: 'ซื้อคีย์', icon: ShoppingCart },
            { id: 'keys', label: 'ใช้คีย์', icon: Key },
            { id: 'topup', label: 'การเติมเงิน', icon: Wallet },
            { id: 'general_purchase', label: 'สินค้าทั่วไป', icon: Package },
            { id: 'special_purchase', label: 'สินค้าพิเศษ', icon: Crown }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition-all border cursor-pointer ${ 
                  active 
                    ? 'bg-[#3b82f6]/10 text-black border-#3b82f6 shadow-[inset_0_0_8px_rgba(16,185,129,0.15)] ring-1 ring-#3b82f6/30' 
                    : 'text-gray-500 border-transparent hover:text-black hover:bg-gray-100 hover:border-gray-200' 
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2 text-zinc-200">
        <AnimatePresence mode="wait">
          
          {filter === 'keys' && (
            <motion.div 
              key="keys"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 pl-1 select-none">
                <h2 className="text-base font-bold flex items-center gap-2 text-black">
                  <Key className="w-4 h-4 text-[#3b82f6]" /> ประวัติและคีย์ที่ผ่านการ Redeem
                </h2>
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase">TOTAL: {usedKeysHistory.length}</span>
              </div>
              {usedKeysHistory.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-200 bg-white/40 select-none">
                  <Key className="w-8 h-8 mb-3.5 text-zinc-650 opacity-40" />
                  <p className="font-semibold text-xs tracking-wide uppercase">ยังไม่มีพฤติกรรมการใช้งานคีย์ในระบบสำนักสโตร์</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {usedKeysHistory.map((key) => renderCard(key, 'key_use'))}
                </div>
              )}
            </motion.div>
          )}

          {filter === 'topup' && (
            <motion.div 
              key="topup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 pl-1 select-none">
                <h2 className="text-base font-bold flex items-center gap-2 text-black">
                  <Wallet className="w-4 h-4 text-[#3b82f6]" /> รายการเสร็จสิ้นยอดเติมทรัพย์สิน
                </h2>
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase">TOTAL: {topupHistory.length}</span>
              </div>
              {topupHistory.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-200 bg-white/40 select-none">
                  <Wallet className="w-8 h-8 mb-3.5 text-zinc-650 opacity-40" />
                  <p className="font-semibold text-xs tracking-wide uppercase">ยังไม่ปรากฏยอดสะสมเติมทรัพย์ในระบบ</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {topupHistory.map((item) => renderCard(item, 'topup'))}
                </div>
              )}
            </motion.div>
          )}

          {filter === 'key_purchase' && (
            <motion.div 
              key="key_purchase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 pl-1 select-none">
                <h2 className="text-base font-bold flex items-center gap-2 text-black">
                  <ShoppingCart className="w-4 h-4 text-[#3b82f6]" /> รายละเอียดจัดซื้อรหัสคีย์
                </h2>
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase">TOTAL: {keyPurchases.length}</span>
              </div>
              {renderPurchaseList(keyPurchases, 'key_purchase', 'ท่านยังไม่ได้เริ่มสะสมสั่งซื้อคีย์ผลิตภัณฑ์')}
            </motion.div>
          )}

          {filter === 'general_purchase' && (
            <motion.div 
              key="general_purchase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 pl-1 select-none">
                <h2 className="text-base font-bold flex items-center gap-2 text-black">
                  <Package className="w-4 h-4 text-fuchsia-400" /> จัดซื้อสินค้าธรรมดาทั่วไป
                </h2>
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase">TOTAL: {generalPurchases.length}</span>
              </div>
              {renderPurchaseList(generalPurchases, 'general_purchase', 'ยังปราศจากการจัดซื้อสินค้าทั่วไปของเจ้าหน้าที่')}
            </motion.div>
          )}

          {filter === 'special_purchase' && (
            <motion.div 
              key="special_purchase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 pl-1 select-none">
                <h2 className="text-base font-bold flex items-center gap-2 text-black">
                  <Crown className="w-4 h-4 text-[#7c3aed]" /> รายการนำเข้าฝากสินค้าพรีเมียมพิเศษ
                </h2>
                <span className="text-[10px] font-mono text-gray-500 font-semibold uppercase">TOTAL: {specialPurchases.length}</span>
              </div>
              {renderPurchaseList(specialPurchases, 'special_purchase', 'ไม่พบการรับมอบสินค้าพิเศษระดับมงกุฎพรีเมียม')}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Details modal overlays */}
      <DetailsModal />
    </div>
  );
};
