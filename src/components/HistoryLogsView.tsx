import React, { useState } from 'react';
import { History, Key, Activity, ArrowRight, Clock, Monitor, Wallet, ShoppingCart, Copy, Check, Package, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryLogsViewProps {
  usedKeysHistory?: any[];
  purchaseHistory?: any[];
}

export const HistoryLogsView: React.FC<HistoryLogsViewProps> = ({ usedKeysHistory = [], purchaseHistory = [] }) => {
  const [filter, setFilter] = useState<'key_purchase' | 'keys' | 'topup' | 'general_purchase' | 'special_purchase'>('key_purchase');
  const [topupHistory, setTopupHistory] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{details: any, type: string} | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('apex_topup_history');
      if (saved) {
        setTopupHistory(JSON.parse(saved));
      }
    } catch(e) {}
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
    <div className="flex items-center justify-between gap-3 bg-zinc-50 border border-zinc-200 py-1.5 px-3 rounded-lg w-full max-w-xs shadow-sm">
      <span className="font-mono text-zinc-700 font-medium text-xs truncate">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-zinc-400 hover:text-zinc-800 transition-colors shrink-0"
        title="คัดลอก"
      >
        {copiedId === id ? <Check className="w-3.5 h-3.5 text-emerald-600"/> : <Copy className="w-3.5 h-3.5"/>}
      </button>
    </div>
  );

  const DetailsModal = () => {
    if (!selectedItem) return null;
    const { details: item, type } = selectedItem;

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
        <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b border-zinc-100">
            <h3 className="font-bold text-lg text-zinc-900">รายละเอียดรายการ</h3>
            <button onClick={() => setSelectedItem(null)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-colors absolute top-4 right-4 focus:outline-none">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">หมายเลขบิล</span>
              <span className="font-mono font-bold text-xs bg-zinc-100 px-2 py-0.5 rounded text-zinc-700">BILL-{item.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">วันที่และเวลา</span>
              <span className="text-sm font-medium text-zinc-900">{new Date(item.timestamp || item.usedAt).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 text-sm font-medium">สถานะรายการ</span>
              <StatusBadge status="SUCCESS" />
            </div>
            
            <div className="h-px bg-zinc-100 my-2 w-full relative"></div>

            {type === 'topup' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-zinc-900">เติมเงินเข้าระบบ ({item.type || 'ผ่านระบบ'})</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-zinc-500 text-sm font-medium">จำนวนเงิน</span>
                   <span className="text-xl font-black text-blue-600">+{item.amount.toLocaleString()} ฿</span>
                </div>
              </>
            )}

            {type === 'key_use' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-zinc-900">ใช้งานคีย์ (Redeem)</span>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100 mt-2">
                   <span className="text-zinc-500 text-sm font-medium">รายละเอียดคีย์</span>
                   <CopyBox text={item.key} id={item.id} />
                </div>
              </>
            )}

            {['key_purchase', 'general_purchase', 'special_purchase'].includes(type) && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 text-sm font-medium shrink-0 pr-4">สินค้า</span>
                  <span className="text-sm font-bold text-zinc-900 text-right">{item.productName}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-zinc-500 text-sm font-medium">จำนวนเงิน</span>
                   <span className="text-xl font-black text-rose-600">-{item.price.toLocaleString()} ฿</span>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-zinc-100 mt-2">
                   <span className="text-zinc-500 text-sm font-medium">รายละเอียดสินค้า (คีย์ / ข้อมูล)</span>
                   <CopyBox text={item.secretData} id={item.id} />
                </div>
              </>
            )}

          </div>
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
             <button 
               onClick={() => setSelectedItem(null)}
               className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-colors w-full"
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
      amountNode = <span className="font-black text-blue-600 text-base md:text-lg">+{item.amount.toLocaleString()} ฿</span>;
    } else if (type === 'key_use') {
      title = "ใช้งานคีย์ (Redeem)";
      amountNode = <span className="font-black text-emerald-600 text-base md:text-lg">-</span>;
      displayId = item.id.substring(0,8).toUpperCase();
    } else {
      title = item.productName;
      amountNode = <span className="font-black text-rose-600 text-base md:text-lg">-{item.price.toLocaleString()} ฿</span>;
    }

    return (
      <div key={item.id} className="bg-white border border-zinc-200 rounded-3xl p-5 hover:border-zinc-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-zinc-100 group-hover:bg-red-500 transition-colors"></div>
        <div className="flex flex-col gap-2 flex-1 pl-2">
          <div className="flex items-center gap-3">
             <span className="font-bold text-zinc-900 text-base md:text-lg tracking-tight">{title}</span>
             <StatusBadge status="SUCCESS" />
          </div>
          <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
            <span className="font-mono bg-zinc-100 px-2 py-0.5 rounded-md text-[11px] text-zinc-700"># BILL-{displayId}</span>
            <span className="hidden leading-none md:inline-block border-l border-zinc-300 h-3"></span>
            <span>{dateStr}</span>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center justify-between md:items-end gap-4 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 pl-2 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 mb-0.5 md:hidden">จำนวนเงิน</span>
            {amountNode}
          </div>
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-6 py-2.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-sm font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 w-full md:w-auto"
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
        <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-300 rounded-3xl bg-zinc-50">
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
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-900 pb-20">
      {/* Header */}
      <div className="mb-8 pl-2">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-tight">
            <History className="w-8 h-8 text-red-600" /> 
            ประวัติการใช้งาน
        </h1>
        <p className="text-sm font-medium text-zinc-500">History / Logs ประวัติการใช้งานต่างๆ ของคุณในระบบ</p>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto pb-4 mb-4 scrollbar-none w-full">
        <div className="flex bg-white border border-zinc-200 rounded-2xl w-fit shadow-sm p-1.5 gap-1.5 min-w-max">
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
                  active ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/20' : 'text-zinc-500 border-transparent hover:text-red-600 hover:bg-zinc-50 hover:border-zinc-200'
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
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-2 pl-2">
              <Key className="w-5 h-5 text-emerald-500" /> ประวัติการใช้คีย์
            </h2>
            {usedKeysHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-300 rounded-3xl bg-zinc-50">
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
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-2 pl-2">
              <Wallet className="w-5 h-5 text-blue-600" /> ประวัติการเติมเงิน
            </h2>
            {topupHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-zinc-400 border border-dashed border-zinc-300 rounded-3xl bg-zinc-50">
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
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4 pl-2">
              <ShoppingCart className="w-5 h-5 text-red-500" /> ประวัติการซื้อคีย์
            </h2>
            {renderPurchaseList(keyPurchases, 'key_purchase', 'ยังไม่มีประวัติการซื้อคีย์')}
          </div>
        )}

        {filter === 'general_purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4 pl-2">
              <Package className="w-5 h-5 text-fuchsia-500" /> ประวัติการซื้อสินค้าทั่วไป
            </h2>
            {renderPurchaseList(generalPurchases, 'general_purchase', 'ยังไม่มีประวัติการซื้อสินค้าทั่วไป')}
          </div>
        )}

        {filter === 'special_purchase' && (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-right-8 duration-300">
            <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 mb-4 pl-2">
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

