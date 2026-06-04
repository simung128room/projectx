import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Lock, Mail, User, UserPlus, LogIn, Shield, ArrowLeft } from 'lucide-react';
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
    if (!pass) return { score: 0, label: '', color: 'bg-white/5' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, label: 'อ่อน (Weak)', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'ปานกลาง (Medium)', color: 'bg-amber-500' };
    return { score, label: 'ปลอดภัย (Strong)', color: 'bg-neon-green' };
  };

  const strength = getPasswordStrength(authPassword);

  useEffect(() => {
    setAuthMode(initialMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
       Swal.fire({ icon: 'warning', title: 'โปรดยืนยันตัวตน', text: 'กรุณายืนยันว่าคุณไม่ใช่บอท' });
       return;
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
        
        Swal.fire({ icon: 'success', title: 'สมัครสมาชิกสำเร็จ', text: 'กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ', timer: 1500, showConfirmButton: false });
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#030303] text-white">
      {/* Cool Hex / Tech Canvas Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:3rem_3rem]"
        style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)' }}
      />

      {/* Modern Radial Gradient Ring Background */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[450px] h-[450px] bg-neon-green/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#090909]/80 border border-white/[0.08] backdrop-blur-2xl relative z-10 p-8 sm:p-10 rounded-2xl shadow-2xl shadow-black/80"
      >
        {/* Header / Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="w-14 h-14 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-5"
          >
            <Shield className="w-7 h-7 text-neon-green animate-pulse" />
          </motion.div>
          <h2 className="font-mono text-2xl font-black tracking-widest text-white uppercase select-none">
            APEX<span className="text-neon-green">STORE</span>
          </h2>
          <p className="text-[10px] text-white/30 tracking-[0.2em] font-mono mt-1 uppercase">
            {authMode === 'login' ? 'ลงชื่อเข้าใช้ระบบ / APEX SECURE SIGN-IN' : authMode === 'forgot' ? 'กู้คืนรหัสผ่าน / RECOVERY' : 'สร้างบัญชีผู้ใช้ใหม่ / JOIN STORE'}
          </p>
        </div>

        {/* Authentication Mode Switcher Pill */}
        {authMode !== 'forgot' && (
          <div className="p-1 rounded-xl bg-white/[0.02] border border-white/[0.05] flex gap-1 mb-6">
            <button
              onClick={() => { setAuthMode('login'); setActiveView('login'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${authMode === 'login' ? 'bg-[#111111] text-white shadow-xl border border-white/[0.08]' : 'text-white/40 hover:text-white'}`}
            >
              ลงชื่อเข้าใช้
            </button>
            <button
              onClick={() => { setAuthMode('signup'); setActiveView('signup'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${authMode === 'signup' ? 'bg-[#111111] text-white shadow-xl border border-white/[0.08]' : 'text-white/40 hover:text-white'}`}
            >
              สมัครสมาชิก
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Username field */}
            <motion.div layout key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative">
                <div className="absolute left-3.5 top-[13px] text-white/30">
                  <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 rounded-xl outline-none transition-all text-white text-sm placeholder:text-zinc-650 font-sans"
                  placeholder="ชื่อผู้ใช้ / Username"
                  required
                />
              </div>
            </motion.div>

            {/* Email field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="relative">
                  <div className="absolute left-3.5 top-[13px] text-white/30">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 rounded-xl outline-none transition-all text-white text-sm placeholder:text-zinc-650 font-sans"
                    placeholder="อีเมลปลอดภัย / Recovery Email"
                    required
                  />
                </div>
              </motion.div>
            )}

            {/* Password field */}
            <motion.div layout key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative">
                <div className="absolute left-3.5 top-[13px] text-white/30">
                  <Lock className="w-4 h-4" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 rounded-xl outline-none transition-all text-white text-sm placeholder:text-zinc-650 font-sans text-white"
                  placeholder="รหัสผ่าน / Password (อย่างน้อย 6 ตัวอักษร)"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>

            {/* Password strength indicator */}
            {authMode === 'signup' && authPassword && (
              <motion.div layout key="strength" className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-white/30 px-1">
                  <span>ความเข้มแข็งของรหัสผ่าน</span>
                  <span className={strength.score >= 4 ? "text-neon-green" : strength.score >= 3 ? "text-amber-400" : "text-rose-450"}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full transition-all duration-300 ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
                </div>
              </motion.div>
            )}

            {/* Confirm Password field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirmPassword" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="relative">
                  <div className="absolute left-3.5 top-[13px] text-white/30">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 rounded-xl outline-none transition-all text-white text-sm placeholder:text-zinc-650 font-sans"
                    placeholder="ยืนยันรหัสผ่านอีกครั้ง / Confirm Password"
                    required
                    minLength={6}
                  />
                  <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-white/30 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forget password trigger for login view */}
          {authMode === 'login' && (
            <div className="flex justify-end p-1">
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-[11px] font-medium text-white/40 hover:text-white transition-colors"
              >
                ลืมรหัสผ่านใช่หรือไม่?
              </button>
            </div>
          )}

          {/* Turnstile Integration */}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center py-2 bg-white/[0.01] rounded-xl border border-white/[0.03]">
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
              />
            </div>
          )}

          {/* Submit Action Button */}
          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-zinc-200 text-xs tracking-widest uppercase transition-all duration-150 flex justify-center items-center gap-2 mt-4 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>กำลังทำรายการ...</span>
              </>
            ) : (
              <>
                {authMode === 'login' ? 'ลงชื่อเข้าใช้ระบบ / PRIVATE SIGN IN' : authMode === 'forgot' ? 'กู้คืนและรีเซ็ตรหัสผ่าน' : 'สร้างบัญชีใหม่ / COMPLETE REGISTRATION'}
              </>
            )}
          </button>
        </form>
        
        {/* Sub Navigation Links */}
        <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
          {authMode === 'forgot' ? (
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-white/40 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับไปหน้าลงชื่อเข้าใช้
            </button>
          ) : (
            <button 
              onClick={() => { 
                const nextMode = authMode === 'login' ? 'signup' : 'login';
                setAuthMode(nextMode as "login" | "signup"); 
                setActiveView(nextMode); 
              }} 
              className="text-white/40 hover:text-neon-green text-xs font-bold transition-all duration-200"
            >
              {authMode === 'login' ? 'ยังไม่มีบัญชีสมาชิก? สมัครใช้งานฟรีที่นี่' : 'มีบัญชีอยู่แล้ว? กดที่นี่เพื่อลงชื่อเข้าใช้'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

