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
    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 ${ status === 'SUCCESS' ? 'text-emerald-700 bg-primary text-primary-foreground' : 'text-zinc-400 bg-zinc-200' }`}>
      {status}
    </span>
  );

  const CopyBox = ({ text, id }: { text: string, id: string }) => (
    <div className="flex items-center justify-between gap-3 bg-card border border-border border-2 py-1.5 px-3 w-full max-w-xs brut-card">
      <span className="font-mono text-muted-foreground font-medium text-xs truncate">
        {text}
      </span>
      <button 
        onClick={() => handleCopy(text, id)}
        className="text-muted-foreground hover:text-zinc-200 transition-colors shrink-0"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
          <div className="bg-card w-full max-w-md overflow-hidden relative brut-card" onClick={e => e.stopPropagation()}>
            <div className="p-6 pb-4 relative">
              <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-zinc-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-2xl font-black text-blue-600 mb-1">รายละเอียดการซื้อ</h3>
              <p className="text-muted-foreground text-sm font-medium">หมายเลขบิล: <span className="font-mono text-white bg-card px-2 py-0.5 brut-card">BILL-{item.id?.toUpperCase()}</span></p>
            </div>

            <div className="px-6 space-y-6">
              <div className="bg-pink-50 border border-pink-100 p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100/50 blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
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
                <div className="bg-card border p-4 flex flex-col gap-4 border-border border-2 brut-card">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-card border border-border border-2 flex items-center justify-center shrink-0 text-muted-foreground brut-card">
                      <Package className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-white text-sm md:text-base truncate">{item.productName}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-medium bg-card px-2 py-0.5 brut-card">จำนวน 1 ชิ้น</span>
                        <span className="text-sm font-black text-rose-600">฿ {item.price?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    className="w-full py-2.5 bg-card hover:bg-[#121212] border border-border border-2 text-muted-foreground text-sm font-bold transition-all brut-card"
                  >
                    {showSecret ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                  </button>
                  {showSecret && item.secretData && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200 pt-2 border-t border-border border-2">
                       <span className="text-xs font-bold text-muted-foreground mb-2 block">โค้ด / ข้อมูลสินค้า</span>
                       <CopyBox text={item.secretData} id={item.id} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 mt-2">
              <button 
                onClick={() => setSelectedItem(null)}
                className="w-full py-4 bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-white text-base font-black transition-all"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedItem(null)}>
        <div className="bg-card w-full max-w-md overflow-hidden relative brut-card" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center p-6 border-b border-border border-2">
            <h3 className="font-bold text-lg text-white">รายละเอียดรายการ</h3>
            <button onClick={() => setSelectedItem(null)} className="p-2 bg-card hover:bg-zinc-200 text-muted-foreground transition-colors absolute top-4 right-4 focus:outline-none brut-card">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">หมายเลขบิล</span>
              <span className="font-mono font-bold text-xs bg-card px-2 py-0.5 rounded text-muted-foreground brut-card">BILL-{item.id?.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">วันที่และเวลา</span>
              <span className="text-sm font-medium text-white">{new Date(item.timestamp || item.usedAt || item.date).toLocaleString('th-TH')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm font-medium">สถานะรายการ</span>
              <StatusBadge status="SUCCESS" />
            </div>
            
            <div className="h-px bg-card my-2 w-full relative brut-card"></div>

            {type === 'topup' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-white">เติมเงินเข้าระบบ ({item.type || 'ผ่านระบบ'})</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                   <span className="text-muted-foreground text-sm font-medium">จำนวนเงิน</span>
                   <span className="text-xl font-black text-blue-600">+{item.amount?.toLocaleString() || 0} ฿</span>
                </div>
              </>
            )}

            {type === 'key_use' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm font-medium">ประเภทรายการ</span>
                  <span className="text-sm font-bold text-white">ใช้งานคีย์ (Redeem)</span>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-border border-2 mt-2">
                   <span className="text-muted-foreground text-sm font-medium">รายละเอียดคีย์</span>
                   <CopyBox text={item.key} id={item.id} />
                </div>
              </>
            )}

          </div>
          <div className="p-4 bg-card border-t border-border border-2 flex justify-end brut-card">
             <button 
               onClick={() => setSelectedItem(null)}
               className="px-6 py-3 bg-card hover:bg-[#1e1e1e] text-white text-sm font-bold transition-colors w-full brut-card"
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
      amountNode = <span className="font-black text-blue-600 text-base md:text-lg">+{(item.amount || 0).toLocaleString()} ฿</span>;
    } else if (type === 'key_use') {
      title = "ใช้งานคีย์ (Redeem)";
      amountNode = <span className="font-black text-emerald-600 text-base md:text-lg">-</span>;
      displayId = item.id.substring(0,8).toUpperCase();
    } else {
      title = item.productName;
      amountNode = <span className="font-black text-rose-600 text-base md:text-lg">-{(item.price || 0).toLocaleString()} ฿</span>;
    }

    return (
      <div key={item.id} className="bg-card border border-border border-2 p-5 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group relative overflow-hidden brut-card">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-card group-hover:bg-[#2563EB] transition-colors brut-card"></div>
        <div className="flex flex-col gap-2 flex-1 pl-2">
          <div className="flex items-center gap-3">
             <span className="font-bold text-white text-base md:text-lg tracking-tight">{title}</span>
             <StatusBadge status="SUCCESS" />
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium">
            <span className="font-mono bg-card px-2 py-0.5 text-[11px] text-muted-foreground brut-card"># BILL-{displayId}</span>
            <span className="hidden leading-none md:inline-block border-l border-border border-2 h-3"></span>
            <span>{dateStr}</span>
          </div>
        </div>
        
        <div className="flex flex-row flex-wrap md:flex-nowrap items-center justify-between md:items-end gap-4 border-t md:border-t-0 border-border border-2 pt-4 md:pt-0 pl-2 md:pl-0 mt-1 md:mt-0">
          <div className="flex flex-col items-start md:items-end w-full md:w-auto">
            <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5 md:hidden">จำนวนเงิน</span>
            {amountNode}
          </div>
          <button 
            onClick={() => setSelectedItem({ details: item, type })}
            className="px-6 py-2.5 bg-card hover:bg-[#121212] border border-border border-2 text-muted-foreground text-sm font-bold transition-all whitespace-nowrap active:scale-95 w-full md:w-auto brut-card"
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
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border border-2 bg-card brut-card">
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
            <History className="w-8 h-8 text-blue-600" /> 
            ประวัติสั่งซื้อ
        </h1>
        <p className="text-sm font-medium text-muted-foreground">History / Logs ประวัติการทำรายการต่างๆ ของคุณในระบบ</p>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="overflow-x-auto pb-4 mb-4 scrollbar-none w-full">
        <div className="flex bg-card border border-border border-2 w-fit p-1.5 gap-1.5 min-w-max brut-card">
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
                className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs sm:text-sm transition-all border ${ active ? 'bg-purple-600 text-white border-[#3B82F6]' : 'text-zinc-500 border-transparent hover:text-blue-600 hover:bg-[#121212] hover:border-white/10' }`}
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
              <Key className="w-5 h-5 text-blue-500" /> ประวัติการใช้คีย์
            </h2>
            {usedKeysHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border border-2 bg-card brut-card">
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
              <Wallet className="w-5 h-5 text-blue-600" /> ประวัติการเติมเงิน
            </h2>
            {topupHistory.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border border-2 bg-card brut-card">
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

