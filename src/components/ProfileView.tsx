import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  Shield, 
  Mail, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  LogOut, 
  Package, 
  History, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck,
  Settings,
  Activity,
  UserCheck
} from 'lucide-react';
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
  user,
  userPlan,
  setUserPlan,
  clientIp,
  setActiveView,
  handleLogout,
  purchaseHistory = [],
  usedKeysHistory = []
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullName, setFullName] = useState(userPlan?.fullName || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const rawRole = userPlan?.role;
  let role = '';
  if (rawRole && ['admin', 'owner'].includes(rawRole.toLowerCase())) {
     role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
  } else {
     role = getUserRank(userPlan, user);
  }
  const isAdminOrOwner = ['admin', 'owner'].includes(rawRole?.toLowerCase() || '');
  const balance = userPlan?.balance || 0;
  const username = userPlan?.username || user?.email?.split('@')[0] || 'Member';
  const email = user?.email || 'เข้าสู่ระบบแล้ว';
  const registeredAt = userPlan?.registeredAt 
    ? new Date(userPlan.registeredAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await axios.post(`/api/users/${user.id}`, { fullName });
      const newPlan = { 
        ...userPlan, 
        fullName, 
        username: userPlan?.username || username, 
        isPremium: userPlan?.isPremium || false, 
        premiumExpireDate: userPlan?.premiumExpireDate || null 
      };
      setUserPlan(newPlan);
      if (clientIp) {
        localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
      }
      Swal.fire({ 
        icon: 'success', 
        title: 'บันทึกข้อมูลเรียบร้อย', 
        timer: 1550, 
        showConfirmButton: false, 
        background: '#09090b', 
        color: '#fff',
        customClass: {
          popup: 'rounded-2xl border border-white/5'
        }
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        text: err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        background: '#09090b',
        color: '#fff',
        customClass: {
          popup: 'rounded-2xl border border-white/5'
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="max-w-4xl mx-auto px-4 py-8 font-sans space-y-6">
        
        {/* TOP PROFILE CARD */}
        <div className="relative overflow-hidden bg-[#070709] border border-zinc-850 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-center gap-6">
          {/* Neon Radial Gradient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-green/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Avatar Area */}
          <div className="relative shrink-0 select-none">
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 p-1 rounded-full overflow-hidden shadow-lg hover:gradient-border transition-all duration-300">
              <img 
                loading="lazy" 
                src={getAvatarUrl(user?.id || username)} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-zinc-950 flex items-center justify-center font-bold text-[9px] shadow ${
              isAdminOrOwner 
                ? "bg-amber-500 text-black" 
                : "bg-emerald-500 text-black"
            }`} title={role}>
              {isAdminOrOwner ? "👑" : "💎"}
            </div>
          </div>

          {/* User Meta Details info */}
          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight truncate max-w-[240px] sm:max-w-md">
                {username}
              </h1>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border rounded-md shrink-0 ${
                isAdminOrOwner 
                  ? "text-amber-400 bg-amber-400/5 border-amber-400/20" 
                  : "text-emerald-400 bg-emerald-400/5 border-emerald-400/20"
              }`}>
                {role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium break-all flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {email}
            </p>
            <p className="text-[11px] text-zinc-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-650" />
              เป็นสมาชิกเมื่อ {registeredAt}
            </p>
          </div>
        </div>

        {/* TWO COLUMN CONTENT SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          
          {/* LEFT PANEL: WALLET & CORE ACTIONS */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Wallet Bento Box */}
            <div className="bg-[#070709] border border-zinc-850 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-[170px]">
              <div>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ยอดเงินคงเหลือ</span>
                </div>
                <div className="mt-4 flex items-baseline gap-1 animate-in fade-in">
                  <span className="text-4xl font-extrabold text-white tracking-tight font-mono select-none">
                    {Math.floor(balance).toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-emerald-500">฿</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveView('wallet')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-200 cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-[0.98]"
              >
                + เติมเงินด่วน
              </button>
            </div>

            {/* Quick Navigation Actions */}
            <div className="bg-[#070709] border border-zinc-850 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest pl-1">
                การนำทางเมนูผู้ใช้
              </div>
              
              <div className="flex flex-col gap-2">
                <button 
                  type="button" 
                  onClick={() => setActiveView('my_orders')}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/20 hover:border-zinc-700/65 transition-all group rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 animate-none">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-350 group-hover:text-white transition-colors">คำสั่งซื้อของฉัน</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  type="button" 
                  onClick={() => setActiveView('checker_logs')}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/20 hover:border-zinc-700/65 transition-all group rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 animate-none">
                      <Activity className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-350 group-hover:text-white transition-colors">ประวัติเช็คไอดี</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  type="button" 
                  onClick={() => setActiveView('redeem')}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/20 hover:border-zinc-700/65 transition-all group rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 animate-none">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-350 group-hover:text-white transition-colors">เติมคีย์ไลเซนส์</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  type="button" 
                  onClick={() => setActiveView('settings')}
                  className="w-full flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/20 hover:border-zinc-700/65 transition-all group rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-700/50 animate-none">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-350 group-hover:text-white transition-colors">การตั้งค่า</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </button>

                <button 
                  type="button" 
                  onClick={() => { 
                    Swal.fire({
                      title: 'ยืนยันการออกจากระบบ?',
                      text: 'ออกจากเซสชั่นการใช้งานปัจจุบัน',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#18181b',
                      cancelButtonText: 'ยกเลิก',
                      confirmButtonText: 'ออกจากระบบ',
                      background: '#09090b',
                      color: '#fff',
                      customClass: {
                        popup: 'rounded-2xl border border-white/5'
                      }
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleLogout();
                      }
                    });
                  }} 
                  className="w-full flex items-center justify-between p-3.5 bg-red-500/5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/10 transition-all group rounded-xl cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 animate-none">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-zinc-350 group-hover:text-red-400 transition-colors">ออกจากระบบ</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: DETAILS EDIT FORM & RECENT TRANSACTION HISTORY */}
          <div className="md:col-span-3 space-y-6">
            
            {/* Edit Details Section */}
            <div className="bg-[#070709] border border-zinc-850 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
                <UserCheck className="w-4 h-4 text-emerald-400 animate-none" />
                <h2 className="text-sm font-bold text-white">แก้ไขข้อมูลรายละเอียดบัญชี</h2>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1.5 block ml-0.5">
                    ชื่อ-นามสกุลจริง
                  </label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ระบุชื่อและนามสกุลจริงของคุณ"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 px-4 text-xs text-white focus:border-emerald-500/50 outline-none transition-all placeholder:text-zinc-650 font-semibold" 
                  />
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={isUpdating}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-2.5 px-6 shrink-0 transition-all text-xs rounded-xl cursor-pointer uppercase tracking-wider shadow-lg shadow-emerald-500/5 disabled:opacity-50"
                  >
                    {isUpdating ? 'กำลังอัปเดต...' : 'บันทึกข้อมูลโพรไฟล์'}
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Orders Section (Clean Minimalist List) */}
            <div className="bg-[#070709] border border-zinc-850 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400 animate-none" />
                  <h2 className="text-sm font-bold text-white">ประวัติสั่งซื้อล่าสุด</h2>
                </div>
                <button 
                  onClick={() => setActiveView('my_orders')} 
                  className="text-xs font-black text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer text-[10px] uppercase tracking-widest"
                >
                  ดูทั้งหมด
                </button>
              </div>

              {purchaseHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                  <Package className="w-8 h-8 opacity-30 mb-2 text-zinc-400 animate-none" />
                  <span className="text-xs font-bold">ไม่มีรายการเมื่อเร็วๆ นี้</span>
                </div>
              ) : (
                <div className="divide-y divide-zinc-900/60">
                  {purchaseHistory.slice(0, 3).map((item: any) => {
                    const dateStr = item.timestamp 
                      ? new Date(item.timestamp).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                      : '-';
                    const displayId = item.id.substring(0, 8).toUpperCase();
                    
                    return (
                      <div key={item.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-white truncate hover:text-emerald-400 transition-colors">
                            {item.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400 font-bold">
                            <span className="text-emerald-500 bg-emerald-500/5 border border-emerald-500/10 px-1.5 py-0.5 rounded text-[8px] uppercase">
                              #{displayId}
                            </span>
                            <span>{dateStr}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-rose-500 font-mono">
                            -{Math.floor(item.price).toLocaleString()} ฿
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </AnimatedScroll>
  );
};
