import React, { useState } from 'react';
import { Users, Search, Edit, CheckCircle, Ban, Wallet, ArrowRightLeft, Eye, RefreshCw, HandCoins, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

interface AdminUserManagementProps {
  purchaseHistory: any[];
  topupHistory: any[];
  usedKeysHistory: any[];
  users: any[];
  onRefresh: () => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({ purchaseHistory, topupHistory, usedKeysHistory, users, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionTab, setActionTab] = useState<'info'|'purchase'|'topup'|'keys'>('info');

  const filteredUsers = users.filter(u => 
    (u.email || '').toLowerCase().includes(search.toLowerCase()) || 
    (u.role || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateBalance = async (user: any, type: 'add' | 'deduct') => {
    const { value } = await Swal.fire({
      title: type === 'add' ? 'เพิ่มเงิน (Add Balance)' : 'หักเงิน (Deduct Balance)',
      input: 'number',
      inputLabel: 'จำนวนเงิน (บาท)',
      inputAttributes: { min: '1', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: type === 'add' ? '#10b981' : '#dc2626'
    });

    if (value) {
      const amount = Number(value);
      const newBalance = type === 'add' ? (user.balance || 0) + amount : Math.max(0, (user.balance || 0) - amount);
      
      try {
        Swal.showLoading();
        await axios.post(`/api/users/${user.id || user.uid}`, { balance: newBalance });
        setSelectedUser({ ...user, balance: newBalance });
        onRefresh();
        Swal.fire({ icon: 'success', title: 'สำเร็จ!', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    }
  };

  const handleEditUser = async (user: any) => {
    const { value } = await Swal.fire({
      title: 'แก้ไขข้อมูลผู้ใช้',
      html: `
        <div class="space-y-4">
          <input id="swal-role" class="swal2-input w-full" placeholder="Role (Member, Admin, Premium)" value="${user.role || 'Member'}">
          <input id="swal-username" class="swal2-input w-full" placeholder="Display Name" value="${user.username || ''}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      confirmButtonColor: '#dc2626',
      preConfirm: () => {
        return {
          role: (document.getElementById('swal-role') as HTMLInputElement).value,
          username: (document.getElementById('swal-username') as HTMLInputElement).value
        };
      }
    });

    if (value) {
      try {
        Swal.showLoading();
        await axios.post(`/api/users/${user.id || user.uid}`, value);
        setSelectedUser({ ...user, ...value });
        onRefresh();
        Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลแล้ว', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    }
  };

  const handleToggleBan = async (user: any) => {
    const isBanned = user.status === 'banned';
    const result = await Swal.fire({
      title: isBanned ? 'ปลดแบนผู้ใช้นี้?' : 'แบนผู้ใช้นี้เข้าสู่ระบบ?',
      text: isBanned ? 'ผู้ใช้จะสามารถเข้าสู่ระบบและใช้งานได้ตามปกติ' : 'ผู้ใช้จะไม่สามารถเข้าสู่ระบบและใช้บริการได้อีก',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isBanned ? 'ปลดแบน' : 'ยืนยันการแบน',
      confirmButtonColor: isBanned ? '#10b981' : '#dc2626'
    });

    if (result.isConfirmed) {
      const newStatus = isBanned ? 'active' : 'banned';
      try {
        Swal.showLoading();
        await axios.post(`/api/users/${user.id || user.uid}`, { status: newStatus });
        setSelectedUser({ ...user, status: newStatus });
        onRefresh();
        Swal.fire({ icon: 'success', title: 'สำเร็จ!', showConfirmButton: false, timer: 1500 });
      } catch (err) {
        Swal.fire('Error', 'ไม่สามารถบันทึกข้อมูลได้', 'error');
      }
    }
  };

  // Match history by username/email
  const userPurchaseHistory = purchaseHistory.filter(h => h.username && selectedUser && selectedUser.email && (h.username.toLowerCase() === selectedUser.email.toLowerCase() || h.username.toLowerCase() === selectedUser.email.split('@')[0].toLowerCase() || selectedUser.email.toLowerCase().startsWith(h.username.toLowerCase())));
  const userTopupHistory = topupHistory.filter(h => h.username && selectedUser && selectedUser.email && (h.username.toLowerCase() === selectedUser.email.toLowerCase() || h.username.toLowerCase() === selectedUser.email.split('@')[0].toLowerCase() || selectedUser.email.toLowerCase().startsWith(h.username.toLowerCase())));
  const userKeysHistory = usedKeysHistory; // For simulation, assuming keys might be linked later, currently we just show all or none

  return (
    <div className="space-y-6">
      {!selectedUser ? (
        <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#1a7fe6]" /> จัดการผู้ใช้ (User Management)</h3>
            <div className="flex bg-[#0a0d12] border border-white/10 rounded-2xl p-1 overflow-hidden shrink-0 w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ค้นหาอีเมล, บทบาท..."
                className="w-full bg-transparent border-none focus:ring-0 text-xs px-3 py-2 pl-9 font-medium"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 flex-1">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs uppercase bg-[#0a0d12] text-zinc-500 font-bold tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-b border-white/5">อีเมล/ผู้ใช้</th>
                  <th className="px-4 py-3 border-b border-white/5">บทบาท</th>
                  <th className="px-4 py-3 border-b border-white/5">สถานะ</th>
                  <th className="px-4 py-3 border-b border-white/5 text-right">ยอดเงิน (บาท)</th>
                  <th className="px-4 py-3 border-b border-white/5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-[#0a0d12]/50 transition-colors">
                    <td className="px-4 py-4 font-bold text-white flex items-center gap-2">
                      {u.email}
                      <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           navigator.clipboard.writeText(u.email);
                           Swal.fire({ title: 'Copied!', text: 'คัดลอกอีเมลแล้ว', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' });
                         }}
                         className="text-zinc-300 hover:text-zinc-500 transition-colors"
                      >
                         <Copy className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold ${u.role === 'Admin' ? 'bg-[#1E90FF]/10 text-[#1E90FF] border border-white/10' : u.role === 'Premium' ? 'bg-amber-500/10 text-amber-600 border border-amber-100' : 'bg-[#121820] text-zinc-400 border border-white/10'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {u.status === 'banned' ? (
                         <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-[#121820] text-zinc-500 flex items-center gap-1 w-max"><Ban className="w-3 h-3"/> ระงับห้ามใช้</span>
                      ) : (
                         <span className="px-2 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-600 flex items-center gap-1 w-max"><CheckCircle className="w-3 h-3"/> ปกติ</span>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold font-mono text-emerald-600 text-right">{u.balance.toLocaleString()}</td>
                    <td className="px-4 py-4 text-right">
                       <button onClick={() => setSelectedUser(u)} className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 ml-auto shadow-sm active:scale-95">
                          <Eye className="w-3 h-3" /> ดูข้อมูล
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500 font-medium text-xs">ไม่พบข้อมูลผู้ใช้</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key="user-detail"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-[#0B0F14] border border-white/10 rounded-3xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-6 md:p-8 bg-[#0a0d12]/50 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#0B0F14] border border-white/10 rounded-2xl flex items-center justify-center p-1 shrink-0 relative overflow-hidden shadow-sm">
                   <div className="bg-[#121820] w-full h-full rounded-xl flex items-center justify-center text-zinc-400">
                     <Users className="w-6 h-6" />
                   </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedUser.email}</h2>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className={`px-2 py-0.5 rounded uppercase tracking-widest ${selectedUser.role === 'Admin' ? 'bg-[#1E90FF]/20 text-[#1E90FF]' : selectedUser.role === 'Premium' ? 'bg-amber-100 text-amber-600' : 'bg-zinc-200 text-zinc-400'}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 ${selectedUser.status === 'banned' ? 'bg-zinc-200 text-zinc-400' : 'bg-emerald-100 text-emerald-600'}`}>
                      {selectedUser.status === 'banned' ? <><Ban className="w-3 h-3"/> Banned</> : <><CheckCircle className="w-3 h-3"/> Active</>}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedUser(null)} className="px-4 py-2 border border-white/10 bg-[#0B0F14] hover:bg-[#0a0d12] text-zinc-400 rounded-xl text-xs font-bold transition-all shadow-sm">กลับไปหน้ารายชื่อ</button>
              </div>
            </div>

            <div className="border-b border-white/5 bg-[#0B0F14] px-6 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-2 py-4 w-max">
                {[
                  { id: 'info', label: 'ข้อมูลทั่วไป & จัดการ' },
                  { id: 'purchase', label: 'ประวัติซื้อสินค้า' },
                  { id: 'topup', label: 'ประวัติเติมเงิน' },
                  { id: 'keys', label: 'ประวัติใช้คีย์' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActionTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      actionTab === tab.id 
                        ? 'bg-zinc-900 text-white shadow-sm ring-1 ring-zinc-900' 
                        : 'bg-[#0a0d12] text-zinc-500 hover:bg-[#121820] hover:text-zinc-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 bg-[#0B0F14] min-h-[300px]">
              {actionTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Info */}
                  <div className="space-y-6">
                    <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><Wallet className="w-4 h-4"/> ข้อมูลการเงิน</h4>
                      <div className="flex items-end justify-between mb-6">
                        <div>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">ยอดเงินคงเหลือ</p>
                           <p className="text-3xl font-black font-mono text-emerald-500">฿{selectedUser.balance.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateBalance(selectedUser, 'add')} className="flex-1 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 outline-none">
                          <HandCoins className="w-4 h-4" /> เพิ่มเงิน
                        </button>
                        <button onClick={() => handleUpdateBalance(selectedUser, 'deduct')} className="flex-1 py-2.5 bg-[#1E90FF]/10 border border-[#1E90FF]/30 text-[#1E90FF] hover:bg-[#1E90FF]/20 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 outline-none">
                          <ArrowRightLeft className="w-4 h-4" /> หักเงิน
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/5 flex justify-between items-center bg-[#0a0d12]/50">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">วันที่ลงทะเบียน</p>
                        <p className="text-sm font-bold text-zinc-200 mt-0.5">{new Date(selectedUser.registered).toLocaleString('th-TH')}</p>
                      </div>
                      <CalendarIcon className="w-5 h-5 text-zinc-300" />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-6">
                    <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-6">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">การจัดการบัญชี</h4>
                      
                      <div className="space-y-3">
                        <button onClick={() => handleEditUser(selectedUser)} className="w-full flex items-center justify-between p-3.5 bg-[#0B0F14] border border-white/10 hover:border-white/20 rounded-xl transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-[#0a0d12] rounded-lg group-hover:bg-[#121820] transition-colors"><Edit className="w-4 h-4 text-zinc-400" /></div>
                             <div className="flex flex-col items-start leading-tight">
                                <span className="text-sm font-bold text-white">แก้ไขข้อมูลบทบาท</span>
                                <span className="text-[10px] text-zinc-500 font-medium mt-0.5">เปลี่ยนสิทธิ์ Member / Premium</span>
                             </div>
                           </div>
                        </button>
                        
                        <button onClick={() => Swal.fire({title: 'เปลี่ยนรหัสผ่าน', input: 'password', inputPlaceholder: 'New Password...', showCancelButton: true, confirmButtonText: 'อัปเดต', confirmButtonColor: '#dc2626'})} className="w-full flex items-center justify-between p-3.5 bg-[#0B0F14] border border-white/10 hover:border-white/20 rounded-xl transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-[#0a0d12] rounded-lg group-hover:bg-[#121820] transition-colors"><RefreshCw className="w-4 h-4 text-zinc-400" /></div>
                             <div className="flex flex-col items-start leading-tight">
                                <span className="text-sm font-bold text-white">เปลี่ยนรหัสผ่าน</span>
                                <span className="text-[10px] text-zinc-500 font-medium mt-0.5">Force reset password</span>
                             </div>
                           </div>
                        </button>

                        <button onClick={() => handleToggleBan(selectedUser)} className={`w-full flex items-center justify-between p-3.5 bg-[#0B0F14] border ${selectedUser.status === 'banned' ? 'border-emerald-500/30 hover:border-emerald-500/50' : 'border-[#1E90FF]/30 hover:border-[#1E90FF]/40'} rounded-xl transition-all group`}>
                           <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-lg transition-colors ${selectedUser.status === 'banned' ? 'bg-emerald-500/10 group-hover:bg-emerald-100' : 'bg-[#1E90FF]/10 group-hover:bg-[#1E90FF]/20'}`}>
                                {selectedUser.status === 'banned' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <Ban className="w-4 h-4 text-[#1E90FF]" />}
                             </div>
                             <div className="flex flex-col items-start leading-tight">
                                <span className={`text-sm font-bold ${selectedUser.status === 'banned' ? 'text-emerald-700' : 'text-[#166bcc]'}`}>{selectedUser.status === 'banned' ? 'ปลดแบนผู้ใช้นี้' : 'ระงับ/แบนผู้ใช้นี้'}</span>
                                <span className={`text-[10px] font-medium mt-0.5 ${selectedUser.status === 'banned' ? 'text-emerald-600/70' : 'text-[#1E90FF]/70'}`}>{selectedUser.status === 'banned' ? 'ผู้ใช้จะสามารถล็อกอินได้' : 'ป้องกันการเข้าสู่ระบบ'}</span>
                             </div>
                           </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {actionTab === 'purchase' && (
                <div className="space-y-3">
                  {userPurchaseHistory.length > 0 ? userPurchaseHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold">{h.productName}</p>
                        <p className="text-xs text-zinc-500">{new Date(h.date).toLocaleString('th-TH')}</p>
                      </div>
                      <p className="font-bold text-[#1a7fe6] font-mono">-฿{h.price}</p>
                    </div>
                  )) : <p className="text-center text-sm font-bold text-zinc-400 py-10">ไม่พบประวัติการซื้อ</p>}
                </div>
              )}

              {actionTab === 'topup' && (
                <div className="space-y-3">
                  {userTopupHistory.length > 0 ? userTopupHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold">เติมเงิน ({h.method})</p>
                        <p className="text-xs text-zinc-500">{new Date(h.date).toLocaleString('th-TH')}</p>
                      </div>
                      <p className="font-bold text-emerald-500 font-mono">+฿{h.amount}</p>
                    </div>
                  )) : <p className="text-center text-sm font-bold text-zinc-400 py-10">ไม่พบประวัติการเติมเงิน</p>}
                </div>
              )}

              {actionTab === 'keys' && (
                <div className="space-y-3">
                  {userKeysHistory.length > 0 ? userKeysHistory.map((k, i) => (
                    <div key={i} className="flex justify-between items-center p-4 border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-sm font-bold font-mono">{k.key || k.code || k.name || 'Key-' + i}</p>
                        <p className="text-xs text-zinc-500">{new Date(k.used_at || k.date || new Date()).toLocaleString('th-TH')}</p>
                      </div>
                      <p className="font-bold text-emerald-500 text-xs px-2 py-1 bg-emerald-500/10 rounded uppercase">Used</p>
                    </div>
                  )) : <p className="text-center text-sm font-bold text-zinc-400 py-10">ไม่พบประวัติใช้คีย์</p>}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

const CalendarIcon = (props: React.ComponentProps<'svg'>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
)
