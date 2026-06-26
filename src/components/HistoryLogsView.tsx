import React, { useState } from 'react';
import { 
  History, 
  Key, 
  Clock, 
  Wallet, 
  ShoppingCart, 
  Copy, 
  Check, 
  Package, 
  Crown, 
  X,
  TrendingDown,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowUpRight,
  Search,
  Receipt
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
  const [searchQuery, setSearchQuery] = useState('');

  // Calculations for dashboard indicators
  const totalSpent = purchaseHistory.reduce((acc, curr) => acc + Number(curr.price || 0), 0);
  const totalTopup = topupHistory.reduce((acc, curr) => acc + Number(curr.amount || curr.money || 0), 0);
  const totalRedeemed = usedKeysHistory.length;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'คัดลอกรหัสสำเร็จ!',
      showConfirmButton: false,
      timer: 1500,
      background: '#ffffff',
      color: '#1f2937',
      customClass: {
        popup: 'border border-zinc-200 rounded-xl shadow-md'
      }
    });

    setTimeout(() => setCopiedId(null), 2000);
  };

  const keyPurchases = purchaseHistory.filter(p => p.productName?.includes('คีย์') || false);
  const specialPurchases = purchaseHistory.filter(p => !(p.productName?.includes('คีย์') || false) && p.price >= 500);
  const generalPurchases = purchaseHistory.filter(p => !(p.productName?.includes('คีย์') || false) && p.price < 500);

  const getFilteredList = () => {
    let list: any[] = [];
    switch (filter) {
      case 'key_purchase':
        list = keyPurchases;
        break;
      case 'keys':
        list = usedKeysHistory;
        break;
      case 'topup':
        list = topupHistory;
        break;
      case 'general_purchase':
        list = generalPurchases;
        break;
      case 'special_purchase':
        list = specialPurchases;
        break;
    }

    if (!searchQuery) return list;
    return list.filter(item => {
      const title = (item.productName || item.key || item.type || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      return title.includes(searchQuery.toLowerCase()) || id.includes(searchQuery.toLowerCase());
    });
  };

  const StatusBadge = () => (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full select-none font-sans">
      สำเร็จ
    </span>
  );

  const CopyBox = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center justify-between gap-3 bg-[#fafafa] border border-zinc-200 py-2.5 px-3.5 rounded-xl w-full">
      <span className="font-mono text-zinc-900 font-semibold text-xs truncate select-all">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-zinc-500 hover:text-zinc-900 transition-all shrink-0 p-1.5 bg-white border border-zinc-200 rounded-lg hover:border-zinc-350 cursor-pointer active:scale-95 shadow-sm"
        title="คัดลอกโค้ด"
      >
        {copiedId === id ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5"/>}
      </button>
    </div>
  );

  const DetailsModal = () => {
    const [showSecret, setShowSecret] = useState(false);
    if (!selectedItem) return null;
    const { details: item, type } = selectedItem;
    const isPurchase = ['key_purchase', 'general_purchase', 'special_purchase'].includes(type);

    return (
      <div 
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
        onClick={() => setSelectedItem(null)}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="bg-white border border-zinc-200 w-full max-w-md rounded-2xl overflow-hidden relative shadow-2xl transition-all font-sans text-zinc-800"
          onClick={e => e.stopPropagation()}
        >
          {/* Subtle top decoration strip */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-teal-500 to-indigo-500" />
          
          <div className="p-6 pb-4 relative border-b border-zinc-100">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 px-2.5 py-1 border border-zinc-200/50 rounded-md">
              <Receipt className="w-3.5 h-3.5" /> ใบเสร็จดิจิทัล
            </span>
            <h3 className="text-base font-bold text-zinc-900 mt-3.5 mb-0.5 tracking-tight">
              รายละเอียดธุรกรรมเสร็จสิ้น
            </h3>
            <p className="text-zinc-400 text-[10px] font-mono">
              รหัสอ้างอิง: <span className="text-zinc-500 uppercase">#{item.id?.substring(0, 12) || 'N/A'}</span>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Payment Ticket details container */}
            <div className="bg-zinc-50/55 border border-zinc-200 p-5 rounded-xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-3.5 text-xs font-semibold">
                <span className="text-zinc-400">วันที่ทำรายการ</span>
                <span className="text-zinc-800 font-bold font-mono">
                  {new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}
                </span>
              </div>
              
              {isPurchase && (
                <div className="flex justify-between items-center mb-3.5 text-xs font-semibold">
                  <span className="text-zinc-400">ประเภทบริการ</span>
                  <span className="text-zinc-800 font-bold">สั่งซื้อสินค้าคุณภาพสูง</span>
                </div>
              )}

              {type === 'topup' && (
                <div className="flex justify-between items-center mb-3.5 text-xs font-semibold">
                  <span className="text-zinc-400">ช่องทางการชำระ</span>
                  <span className="text-zinc-800 font-bold">{item.type || 'ระบบอัตโนมัติ'}</span>
                </div>
              )}

              {type === 'key_use' && (
                <div className="flex justify-between items-center mb-3.5 text-xs font-semibold">
                  <span className="text-zinc-400">กิจกรรม</span>
                  <span className="text-zinc-800 font-bold">การแลกรับสินค้าสิทธิ์พิเศษ</span>
                </div>
              )}

              <div className="border-t border-dashed border-zinc-200 my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase">ยอดคำนวณสุทธิ</span>
                <span className={`text-lg font-bold font-mono ${type === 'topup' ? 'text-blue-600' : 'text-zinc-900'}`}>
                  {type === 'topup' ? `+฿${(item.amount || item.money || 0).toLocaleString()}` : `฿${(item.price || 0).toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Product description content if purchase */}
            {isPurchase && (
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 pl-0.5 select-none">ข้อมูลผลิตภัณฑ์</h4>
                <div className="bg-white border border-zinc-200 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-zinc-50 border border-zinc-200 rounded-lg flex items-center justify-center shrink-0 text-zinc-500 shadow-sm">
                      {type === 'special_purchase' ? <Crown className="w-5 h-5 text-zinc-600" /> : <Package className="w-5 h-5 text-zinc-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">ผลิตภัณฑ์ในระบบ</span>
                      <h5 className="font-bold text-zinc-850 text-sm truncate">
                        {item.productName}
                      </h5>
                    </div>
                  </div>

                  {item.secretData && (
                    <>
                      <button 
                        onClick={() => setShowSecret(!showSecret)}
                        className="w-full py-2 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-[#fafafa] rounded-lg text-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-sm"
                      >
                        {showSecret ? 'ซ่อนรหัสสินค้าลิขสิทธิ์' : 'แสดงข้อมูลรหัสลิขสิทธิ์'}
                      </button>

                      <AnimatePresence>
                        {showSecret && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pt-1"
                          >
                            <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-400 mb-1.5 block">
                              คีย์ / บัญชีลิขสิทธิ์ของคุณที่ทำรายการสำเร็จ
                            </span>
                            <CopyBox text={item.secretData} id={item.id} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
            )}

            {type === 'key_use' && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider pl-0.5 block">ข้อมูลสิทธิ์การทำรายการ</span>
                <CopyBox text={item.key} id={item.id} />
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-white text-xs font-bold transition-all cursor-pointer select-none"
            >
              ปิดรายงานข้อมูล
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderCard = (item: any, type: string) => {
    let title = "";
    let amountNode = null;
    let iconNode = null;
    let badgeLabel = "";

    const dateStr = new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const displayId = item.id ? item.id.toUpperCase().substring(0, 8) : 'N/A';

    if (type === 'topup') {
      title = `เติมเงินเข้าระบบ • (${item.type || 'ทรูวอเล็ต'})`;
      amountNode = <span className="font-bold text-blue-600 text-base font-mono">+฿{(item.amount || item.money || 0).toLocaleString()}</span>;
      iconNode = <Wallet className="w-5 h-5 text-zinc-600" />;
      badgeLabel = "เติมเงิน";
    } else if (type === 'key_use') {
      title = `รีดีมใช้งานคีย์ • [${item.key?.substring(0, 16)}...]`;
      amountNode = <span className="font-bold text-zinc-500 text-xs font-sans bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded">ลืมคีย์แลกของ</span>;
      iconNode = <Key className="w-5 h-5 text-zinc-600" />;
      badgeLabel = "ใช้งานคีย์";
    } else {
      title = item.productName || 'ไม่มีชื่อสินค้า';
      amountNode = <span className="font-bold text-zinc-800 text-base font-mono">-฿{(item.price || 0).toLocaleString()}</span>;
      
      if (type === 'special_purchase') {
        iconNode = <Crown className="w-5 h-5 text-zinc-600" />;
        badgeLabel = "ไอเทมพิเศษ";
      } else {
        iconNode = <Package className="w-5 h-5 text-zinc-500" />;
        badgeLabel = "สินค้าทางสิทธิ์";
      }
    }

    return (
      <div 
        key={item.id} 
        className="bg-white border border-zinc-200/80 hover:border-zinc-350 rounded-2xl p-5 hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden text-zinc-800"
      >
        <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
          <div className="w-11 h-11 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-zinc-100/50 transition-colors">
            {iconNode}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
               <span className="font-bold text-zinc-900 text-sm md:text-base tracking-tight truncate leading-tight group-hover:text-blue-600 transition-colors">
                 {title}
               </span>
               <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200/20 text-zinc-500 select-none uppercase tracking-wide">
                 {badgeLabel}
               </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-sans">
              <span className="font-mono bg-zinc-100/70 border border-zinc-200/50 px-1.5 py-0.5 rounded text-[10px] text-zinc-500 font-semibold">#{displayId}</span>
              <span className="text-zinc-300">•</span>
              <span className="font-medium text-zinc-400">{dateStr}</span>
              <span className="text-zinc-300">•</span>
              <StatusBadge />
            </div>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-nowrap items-center justify-between md:items-center gap-4 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 pl-1 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-auto font-sans">
            <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-400 mb-0.5 hidden md:block select-none">ยอดทำรายการ</span>
            {amountNode}
          </div>
          
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-4.5 py-2 hover:bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-xs font-bold transition-all whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
          >
            ดูสิทธิ์และรหัสสินค้า <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  const renderPurchaseList = (list: any[], type: string, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 bg-white rounded-2xl select-none">
          <ShoppingCart className="w-10 h-10 mb-3 text-zinc-350 animate-pulse" />
          <p className="font-bold text-xs text-zinc-450 tracking-wider uppercase">{emptyMessage}</p>
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-800 pb-24 relative bg-white">
      {/* Main Header */}
      <div className="mb-8 pl-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center rounded-xl shadow-xs shrink-0">
              <History className="w-5.5 h-5.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight leading-none">
              ประวัติความเคลื่อนไหวทั้งหมด
            </h1>
          </div>
          <p className="text-xs text-zinc-400 font-bold leading-relaxed">
            ดูรายละเอียดประวัติรายการบัญชีสโตร์ สินค้า หรือลิขสิทธิ์ทั้งหมดที่คุณสั่งซื้อสำเร็จ
          </p>
        </div>

        {/* Global search controller */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="พิมพ์คำสืบค้นรหัส / ชื่อสินค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none placeholder-zinc-400 font-bold transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Metrics Center Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-450 uppercase">ยอดคำสั่งซื้อสะสม</span>
            <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg border border-zinc-250/20">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono tracking-tight text-zinc-900">
              ฿{totalSpent.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">ยอดใช้จ่ายจริงทั้งหมดของคุณ</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-500 uppercase">ยอดเติมเครดิตสะสม</span>
            <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg border border-zinc-200/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono tracking-tight text-zinc-900">
              ฿{totalTopup.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">ยอดเงินเติมผ่านช่องทางต่างๆ ทั้งสิ้น</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-500 uppercase">แลกสิทธิ์ใช้งานคีย์</span>
            <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg border border-zinc-200/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold font-mono tracking-tight text-zinc-900">
              {totalRedeemed} รายการ
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">จำนวนคีย์ในคลังที่คุณใช้สิทธิ์แล้ว</p>
          </div>
        </div>
      </div>

      {/* Modern Filter Rail with minimal styling */}
      <div className="overflow-x-auto pb-2 mb-6 scrollbar-none w-full relative z-10 select-none" style={{ scrollbarWidth: 'none' }}>
        <div className="flex bg-zinc-50 border border-zinc-200 p-1 rounded-xl gap-1 w-fit min-w-full md:min-w-max shadow-sm">
          {[
            { id: 'key_purchase', label: 'ซื้อคีย์ในร้าน', count: keyPurchases.length, icon: ShoppingCart },
            { id: 'keys', label: 'รีดีมเปิดซองคีย์', count: usedKeysHistory.length, icon: Key },
            { id: 'topup', label: 'เติมความจุเงิน', count: topupHistory.length, icon: Wallet },
            { id: 'general_purchase', label: 'ซื้อทั่วไป', count: generalPurchases.length, icon: Package },
            { id: 'special_purchase', label: 'ซื้อพิเศษ / VIP', count: specialPurchases.length, icon: Crown }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id as any);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${ 
                  active 
                    ? 'bg-white border border-zinc-200 text-zinc-900 shadow-xs' 
                    : 'text-zinc-450 border border-transparent hover:text-zinc-800 hover:bg-zinc-100/50' 
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  active ? 'bg-zinc-100 text-zinc-800' : 'bg-zinc-200/40 text-zinc-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Container rendering lists */}
      <div className="mt-2 text-zinc-800 relative z-10">
        <AnimatePresence mode="wait">
          
          {filter === 'keys' && (
            <motion.div 
              key="keys"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pl-0.5">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900">
                  <Key className="w-4 h-4 text-zinc-500" /> สมุดประวัติแลกรับลิขสิทธิ์
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">จำนวนรายการ: {getFilteredList().length}</span>
              </div>
              {getFilteredList().length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 bg-white rounded-2xl select-none">
                  <Key className="w-10 h-10 mb-3 text-zinc-350 animate-pulse" />
                  <p className="font-bold text-xs tracking-wider uppercase">ยังไม่พบบันทึกการใช้งานคีย์ตามเงื่อนไข</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {getFilteredList().map((key) => renderCard(key, 'key_use'))}
                </div>
              )}
            </motion.div>
          )}

          {filter === 'topup' && (
            <motion.div 
              key="topup"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pl-0.5">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900">
                  <Wallet className="w-4 h-4 text-zinc-500" /> รายการเดินบัญชีรับโอนและเติมเงิน
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">จำนวนรายการ: {getFilteredList().length}</span>
              </div>
              {getFilteredList().length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 bg-white rounded-2xl select-none">
                  <Wallet className="w-10 h-10 mb-3 text-zinc-350 animate-pulse" />
                  <p className="font-bold text-xs tracking-wider uppercase">ไม่มีการเติมเงินทางสถิตินี้</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {getFilteredList().map((item) => renderCard(item, 'topup'))}
                </div>
              )}
            </motion.div>
          )}

          {filter === 'key_purchase' && (
            <motion.div 
              key="key_purchase"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pl-0.5">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900">
                  <ShoppingCart className="w-4 h-4 text-zinc-500" /> รายการชำระผ่านคีย์สิทธิ์
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">จำนวนรายการ: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'key_purchase', 'ไม่พบคีย์ในบัญชีประวัติการซื้อของคุณ')}
            </motion.div>
          )}

          {filter === 'general_purchase' && (
            <motion.div 
              key="general_purchase"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pl-0.5">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900">
                  <Package className="w-4 h-4 text-zinc-500" /> ประวัติซื้อสินค้าทั่วไป
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">จำนวนรายการ: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'general_purchase', 'ไม่มีการซื้อสินค้าทั่วไปที่ระบุ')}
            </motion.div>
          )}

          {filter === 'special_purchase' && (
            <motion.div 
              key="special_purchase"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3 pl-0.5">
                <h2 className="text-sm font-bold flex items-center gap-2 text-zinc-900">
                  <Crown className="w-4 h-4 text-zinc-500" /> ประวัติยอดสะสมการสั่งซื้อสินค้าพิเศษ / VIP
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-semibold uppercase">จำนวนรายการ: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'special_purchase', 'ไม่มีรายการจัดซื้อ VIP คอนเทนต์ของคุณ')}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Details modal renders here */}
      <AnimatePresence>
        {selectedItem && <DetailsModal />}
      </AnimatePresence>
    </div>
  );
};
