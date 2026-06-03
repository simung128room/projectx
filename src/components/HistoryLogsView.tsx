import React, { useState } from 'react';
import { History, Key, Activity, ArrowRight, Clock, Monitor, Wallet, ShoppingCart, Copy, Check, Package, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogsViewProps {
  usedKeysHistory?: any[];
  purchaseHistory?: any[];
  topupHistory?: any[];
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({ usedKeysHistory = [], purchaseHistory = [], topupHistory = [] }) => {
  const [filter, setFilter] = useState<'key_purchase' | 'keys' | 'topup' | 'general_purchase' | 'special_purchase'>('key_purchase');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{details: any, type: string} | null>(null);

  React.useEffect(() => {
    // Optional mounted state log
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const keyPurchases = purchaseHistory.filter(p => p.productName.includes('คีย์'));
  const specialPurchases = purchaseHistory.filter(p => !p.productName.includes('คีย์') && p.price >= 500);
  const generalPurchases = purchaseHistory.filter(p => !p.productName.includes('คีย์') && p.price < 500);

  const StatusBadge = ({ status = 'SUCCESS' }: { status?: string }) => (
    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
      status === 'SUCCESS' ? 'text-emerald-700 bg-emerald-100' : 'text-zinc-700 bg-zinc-200'
    }`}>
      {status}
    </span>
  );

  const CopyBox = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center justify-between gap-3 bg-[#121417] border border-white/10 py-1.5 px-3 rounded-lg w-full max-w-xs shadow-sm">
      <span className="font-mono text-zinc-700 font-medium text-xs truncate">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
        title="คัดลอก"
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

    if (isPurchase) {
      return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
          <div className="bg-[#0B0D0F] rounded-xl w-full max-w-md overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-4 relative">
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black text-purple-500 mb-1">รายละเอียดการซื้อ</h3>
              <p className="text-zinc-500 text-sm font-medium">หมายเลขบิล: <span className="font-mono text-white bg-[#121820] px-2 py-0.5 rounded-md">BILL-{item.id?.toUpperCase()}</span></p>
            </div>

            <div className="px-6 space-y-6">
              <div className="bg-pink-50 border border-pink-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-3 relative z-10">
                  <span className="text-sm font-bold text-pink-600">วันที่ซื้อ</span>
                  <span className="text-sm font-medium text-white">{new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}</span>
                </div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-sm font-bold text-pink-600">จำนวนรายการ</span>
                  <span className="text-sm font-medium text-white">1 รายการ</span>
                </div>
                <div className="h-px bg-pink-100/60 mb-4 relative z-10"></div>
                <div className="flex justify-between items-center relative z-10">
                  <span className="text-sm font-bold text-pink-600">ราคารวม</span>
                  <span className="text-xl font-black text-rose-600">฿ {item.price?.toLocaleString() || 0}</span>
                </div>
              </div>

              <div>
                <h4 className="font-black text-white mb-4">รายการสินค้า</h4>
                <div className="bg-[#0B0D0F] border rounded-2xl p-4 flex flex-col gap-4 shadow-sm border-white/10">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-[#121417] border border-white/5 rounded-xl flex items-center justify-center shrink-0 text-zinc-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-white text-sm md:text-base truncate">{item.productName}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-zinc-500 font-medium bg-[#121820] px-2 py-0.5 rounded-md">จำนวน 1 ชิ้น</span>
                        <span className="text-sm font-black text-rose-600">฿ {item.price?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    className="w-full py-2.5 bg-[#121417] hover:bg-[#121820] border border-white/10 text-zinc-200 text-sm font-bold rounded-xl transition-all"
                  >
                    {showSecret ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                  </button>
                  {showSecret && item.secretData && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200 pt-2 border-t border-white/5">
                       <span className="text-xs font-bold text-zinc-500 mb-2 block">โค้ด / ข้อมูลสินค้า</span>
                       <CopyBox text={item.secretData} id={item.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 mt-2">
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-4 bg-purple-600 hover:bg-[#1D4ED8] text-white rounded-2xl text-base font-black transition-all shadow-md shadow-lg/20"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm  z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
        <div className="bg-[#0B0D0F] rounded-xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b border-white/5">
            <h3 className="font-bold text-lg text-white">รายละเอียดรายการ</h3>
            <button onClick={() => setSelectedItem(null)} className="p-2 bg-[#121820] hover:bg-zinc-200 text-zinc-400 rounded-full transition-colors absolute top-4 right-4 focus:outline-none">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">หมายเลขบิล</span>
              <span className="font-mono font-bold text-xs bg-[#121820] px-2 py-0.5 rounded text-zinc-700">BILL-{item.id?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">วันที่และเวลา</span>
              <span className="text-sm font-medium text-white">{new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">สถานะรายการ</span>
              <StatusBadge status="SUCCESS" />
            </div>
            
            <div className="h-px bg-[#121820] my-2 w-full relative"></div>

            {type === 'topup' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-white">เติมเงินเข้าระบบ ({item.type || 'ผ่านระบบ'})</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-zinc-500 text-sm font-medium">จำนวนเงิน</span>
                   <span className="text-xl font-black text-purple-500">+{item.amount?.toLocaleString() || 0} ฿</span>
                </div>
              </>
            )}

            {type === 'key_use' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-white">ใช้งานคีย์ (Redeem)</span>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-2">
                   <span className="text-zinc-500 text-sm font-medium">รายละเอียดคีย์</span>
                   <CopyBox text={item.key} id={item.id} />
                </div>
              </>
            )}

          </div>
          <div className="p-4 bg-[#121417] border-t border-white/5 flex justify-end">
             <button 
               onClick={() => setSelectedItem(null)}
               className="px-6 py-3 bg-zinc-900 hover:bg-gray-200 text-white rounded-xl text-sm font-bold transition-colors w-full"
             >
               ปิดหน้าต่าง
             </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCard = (item: any, type: string) => {
    let title = "";
    let amountNode = null;
    let dateStr = new Date(item.timestamp || item.usedAt).toLocaleString('th-TH');
    let displayId = item.id.toUpperCase();

    if (type === 'topup') {
      title = `เติมเงินเข้าระบบ (${item.type || 'ผ่านระบบ'})`;
      amountNode = <span className="font-black text-purple-500 text-base md:text-lg">+{(item.amount || 0).toLocaleString()} ฿</span>;
    } else if (type === 'key_use') {
      title = "ใช้งานคีย์ (Redeem)";
      amountNode = <span className="font-black text-emerald-600 text-base md:text-lg">-</span>;
      displayId = item.id.substring(0,8).toUpperCase();
    } else {
      title = item.productName;
      amountNode = <span className="font-black text-rose-600 text-base md:text-lg">-{(item.price || 0).toLocaleString()} ฿</span>;
    }

    return (
      <div key={item.id} className="bg-[#0B0D0F] border border-white/10 rounded-xl p-5 hover:border-white/20 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#121820] group-hover:bg-[#2563EB] transition-colors"></div>
        <div className="flex flex-col gap-2 flex-1 pl-2">
          <div className="flex items-center gap-3">
             <span className="font-bold text-white text-base md:text-lg tracking-tight">{title}</span>
             <StatusBadge status="SUCCESS" />
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
            <span className="font-mono bg-[#121820] px-2 py-0.5 rounded-md text-[11px] text-zinc-700"># BILL-{displayId}</span>
            <span className="hidden leading-none md:inline-block border-l border-white/20 h-3"></span>
            <span>{dateStr}</span>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center justify-between md:items-end gap-4 border-t md:border-t-0 border-white/5 pt-4 md:pt-0 pl-2 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-0.5 md:hidden">จำนวนเงิน</span>
            {amountNode}
          </div>
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-6 py-2.5 bg-[#121417] hover:bg-[#121820] border border-white/10 text-zinc-200 text-sm font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 w-full md:w-auto"
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
        <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-white/20 rounded-xl bg-[#121417]">
          <ShoppingCart className="w-8 h-8 mb-4 opacity-30" />
          <p className="font-medium text-sm">{emptyMessage}</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        {list.map((item) => renderCard(item, type))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white pb-20">
      {/* Header */}
      <div className="mb-8 pl-2">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
            <History className="w-8 h-8 text-purple-500" /> 
            ประวัติสั่งซื้อ
        </h1>
        <p className="text-sm font-medium text-zinc-500">History / Logs ประวัติการทำรายการต่างๆ ของคุณในระบบ</p>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto pb-4 mb-4 scrollbar-none w-full">
        <div className="flex bg-[#0B0D0F] border border-white/10 rounded-2xl w-fit shadow-sm p-1.5 gap-1.5 min-w-max">
          {[
            { id: 'key_purchase', label: 'ซื้อคีย์', icon: ShoppingCart },
            { id: 'keys', label: 'ใช้คีย์', icon: Key },
            { id: 'topup', label: 'เติมเงิน', icon: Wallet },
            { id: 'general_purchase', label: 'สินค้าทั่วไป', icon: Package },
            { id: 'special_purchase', label: 'สินค้าพิเศษ', icon: Crown }
          ].map(tab => {
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all border ${
                  active ? 'bg-purple-600 text-white border-[#3B82F6] shadow-md shadow-lg' : 'text-zinc-500 border-transparent hover:text-purple-500 hover:bg-[#121417] hover:border-white/10'
                }`}
              >
                <tab.icon className="w-4 h-4 shrink-0" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-2">
        {filter === 'keys' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-2 pl-2">
              <Key className="w-5 h-5 text-emerald-500" /> ประวัติการใช้คีย์
            </h2>
            {usedKeysHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-white/20 rounded-xl bg-[#121417]">
                <Key className="w-8 h-8 mb-4 opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีประวัติการใช้งานคีย์</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {usedKeysHistory.map((key) => renderCard(key, 'key_use'))}
              </div>
            )}
          </div>
        )}

        {filter === 'topup' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-2 pl-2">
              <Wallet className="w-5 h-5 text-purple-500" /> ประวัติการเติมเงิน
            </h2>
            {topupHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-white/20 rounded-xl bg-[#121417]">
                <Wallet className="w-8 h-8 mb-4 opacity-30" />
                <p className="font-medium text-sm">ยังไม่มีประวัติการเติมเงิน</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {topupHistory.map((item) => renderCard(item, 'topup'))}
              </div>
            )}
          </div>
        )}

        {filter === 'key_purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4 pl-2">
              <ShoppingCart className="w-5 h-5 text-[#2563EB]" /> ประวัติการซื้อคีย์
            </h2>
            {renderPurchaseList(keyPurchases, 'key_purchase', 'ยังไม่มีประวัติการซื้อคีย์')}
          </div>
        )}

        {filter === 'general_purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4 pl-2">
              <Package className="w-5 h-5 text-fuchsia-500" /> ประวัติการซื้อสินค้าทั่วไป
            </h2>
            {renderPurchaseList(generalPurchases, 'general_purchase', 'ยังไม่มีประวัติการซื้อสินค้าทั่วไป')}
          </div>
        )}

        {filter === 'special_purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white mb-4 pl-2">
              <Crown className="w-5 h-5 text-amber-500" /> ประวัติการซื้อสินค้าพิเศษ
            </h2>
            {renderPurchaseList(specialPurchases, 'special_purchase', 'ยังไม่มีประวัติการซื้อสินค้าพิเศษ')}
          </div>
        )}
      </div>

      <DetailsModal />
    </div>
  );
};

