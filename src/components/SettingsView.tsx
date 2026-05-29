import React, { useState, useEffect } from 'react';
import { Shield, Key, Trash2, Lock, ShieldAlert, Settings } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AnimatedScroll } from './AnimatedScroll';
import { Skeleton } from './ui/Skeleton';

interface SettingsViewProps {
  user?: any;
  setActiveView: (view: any) => void;
  useCustomCursor?: boolean;
  toggleCustomCursor?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ setActiveView, user, useCustomCursor, toggleCustomCursor }) => {
  const [currentTab, setCurrentTab] = useState<'password' | 'delete' | 'preferences'>('password');
  const [isLoading, setIsLoading] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, [currentTab]);

  const handleChangePassword = async () => {
    if (!oldPassword) {
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'กรุณากรอกรหัสผ่านเดิม' });
    }
    if (!newPassword || !confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน' });
    }

    try {
      setIsLoading(true);
      const { supabase } = await import('../lib/supabase');
      
      // Re-authenticate user with old password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: oldPassword,
      });

      if (signInError) {
        throw new Error('รหัสผ่านเดิมไม่ถูกต้อง');
      }

      // Update to new password
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;

      Swal.fire({
        title: 'เปลี่ยนรหัสผ่านสำเร็จ',
        text: 'รหัสผ่านของคุณถูกอัปเดตเรียบร้อยแล้ว',
        icon: 'success',
        background: '#09090b',
        color: '#fff'
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      Swal.fire({
         title: 'เกิดข้อผิดพลาด',
         text: error.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
         icon: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const { value: password } = await Swal.fire({
      title: 'ยืนยันการลบบัญชี',
      text: 'กรุณากรอกรหัสผ่านเพื่อยืนยันการลบบัญชี ข้อมูลทั้งหมดจะถูกลบถาวร',
      input: 'password',
      inputPlaceholder: 'รหัสผ่านของคุณ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#18181b',
      confirmButtonText: 'ลบบัญชีถาวร',
      cancelButtonText: 'ยกเลิก',
      background: '#09090b',
      color: '#fff',
      customClass: {
        input: 'bg-zinc-900 border-white/10 text-white rounded-xl'
      }
    });

    if (password) {
      try {
        setIsLoading(true);
        const { supabase } = await import('../lib/supabase');
        
        // Re-authenticate user to confirm password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: password,
        });

        if (signInError) {
          throw new Error('รหัสผ่านไม่ถูกต้อง');
        }

        // Call API to delete user data
        if (user?.id || user?.uid) {
           await axios.delete(`/api/users/${user.id || user.uid}`);
        }
        
        // Sign out
        await supabase.auth.signOut();

        Swal.fire({
          title: 'ลบบัญชีสำเร็จ',
          text: 'บัญชีของคุณถูกลบออกจากระบบแล้ว',
          icon: 'success',
          background: '#09090b',
          color: '#fff'
        }).then(() => {
          window.location.reload();
        });
      } catch (error: any) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด',
          text: error.message || 'ไม่สามารถลบบัญชีได้',
          icon: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-12">
        <div className="max-w-4xl mx-auto mt-6">
          <div className="bg-[#0B0D0F] border-white/10 border rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
            
            {/* Sidebar Tabs */}
            <div className="md:w-1/3 bg-[#121417] border-b md:border-b-0 md:border-r border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#3B82F6]" /> ตั้งค่าผู้ใช้
              </h2>
              
              <div className="space-y-2">
                <button 
                  onClick={() => setCurrentTab('password')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'password' ? 'bg-[#3B82F6] text-white' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Key className="w-4 h-4" />
                  <span className="text-sm font-medium">เปลี่ยนรหัสผ่าน</span>
                </button>
                <button 
                  onClick={() => setCurrentTab('preferences')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'preferences' ? 'bg-[#3B82F6] text-white' : 'text-zinc-400 hover:bg-white/5'}`}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">การตั้งค่าเพิ่มเติม</span>
                </button>
                <button 
                  onClick={() => setCurrentTab('delete')}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'delete' ? 'bg-red-500 text-white' : 'text-red-400 hover:bg-red-500/10'}`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">ลบบัญชี</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3 p-8">
              {isLoading ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Skeleton className="h-8 w-1/3 mb-6" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <Skeleton className="h-14 w-full rounded-xl mt-4" />
                  </div>
                </div>
              ) : (
                <>
                  {currentTab === 'password' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-white mb-6">เปลี่ยนรหัสผ่านใหม่</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block">รหัสผ่านเดิม</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="password" placeholder="••••••••" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full bg-[#121417] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#3B82F6] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block">รหัสผ่านใหม่</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-[#121417] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#3B82F6] outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1.5 block">ยืนยันรหัสผ่านใหม่</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-[#121417] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#3B82F6] outline-none" />
                      </div>
                    </div>
                    <button onClick={handleChangePassword} className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3.5 rounded-xl transition-all shadow-sm">
                      ยืนยันการเปลี่ยนรหัสผ่าน
                    </button>
                  </div>
                </div>
              )}

              {currentTab === 'delete' && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                    <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">ลบบัญชีผู้ใช้งาน</h3>
                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                      คำเตือน: หากคุณลบบัญชี ข้อมูลประวัติการสั่งซื้อ ยอดเงินคงเหลือ และข้อมูลส่วนตัวทั้งหมดจะถูกลบออกถาวรและไม่สามารถกู้คืนได้
                    </p>
                    <button 
                      onClick={handleDeleteAccount}
                      className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-500/20"
                    >
                      ลบบัญชีถาวร
                    </button>
                  </div>
                </div>
              )}

              {currentTab === 'preferences' && (
                <div className="animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-white mb-6">ตั้งค่าการแสดงผลทั่วไป</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#121417] border border-white/5 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-white mb-1">Custom Cursor</div>
                        <div className="text-xs text-zinc-400">เปิด/ปิด เอฟเฟกต์เคอร์เซอร์ของเว็บไซต์ เพื่อลดการกระตุกบนเครื่องสเปกต่ำ</div>
                      </div>
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={useCustomCursor ?? true} 
                            onChange={toggleCustomCursor}
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3B82F6]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
          </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};
