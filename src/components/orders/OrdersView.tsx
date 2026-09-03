import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Copy, 
  Check, 
  Clock, 
  ShoppingCart, 
  Key, 
  Lock, 
  ExternalLink,
  ShieldCheck,
  Search,
  Gamepad2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { OrderItem } from '../../types/store';

export const OrdersView: React.FC<{ onNavigateToShop?: () => void }> = ({ onNavigateToShop }) => {
  const { orders, theme } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'rent'>('all');
  const [search, setSearch] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = orders.filter(order => {
    if (filterType !== 'all' && order.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        order.productTitle.toLowerCase().includes(q) ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.gameName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Package className="w-4 h-4" />
            <span>Order History & Credentials</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            ประวัติการสั่งซื้อและรับไอดีเกม
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            ดูรหัสผ่าน ข้อมูลการเข้าสู่ระบบ และใบเสร็จของทุกรายการย้อนหลังได้ตลอดเวลา
          </p>
        </div>

        {/* Filter / Search bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ทั้งหมด ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('buy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'buy' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              ซื้อขาด ({orders.filter(o => o.type === 'buy').length})
            </button>
            <button
              onClick={() => setFilterType('rent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'rent' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              เช่าไอดี ({orders.filter(o => o.type === 'rent').length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800/80 text-zinc-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">ยังไม่มีประวัติคำสั่งซื้อ</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              เมื่อคุณทำการซื้อหรือเช่าไอดีเกม ข้อมูลรหัสผ่านจะถูกบันทึกไว้ที่นี่อย่างปลอดภัย
            </p>
          </div>
          {onNavigateToShop && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={onNavigateToShop}
              className="py-2.5 px-5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>ไปเลือกดูไอดีเกมในร้านค้า</span>
            </motion.button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              layout
              className="p-5 sm:p-6 rounded-2xl bg-[#0f1015] border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    order.type === 'buy'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {order.type === 'buy' ? <ShoppingCart className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-400">{order.orderNumber}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.type === 'buy'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {order.type === 'buy' ? 'ซื้อขาด' : `เช่า ${order.durationHours || ''} ชม.`}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-zinc-100 mt-0.5">{order.productTitle}</h3>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col justify-between items-end">
                  <span className="text-base font-black text-emerald-400 font-mono">
                    ฿{order.price.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono">{order.purchasedAt}</span>
                </div>
              </div>

              {/* Account Credentials Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 font-mono text-xs">
                {/* Username */}
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-zinc-500 font-sans block">ชื่อผู้ใช้ (Username):</span>
                    <span className="font-bold text-zinc-200 select-all truncate block">{order.credentials.username}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(order.credentials.username, `${order.id}-usr`)}
                    className="p-1 text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer"
                  >
                    {copiedId === `${order.id}-usr` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password */}
                {order.credentials.password && (
                  <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] text-zinc-500 font-sans block">รหัสผ่าน (Password):</span>
                      <span className="font-bold text-amber-300 select-all truncate block">{order.credentials.password}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(order.credentials.password || '', `${order.id}-pwd`)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer"
                    >
                      {copiedId === `${order.id}-pwd` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}

                {/* 2FA / Info */}
                <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <span className="text-[10px] text-zinc-500 font-sans block">ข้อมูลเพิ่มเติม:</span>
                    <span className="text-zinc-300 text-[11px] truncate block">
                      {order.credentials.twoFactorKey || order.credentials.emailLinked || 'พร้อมเล่นทันที'}
                    </span>
                  </div>
                  {order.credentials.twoFactorKey && (
                    <button
                      onClick={() => handleCopy(order.credentials.twoFactorKey || '', `${order.id}-2fa`)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 shrink-0 cursor-pointer"
                    >
                      {copiedId === `${order.id}-2fa` ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
