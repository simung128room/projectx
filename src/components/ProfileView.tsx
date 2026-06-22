import React, { useState } from 'react';
import { 
  User, 
  Wallet, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  ChevronRight, 
  LogOut, 
  Package, 
  Key, 
  Settings,
  Activity,
  UserCheck,
  Coins
} from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getAvatarUrl } from '../lib/avatar';
import { getUserRank } from '../lib/rank';
import { AnimatedScroll } from './AnimatedScroll';
import { motion } from 'motion/react';
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
      if (user?.id) {
        localStorage.setItem(`userplan_${user.id}`, JSON.stringify(newPlan));
      }
      Swal.fire({ 
        icon: 'success', 
        title: 'บันทึกข้อมูลเรียบร้อย', 
        timer: 1550, 
        showConfirmButton: false, 
        background: '#ffffff', 
        color: '#1f2937',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        text: err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        background: '#ffffff',
        color: '#1f2937',
        customClass: {
          popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]'
        }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Custom Shortcut Card component mimicking the HomeView bento cells
  const MenuShortcut = ({
    label,
    subLabel,
    icon: Icon,
    colorClass,
    glowColor,
    onClick
  }: {
    label: string;
    subLabel: string;
    icon: any;
    colorClass: string;
    glowColor: string;
    onClick: () => void;
  }) => (
    <motion.button
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden text-left bg-white border border-zinc-200/80 hover:border-blue-500/30 rounded-2xl p-5.5 flex items-center gap-4 transition-all duration-300 w-full group cursor-pointer shadow-[0_3px_12px_rgba(0,0,0,0.015)]"
    >
      {/* Background radial highlight */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ bg: glowColor } as any}
      />
      {/* Icon enclosure */}
      <div className={`p-4 rounded-xl bg-slate-50 border border-zinc-100 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:scale-105 duration-300 transition-all shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5 font-medium" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-extrabold text-zinc-800 tracking-wide uppercase">{label}</span>
        <span className="text-[11px] text-zinc-400 group-hover:text-blue-600 font-bold tracking-normal truncate mt-1 transition-colors duration-200">
          {subLabel}
        </span>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-blue-500 shrink-0">
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-8 select-none">
        
        {/* TOP INTEGRATED PROFILE HERO */}
        <div className="relative overflow-hidden bg-white border border-zinc-200/80 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col sm:flex-row items-center gap-6">
          <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          
          <div className="relative shrink-0">
            <div className="w-20 h-20 bg-slate-50 border border-zinc-200 p-1 rounded-full overflow-hidden shadow-xs">
              <img 
                loading="lazy" 
                src={getAvatarUrl(user?.id || username)} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full animate-in fade-in duration-305"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-white flex items-center justify-center text-[10px] shadow bg-blue-500 text-white font-bold" title={role}>
              👑
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl font-black text-zinc-900 tracking-tight truncate max-w-[240px] sm:max-w-md">
                {username}
              </h1>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-blue-55 ml-0.5 text-blue-600 bg-blue-50 border border-blue-100 rounded-lg shrink-0">
                {role}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-5 gap-y-1.5 text-zinc-400 mt-1.5">
              <p className="text-xs font-bold flex items-center gap-1.5 break-all">
                <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                {email}
              </p>
              <p className="text-xs font-bold flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                สมาชิกตั้งแต่ {registeredAt}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT NAVIGATION MENU - MAIN MENU STYLE SHORTCUTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 py-1 select-none">
            <span className="w-1.5 h-3.5 rounded-full bg-blue-600 " />
            <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-[0.2em]">
              เมนูข้อมูลบัญชีและการตั้งค่า • USER DASHBOARD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <MenuShortcut
              label="ยอดเงินคงเหลือ"
              subLabel={`คลิกเพื่อเติมเงิน • ฿${Math.floor(balance).toLocaleString()} บาท`}
              icon={Coins}
              colorClass="text-amber-500"
              glowColor="rgba(245,158,11,0.08)"
              onClick={() => setActiveView('wallet')}
            />

            <MenuShortcut
              label="ประวัติการสั่งซื้อ"
              subLabel="คำสั่งซื้อสินค้าและเติมเงินเดี่ยว"
              icon={Package}
              colorClass="text-blue-500"
              glowColor="rgba(59,130,246,0.08)"
              onClick={() => setActiveView('my_orders')}
            />

            <MenuShortcut
              label="ระบบความปลอดภัย"
              subLabel="เปลี่ยนรหัสผ่านเพื่อป้องกันข้อมูล"
              icon={Settings}
              colorClass="text-zinc-500"
              glowColor="rgba(107,114,128,0.08)"
              onClick={() => setActiveView('settings')}
            />

            <MenuShortcut
              label="ออกจากระบบ"
              subLabel="เสร็จสิ้นเซสชั่นและลงชื่อออกเดสก์ท็อป"
              icon={LogOut}
              colorClass="text-rose-500"
              glowColor="rgba(239,68,68,0.08)"
              onClick={() => { 
                Swal.fire({
                  title: 'ยืนยันการออกจากระบบ?',
                  text: 'คุณต้องการปิดหน้าเซสชั่นการใช้งานปัจจุบันหรือไม่',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#e4e4e7',
                  cancelButtonText: 'ยกเลิก',
                  confirmButtonText: 'ยืนยันการออก',
                  background: '#ffffff',
                  color: '#1f2937',
                  customClass: {
                    popup: 'rounded-2xl border border-zinc-150 shadow-[0_15px_40px_rgba(0,0,0,0.05)]',
                    confirmButton: 'rounded-xl px-5 py-2.5 font-bold text-xs',
                    cancelButton: 'rounded-xl px-5 py-2.5 font-bold text-xs text-zinc-650 bg-zinc-100 hover:bg-zinc-200'
                  }
                }).then((result) => {
                  if (result.isConfirmed) {
                    handleLogout();
                  }
                });
              }}
            />

          </div>
        </div>

        {/* PROFILE METADATA DETAILS EDIT FORM */}
        <div className="bg-white border border-zinc-200/80 rounded-[24px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-4 mb-6">
            <UserCheck className="w-5 h-5 text-blue-500 shrink-0" />
            <h2 className="text-sm font-black text-zinc-800 uppercase tracking-wider">แก้ไขข้อมูลสมาชิกและโปรไฟล์</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-xl">
            <div>
              <label className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest mb-2 block ml-0.5">
                ชื่อ-นามสกุลผู้ใช้งาน (จริง)
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ระบุชื่อจริงสำหรับการเชื่อมเคาน์เตอร์ธุรกรรม"
                className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-zinc-200 hover:border-zinc-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 rounded-2xl py-3.5 px-4.5 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 font-bold" 
              />
            </div>

            <div className="flex justify-start pt-2">
              <button 
                type="submit" 
                disabled={isUpdating}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3.5 px-7 shrink-0 transition-all duration-300 text-xs rounded-2xl cursor-pointer uppercase tracking-widest shadow-md hover:shadow-lg disabled:opacity-50 border-none flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <span>บันทึกข้อมูลอย่างเป็นทางการ</span>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </AnimatedScroll>
  );
};
