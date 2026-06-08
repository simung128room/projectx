import React, { useState } from 'react';
import { Eye, Package } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { ReceiptModal } from './modals/ReceiptModal';

interface MyOrdersViewProps {
  purchaseHistory?: any[];
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ purchaseHistory = [] }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 text-xs font-bold uppercase border border-emerald-500/20 rounded-lg flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>สำเร็จ</span>;
      case 'preorder':
        return <span className="bg-purple-500/10 text-purple-400 px-3 py-1 text-xs font-bold uppercase border border-purple-500/20 rounded-lg flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>พรีออเดอร์</span>;
      case 'pending':
        return <span className="bg-amber-500/10 text-amber-500 px-3 py-1 text-xs font-bold uppercase border border-amber-500/20 rounded-lg flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>รอดำเนินการ</span>;
      case 'failed':
        return <span className="bg-red-500/10 text-red-500 px-3 py-1 text-xs font-bold uppercase border border-red-500/20 rounded-lg flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>ล้มเหลว</span>;
      default:
        return <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 text-xs font-bold uppercase border border-emerald-500/20 rounded-lg flex items-center gap-1.5 w-max"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>สำเร็จ</span>; // Default success if not specified
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
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-fade-in fade-in-up">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <Package className="w-8 h-8 text-neon-green" />
          คำสั่งซื้อของฉัน
        </h1>
        <p className="text-sm text-zinc-400 mt-2">ประวัติการสั่งซื้อสินค้าทั้งหมดของคุณ ทั้งสินค้าพร้อมส่งและพรีออเดอร์</p>
      </div>

      <div className="bg-[#0f0f0f] border border-white/[0.05] rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[700px]">
            <thead className="bg-[#1a1a1a] border-b border-white/[0.05] text-xs uppercase font-bold text-zinc-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">เลขบิล</th>
                <th className="px-6 py-4">วันที่</th>
                <th className="px-6 py-4">ชื่อสินค้า</th>
                <th className="px-6 py-4 text-right">ยอดเงิน</th>
                <th className="px-6 py-4 whitespace-nowrap">สถานะ</th>
                <th className="px-6 py-4 text-center w-[120px]">ดูสินค้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {purchaseHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 bg-[#0a0a0a]">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium text-base">ยังไม่มีประวัติการสั่งซื้อ</p>
                  </td>
                </tr>
              ) : (
                purchaseHistory.sort((a, b) => new Date(b.date || b.timestamp || 0).getTime() - new Date(a.date || a.timestamp || 0).getTime()).map((order, idx) => {
                  let status = order.status || (order.isPreorder ? 'preorder' : 'success');
                  
                  return (
                    <tr key={order.id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-zinc-400">{order.id ? order.id.substring(0,8).toUpperCase() : `BILL-${idx+1}`}</td>
                      <td className="px-6 py-4 text-zinc-400 text-xs">{formatDate(order.date || order.timestamp)}</td>
                      <td className="px-6 py-4 font-bold text-white max-w-[200px] truncate">{order.productName || 'สินค้า'}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-neon-yellow">฿{Number(order.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {(status === 'success' || status === 'preorder') ? (
                          <button
                            onClick={() => setSelectedItem({ ...order, title: order.productName, date: order.date || order.timestamp, money: -Number(order.price || 0), type: 'normal_product' })}
                            className="bg-zinc-800 hover:bg-zinc-700 text-white w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-colors"
                            title="ดูสินค้า"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <ReceiptModal
            isOpen={!!selectedItem}
            onClose={() => setSelectedItem(null)}
            purchaseData={selectedItem}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
