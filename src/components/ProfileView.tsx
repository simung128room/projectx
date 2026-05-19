import React from 'react';
import { User, Wallet, Shield, Mail, Calendar, CreditCard, ChevronRight, LogOut, Package, History, Key, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getAvatarUrl } from '../lib/avatar';
import { getUserRank } from '../lib/rank';
import { AnimatedScroll } from './AnimatedScroll';

interface ProfileViewProps {
  user: SupabaseUser | null;
  userPlan: UserPlan | null;
  setUserPlan: (plan: UserPlan) => void;
  clientIp: string | null;
  setActiveView: (view: any) => void;
  handleLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, userPlan, setUserPlan, clientIp, setActiveView, handleLogout
}) => {
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

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="font-sans px-4 pb-12">
        <div className="bg-[#0B0F14] border-white/10 border rounded-3xl w-full max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row mt-6">
          
          {/* Left Side: Balance & Quick Profile */}
        <div className="md:w-1/3 bg-[#0a0d12] p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1a7fe6]/5 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full bg-[#0B0F14] p-1 mb-4 relative z-10 border shadow-sm border-white/10 overflow-hidden">
            <img loading="lazy" 
              src={getAvatarUrl(user?.id || username || 'guest')} 
              alt="avatar" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <h3 className="text-xl font-black text-white mb-1 text-center truncate w-full px-2 z-10">{username}</h3>
          {!isAdminOrOwner && (
            <span className="text-xs font-bold text-[#1E90FF] uppercase tracking-widest bg-[#1E90FF]/10 px-3 py-1 rounded-full border border-white/10 mb-6 z-10">
              {role}
            </span>
          )}
          
          <div className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-sm">
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
              className="mt-3 w-full bg-emerald-500/10 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 py-2 rounded-xl text-xs font-bold transition-all"
            >
              + เติมเงิน
            </button>
          </div>
        </div>

        {/* Right Side: Details & Settings */}
        <div className="md:w-2/3 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#1a7fe6]"/> ข้อมูลส่วนตัว
            </h2>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newFullName = formData.get('fullName') as string;
            const newPlan = { ...userPlan, fullName: newFullName, username: userPlan?.username || username, isPremium: userPlan?.isPremium || false, premiumExpireDate: userPlan?.premiumExpireDate || null };
            setUserPlan(newPlan);
            if (clientIp) localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
            Swal.fire({ icon: 'success', title: 'อัพเดทสำเร็จ', timer: 1500, showConfirmButton: false });
          }} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">ชื่อ-นามสกุล</label>
                <input 
                  name="fullName" 
                  type="text" 
                  defaultValue={fullName !== '-' ? fullName : ''}
                  placeholder="ระบุชื่อ-นามสกุล"
                  className="w-full bg-[#0B0F14] border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:border-[#1E90FF]/50 focus:ring-2 focus:ring-[#1E90FF]/20 outline-none transition-all placeholder:text-zinc-400" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">สมัครสมาชิกเมื่อ</label>
                <div className="w-full bg-[#0a0d12] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" /> {registeredAt}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">อีเมล</label>
              <div className="w-full bg-[#0a0d12] border border-white/5 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center justify-between gap-2 overflow-hidden">
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
              <button type="submit" className="bg-[#1E90FF] hover:bg-[#1a7fe6] text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-sm">
                บันทึกการแก้ไข
              </button>
            </div>
          </form>

          {/* Quick Menu */}
          <div>
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 ml-1">เมนูด่วน</h3>
            <div className="space-y-2">
              <button type="button" onClick={() => setActiveView('history')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0F14] border border-white/10 hover:border-[#1E90FF]/30 hover:bg-[#0a0d12] transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1E90FF]/20 rounded-lg text-[#1E90FF]">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">ประวัติสั่งซื้อ (History)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#1a7fe6] transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('checker_logs')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0F14] border border-white/10 hover:border-zinc-500 hover:bg-[#0a0d12] transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">ประวัติระบบเช็คไอดี (Checker Logs)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('redeem')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0F14] border border-white/10 hover:border-[#1E90FF]/30 hover:bg-[#1E90FF]/5 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#1E90FF]/10 rounded-lg text-[#1E90FF]">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">เปิดใช้งานคีย์ไลเซนส์ (Redeem Key)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#1E90FF] transition-colors" />
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
                }} className="w-full flex items-center justify-between p-3 rounded-2xl bg-[#0B0F14] border border-white/10 hover:border-[#1E90FF]/30 hover:bg-[#1E90FF]/10 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1E90FF]/10 rounded-lg text-[#1a7fe6]">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-[#1E90FF] transition-colors">ออกจากระบบ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#1a7fe6] transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
     </div>
    </AnimatedScroll>
  );
};
