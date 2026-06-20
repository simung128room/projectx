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
        background: '#121212', 
        color: '#fff',
        customClass: {
          popup: 'rounded-md border border-border'
        }
      });
    } catch (err: any) {
      console.error('Error updating profile:', err);
      Swal.fire({
        icon: 'error',
        title: 'บันทึกข้อมูลไม่สำเร็จ',
        text: err.response?.data?.error || err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ',
        background: '#121212',
        color: '#fff',
        customClass: {
          popup: 'rounded-md border border-border'
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative overflow-hidden text-left bg-card border border-border hover:border-[#1f2937 rounded-md p-5 flex items-center gap-4 transition-all duration-300 w-full group cursor-pointer shadow-sm"
    >
      {/* Background radial highlight */}
      <div 
        className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500  pointer-events-none"
        style={{ bg: glowColor } as any}
      />
      {/* Icon enclosure */}
      <div className={`p-3.5 rounded-md bg-card/[0.04] border border-border group-hover:border-transparent group-hover:scale-105 duration-300 transition-all shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5 font-medium" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs sm:text-sm font-semibold text-foreground tracking-wider uppercase">{label}</span>
        <span className="text-[10px] text-muted-foreground group-hover:text-muted-foreground font-medium tracking-normal truncate mt-1">
          {subLabel}
        </span>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-350 text-zinc-600 shrink-0">
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.button>
  );

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-8 select-none">
        
        {/* TOP INTEGRATED PROFILE HERO */}
        <div className="relative overflow-hidden bg-card border border-zinc-850 rounded-md p-6 sm:p-8 shadow-md flex flex-col sm:flex-row items-center gap-6">
          
          

          <div className="relative shrink-0">
            <div className="w-20 h-20 bg-card border border-border p-1 rounded-full overflow-hidden shadow-sm">
              <img 
                loading="lazy" 
                src={getAvatarUrl(user?.id || username)} 
                alt="Avatar" 
                className="w-full h-full object-cover rounded-full animate-in fade-in"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-gray-900 flex items-center justify-center text-[10px] shadow bg-[#3b82f6]`} title={role}>
              👑
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-xl font-medium text-foreground tracking-tight truncate max-w-[240px] sm:max-w-md">
                {username}
              </h1>
              <span className="text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-md shrink-0">
                {role}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-muted-foreground mt-1">
              <p className="text-xs font-medium flex items-center gap-1.5 break-all">
                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                {email}
              </p>
              <p className="text-xs font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                สมาชิกตั้งแต่ {registeredAt}
              </p>
            </div>
          </div>
        </div>

        {/* ACCOUNT NAVIGATION MENU - MAIN MENU STYLE SHORTCUTS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 py-1 select-none">
            <span className="w-1.5 h-3.5 rounded-full bg-blue-600 " />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em]">
              เมนูข้อมูลบัญชีและการตั้งค่า • USER DASHBOARD
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            <MenuShortcut
              label="ยอดเงินคงเหลือ"
              subLabel={`คลิกเพื่อเติมเงิน • ฿${Math.floor(balance).toLocaleString()} บาท`}
              icon={Coins}
              colorClass="text-neon-yellow group-hover:bg-neon-yellow/10 animate-none"
              glowColor="rgba(251,191,36,0.1)"
              onClick={() => setActiveView('wallet')}
            />

            <MenuShortcut
              label="ประวัติการสั่งซื้อ"
              subLabel="คำสั่งซื้อสินค้าและเติมเงินเดี่ยว"
              icon={Package}
              colorClass="text-[#3b82f6] group-hover:bg-[#3b82f6]/10 animate-none"
              glowColor="rgba(59,130,246,0.1)"
              onClick={() => setActiveView('my_orders')}
            />

            <MenuShortcut
              label="ระบบความปลอดภัย"
              subLabel="เปลี่ยนรหัสผ่านเพื่อป้องกันข้อมูล"
              icon={Settings}
              colorClass="text-muted-foreground group-hover:bg-zinc-500/10 animate-none"
              glowColor="rgba(156,163,175,0.1)"
              onClick={() => setActiveView('settings')}
            />

            <MenuShortcut
              label="ออกจากระบบ"
              subLabel="เสร็จสิ้นเซสชั่นและลงชื่อออกเดสก์ท็อป"
              icon={LogOut}
              colorClass="text-rose-500 group-hover:bg-rose-500/10 animate-none"
              glowColor="rgba(239,68,68,0.1)"
              onClick={() => { 
                Swal.fire({
                  title: 'ยืนยันการออกจากระบบ?',
                  text: 'คุณต้องการปิดหน้าเซสชั่นการใช้งานปัจจุบันหรือไม่',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#ef4444',
                  cancelButtonColor: '#18181b',
                  cancelButtonText: 'ยกเลิก',
                  confirmButtonText: 'ยืนยันการออก',
                  background: '#121212',
                  color: '#fff',
                  customClass: {
                    popup: 'rounded-md border border-border'
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
        <div className="bg-card border border-zinc-850 rounded-md p-6 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-5">
            <UserCheck className="w-4.5 h-4.5 text-blue-500" />
            <h2 className="text-sm font-medium text-foreground uppercase tracking-wider">แก้ไขข้อมูลสมาชิกและโปรไฟล์</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-1.5 block ml-0.5">
                ชื่อ-นามสกุลผู้ใช้งาน (จริง)
              </label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="ระบุชื่อจริงสำหรับการเชื่อมเคาน์เตอร์ธุรกรรม"
                className="w-full bg-[#0a0a0b] border border-border focus:border-blue-500/45 rounded-md py-3 px-4 text-xs text-foreground outline-none transition-all placeholder:text-zinc-650 font-semibold" 
              />
            </div>

            <div className="flex justify-start pt-2">
              <button 
                type="submit" 
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-[#3b82f6] text-foreground font-semibold py-2.5 px-6 shrink-0 transition-all text-xs rounded-md cursor-pointer uppercase tracking-wider shadow-sm shadow-neon-green/5 disabled:opacity-50"
              >
                {isUpdating ? 'กำลังบันทึก...' : 'บันทึกข้อมูลอย่างเป็นทางการ'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </AnimatedScroll>
  );
};
