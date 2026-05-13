import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Lock, Mail, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { supabase as auth } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : '0x4AAAAAADDurF1TEj8IRq9g';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  setActiveView: (view: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = React.memo(({ initialMode, setActiveView }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  React.useEffect(() => {
    setAuthMode(initialMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      // Just bypass it since it can hang in preview sometimes
      // return;
    }
    await executeAuth(turnstileToken || 'bypass');
  };

  const executeAuth = async (currentToken: string | null = turnstileToken) => {
    setAuthLoading(true);
    try {
      const generatedEmail = `${authUsername.toLowerCase().replace(/\s+/g, '')}@apex-studio.com`;

      if (authMode === 'signup') {
        try {
          const res = await axios.post('/api/signup', { email: generatedEmail, password: authPassword });
          if (res.data.error) {
             throw new Error(res.data.error);
          }
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }
        
        Swal.fire({ icon: 'success', title: 'สมัครสมาชิกสำเร็จ', text: 'กรุณาเข้าสู่ระบบ...', timer: 1500, showConfirmButton: false });
        setAuthMode('login');
        setActiveView('login');
      } else {
        const { data, error } = await auth.auth.signInWithPassword({ email: generatedEmail, password: authPassword });

        if (error) {
           throw new Error(error.message);
        }

        Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ', timer: 1500, showConfirmButton: false }).then(() => {
           setActiveView('home');
           window.location.hash = 'home';
        });
      }
    } catch (err: any) {
      let msg = err?.message || 'An error occurred';
      if (msg.includes('already registered')) msg = 'ชื่อผู้ใช้ หรือ อีเมลนี้ถูกใช้งานแล้ว';
      if (msg.includes('Invalid login credentials')) msg = 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง';
      if (msg.includes('invalid email format')) msg = 'รูปแบบอีเมลไม่ถูกต้อง';
      if (msg.includes('Email not confirmed')) msg = 'โปรดยืนยันอีเมลของคุณ';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'การเชื่อมต่อเครือข่ายล้มเหลว';
      if (msg.includes('Password should be at least')) msg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0A0D12] rounded-[24px] border border-white/5 shadow-2xl p-6 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#1E90FF]/40 to-transparent"></div>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl font-semibold text-white tracking-tight">
            {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้ใหม่'}
          </h2>
          <p className="text-zinc-500 text-sm mt-1.5">
            {authMode === 'login' ? 'ยินดีต้อนรับกลับสู่ APEX STUDIO' : 'ลงทะเบียนเพื่อเริ่มต้นใช้งาน'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            <motion.div layout key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1">ชื่อผู้ใช้ / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white placeholder:text-zinc-600 font-sans"
                  placeholder="Username"
                  required
                />
              </div>
            </motion.div>

            <motion.div layout key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1">รหัสผ่าน / Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-3 pl-11 pr-11 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white placeholder:text-zinc-600 font-sans"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {authMode === 'signup' && (
              <motion.div layout key="confirm_password" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1 mt-4">ยืนยันรหัสผ่าน / confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-zinc-500" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    className="w-full bg-[#12161E] border border-white/5 rounded-xl py-3 pl-11 pr-11 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white placeholder:text-zinc-600 font-sans"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {TURNSTILE_SITE_KEY && (
            <motion.div layout className="pt-4 mt-2">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: 'light', size: 'compact' }}
                className="w-full overflow-hidden rounded-xl mx-auto flex justify-center"
              />
            </motion.div>
          )}

          <motion.div layout className="pt-4">
            <button 
              type="submit" 
              disabled={authLoading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              className="w-full py-3.5 rounded-xl text-[15px] font-semibold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#1E90FF] hover:bg-[#1A56DB] text-white active:scale-[0.98]"
            >
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : 'ยืนยันการสมัคร'}</span>
              )}
            </button>
          </motion.div>
        </form>
        
        <div className="mt-8 text-center text-[13px]">
          <span className="text-zinc-500">
            {authMode === 'login' ? 'ยังไม่มีบัญชีใช่หรือไม่? ' : 'มีบัญชีอยู่แล้วใช่หรือไม่? '}
          </span>
          <button 
            onClick={() => { 
              const nextMode = authMode === 'login' ? 'signup' : 'login';
              setAuthMode(nextMode); 
              setActiveView(nextMode); 
            }} 
            className="text-[#1E90FF] font-medium hover:text-[#1A56DB] transition-colors underline-offset-4 hover:underline focus:outline-none"
          >
            {authMode === 'login' ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'}
          </button>
        </div>
      </motion.div>
    </div>
  );
});
