import React, { useState } from 'react';
import { Eye, Package, Calendar, DollarSign, Clock, ShieldCheck, ArrowRight, ShoppingBag, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ReceiptModal } from './modals/ReceiptModal';

interface MyOrdersViewProps {
  purchaseHistory?: any[];
}

export const MyOrdersView: React.FC<MyOrdersViewProps> = ({ purchaseHistory = [] }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Math metrics
  const totalOrders = purchaseHistory.length;
  const successfulOrders = purchaseHistory.filter(o => {
    const s = o.status?.toLowerCase();
    return s === 'success' || !s || s === 'completed';
  }).length;
  const preOrdersCount = purchaseHistory.filter(o => o.isPreOrder || o.isPreorder || o.status?.toLowerCase() === 'preorder').length;
  
  const totalSpent = purchaseHistory.reduce((sum, order) => {
    return sum + Number(order.price || order.money || 0);
  }, 0);

  const getStatusBadge = (status: string, isPreOrder: boolean) => {
    const finalStatus = status || (isPreOrder ? 'preorder' : 'success');
    switch (finalStatus?.toLowerCase()) {
      case 'success':
      case 'completed':
        return (
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-bold uppercase border border-emerald-500/20 rounded-xl flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
            สำเร็จ
          </span>
        );
      case 'preorder':
        return (
          <span className="bg-[#4F46E5]/10 text-[#818CF8] px-3 py-1 text-xs font-bold uppercase border border-[#818CF8]/20 rounded-xl flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-[#818CF8] rounded-full animate-pulse"></div>
            พรีออเดอร์
          </span>
        );
      case 'pending':
        return (
          <span className="bg-amber-500/10 text-amber-400 px-3 py-1 text-xs font-bold uppercase border border-amber-500/20 rounded-xl flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>
            รอดำเนินการ
          </span>
        );
      case 'failed':
        return (
          <span className="bg-rose-500/10 text-rose-400 px-3 py-1 text-xs font-bold uppercase border border-rose-500/20 rounded-xl flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-rose-400 rounded-full"></div>
            ล้มเหลว
          </span>
        );
      default:
        return (
          <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-bold uppercase border border-emerald-500/20 rounded-xl flex items-center gap-1.5 w-max">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
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
      
      {/* Header Intro */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
            <Package className="w-8 h-8 text-neon-green" />
            คำสั่งซื้อของฉัน
          </h1>
          <p className="text-sm text-zinc-400 mt-2">ประวัติการสั่งซื้อสินค้า คีย์รหัส แฟลชดีล และสถานะพรีออเดอร์ทั้งหมดของคุณ</p>
        </div>
        <div className="bg-[#111] border border-white/[0.04] rounded-xl px-4 py-2.5 flex items-center gap-2 max-w-max">
          <ShieldCheck className="w-4 h-4 text-neon-green" />
          <span className="text-xs font-bold text-zinc-300">ระบบรักษาความปลอดภัย 256-bit</span>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0c0c0c]/90 border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-bold">ยอดซื้อทั้งหมด</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-black text-white">฿{totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-[#0c0c0c]/90 border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-bold">รายการสำเร็จ</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-black text-emerald-400">{successfulOrders}</span>
            <span className="text-xs text-zinc-600">จาก {totalOrders} รายการ</span>
          </div>
        </div>
        <div className="bg-[#0c0c0c]/90 border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-bold">พรีออเดอร์</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl md:text-2xl font-black text-[#818CF8]">{preOrdersCount}</span>
            <span className="text-xs text-zinc-600">รายการ</span>
          </div>
        </div>
        <div className="bg-[#0c0c0c]/90 border border-white/[0.05] rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-zinc-500 font-bold">ความน่าเชื่อถือ</span>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-sm font-black text-zinc-300">ความปลอดภัยสูง</span>
          </div>
        </div>
      </div>

      {/* Main Order Content */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-2xl shadow-xl overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="px-6 py-4 border-b border-white/[0.06] bg-[#0d0d0d] flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-500" />
            ตารางรายการคำสั่งซื้อ
          </span>
          <span className="text-xs bg-white/[0.05] text-zinc-400 px-2.5 py-1 rounded-lg">
            ล่าสุด
          </span>
        </div>

        {/* Desktop Table view */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300 min-w-[700px]">
            <thead className="bg-[#0b0b0b] border-b border-white/[0.05] text-xs uppercase font-bold text-zinc-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">ออเดอร์ไอดี / เลขบิล</th>
                <th className="px-6 py-4">วันที่ทำรายการ</th>
                <th className="px-6 py-4">ชื่อสินค้า</th>
                <th className="px-6 py-4 text-right">ยอดชำระสุทธิ</th>
                <th className="px-6 py-4">สถานะ</th>
                <th className="px-6 py-4 text-center w-[120px]">ดูข้อมูลสินค้า</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {purchaseHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-zinc-500 bg-[#0a0a0a]/50">
                    <Package className="w-12 h-12 mx-auto mb-4 text-zinc-700 stroke-[1.5px]" />
                    <p className="font-bold text-zinc-400 text-base">ไม่พบประวัติการซื้อ</p>
                    <p className="text-zinc-600 text-xs mt-1">คุณยังไม่ได้ทำคำสั่งซื้อใดๆ ในระบบในขณะนี้</p>
                  </td>
                </tr>
              ) : (
                purchaseHistory
                  .sort((a, b) => new Date(b.date || b.timestamp || 0).getTime() - new Date(a.date || a.timestamp || 0).getTime())
                  .map((order, idx) => {
                    const isPre = !!(order.isPreOrder || order.isPreorder);
                    const status = order.status || (isPre ? 'preorder' : 'success');

                    return (
                      <tr key={order.id || idx} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-400 font-medium">
                          {order.id ? order.id.substring(0, 8).toUpperCase() : `BILL-${idx + 1}`}
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-xs">
                          {formatDate(order.date || order.timestamp)}
                        </td>
                        <td className="px-6 py-4 max-w-[220px]">
                          <div className="font-extrabold text-white truncate text-sm">{order.productName || 'สินค้าคุณภาพ'}</div>
                          {isPre && (
                            <span className="text-[10px] text-zinc-500 block mt-0.5 font-semibold">จัดส่งหลังสั่งซื้อพรีออเดอร์</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-black text-neon-yellow text-sm">
                          ฿{Number(order.price || order.money || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(status, isPre)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {(status === 'success' || status === 'preorder' || status === 'completed') ? (
                            <button
                              onClick={() => setSelectedItem({
                                ...order,
                                isPreOrder: isPre,
                                productName: order.productName,
                                date: order.date || order.timestamp,
                                key: order.productName,
                                secretData: order.secretData || order.key || 'อยู่ระหว่างจัดเตรียมข้อมูลส่งมอบสินค้า...',
                                type: 'normal_product'
                              })}
                              className="bg-white/[0.04] border border-white/[0.08] hover:bg-neon-green hover:text-black hover:border-transparent text-zinc-300 w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all duration-300 group-hover:scale-110 cursor-pointer"
                              title="ดูสินค้า"
                            >
                              <Eye className="w-4.5 h-4.5" />
                            </button>
                          ) : (
                            <span className="text-zinc-600 font-mono">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List View (Incredibly polished cards) */}
        <div className="block md:hidden divide-y divide-white/[0.05]">
          {purchaseHistory.length === 0 ? (
            <div className="px-6 py-16 text-center text-zinc-500 bg-[#0a0a0a]/50">
              <Package className="w-12 h-12 mx-auto mb-4 text-zinc-700 stroke-[1.5px]" />
              <p className="font-bold text-zinc-400 text-base">ไม่พบประวัติการซื้อ</p>
              <p className="text-zinc-600 text-xs mt-1">คุณยังไม่ได้ทำคำสั่งซื้อใดๆ ในระบบในขณะนี้</p>
            </div>
          ) : (
            purchaseHistory
              .sort((a, b) => new Date(b.date || b.timestamp || 0).getTime() - new Date(a.date || a.timestamp || 0).getTime())
              .map((order, idx) => {
                const isPre = !!(order.isPreOrder || order.isPreorder);
                const status = order.status || (isPre ? 'preorder' : 'success');

                return (
                  <div key={order.id || idx} className="p-5 hover:bg-white/[0.01] transition-all flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/[0.03] pb-3">
                      <div>
                        <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">เลขที่บิล</div>
                        <div className="text-xs font-mono font-bold text-zinc-300 mt-0.5">
                          {order.id ? order.id.substring(0, 8).toUpperCase() : `BILL-${idx + 1}`}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-[10px] text-zinc-500 font-bold">ราคา</div>
                        <div className="text-sm font-mono font-black text-neon-yellow mt-0.5">
                          ฿{Number(order.price || order.money || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">รายการ</span>
                      <span className="text-sm font-extrabold text-white leading-tight">{order.productName || 'สินค้า'}</span>
                      {isPre && <span className="text-[9px] text-zinc-500 italic mt-0.5">พรีออเดอร์สินค้า</span>}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[9px] text-zinc-600 block">ทำรายการเมื่อ</span>
                        <span className="text-[11px] text-zinc-400 font-bold">{formatDate(order.date || order.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(status, isPre)}
                        {(status === 'success' || status === 'preorder' || status === 'completed') && (
                          <button
                            onClick={() => setSelectedItem({
                              ...order,
                              isPreOrder: isPre,
                              productName: order.productName,
                              date: order.date || order.timestamp,
                              key: order.productName,
                              secretData: order.secretData || order.key || 'อยู่ระหว่างจัดเตรียมส่งมอบข้อมูล...',
                              type: 'normal_product'
                            })}
                            className="bg-white/5 border border-white/[0.08] hover:bg-neon-green hover:text-black hover:border-transparent text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            ดูสินค้า
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Pre-order terms & policy explanation */}
      <div className="mt-6 bg-[#0c0c0c] border border-[#2b2207]/40 rounded-2xl p-4 flex gap-4 items-start">
        <Info className="w-5 h-5 text-neon-yellow shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-bold text-zinc-200">ข้อควรทราบเกี่ยวกับระบบพรีออเดอร์ (Pre-order Info)</p>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            รายการสินค้าพรีออเดอร์จะใช้เวลาจัดส่งข้อมูล 15-30 นาทีหลังชำระเงินสำเร็จ แอดมินจะทำการส่งรหัสไอดีเข้าไปในรายละเอียดบิลของท่านอัตโนมัติ คุณสามารถตรวจสอบข้อมูลชุดไอดีได้ทันทีเมื่อสัญลักษณ์เปลี่ยนเป็นสำเร็จ
          </p>
        </div>
      </div>

      {/* Detailed Modal view */}
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
