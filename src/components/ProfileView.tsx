import React from 'react';
import { User, Wallet, Shield, Mail, Calendar, CreditCard, ChevronRight, LogOut, Package, History } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

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
  const role = userPlan?.role || 'สมาชิกทั่วไป';
  const balance = userPlan?.balance || 0;
  const fullName = userPlan?.fullName || '-';
  const username = userPlan?.username || user?.email?.split('@')[0] || '';
  const email = user?.email || 'เข้าสู่ระบบด้วยคีย์ (Anonymous)';
  const registeredAt = userPlan?.registeredAt ? new Date(userPlan.registeredAt).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');

  return (
    <div className="font-sans animate-in fade-in duration-500">
      <div className="bg-zinc-900 border-zinc-800 border rounded-3xl w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden flex flex-col md:flex-row mt-6">
        
        {/* Left Side: Balance & Quick Profile */}
        <div className="md:w-1/3 bg-zinc-950 p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-1 mb-4 relative z-10">
            <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center border-4 border-zinc-950">
              <User className="w-10 h-10 text-cyan-400" />
            </div>
            <div className="absolute bottom-0 right-0 bg-emerald-500 w-5 h-5 rounded-full border-4 border-zinc-950"></div>
          </div>
          
          <h3 className="text-xl font-black text-white mb-1 text-center truncate w-full px-2 z-10">{username}</h3>
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-6 z-10">
            {role}
          </span>
          
          <div className="w-full bg-gradient-to-r from-zinc-900 to-zinc-800 border border-white/5 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden group">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">ยอดเงินคงเหลือ</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              <span className="text-sm font-medium text-emerald-400 mr-1">฿</span>
              {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
            <button 
              onClick={() => {
                Swal.fire({
                  title: 'ระบบเติมเงิน',
                  text: 'ระบบเติมเงินกำลังอยู่ในการพัฒนา เร็วๆ นี้!',
                  icon: 'info',
                  background: '#09090b',
                  color: '#fff',
                  confirmButtonColor: '#0ea5e9'
                });
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
              <Shield className="w-5 h-5 text-indigo-400"/> ข้อมูลส่วนตัว
            </h2>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newFullName = formData.get('fullName') as string;
            const newPlan = { ...userPlan, fullName: newFullName, username: userPlan?.username || username, isPremium: userPlan?.isPremium || false, premiumExpireDate: userPlan?.premiumExpireDate || null };
            setUserPlan(newPlan);
            if (clientIp) localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
            Swal.fire({ icon: 'success', title: 'อัพเดทสำเร็จ', background: '#09090b', color: '#fff', timer: 1500, showConfirmButton: false });
          }} className="space-y-4 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">ชื่อ-นามสกุล</label>
                <input 
                  name="fullName" 
                  type="text" 
                  defaultValue={fullName !== '-' ? fullName : ''}
                  placeholder="ระบุชื่อ-นามสกุล"
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-2.5 px-4 text-sm text-white focus:border-cyan-500 outline-none transition-all placeholder:text-zinc-700" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">สมัครสมาชิกเมื่อ</label>
                <div className="w-full bg-zinc-950/30 border border-zinc-800/50 rounded-xl py-2.5 px-4 text-sm text-zinc-400 cursor-not-allowed flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-600" /> {registeredAt}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">อีเมล</label>
              <div className="w-full bg-zinc-950/30 border border-zinc-800/50 rounded-xl py-2.5 px-4 text-sm text-zinc-400 cursor-not-allowed flex items-center gap-2">
                <Mail className="w-4 h-4 text-zinc-600" /> {email}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2.5 px-6 rounded-xl transition-all text-sm">
                บันทึกการแก้ไข
              </button>
            </div>
          </form>

          {/* Quick Menu */}
          <div>
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 ml-1">เมนูด่วน</h3>
            <div className="space-y-2">
              <button type="button" onClick={() => setActiveView('logs')} className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/30 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">ประวัติการใช้งานระบบเช็คไอดี</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </button>
              
              {user && (
                <button type="button" onClick={() => { 
                  Swal.fire({
                    title: 'ยืนยันการออกจากระบบ?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ef4444',
                    cancelButtonColor: '#27272a',
                    confirmButtonText: 'ออกจากระบบ',
                    cancelButtonText: 'ยกเลิก',
                    background: '#09090b',
                    color: '#fff'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      handleLogout();
                    }
                  });
                }} className="w-full flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-500/30 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">ออกจากระบบ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-red-400 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
