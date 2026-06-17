import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Zap, Lock, Mail, User, UserPlus, LogIn, Shield, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { supabase as auth } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : null;

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  setActiveView: (view: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = React.memo(({ initialMode, setActiveView }) => {
  const [formError, setFormError] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [otp, setOtp] = useState('');
  const [otpRequired, setOtpRequired] = useState(false);

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
    setFormError("");
    if (authMode === "signup") {
      if (!authUsername || !authEmail || !authPassword || !authConfirmPassword) { setFormError("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
      if (authPassword !== authConfirmPassword) { setFormError("รหัสผ่านไม่ตรงกัน"); return; }
      if (authPassword.length < 6) { setFormError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"); return; }
      if (TURNSTILE_SITE_KEY && !turnstileToken) { setFormError("กรุณายืนยันตัวตนว่าไม่ใช่โปรแกรมอัตโนมัติ (Captcha)"); return; }
    } else if (authMode === "login") {
      if (!authUsername || !authPassword) { setFormError("กรุณากรอกข้อมูลให้ครบถ้วน"); return; }
      if (TURNSTILE_SITE_KEY && !turnstileToken) { setFormError("กรุณายืนยันตัวตนว่าไม่ใช่โปรแกรมอัตโนมัติ (Captcha)"); return; }
    }
    
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
          const res = await axios.post('/api/reset-password', {
            username: authUsername,
            email: authEmail,
            newPassword: authPassword,
            otp: otpRequired ? otp : undefined
          });
          if (res.data.otpRequired) {
            setOtpRequired(true);
            Swal.fire({
              icon: 'info',
              title: 'กรุณากรอกรหัส OTP',
              text: res.data.message || 'ส่งรหัส OTP เรียบร้อยแล้ว (ตรวจสอบได้ใน console log ของเซิร์ฟเวอร์)',
              confirmButtonColor: '#ef4444'
            });
            setAuthLoading(false);
            return;
          }
          if (res.data.error) {
            throw new Error(res.data.error);
          }
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }

        Swal.fire({ icon: 'success', title: 'รีเซ็ตรหัสผ่านสำเร็จ', text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', timer: 1500, showConfirmButton: false });
        setAuthMode('login');
        setActiveView('login');
        setOtpRequired(false);
        setOtp('');
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#000000] text-white">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <img 
          src="https://img2.pic.in.th/IMG_7177176d5344301b32a1.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-15 blur-lg transform scale-105"
        />
        <div className="absolute inset-0 bg-[#09090b]" />
        <div className="absolute inset-0 bg-[#09090b]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#050505]/80 backdrop- border border-white/5 relative z-10 p-8 sm:p-10 rounded-md shadow-sm"
      >
        {/* Header / Brand */}
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-6 cursor-pointer"
            onClick={() => setActiveView("home")}
          >
            <img src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png" alt="APEXSTORE Logo" className="h-[48px] md:h-[56px] object-contain drop- hover:scale-105 transition-transform duration-300" />
          </motion.div>
          
          <h1 className="text-xl font-medium tracking-wide text-white mb-1.5">
            {authMode === 'login' ? 'Welcome Back' : authMode === 'forgot' ? 'Reset Password' : 'Create an Account'}
          </h1>
          <p className="text-xs text-white/40 tracking-wider font-medium uppercase">
            {authMode === 'login' ? 'กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ' : authMode === 'forgot' ? 'กรอกอีเมลเพื่อกู้คืนรหัสผ่าน' : 'สมัครสมาชิกเพื่อเริ่มต้นใช้งาน'}
          </p>
        </div>

        {/* Authentication Mode Switcher Pill */}
        {authMode !== 'forgot' && (
          <div className="p-1 rounded-md bg-white/[0.06] border border-[#1e1e1e] flex gap-1 mb-8 relative">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setActiveView('login'); }}
              className={`flex-1 py-2.5 rounded-md text-xs font-medium tracking-wider uppercase transition-all duration-300 z-10 ${authMode === 'login' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              ลงชื่อเข้าใช้
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setActiveView('signup'); }}
              className={`flex-1 py-2.5 rounded-md text-xs font-medium tracking-wider uppercase transition-all duration-300 z-10 ${authMode === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
            >
              สมัครสมาชิก
            </button>
            {/* Sliding Pill Background */}
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white/10 rounded-md shadow-md transition-all duration-300 ease-out z-0"
              style={{ left: authMode === 'login' ? '4px' : 'calc(50%)' }}
            />
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Username field */}
            <motion.div layout key="username" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 tracking-wider pl-1 flex items-center gap-1.5 select-none uppercase">
                  <User className="w-3.5 h-3.5 text-white/40" />
                  <span>ชื่อผู้ใช้</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-[#1e1e1e] hover:bg-white/[0.04] focus:bg-white/[0.04] focus:border-[#1e1e1e] rounded-md outline-none transition-all text-white text-sm placeholder:text-white/20 font-sans animate-none"
                    placeholder=""
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Email field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-xs font-semibold text-white/60 tracking-wider pl-1 flex items-center gap-1.5 select-none uppercase">
                    <Mail className="w-3.5 h-3.5 text-white/40" />
                    <span>อีเมลติดต่อกลับ</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                      <Mail className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-[#1e1e1e] hover:bg-white/[0.04] focus:bg-white/[0.04] focus:border-[#1e1e1e] rounded-md outline-none transition-all text-white text-sm placeholder:text-white/20 font-sans"
                      placeholder=""
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTP field (Only for forgot password when otpRequired is true) */}
            {authMode === 'forgot' && otpRequired && (
              <motion.div layout key="otp" initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-xs font-semibold text-[#39ff14]/85 tracking-wider pl-1 flex items-center gap-1.5 select-none uppercase animate-pulse">
                    <Shield className="w-3.5 h-3.5 text-[#39ff14]/60" />
                    <span>รหัสยืนยัน OTP</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#39ff14]/40 group-focus-within:text-[#39ff14] transition-colors">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-11 pr-4 py-3.5 bg-black/40 border border-[#39ff14]/30 hover:bg-black/50 focus:bg-black/50 focus:border-[#39ff14] rounded-md outline-none transition-all text-[#39ff14] text-sm placeholder:text-[#39ff14]/20 font-mono tracking-widest text-center"
                      placeholder=""
                      required
                      maxLength={6}
                      minLength={6}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password field */}
            <motion.div layout key="password" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className={authMode !== 'login' ? 'mt-4' : ''}>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/60 tracking-wider pl-1 flex items-center gap-1.5 select-none uppercase">
                  <Lock className="w-3.5 h-3.5 text-white/40" />
                  <span>รหัสผ่าน</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-[#1e1e1e] hover:bg-white/[0.04] focus:bg-white/[0.04] focus:border-[#1e1e1e] rounded-md outline-none transition-all text-white text-sm placeholder:text-white/20 font-sans"
                    placeholder=""
                    required
                    minLength={8}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Password strength indicator */}
            {authMode === 'signup' && authPassword && (
              <motion.div layout key="strength" className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[11px] font-medium text-white/30 px-1">
                  <span>ความปลอดภัย</span>
                  <span className={strength.score >= 4 ? "text-[#39ff14]" : strength.score >= 3 ? "text-amber-400" : "text-rose-450"}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full transition-all duration-500 ease-out ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
                </div>
              </motion.div>
            )}

            {/* Confirm Password field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirmPassword" initial={{ opacity: 0, height: 0, scale: 0.95 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <div className="flex flex-col gap-1.5 mt-4">
                  <label className="text-xs font-semibold text-white/60 tracking-wider pl-1 flex items-center gap-1.5 select-none uppercase">
                    <Shield className="w-3.5 h-3.5 text-white/40" />
                    <span>ยืนยันรหัสผ่านอีกครั้ง</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-white transition-colors">
                      <Shield className="w-4.5 h-4.5" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-white/[0.04] border border-[#1e1e1e] hover:bg-white/[0.04] focus:bg-white/[0.04] focus:border-[#1e1e1e] rounded-md outline-none transition-all text-white text-sm placeholder:text-white/20 font-sans"
                      placeholder=""
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forget password trigger for login view */}
          {authMode === 'login' && (
            <div className="flex justify-between items-center px-1 mt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#1e1e1e] bg-white/5 checked:bg-white/20 text-white focus:ring-0 focus:ring-offset-0 transition-colors" />
                 <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">จดจำการเข้าระบบ</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-[11px] font-medium text-white/40 hover:text-white transition-colors"
              >
                ลืมรหัสผ่าน?
              </button>
            </div>
          )}

          {/* Turnstile Integration */}
          {formError && <div className="mt-4 text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md p-3 text-sm font-medium animate-pulse text-center">{formError}</div>}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center relative z-20 py-2 w-full max-w-[300px] mx-auto overflow-hidden">
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
            className="w-full py-3.5 rounded-md font-medium bg-white text-black hover:bg-zinc-200 hover:scale-[1.02] active:scale-95 text-xs tracking-widest uppercase transition-all duration-200 flex justify-center items-center gap-2 mt-6 cursor-pointer disabled:opacity-50 disabled:pointer-events-none disabled:transform-none shadow-sm"
          >
            {authLoading ? (
              <>
                <span className="w-4 h-4  border-black/20 border-t-black rounded-full animate-spin" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                {authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'สร้างบัญชี'}
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>
        
        {/* Sub Navigation Links */}
        <div className="mt-8 pt-6 border-t border-[#1e1e1e] text-center">
          {authMode === 'forgot' ? (
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-white/40 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับไปหน้าเข้าสู่ระบบ
            </button>
          ) : (
            <p className="text-white/30 text-xs mt-2">
              เมื่อเข้าสู่ระบบ คุณยอมรับ <a href="#" onClick={(e)=>{e.preventDefault();setActiveView("custom_page");}} className="text-white/60 hover:text-white cursor-pointer underline underline-offset-2 decoration-white/20 transition-colors">ข้อกำหนด</a> และ <a href="#" onClick={(e)=>{e.preventDefault();setActiveView("custom_page");}} className="text-white/60 hover:text-white cursor-pointer underline underline-offset-2 decoration-white/20 transition-colors">นโยบายความเป็นส่วนตัว</a> ของเรา
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
});

