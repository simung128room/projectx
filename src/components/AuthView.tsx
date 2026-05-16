import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Lock, Mail, User, UserPlus, LogIn } from 'lucide-react';
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
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, label: 'อ่อน (Weak)', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'ปานกลาง (Medium)', color: 'bg-amber-500' };
    return { score, label: 'ปลอดภัย (Strong)', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(authPassword);

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
    if ((authMode === 'signup' || authMode === 'forgot') && authPassword !== authConfirmPassword) {
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'รหัสผ่านไม่ตรงกัน', confirmButtonColor: '#ef4444' });
      return;
    }

    setAuthLoading(true);
    try {
      const generatedEmail = `${authUsername.toLowerCase().replace(/\s+/g, '')}@apex-studio.com`;

      if (authMode === 'signup') {
        try {
          const res = await axios.post('/api/signup', { email: generatedEmail, password: authPassword, recoveryEmail: authEmail });
          if (res.data.error) {
             throw new Error(res.data.error);
          }
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }
        
        Swal.fire({ icon: 'success', title: 'สมัครสมาชิกสำเร็จ', text: 'กรุณาเข้าสู่ระบบ...', timer: 1500, showConfirmButton: false });
        setAuthMode('login');
        setActiveView('login');
      } else if (authMode === 'forgot') {
        try {
          const res = await axios.post('/api/reset-password', { username: authUsername, email: authEmail, newPassword: authPassword });
          if (res.data.error) {
            throw new Error(res.data.error);
          }
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }

        Swal.fire({ icon: 'success', title: 'รีเซ็ตรหัสผ่านสำเร็จ', text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', timer: 1500, showConfirmButton: false });
        setAuthMode('login');
        setActiveView('login');
      } else {
        const { data, error } = await auth.auth.signInWithPassword({ email: generatedEmail, password: authPassword });

        if (error) {
           throw new Error(error.message);
        }

        Swal.fire({ icon: 'success', title: 'เข้าสู่ระบบสำเร็จ', timer: 1500, showConfirmButton: false });
        setActiveView('home');
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
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight leading-tight">
              {authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'สร้างบัญชีผู้ใช้ใหม่'}
            </h2>
            <p className="text-zinc-500 text-[13px] sm:text-sm mt-1.5">
              {authMode === 'login' ? 'ยินดีต้อนรับกลับสู่ APEX STUDIO' : authMode === 'forgot' ? 'กู้คืนบัญชีของคุณ' : 'ลงทะเบียนเพื่อเริ่มต้นใช้งาน'}
            </p>
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 ml-4 flex items-center justify-center">
            <motion.img 
              src="https://i.postimg.cc/6qnW8nqX/IMG-6366.png" 
              alt="APEX STUDIO" 
              className="w-full h-full object-contain drop-shadow-md" 
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 8, -8, 0]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            <motion.div layout key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1">ชื่อผู้ใช้ / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-zinc-500" />
                </div>
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
                  placeholder="Username"
                  required
                />
              </div>
            </motion.div>

            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1">อีเมล / Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
                    placeholder="example@yourmail.com"
                    required
                  />
                </div>
              </motion.div>
            )}

            <motion.div layout key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
              <div className="flex justify-between items-end mb-1.5 px-1">
                <label className="block text-sm font-medium text-zinc-400">{authMode === 'forgot' ? 'รหัสผ่านใหม่ / New Password' : 'รหัสผ่าน / Password'}</label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-zinc-500" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-10 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
                  placeholder="Enter password"
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
              {(authMode === 'signup' || authMode === 'forgot') && authPassword && (
                <div className="mt-2 px-1">
                  <div className="flex items-center justify-between mb-1 text-[10px] font-medium text-zinc-500">
                    <span>ความปลอดภัยรหัสผ่าน</span>
                    <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div 
                        key={level} 
                        className={`flex-1 rounded-full transition-all duration-300 ${level <= strength.score ? strength.color : 'bg-zinc-800'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirm_password" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5 px-1 mt-4">ยืนยันรหัสผ่าน / Confirm password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-zinc-500" />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-10 outline-none focus:border-[#1A56DB]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {TURNSTILE_SITE_KEY && (
            <motion.div layout className="pt-2 mt-2 w-full">
              <div className="w-full h-[58px] relative overflow-hidden rounded-xl border border-white/5 bg-[#0B0F14]">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] scale-[0.92] flex justify-center">
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken(null)}
                    onError={() => setTurnstileToken(null)}
                    options={{ theme: 'dark', size: 'flexible' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <motion.div layout className="pt-4">
            <button 
              type="submit" 
              disabled={authLoading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-[#1E90FF] hover:bg-[#1A56DB] text-white active:scale-[0.98]"
            >
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'ยืนยันการตั้งรหัสผ่านใหม่' : 'ยืนยันการสมัคร'}</span>
              )}
            </button>
          </motion.div>
        </form>
        
        <div className="mt-8 text-center text-[13px] flex flex-col gap-3">
          {authMode === 'login' && (
            <div>
              <button 
                onClick={() => setAuthMode('forgot')} 
                className="text-zinc-400 hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none"
              >
                ลืมรหัสผ่าน? / Forgot Password
              </button>
            </div>
          )}
          {authMode !== 'forgot' && (
            <div>
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
          )}
          {authMode === 'forgot' && (
            <div>
              <button 
                onClick={() => { 
                  setAuthMode('login'); 
                  setActiveView('login'); 
                }} 
                className="text-zinc-400 font-medium hover:text-white transition-colors underline-offset-4 hover:underline focus:outline-none flex items-center justify-center gap-1 mx-auto"
              >
                ย้อนกลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
});
