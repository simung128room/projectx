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
        popup: 'border border-zinc-200 rounded-2xl shadow-md'
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
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full select-none font-mono">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      SUCCESS
    </span>
  );

  const CopyBox = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center justify-between gap-3 bg-slate-50 border border-zinc-200 py-2.5 px-3.5 rounded-xl w-full">
      <span className="font-mono text-zinc-800 font-bold text-xs truncate select-all">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-zinc-500 hover:text-zinc-900 transition-all shrink-0 p-1.5 bg-white border border-zinc-250 rounded-lg hover:border-zinc-350 cursor-pointer active:scale-95 shadow-sm"
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
        className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" 
        onClick={() => setSelectedItem(null)}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-zinc-200/80 w-full max-w-md rounded-3xl overflow-hidden relative shadow-2xl transition-all font-sans text-zinc-850"
          onClick={e => e.stopPropagation()}
        >
          {/* Top aesthetic accent line */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
          
          <div className="p-6 pb-4 relative border-b border-zinc-100">
            <button 
              onClick={() => setSelectedItem(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 bg-white border border-zinc-200 rounded-lg cursor-pointer hover:shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 border border-blue-100 rounded-md">
              <Receipt className="w-3 h-3" /> DIGITAL RECEIPT
            </span>
            <h3 className="text-lg font-bold text-zinc-900 mt-3.5 mb-1 tracking-tight">
              รายละเอียดธุรกรรมเสร็จสิ้น
            </h3>
            <p className="text-zinc-400 text-xs font-mono">
              ORDER_ID: <span className="text-blue-600 uppercase">#{item.id?.substring(0, 12) || 'N/A'}</span>
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Payment Ticket container with cut-out style */}
            <div className="bg-slate-50 border border-zinc-150 p-5 rounded-2xl relative overflow-hidden">
              <div className="absolute top-4 right-4 w-12 h-12 bg-zinc-200/50 rounded-full border border-zinc-300/10 flex items-center justify-center pointer-events-none opacity-20">
                <History className="w-5 h-5 text-zinc-650" />
              </div>
              
              <div className="flex justify-between items-center mb-3 text-xs font-medium">
                <span className="text-zinc-500">วันที่ทำรายการ</span>
                <span className="text-zinc-800 font-bold font-mono">
                  {new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}
                </span>
              </div>
              
              {isPurchase && (
                <div className="flex justify-between items-center mb-3 text-xs font-medium">
                  <span className="text-zinc-500">ประเภทรายการ</span>
                  <span className="text-zinc-800 font-bold">ชำระค่าสินค้า</span>
                </div>
              )}

              {type === 'topup' && (
                <div className="flex justify-between items-center mb-3 text-xs font-medium">
                  <span className="text-zinc-500">ช่องทางการเงิน</span>
                  <span className="text-zinc-800 font-bold">{item.type || 'ระบบสโตร์'}</span>
                </div>
              )}

              {type === 'key_use' && (
                <div className="flex justify-between items-center mb-3 text-xs font-medium">
                  <span className="text-zinc-500">กิจกรรม</span>
                  <span className="text-zinc-800 font-bold">การแลกรางวัล (Redeem)</span>
                </div>
              )}

              <div className="border-t border-dashed border-zinc-200 my-4" />
              
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase">ยอดคำนวณสุทธิ</span>
                <span className={`text-xl font-extrabold font-mono ${type === 'topup' ? 'text-blue-600' : 'text-emerald-600'}`}>
                  {type === 'topup' ? `+฿${(item.amount || item.money || 0).toLocaleString()}` : `฿${(item.price || 0).toLocaleString()}`}
                </span>
              </div>
            </div>

            {/* Product description content if product */}
            {isPurchase && (
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 pl-1 select-none">ข้อมูลผลิตภัณฑ์</h4>
                <div className="bg-slate-50 border border-zinc-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 text-zinc-500 shadow-sm">
                      {type === 'special_purchase' ? <Crown className="w-5 h-5 text-indigo-500" /> : <Package className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block font-sans">Product Name</span>
                      <h5 className="font-extrabold text-zinc-900 text-sm truncate">
                        {item.productName}
                      </h5>
                    </div>
                  </div>

                  {item.secretData && (
                    <>
                      <button 
                        onClick={() => setShowSecret(!showSecret)}
                        className="w-full py-2 bg-white border border-zinc-200/85 hover:border-zinc-350 hover:bg-slate-50 rounded-xl text-zinc-700 text-xs font-bold tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-sm"
                      >
                        {showSecret ? 'ซ่อนข้อมูลลับลิขสิทธิ์' : 'เปิดข้อมูลรหัสรหัสลับผ่าน'}
                      </button>

                      <AnimatePresence>
                        {showSecret && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden pt-1"
                          >
                            <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 mb-1.5 block">
                              ข้อมูลผลิตภัณฑ์ / ลิขสิทธิ์โค้ด
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
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 block">คีย์การ์ดที่ทำรายการ</span>
                <CopyBox text={item.key} id={item.id} />
              </div>
            )}
          </div>

          <div className="p-6 pt-0">
            <button 
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-900 hover:to-black border border-zinc-700/60 rounded-xl text-white text-xs font-extrabold uppercase tracking-wide transition-all cursor-pointer select-none"
            >
              ย้อนกลับสู่ตารางงาน
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
    let cardLeftStroke = "from-zinc-400 to-zinc-500"; 
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
      title = `เติมเงินสำเร็จ • (${item.type || 'ทรูวอเล็ต'})`;
      amountNode = <span className="font-extrabold text-blue-600 text-lg font-mono">+{Number(item.amount || item.money || 0).toLocaleString()} ฿</span>;
      iconNode = <Wallet className="w-5 h-5 text-blue-600" />;
      cardLeftStroke = "from-blue-500 to-indigo-600";
      badgeLabel = "Top Up";
    } else if (type === 'key_use') {
      title = `รีดีมสำเร็จ • [${item.key?.substring(0, 16)}...]`;
      amountNode = <span className="font-bold text-zinc-500 text-xs font-mono bg-zinc-50 border border-zinc-150 px-2 py-1 rounded-md">Redeem Link</span>;
      iconNode = <Key className="w-5 h-5 text-amber-600" />;
      cardLeftStroke = "from-amber-400 to-yellow-600";
      badgeLabel = "Key Redeem";
    } else {
      title = item.productName || 'ไม่มีชื่อสินค้า';
      amountNode = <span className="font-extrabold text-rose-600 text-lg font-mono">-{Number(item.price || 0).toLocaleString()} ฿</span>;
      
      if (type === 'special_purchase') {
        iconNode = <Crown className="w-5 h-5 text-amber-500" />;
        cardLeftStroke = "from-amber-500 to-yellow-500";
        badgeLabel = "Premium";
      } else {
        iconNode = <Package className="w-5 h-5 text-blue-500" />;
        cardLeftStroke = "from-blue-550 to-indigo-600";
        badgeLabel = "Product";
      }
    }

    return (
      <div 
        key={item.id} 
        className="bg-white border border-zinc-200 hover:border-zinc-350 rounded-3xl p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden text-zinc-800"
      >
        {/* Glow indicator line on left */}
        <div className={`absolute top-0 left-0 w-1 md:w-1.5 h-full bg-gradient-to-b ${cardLeftStroke} opacity-60 group-hover:opacity-100 transition-all duration-300`} />
        
        <div className="flex flex-row items-center gap-4 pl-1.5 flex-1 min-w-0">
          <div className="w-11 h-11 bg-slate-50 border border-zinc-150 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            {iconNode}
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
               <span className="font-extrabold text-zinc-900 text-sm md:text-base tracking-tight truncate leading-tight group-hover:text-blue-600 transition-colors">
                 {title}
               </span>
               <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 text-zinc-650 select-none uppercase tracking-wide font-mono">
                 {badgeLabel}
               </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-400 font-mono">
              <span className="text-[10px] font-bold tracking-wide uppercase px-1.5 py-0.5 bg-slate-150 rounded border border-zinc-200">#{displayId}</span>
              <span className="text-zinc-300 select-none">•</span>
              <span className="font-semibold">{dateStr}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-row md:flex-nowrap items-center justify-between md:items-center gap-4 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 pl-1.5 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-auto font-mono">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-zinc-400 mb-0.5 hidden md:block select-none">Transaction</span>
            {amountNode}
          </div>
          
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-4.5 py-2.5 bg-white hover:bg-slate-50 border border-zinc-200 hover:border-zinc-350 rounded-2xl text-zinc-700 hover:text-zinc-900 text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-1 shadow-sm"
          >
            ดูรายละเอียด <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    );
  };

  const renderPurchaseList = (list: any[], type: string, emptyMessage: string) => {
    if (list.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-zinc-450 border border-dashed border-zinc-200 bg-slate-50/50 rounded-3xl relative overflow-hidden select-none">
          <ShoppingCart className="w-10 h-10 mb-3 text-zinc-400 animate-pulse" />
          <p className="font-bold text-xs tracking-wider uppercase">{emptyMessage}</p>
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-850 pb-24 relative">
      
      {/* Exquisite ambient radial elements */}
      <div className="absolute top-[-5%] left-[25%] w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[90px] pointer-events-none select-none" />
      <div className="absolute bottom-[20%] right-[15%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none select-none" />

      {/* Main Header */}
      <div className="mb-8 pl-1 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center rounded-2xl shadow-sm shrink-0">
              <History className="w-5.5 h-5.5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
              ประวัติทำธุรกรรม
            </h1>
          </div>
          <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
            ยินดีต้อนรับสู่ศูนย์บริการประวัติการเงิน คีย์ และรายการสะสมแสตมป์เติมเงินความเสี่ยงต่ำ
          </p>
        </div>

        {/* Global search controller */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="ค้นหารายการ ID / ชื่อ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-2xl pl-10 pr-4 py-2 text-xs focus:zinc-350 focus:outline-none placeholder-zinc-400 font-bold shadow-sm"
          />
        </div>
      </div>

      {/* Metrics Center Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-400 uppercase">ยอดใช้จ่ายสะสม</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-mono tracking-tight text-rose-650">
              ฿{totalSpent.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-405 font-bold mt-1">จากรายการจัดซื้อสินค้าทั้งหมดในระบบ</p>
          </div>
          <div className="absolute top-0 right-0 w-12 h-1 bg-rose-500" />
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-400 uppercase">ยอดการเติมเงินสะสม</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-mono tracking-tight text-blue-650">
              ฿{totalTopup.toLocaleString()}
            </h3>
            <p className="text-[10px] text-zinc-405 font-bold mt-1">ประวัติยอดเงินนำเข้ารวมทั้งหมด</p>
          </div>
          <div className="absolute top-0 right-0 w-12 h-1 bg-blue-500" />
        </div>

        <div className="bg-white border border-zinc-200 rounded-3xl p-5 relative overflow-hidden flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <span className="text-[10px] tracking-wider font-extrabold text-zinc-400 uppercase">จำนวนรีดีมสำเร็จ</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-extrabold font-mono tracking-tight text-amber-655">
              {totalRedeemed} ใบสั่ง
            </h3>
            <p className="text-[10px] text-zinc-405 font-bold mt-1">คีย์ที่เปลี่ยนเป็นสินค้าแลกรับสิทธิ์</p>
          </div>
          <div className="absolute top-0 right-0 w-12 h-1 bg-amber-500" />
        </div>
      </div>

      {/* Modern Filter Rail */}
      <div className="overflow-x-auto pb-2 mb-6 scrollbar-none w-full relative z-10 select-none">
        <div className="flex bg-slate-50 border border-zinc-200 p-1.5 rounded-2xl gap-2 w-fit min-w-full md:min-w-max shadow-sm">
          {[
            { id: 'key_purchase', label: 'ซื้อคีย์', count: keyPurchases.length, icon: ShoppingCart, color: 'text-blue-600' },
            { id: 'keys', label: 'ใช้คีย์', count: usedKeysHistory.length, icon: Key, color: 'text-amber-600' },
            { id: 'topup', label: 'การเติมเงิน', count: topupHistory.length, icon: Wallet, color: 'text-emerald-600' },
            { id: 'general_purchase', label: 'สินค้าทั่วไป', count: generalPurchases.length, icon: Package, color: 'text-purple-600' },
            { id: 'special_purchase', label: 'สินค้าพิเศษ', count: specialPurchases.length, icon: Crown, color: 'text-amber-600' }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilter(tab.id as any);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2.5 px-4.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all border cursor-pointer ${ 
                  active 
                    ? 'bg-white border-zinc-250 text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 border-transparent hover:text-zinc-800 hover:bg-slate-200/50' 
                }`}
              >
                <tab.icon className={`w-3.5 h-3.5 shrink-0 ${active ? tab.color : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono ${
                  active ? 'bg-slate-100 text-zinc-800' : 'bg-slate-200/50 text-zinc-400'
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 font-sans"
            >
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 pl-1 animate-in fade-in">
                <h2 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                  <Key className="w-4 h-4 text-amber-500" /> ประวัติแลกผลิตภัณฑ์คุณสมบัติพิเศษ
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">FILTERED: {getFilteredList().length}</span>
              </div>
              {getFilteredList().length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 bg-slate-50/50 rounded-2xl relative select-none">
                  <Key className="w-10 h-10 mb-3 text-zinc-350 animate-pulse" />
                  <p className="font-bold text-xs tracking-wider uppercase">ยังไม่มีคีย์ที่ระบุใช้งานตามเงื่อนไขค้นหา</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {getFilteredList().map((key) => renderCard(key, 'key_use'))}
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
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 pl-1">
                <h2 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                  <Wallet className="w-4 h-4 text-emerald-500" /> รายการดำเนินการเติมยอดรวมเครดิต
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">FILTERED: {getFilteredList().length}</span>
              </div>
              {getFilteredList().length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-200 bg-slate-50/50 rounded-2xl select-none">
                  <Wallet className="w-10 h-10 mb-3 text-zinc-350 animate-pulse" />
                  <p className="font-bold text-xs tracking-wider uppercase">ไม่มีหลักฐานเติมเงินที่ตรงกับคำสืบค้นในขณะนี้</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-in fade-in duration-300">
                  {getFilteredList().map((item) => renderCard(item, 'topup'))}
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
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 pl-1">
                <h2 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                  <ShoppingCart className="w-4 h-4 text-blue-500" /> ตารางรายการชำระซื้อคีย์
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">FILTERED: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'key_purchase', 'ไม่พบคีย์จากระบบการซื้อขายหรือคำสืบค้นของคุณ')}
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
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 pl-1">
                <h2 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                  <Package className="w-4 h-4 text-purple-500" /> ประวัติซื้อสินค้าทั่วไป
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">FILTERED: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'general_purchase', 'ไม่มีการซื้อขายสินค้าทั่วไปที่ตรงความต้องการ')}
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
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3 pl-1">
                <h2 className="text-sm font-extrabold flex items-center gap-2 text-zinc-900">
                  <Crown className="w-4 h-4 text-amber-500" /> ประวัติยอดสะสมการสั่งซื้อสินค้าพิเศษ
                </h2>
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase">FILTERED: {getFilteredList().length}</span>
              </div>
              {renderPurchaseList(getFilteredList(), 'special_purchase', 'ไม่พบการสั่งซื้อกลุ่มสินค้าพรีเมียมในขอบข่ายค้นหา')}
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
