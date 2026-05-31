import React, { useState } from 'react';
import { User, Wallet, Shield, Mail, Calendar, CreditCard, ChevronRight, LogOut, Package, History, Key, Copy, Link2, Check, RefreshCw, Smartphone } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getAvatarUrl } from '../lib/avatar';
import { getUserRank } from '../lib/rank';
import { AnimatedScroll } from './AnimatedScroll';
import axios from 'axios';

interface ProfileViewProps {
  user: SupabaseUser | null;
  userPlan: UserPlan | null;
  setUserPlan: (plan: UserPlan) => void;
  clientIp: string | null;
  setActiveView: (view: any) => void;
  handleLogout: () => void;
  purchaseHistory?: any[];
  usedKeysHistory?: any[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, userPlan, setUserPlan, clientIp, setActiveView, handleLogout,
  purchaseHistory = [], usedKeysHistory = []
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawRole = userPlan?.role;
  let role = '';
  if (rawRole && ['admin', 'owner'].includes(rawRole.toLowerCase())) {
     role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
  } else {
     role = getUserRank(userPlan, user);
  }
  const isAdminOrOwner = ['admin', 'owner'].includes(rawRole?.toLowerCase() || '');
  const balance = userPlan?.balance || 0;
  const fullName = userPlan?.fullName || '-';
  const username = userPlan?.username || user?.email?.split('@')[0] || '';
  const email = user?.email || 'เข้าสู่ระบบด้วยคีย์ (Anonymous)';
  const registeredAt = userPlan?.registeredAt ? new Date(userPlan.registeredAt).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderHistoryItem = (item: any, type: 'purchase' | 'key') => {
    const timestamp = item.timestamp || item.usedAt;
    const dateStr = timestamp ? new Date(timestamp).toLocaleString('th-TH') : '-';
    const displayId = item.id.substring(0, 8).toUpperCase();
    
    return (
      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#121417] border border-white/5 hover:border-white/10 transition-colors gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[400px]">
            {type === 'purchase' ? item.productName : `Redeemed: ${item.key || 'Unknown'}`}
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 font-medium">
            <span className="font-mono bg-[#121820] px-1.5 py-0.5 rounded text-zinc-400">#{displayId}</span>
            <span>{dateStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {type === 'purchase' ? (
            <span className="font-black text-rose-500 text-sm">
              -{(item.price || 0).toLocaleString()} ฿
            </span>
          ) : (
            <span className="font-black text-emerald-500 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-full">
              SUCCESS
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="font-sans px-4 pb-12">
        <div className="bg-[#0B0D0F] border-white/10 border rounded-xl w-full max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row mt-6">
          
          {/* Left Side: Balance & Quick Profile */}
        <div className="md:w-1/3 bg-[#121417] p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5  rounded-full pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full bg-[#0B0D0F] p-1 mb-4 relative z-10 border shadow-sm border-white/10 overflow-hidden">
            <img loading="lazy" 
              src={getAvatarUrl(user?.id || username || 'guest')} 
              alt="avatar" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <h3 className="text-xl font-black text-white mb-1 text-center truncate w-full px-2 z-10">{username}</h3>
          {!isAdminOrOwner && (
            <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-widest bg-[#3B82F6]/10 px-3 py-1 rounded-full border border-white/10 mb-6 z-10">
              {role}
            </span>
          )}
          
          <div className="w-full bg-[#0B0D0F] border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">ยอดเงินคงเหลือ</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <span className="text-sm font-medium text-emerald-500 mr-1">฿</span>
              {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
            <button 
              onClick={() => {
                setActiveView('wallet');
              }}
              className="mt-3 w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 py-2 rounded-xl text-xs font-bold transition-all"
            >
              + เติมเงิน
            </button>
          </div>
        </div>

        {/* Right Side: Details & Settings */}
        <div className="md:w-2/3 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2563EB]"/> ข้อมูลส่วนตัว
            </h2>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newFullName = formData.get('fullName') as string;
            
            if (!user) {
              Swal.fire({ icon: 'error', title: 'ไม่พบข้อมูลผู้ใช้', text: 'กรุณาเข้าสู่ระบบก่อนอัพเดทโปรไฟล์', background: '#09090b', color: '#fff' });
              return;
            }

            // Display loading state
            Swal.fire({
              title: 'กำลังบันทึกข้อมูล...',
              allowOutsideClick: false,
              didOpen: () => { Swal.showLoading(); }
            });

            try {
              // API call to database
              await axios.post(`/api/users/${user.id}`, { fullName: newFullName });
              const newPlan = { ...userPlan, fullName: newFullName, username: userPlan?.username || username, isPremium: userPlan?.isPremium || false, premiumExpireDate: userPlan?.premiumExpireDate || null };
              setUserPlan(newPlan);
              if (clientIp) localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
              Swal.fire({ icon: 'success', title: 'อัพเดทสำเร็จ', timer: 1500, showConfirmButton: false, background: '#09090b', color: '#fff' });
            } catch (err: any) {
              console.error('Error updating profile:', err);
              Swal.fire({
                icon: 'error',
                title: 'อัพเดทไม่สำเร็จ',
                text: err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล',
                background: '#09090b',
                color: '#fff'
              });
            }
          }} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">ชื่อ-นามสกุล</label>
                <input 
                  name="fullName" 
                  type="text" 
                  defaultValue={fullName !== '-' ? fullName : ''}
                  placeholder="ระบุชื่อ-นามสกุล"
                  className="w-full bg-[#0B0D0F] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-[#3B82F6]/50 focus:ring-2 focus:ring-[#3B82F6]/20 outline-none transition-all placeholder:text-zinc-400" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">สมัครสมาชิกเมื่อ</label>
                <div className="w-full bg-[#121417] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" /> {registeredAt}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">อีเมล</label>
              <div className="w-full bg-[#121417] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(email); Swal.fire({ title: 'Copied!', text: 'คัดลอกอีเมลสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' }); }}
                  className="p-1 hover:bg-zinc-200 rounded-md transition-colors text-zinc-400 hover:text-zinc-400 shrink-0"
                  title="Copy Email"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-sm">
                บันทึกการแก้ไข
              </button>
            </div>
          </form>

          {/* Quick Menu */}
          <div>
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 ml-1">เมนูด่วน</h3>
            <div className="space-y-2">
              <button type="button" onClick={() => setActiveView('history')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/10 hover:border-[#3B82F6]/30 hover:bg-[#121417] transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3B82F6]/20 rounded-lg text-[#3B82F6]">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">ประวัติสั่งซื้อ (History)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#2563EB] transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('checker_logs')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/10 hover:border-zinc-500 hover:bg-[#121417] transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">ประวัติระบบเช็คไอดี (Checker Logs)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('redeem')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/10 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#3B82F6]">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">เปิดใช้งานคีย์ไลเซนส์ (Redeem Key)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#3B82F6] transition-colors" />
              </button>
              
              {user && (
                <button type="button" onClick={() => { 
                  Swal.fire({
                    title: 'ยืนยันการออกจากระบบ?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#f4f4f5',
                    cancelButtonText: '<span style="color:#18181b">ยกเลิก</span>',
                    confirmButtonText: 'ออกจากระบบ',
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleLogout();
                    }
                  });
                }} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0D0F] border border-white/10 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/10 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#3B82F6]/10 rounded-lg text-[#2563EB]">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-[#3B82F6] transition-colors">ออกจากระบบ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#2563EB] transition-colors" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8">
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-4 ml-1">การเชื่อมต่อบัญชี (Linked Accounts)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 rounded-xl bg-[#121417] border border-white/5 hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-white">Facebook</span>
                    <span className="text-[10px] text-zinc-500">ไม่ได้เชื่อมต่อ</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#3B82F6] px-3 py-1 bg-[#3B82F6]/10 rounded-full">เชื่อมต่อ</span>
              </button>
              
              <button className="flex items-center justify-between p-4 rounded-xl bg-[#121417] border border-white/5 hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-white">Discord</span>
                    <span className="text-[10px] text-zinc-500">ไม่ได้เชื่อมต่อ</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#3B82F6] px-3 py-1 bg-[#3B82F6]/10 rounded-full">เชื่อมต่อ</span>
              </button>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">รายการสินค้าที่ซื้อล่าสุด (Purchased Items)</h3>
              <button onClick={() => setActiveView('history')} className="text-[10px] uppercase font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
                ดูทั้งหมด
              </button>
            </div>
            
            {purchaseHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-[#121417] rounded-xl border border-white/5 border-dashed text-zinc-500">
                <Package className="w-6 h-6 opacity-40 mb-2" />
                <span className="text-xs font-medium">ยังไม่มีประวัติการซื้อ</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {purchaseHistory.slice(0, 3).map(item => renderHistoryItem(item, 'purchase'))}
              </div>
            )}
          </div>

          <div className="mt-8 border-t border-white/5 pt-8">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">คีย์ที่เปิดใช้งานล่าสุด (Redeemed Keys)</h3>
              <button onClick={() => setActiveView('history')} className="text-[10px] uppercase font-bold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
                ดูทั้งหมด
              </button>
            </div>
            
            {usedKeysHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 bg-[#121417] rounded-xl border border-white/5 border-dashed text-zinc-500">
                <Key className="w-6 h-6 opacity-40 mb-2" />
                <span className="text-xs font-medium">ยังไม่มีประวัติการใช้งานคีย์</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {usedKeysHistory.slice(0, 3).map(item => renderHistoryItem(item, 'key'))}
              </div>
            )}
          </div>

        </div>
      </div>
     </div>
    </AnimatedScroll>
  );
};
