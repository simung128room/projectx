import React from 'react';
import { User, Wallet, Shield, Mail, Calendar, CreditCard, ChevronRight, LogOut, Package, History, Key, Copy } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from 'firebase/auth';
import { getAvatarUrl } from '../lib/avatar';

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
      <div className="bg-white border-zinc-200 border rounded-3xl w-full max-w-4xl mx-auto shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col md:flex-row mt-6">
        
        {/* Left Side: Balance & Quick Profile */}
        <div className="md:w-1/3 bg-zinc-50 p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="w-24 h-24 rounded-full bg-white p-1 mb-4 relative z-10 border shadow-sm border-zinc-200 overflow-hidden">
            <img 
              src={getAvatarUrl(username || 'guest')} 
              alt="avatar" 
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-1 right-1 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white"></div>
          </div>
          
          <h3 className="text-xl font-black text-zinc-900 mb-1 text-center truncate w-full px-2 z-10">{username}</h3>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100 mb-6 z-10">
            {role}
          </span>
          
          <div className="w-full bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col items-center relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">ยอดเงินคงเหลือ</span>
            </div>
            <div className="text-3xl font-black text-zinc-900 mb-1">
              <span className="text-sm font-medium text-emerald-500 mr-1">฿</span>
              {balance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </div>
            <button 
              onClick={() => {
                setActiveView('wallet');
              }}
              className="mt-3 w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-100 py-2 rounded-xl text-xs font-bold transition-all"
            >
              + เติมเงิน
            </button>
          </div>
        </div>

        {/* Right Side: Details & Settings */}
        <div className="md:w-2/3 p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500"/> ข้อมูลส่วนตัว
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
                  className="w-full bg-white border border-zinc-200 rounded-xl py-2.5 px-4 text-sm text-zinc-900 focus:border-red-400 focus:ring-2 focus:ring-red-50 outline-none transition-all placeholder:text-zinc-400" 
                />
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">สมัครสมาชิกเมื่อ</label>
                <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" /> {registeredAt}
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block ml-1">อีเมล</label>
              <div className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-2.5 px-4 text-sm text-zinc-500 cursor-not-allowed flex items-center justify-between gap-2 overflow-hidden">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(email); Swal.fire({ title: 'Copied!', text: 'คัดลอกอีเมลสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' }); }}
                  className="p-1 hover:bg-zinc-200 rounded-md transition-colors text-zinc-400 hover:text-zinc-600 shrink-0"
                  title="Copy Email"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all text-sm shadow-sm">
                บันทึกการแก้ไข
              </button>
            </div>
          </form>

          {/* Quick Menu */}
          <div>
            <h3 className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-3 ml-1">เมนูด่วน</h3>
            <div className="space-y-2">
              <button type="button" onClick={() => setActiveView('history')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-red-200 hover:bg-zinc-50 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">ประวัติการทำรายการ (History)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('logs')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-indigo-200 hover:bg-zinc-50 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-500">
                    <History className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">ประวัติระบบเช็คไอดี (Checker Logs)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-indigo-500 transition-colors" />
              </button>

              <button type="button" onClick={() => setActiveView('redeem')} className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-amber-200 hover:bg-amber-50/30 transition-all group shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 transition-colors">เปิดใช้งานคีย์ไลเซนส์ (Redeem Key)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transition-colors" />
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
                }} className="w-full flex items-center justify-between p-3 rounded-2xl bg-white border border-zinc-200 hover:border-red-200 hover:bg-red-50 transition-all group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-50 rounded-lg text-red-500">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-red-600 transition-colors">ออกจากระบบ</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
