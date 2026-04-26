import React from 'react';
import { User, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../../types';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileModalProps {
  show: boolean;
  onClose: () => void;
  user: SupabaseUser | null;
  userPlan: UserPlan | null;
  setUserPlan: (plan: UserPlan) => void;
  clientIp: string | null;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  show, onClose, user, userPlan, setUserPlan, clientIp
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-[#09090b]/90 flex items-center justify-center p-4 z-[70] backdrop-blur-md font-sans animate-in zoom-in-95 duration-200">
      <div className="bg-[#151518] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400"/> ข้อมูลโปรไฟล์
        </h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const newUsername = formData.get('username') as string;
          if (userPlan) {
            const newPlan = { ...userPlan, username: newUsername };
            setUserPlan(newPlan);
            if (clientIp) localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
            Swal.fire({ icon: 'success', title: 'อัพเดทสำเร็จ', text: 'บันทึกข้อมูลโปรไฟล์แล้ว', background: '#09090b', color: '#fff', timer: 1500, showConfirmButton: false });
            onClose();
          }
        }} className="space-y-4">
          <div>
            <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">ชื่อผู้ใช้งาน</label>
            <input 
              required 
              name="username" 
              type="text" 
              defaultValue={userPlan?.username || user?.email?.split('@')[0] || ''}
              className="w-full bg-[#09090b] border border-white/10 rounded-xl py-3 px-4 text-sm focus:border-cyan-500 outline-none text-white transition-all" 
            />
          </div>
          <div>
            <label className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">อีเมล</label>
            <input 
              type="text" 
              readOnly
              disabled
              defaultValue={user?.email || 'ไม่มีระบบอีเมล (เข้าสู่ระบบด้วยคีย์)'}
              className="w-full bg-[#09090b]/50 border border-white/5 rounded-xl py-3 px-4 text-sm text-zinc-500 cursor-not-allowed opacity-50" 
            />
          </div>
          <div className="p-4 rounded-xl bg-zinc-900 border border-white/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-zinc-400">สถานะ:</span>
              <span className={`text-xs font-bold ${userPlan?.isPremium ? 'text-amber-500' : 'text-zinc-300'}`}>{userPlan?.isPremium ? 'VIP' : 'Free'}</span>
            </div>
            {userPlan?.isPremium && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">หมดอายุ:</span>
                <span className="text-xs text-emerald-400">{new Date(userPlan.premiumExpireDate!).toLocaleDateString('th-TH')}</span>
              </div>
            )}
          </div>
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl transition-all">
            บันทึกการเปลี่ยนแปลง
          </button>
        </form>
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-full">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
