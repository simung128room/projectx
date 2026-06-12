import React, { useState, useEffect } from 'react';
import { Shield, Key, Trash2, Lock, ShieldAlert, Settings, ShieldCheck } from 'lucide-react';
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
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'กรุณากรอกรหัสผ่านเดิม', background: '#09090b', color: '#fff' });
    }
    if (!newPassword || !confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'กรุณากรอกข้อมูลให้ครบถ้วน', background: '#09090b', color: '#fff' });
    }
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'ข้อผิดพลาด', text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน', background: '#09090b', color: '#fff' });
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
         background: '#09090b',
         color: '#fff'
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
        input: 'bg-[#050505] border-white/[0.04] text-white rounded-md'
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
          background: '#09090b',
          color: '#fff'
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
          <div className="bg-[#070708] border border-zinc-800 overflow-hidden flex flex-col md:flex-row rounded-md shadow-md">
            
            {/* Sidebar Tabs */}
            <div className="md:w-1/3 bg-[#09090a] border-b md:border-b-0 md:border-r border-zinc-800 p-6 flex flex-col justify-start">
              <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-neon-green" /> ตั้งค่าผู้ใช้
              </h2>
              
              <div className="space-y-1.5">
                <button 
                  onClick={() => setCurrentTab('password')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${currentTab === 'password' ? 'bg-white/[0.04] text-white border-l-2 border-neon-green pl-[14px]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] hover:pl-[18px]'}`}
                >
                  <Key className={`w-4.5 h-4.5 ${currentTab === 'password' ? 'text-neon-green' : 'text-zinc-500'}`} />
                  <span className="text-sm font-semibold">เปลี่ยนรหัสผ่าน</span>
                </button>
                <button 
                  onClick={() => setCurrentTab('preferences')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${currentTab === 'preferences' ? 'bg-white/[0.04] text-white border-l-2 border-neon-green pl-[14px]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04] hover:pl-[18px]'}`}
                >
                  <Settings className={`w-4.5 h-4.5 ${currentTab === 'preferences' ? 'text-neon-green' : 'text-zinc-500'}`} />
                  <span className="text-sm font-semibold">การตั้งค่าแสดงผล</span>
                </button>
                <button 
                  onClick={() => setCurrentTab('delete')}
                  className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-sm font-semibold rounded-md transition-all cursor-pointer ${currentTab === 'delete' ? 'bg-red-500/10 text-red-400 border-l-2 border-red-500 pl-[14px]' : 'text-red-400/85 hover:text-red-400 hover:bg-red-500/10 hover:pl-[18px]'}`}
                >
                  <Trash2 className="w-4.5 h-4.5 text-red-500/85" />
                  <span className="text-sm font-semibold">ลบบัญชี</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="md:w-2/3 p-6 sm:p-8">
              {isLoading ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <Skeleton className="h-8 w-1/3 mb-6" />
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-12 w-full " />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-12 w-full " />
                    </div>
                    <Skeleton className="h-14 w-full mt-4" />
                  </div>
                </div>
              ) : (
                <>
                  {currentTab === 'password' && (
                    <div className="animate-in fade-in duration-300">
                      <h3 className="text-base font-bold text-white mb-6">เปลี่ยนรหัสผ่านใหม่</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">รหัสผ่านเดิม</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                            <input 
                              type="password" 
                              placeholder="••••••••" 
                              value={oldPassword} 
                              onChange={e => setOldPassword(e.target.value)} 
                              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 pl-11 pr-4 text-sm text-white focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder:text-zinc-650"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">รหัสผ่านใหม่</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                            <input 
                              type="password" 
                              placeholder="••••••••" 
                              value={newPassword} 
                              onChange={e => setNewPassword(e.target.value)} 
                              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 pl-11 pr-4 text-sm text-white focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder:text-zinc-650"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block">ยืนยันรหัสผ่านใหม่</label>
                          <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                            <input 
                              type="password" 
                              placeholder="••••••••" 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-md py-3 pl-11 pr-4 text-sm text-white focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder:text-zinc-650"
                            />
                          </div>
                        </div>
                        <button 
                          onClick={handleChangePassword} 
                          className="w-full bg-neon-green hover:bg-neon-green/95 text-black font-semibold py-3.5 transition-all text-sm rounded-md uppercase tracking-wider cursor-pointer"
                        >
                          ยืนยันการเปลี่ยนรหัสผ่าน
                        </button>
                      </div>
                    </div>
                  )}

                  {currentTab === 'delete' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="bg-red-500/10 border border-red-500/20 p-6 text-center rounded-md">
                        <ShieldAlert className="w-12 h-12 text-red-550 mx-auto mb-4" />
                        <h3 className="text-base font-bold text-white mb-2">ลบบัญชีผู้ใช้งาน</h3>
                        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                          คำเตือน: หากคุณลบบัญชี ข้อมูลประวัติการสั่งซื้อ ยอดเงินคงเหลือ และข้อมูลส่วนตัวทั้งหมดจะถูกลบออกถาวรและไม่สามารถกู้คืนได้
                        </p>
                        <button 
                          onClick={handleDeleteAccount}
                          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3.5 transition-all text-sm rounded-md uppercase tracking-wider cursor-pointer"
                        >
                          ลบบัญชีถาวร
                        </button>
                      </div>
                    </div>
                  )}

                  {currentTab === 'preferences' && (
                    <div className="animate-in fade-in duration-300">
                      <h3 className="text-base font-bold text-white mb-6">ตั้งค่าการแสดงผลทั่วไป</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 rounded-md">
                          <div className="pr-4">
                            <div className="text-sm font-semibold text-white mb-1">Custom Cursor</div>
                            <div className="text-xs text-zinc-400 leading-normal">เปิด/ปิด เอฟเฟกต์เคอร์เซอร์ของเว็บไซต์ เพื่อลดการกระตุกบนเครื่องสเปกต่ำ</div>
                          </div>
                          <div className="flex items-center shrink-0">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={useCustomCursor ?? true} 
                                onChange={toggleCustomCursor}
                              />
                              <div className="w-11 h-6 bg-[#050505] border border-zinc-850 rounded-full peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-300 after:border-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-green"></div>
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
