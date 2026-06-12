import React, { useState } from 'react';
import { Users, Search, Edit, CheckCircle, Ban, Wallet, ArrowRightLeft, Eye, RefreshCw, HandCoins, Copy, Calendar } from 'lucide-react';
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
      title: type === 'add' ? 'เพิ่มวงเงิน (Add Balance)' : 'หักวงเงิน (Deduct Balance)',
      input: 'number',
      inputLabel: 'จำนวนเงินสะสม (บาท)',
      inputAttributes: { min: '1', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'อัปเดตข้อมูล',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#71717a',
      background: '#09090b',
      color: '#fff'
    });

    if (value) {
      const amount = Number(value);
      const newBalance = type === 'add' ? (user.balance || 0) + amount : Math.max(0, (user.balance || 0) - amount);
      
      try {
        Swal.showLoading();
        await axios.post(`/api/users/${user.id || user.uid}`, { balance: newBalance });
        setSelectedUser({ ...user, balance: newBalance });
        onRefresh();
        Swal.fire({ icon: 'success', title: 'อัปเดตเครดิตเรียบร้อย!', showConfirmButton: false, timer: 1200, background: '#09090b', color: '#fff' });
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'ไม่สามารถบันทึกข้อมูลได้', icon: 'error', background: '#09090b', color: '#fff' });
      }
    }
  };

  const handleEditUser = async (user: any) => {
    const { value } = await Swal.fire({
      title: 'แก้ไขบทบาทและสถานะ',
      html: `
        <div class="space-y-4">
          <input id="swal-role" class="swal2-input w-full" placeholder="Role (Member, Admin, Premium)" value="${user.role || 'Member'}">
          <input id="swal-username" class="swal2-input w-full" placeholder="Display Name" value="${user.username || ''}">
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#71717a',
      background: '#09090b',
      color: '#fff',
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
        Swal.fire({ icon: 'success', title: 'อัปเดตข้อมูลแล้ว', showConfirmButton: false, timer: 1200, background: '#09090b', color: '#fff' });
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'ไม่สามารถอัปเดตได้', icon: 'error', background: '#09090b', color: '#fff' });
      }
    }
  };

  const handleToggleBan = async (user: any) => {
    const isBanned = user.status === 'banned';
    const result = await Swal.fire({
      title: isBanned ? 'ปลดระงับบัญชีนี้?' : 'ระงับบัญชีผู้ใช้นี้?',
      text: isBanned ? 'ผู้ใช้จะสามารถเข้าสู่ระบบและสั่งซื้อสินค้าได้ตามปกติ' : 'ผู้ใช้จะไม่สามารถสั่งซื้อสินค้าหรือใช้งานหน้าเว็บได้อีก',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isBanned ? 'ปลดระงับ' : 'สกัดกั้นบัญชี',
      confirmButtonColor: isBanned ? '#10B981' : '#EF4444',
      cancelButtonColor: '#71717a',
      background: '#09090b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      const newStatus = isBanned ? 'active' : 'banned';
      try {
        Swal.showLoading();
        await axios.post(`/api/users/${user.id || user.uid}`, { status: newStatus });
        setSelectedUser({ ...user, status: newStatus });
        onRefresh();
        Swal.fire({ icon: 'success', title: 'เสร็จสิ้นการตั้งค่า', showConfirmButton: false, timer: 1200, background: '#09090b', color: '#fff' });
      } catch (err) {
        Swal.fire({ title: 'Error', text: 'ไม่สามารถเปลี่ยนสถานะได้', icon: 'error', background: '#09090b', color: '#fff' });
      }
    }
  };

  const selectedUID = selectedUser?.id || selectedUser?.uid;
  const userPurchaseHistory = purchaseHistory.filter(h => (h.userId === selectedUID || h.uid === selectedUID));
  const userTopupHistory = topupHistory.filter(h => (h.uid === selectedUID || h.userId === selectedUID));
  const userKeysHistory = usedKeysHistory.filter(h => h.uid === selectedUID);

  return (
    <div className="space-y-6">
      {!selectedUser ? (
        <div className="bg-card border border-zinc-800 rounded-md p-6 relative overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-zinc-850 pb-4">
            <div>
               <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-[#10b981]" /> บัญชีสมาชิก (User Accounts)</h3>
               <p className="text-xs text-zinc-500 mt-1">บริหารสถิติผู้ซื้อ กำหนดบทบาท หรือปรับลดพอร์ตวงเงินแบบรายบุคคล</p>
            </div>
            
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ค้นหาชื่อ, อีเมลสมาชก..."
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#10b981] text-xs px-3 py-2 pl-9 rounded-md text-white focus:outline-none transition-colors"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-850 rounded-md">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="text-xs uppercase bg-zinc-950 text-zinc-550 border-b border-zinc-850">
                <tr>
                  <th className="px-5 py-3 font-semibold">สมาชิก</th>
                  <th className="px-5 py-3 font-semibold text-center">ไอพีล่าสุด</th>
                  <th className="px-5 py-3 font-semibold">บทบาท</th>
                  <th className="px-5 py-3 font-semibold">สถานะ</th>
                  <th className="px-5 py-3 font-semibold text-right">ยอดคงเหลือ</th>
                  <th className="px-5 py-3 font-semibold text-right">ข้อมูลเชิงลึก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/40">
                {filteredUsers.length > 0 ? filteredUsers.map((u, i) => (
                  <tr key={i} className="hover:bg-[#050505]/10 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span>{u.email}</span>
                        <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             navigator.clipboard.writeText(u.email);
                             Swal.fire({ title: 'Copied!', text: 'คัดลอกอีเมลแล้ว', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' });
                           }}
                           className="text-zinc-500 hover:text-white transition-colors"
                        >
                           <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                       <span className="font-mono text-xs text-zinc-500 bg-zinc-950/65 border border-zinc-850 rounded px-2.5 py-0.5">{u.lastLoginIp || u.last_login_ip || 'ไม่ทราบ'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold ${
                        u.role === 'Admin' 
                          ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' 
                          : u.role === 'Premium' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-[#0a0a0a]/40 text-zinc-400 border border-zinc-800'
                      }`}>
                        {u.role || 'Member'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.status === 'banned' ? (
                         <span className="px-2 py-0.5 text-[10px] rounded uppercase font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-flex items-center gap-1"><Ban className="w-2.5 h-2.5"/> ระงับส่งออก</span>
                      ) : (
                         <span className="px-2 py-0.5 text-[10px] rounded uppercase font-bold bg-[#10b981]/10 border border-emerald-500/20 text-[#10b981] inline-flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5"/> เปิดบริการ</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-[#10b981] text-right">฿{(u.balance || 0).toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-right">
                       <button onClick={() => setSelectedUser(u)} className="px-3 py-1 bg-[#050505] hover:bg-[#0a0a0a] text-zinc-300 hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1.5 rounded border border-zinc-800">
                          <Eye className="w-3.5 h-3.5" /> ตรวจสอบ
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-zinc-600 text-xs font-semibold">ไม่พบข้อมูลสมาชิกตรงตามคำค้นหา</td>
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
            className="bg-card border border-zinc-800 rounded-md overflow-hidden flex flex-col shadow-md"
          >
            <div className="p-6 md:p-8 bg-zinc-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-850">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#050505] border border-zinc-800 rounded-md text-zinc-400 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6 text-[#10b981]" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white mb-1">{selectedUser.email}</h2>
                  <div className="flex items-center gap-2 text-[10px] font-bold mt-1">
                    <span className={`px-2 py-0.5 rounded border ${selectedUser.role === 'Admin' ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400' : selectedUser.role === 'Premium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-zinc-850 text-zinc-400 border-zinc-800'}`}>
                      {selectedUser.role || 'Member'}
                    </span>
                    <span className={`px-2 py-0.5 rounded border ${selectedUser.status === 'banned' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-[#10b981]/10 border-emerald-500/20 text-[#10b981]'}`}>
                      {selectedUser.status === 'banned' ? 'ACCOUNT BANNED' : 'ACCOUNT ACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedUser(null)} 
                className="px-4 py-2 border border-zinc-800 bg-[#050505] hover:bg-zinc-850 text-zinc-400 hover:text-white text-xs font-bold transition-all rounded-md"
              >
                กลับไปหน้ารายชื่อ
              </button>
            </div>

            <div className="border-b border-zinc-850 bg-[#050505]/10 px-6 overflow-x-auto">
              <div className="flex items-center gap-2 py-3 w-max">
                {[
                  { id: 'info', label: 'ฟังก์ชันการจัดการ' },
                  { id: 'purchase', label: 'ข้อมูลจัดซื้อ' },
                  { id: 'topup', label: 'ยอดโอนเข้า' },
                  { id: 'keys', label: 'รหัสเติมสะสม' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActionTab(tab.id as any)}
                    className={`px-4 py-1.5 text-xs font-bold transition-all rounded-md border ${ 
                      actionTab === tab.id 
                        ? 'bg-zinc-950 text-white border-zinc-800 font-bold' 
                        : 'bg-[#050505]/30 border-transparent text-zinc-500 hover:text-zinc-300' 
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8 min-h-[300px]">
              {actionTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Financial Controls */}
                  <div className="space-y-6">
                    <div className="bg-zinc-950/45 border border-zinc-850 p-6 rounded-md shadow-sm">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2 border-b border-zinc-900 pb-2.5">
                        <Wallet className="w-3.5 h-3.5 text-[#10b981]" /> สถานะพอร์ตและวงเงิน
                      </h4>
                      <div className="mb-6">
                         <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">เงินคงค้างกระเป๋า</p>
                         <p className="text-2xl font-semibold font-mono text-[#10b981]">฿{(selectedUser.balance || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2.5">
                        <button 
                          onClick={() => handleUpdateBalance(selectedUser, 'add')} 
                          className="flex-1 py-2 border border-emerald-500/30 bg-[#10b981]/5 text-[#10b981] hover:bg-[#10b981]/15 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2"
                        >
                          <HandCoins className="w-4 h-4" /> เพิ่มพวงกระเป๋าเงิน
                        </button>
                        <button 
                          onClick={() => handleUpdateBalance(selectedUser, 'deduct')} 
                          className="flex-1 py-2 border border-zinc-800 bg-[#050505] text-zinc-400 hover:bg-[#0a0a0a] rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <ArrowRightLeft className="w-4 h-4" /> หักเครดิต
                        </button>
                      </div>
                    </div>

                    <div className="p-4 border border-zinc-850 flex justify-between items-center bg-zinc-950/20 rounded-md">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">วันที่สมัครสมาชก</p>
                        <p className="text-sm font-bold text-zinc-300 mt-1">{new Date(selectedUser.registered || Date.now()).toLocaleString('th-TH')}</p>
                      </div>
                      <Calendar className="w-4 h-4 text-zinc-500" />
                    </div>

                    <div className="p-4 border border-zinc-850 bg-zinc-950/20 space-y-3.5 rounded-md">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">ตำแหน่งไอพีสุดท้าย</p>
                        <p className="text-xs font-mono text-[#10b981] font-bold bg-zinc-950 w-max px-2.5 py-0.5 rounded border border-zinc-850 mt-1">{selectedUser.lastLoginIp || selectedUser.last_login_ip || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-zinc-900/60">
                        <div>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase">บราวเซอร์อุปกรณ์</p>
                           <p className="text-xs font-semibold text-zinc-400 mt-0.5">{selectedUser.lastLoginSource || selectedUser.last_login_source || 'ไม่ระบุ'}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase">ตำแหน่งเซสชัน</p>
                           <p className="text-xs font-semibold text-zinc-400 mt-0.5">{selectedUser.lastLoginCountry || selectedUser.last_login_country || 'ประเทศไทย'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="space-y-6">
                    <div className="bg-zinc-950/45 border border-zinc-850 p-6 rounded-md">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 border-b border-zinc-900 pb-2.5">การควบคุมเครือข่ายบัญชี</h4>
                      
                      <div className="space-y-3.5">
                        <button onClick={() => handleEditUser(selectedUser)} className="w-full flex items-center justify-between p-3.5 bg-[#050505]/50 border border-zinc-850 hover:border-zinc-800 rounded-md transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-zinc-950 rounded-md text-zinc-500"><Edit className="w-4 h-4" /></div>
                             <div className="flex flex-col items-start text-left leading-tight">
                                <span className="text-xs font-semibold text-white group-hover:text-[#10b981] transition-colors">ยกระดับ/ปรับบทบาทผู้สิทธิ์</span>
                                <span className="text-[10px] text-zinc-500 mt-1">เปลี่ยนขอบเขต Member / Premium / Admin</span>
                             </div>
                           </div>
                        </button>
                        
                        <button onClick={async () => {
                          const { value: password } = await Swal.fire({
                            title: 'ตั้งรหัสผ่านใหม่ (Force Override)', 
                            input: 'password', 
                            inputPlaceholder: 'ใส่รหัสผ่านใหม่ตรงนี้...', 
                            showCancelButton: true, 
                            confirmButtonText: 'เปลี่ยนรหัส', 
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#71717a',
                            background: '#09090b',
                            color: '#fff'
                          });
                          if (password) {
                            try {
                               Swal.showLoading();
                               await axios.post(`/api/users/${selectedUser.id || selectedUser.uid}/password`, { password });
                               Swal.fire({ icon: 'success', title: 'เปลี่ยนรหัสผ่านสำเร็จ', showConfirmButton: false, timer: 1200, background: '#09090b', color: '#fff' });
                            } catch (err: any) {
                               Swal.fire({ title: 'Error', text: err.response?.data?.error || 'ไม่สามารถเปลี่ยนรหัสได้', icon: 'error', background: '#09090b', color: '#fff' });
                            }
                          }
                        }} className="w-full flex items-center justify-between p-3.5 bg-[#050505]/50 border border-zinc-850 hover:border-zinc-800 rounded-md transition-all group">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-zinc-950 rounded-md text-zinc-500"><RefreshCw className="w-4 h-4" /></div>
                             <div className="flex flex-col items-start text-left leading-tight">
                                <span className="text-xs font-semibold text-white group-hover:text-[#10b981] transition-colors">บังคับเปลี่ยนรหัสผ่าน</span>
                                <span className="text-[10px] text-zinc-500 mt-1">กำหนดคีย์พาสเวิร์ดใหม่ทดแทนค่าเดิมทันที</span>
                             </div>
                           </div>
                        </button>

                        <button onClick={() => handleToggleBan(selectedUser)} className={`w-full flex items-center justify-between p-3.5 rounded-md border transition-all ${selectedUser.status === 'banned' ? 'border-emerald-500/20 bg-[#10b981]/5 hover:border-emerald-500/40' : 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40'}`}>
                           <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-md ${selectedUser.status === 'banned' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-rose-500/10 text-rose-400'}`}>
                                {selectedUser.status === 'banned' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                             </div>
                             <div className="flex flex-col items-start text-left leading-tight">
                                <span className={`text-xs font-semibold ${selectedUser.status === 'banned' ? 'text-[#10b981]' : 'text-rose-400'}`}>
                                  {selectedUser.status === 'banned' ? 'ปลดระงับบัญชีนี้' : 'สกัดกั้น/แบนบัญชีนี้'}
                                </span>
                                <span className="text-[10px] text-zinc-500 mt-1">
                                  {selectedUser.status === 'banned' ? 'เปิดให้ลูกค้ากลับเข้ามาใช้งานเว็บ' : 'ล็อกอินไม่ผ่านเด็ดขาด'}
                                </span>
                             </div>
                           </div>
                        </button>

                        <button onClick={async () => {
                          const result = await Swal.fire({
                            title: 'ลบบัญชีถาวร?',
                            text: 'ประวัติการทำรายการทุกออเดอร์ของผู้ซื้อรายนี้จะสูญสลายถาวร',
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonText: 'ลบทันที',
                            confirmButtonColor: '#EF4444',
                            cancelButtonColor: '#71717a',
                            background: '#09090b',
                            color: '#fff'
                          });
                          if (result.isConfirmed) {
                            try {
                               Swal.showLoading();
                               await axios.delete(`/api/users/${selectedUser.id || selectedUser.uid}`);
                               Swal.fire({ icon: 'success', title: 'ระเบิดบัญชีผู้ใช้แล้ว', showConfirmButton: false, timer: 1200, background: '#09090b', color: '#fff' });
                               setSelectedUser(null);
                               onRefresh();
                            } catch (err: any) {
                               Swal.fire({ title: 'Error', text: err.response?.data?.error || 'ไม่สามารถลบผู้ใช้งานได้', icon: 'error', background: '#09090b', color: '#fff' });
                            }
                          }
                        }} className="w-full flex items-center justify-between p-3 border border-rose-500/10 hover:border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 rounded-md transition-all scale-[0.99] hover:scale-[1] mt-6">
                           <div className="flex-1 text-center py-1">
                              <span className="text-xs font-bold">ลบข้อมูลบัญชีผู้ใช้งานคนนี้ถาวร</span>
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
                    <div key={i} className="flex justify-between items-center p-4 bg-zinc-950/40 border border-zinc-850 rounded-md">
                      <div>
                        <p className="text-sm font-bold text-white">{h.productName}</p>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(h.date).toLocaleString('th-TH')}</p>
                      </div>
                      <p className="font-bold text-rose-400 font-mono">-฿{h.price}</p>
                    </div>
                  )) : <p className="text-center text-xs font-semibold text-zinc-550 py-12">ไม่มีบันทึกการจัดซื้อสินค้าชิ้นใดของสมาชิกลายนี้</p>}
                </div>
              )}

              {actionTab === 'topup' && (
                <div className="space-y-3">
                  {userTopupHistory.length > 0 ? userTopupHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-zinc-950/40 border border-zinc-850 rounded-md">
                      <div>
                        <p className="text-sm font-bold text-white">เติมเงิน ({h.method})</p>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(h.date).toLocaleString('th-TH')}</p>
                      </div>
                      <p className="font-bold text-[#10b981] font-mono">+฿{h.amount}</p>
                    </div>
                  )) : <p className="text-center text-xs font-semibold text-zinc-550 py-12">ไม่มีรายการสถิติการเติมเครดิตเข้าสโตร์</p>}
                </div>
              )}

              {actionTab === 'keys' && (
                <div className="space-y-3">
                  {userKeysHistory.length > 0 ? userKeysHistory.map((k, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-zinc-950/40 border border-zinc-850 rounded-md">
                      <div>
                        <p className="text-sm font-bold font-mono text-zinc-300">{k.key || k.code || k.name || 'Key-' + i}</p>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(k.used_at || k.date || new Date()).toLocaleString('th-TH')}</p>
                      </div>
                      <span className="text-[10px] font-bold text-[#10b981] px-2.5 py-0.5 rounded-full bg-[#10b981]/10 border border-emerald-500/20 uppercase tracking-widest">Used / เติมแล้ว</span>
                    </div>
                  )) : <p className="text-center text-xs font-semibold text-zinc-550 py-12">ไม่เคยพบรายการสะสมรางวัลหรือรหัสของขวัญ</p>}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
