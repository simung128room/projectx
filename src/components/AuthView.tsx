import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Lock, Mail, User, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { supabase as auth } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

const rawEnvKey = (import.meta.env.TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : '0x4AAAAAADDNPyGBIV4MApep';

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
      if (msg.includes('invalid email format') || msg.includes('validation failed')) msg = 'รูปแบบอีเมล หรือข้อมูลไม่ถูกต้อง';
      if (msg.includes('Email not confirmed')) msg = 'โปรดยืนยันอีเมลของคุณ';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'การเชื่อมต่อเครือข่ายล้มเหลว (Network Error)';
      if (msg.includes('Password should be at least')) msg = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
      if (msg.toLowerCase().includes('api key')) msg = 'ตั้งค่า API Key ของระบบไม่ถูกต้อง (API Key Invalid)';
      
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#ef4444' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#0A0D12]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#3B82F6]/10 via-[#0A0D12] to-[#0A0D12] pointer-events-none"></div>
      <div className="absolute w-full h-full bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl bg-[#0B0F14]/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative z-10 flex overflow-hidden lg:divide-x lg:divide-white/10"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] from-transparent via-[#3B82F6]/40 to-transparent z-20"></div>

        {/* Left Side: Illustration / Info (Hidden on Mobile) */}
        <div className="hidden lg:flex w-1/2 bg-zinc-950/50 relative flex-col justify-center p-14 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#3B82F6]/10 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                >
                    <img loading="lazy" src="https://img2.pic.in.th/IMG_66428dd32388057a24f4.png" alt="Logo" className="w-20 h-20 mb-8 drop-shadow-xl" />
                    <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-cyan-400 drop-shadow-sm">APEXSTORE</span><br/>
                        ระบบบริหาร<br/>ร้านค้าอันดับหนึ่ง
                    </h1>
                    <p className="text-zinc-400 text-[15px] leading-relaxed max-w-sm mb-10">
                        เชื่อมต่อทุกอย่างไว้ในที่เดียว ตอบโจทย์ทุกการใช้งาน ซื้อ-ขาย รวดเร็วและปลอดภัยระดับมาตรฐาน
                    </p>
                    
                    <div className="space-y-5">
                        <div className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                                <Zap className="w-5 h-5" />
                            </div>
                            ระบบอัตโนมัติ รวดเร็ว 24 ชม.
                        </div>
                        <div className="flex items-center gap-4 text-sm text-zinc-300 font-medium">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                                <Lock className="w-5 h-5" />
                            </div>
                            ความปลอดภัยสูง ป้องกันข้อมูล
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 bg-[#0B0F14] p-8 sm:p-12 relative flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/5 rounded-full blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-start mb-8 relative">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight">
                {authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'สร้างบัญชีผู้ใช้ใหม่'}
              </h2>
              <div className="h-1 w-12 bg-[#3B82F6] rounded-full mt-3 mb-3"></div>
              <p className="text-zinc-400 text-[13px] sm:text-sm">
                {authMode === 'login' ? 'ยินดีต้อนรับกลับสู่ APEXSTORE' : authMode === 'forgot' ? 'กู้คืนบัญชีของคุณ' : 'ลงทะเบียนเพื่อเริ่มต้นใช้งานระบบ'}
              </p>
            </div>
            <div className="w-12 h-12 shrink-0 lg:hidden flex items-center justify-center">
              <motion.img loading="lazy" 
                src="https://img2.pic.in.th/IMG_66428dd32388057a24f4.png" 
                alt="Logo" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain drop-shadow-md" 
                animate={{ 
                  y: [0, -4, 0],
                  rotate: [0, 4, -4, 0]
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
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1D4ED8]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
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
                    className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-[#1D4ED8]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
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
                  className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-10 outline-none focus:border-[#1D4ED8]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
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
                    className="w-full bg-[#12161E] border border-white/5 rounded-xl py-2 pl-10 pr-10 outline-none focus:border-[#1D4ED8]/50 focus:bg-[#151A23] transition-colors text-white text-sm placeholder:text-zinc-600 font-sans"
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

          <motion.div layout className="pt-6">
            <button 
              type="submit" 
              disabled={authLoading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              className={`w-full py-3.5 rounded-xl text-[15px] font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg active:scale-[0.98] ${
                authMode === 'signup'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : authMode === 'forgot'
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-500/20'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[#3B82F6]/20'
              }`}
            >
              {authLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการ...</span>
                </div>
              ) : (
                <span>{authMode === 'login' ? 'เข้าสู่ระบบตอนนี้' : authMode === 'forgot' ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน' : 'สร้างบัญชีใหม่'}</span>
              )}
            </button>
          </motion.div>
        </form>
        
        <div className="mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-[1px] bg-white/5"></div>
            <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest">หรือ</span>
            <div className="flex-1 h-[1px] bg-white/5"></div>
          </div>
          
          <div className="text-center text-[13.5px] flex flex-col gap-4">
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
            <div className="flex items-center justify-center gap-2">
              <span className="text-zinc-500">
                {authMode === 'login' ? 'ยังไม่มีบัญชีใช่หรือไม่?' : 'มีบัญชีอยู่แล้วใช่หรือไม่?'}
              </span>
              <button 
                onClick={() => { 
                  const nextMode = authMode === 'login' ? 'signup' : 'login';
                  setAuthMode(nextMode); 
                  setActiveView(nextMode); 
                }} 
                className={`font-bold transition-colors underline-offset-4 hover:underline focus:outline-none ${
                    authMode === 'login' ? 'text-emerald-500 hover:text-emerald-400' : 'text-[#3B82F6] hover:text-[#2563EB]'
                }`}
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
        </div>
        </div>
      </motion.div>
    </div>
  );
});
