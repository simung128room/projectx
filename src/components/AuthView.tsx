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
    if (!pass) return { score: 0, label: '', color: 'bg-card/5' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    
    if (score <= 2) return { score, label: 'อ่อน (Weak)', color: 'bg-rose-500' };
    if (score <= 3) return { score, label: 'ปานกลาง (Medium)', color: 'bg-amber-500' };
    return { score, label: 'ปลอดภัย (Strong)', color: 'bg-blue-600' };
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
          Swal.fire({ icon: 'success', title: 'รีเซ็ตรหัสผ่านสำเร็จ', text: 'กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่', timer: 1500, showConfirmButton: false });
          setAuthMode('login');
          setActiveView('login');
          setOtpRequired(false);
          setOtp('');
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }
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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 text-zinc-800 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[480px] bg-white p-8 sm:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            {authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'ขอต้อนรับสู่ XENOBUX'}
          </h1>
        </div>

        {/* Tab Switcher */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-zinc-200 mb-8">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setActiveView('login'); }}
              className={`flex-1 pb-3 text-base font-bold transition-colors ${authMode === 'login' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setActiveView('signup'); }}
              className={`flex-1 pb-3 text-base font-bold transition-colors ${authMode === 'signup' ? 'border-b-2 border-zinc-900 text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}
            >
              เปิดบัญชี
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Username field */}
            <motion.div layout key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-zinc-600">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all text-zinc-900 text-sm"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Email field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[13px] font-bold text-zinc-600">
                    อีเมล
                  </label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all text-zinc-900 text-sm"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTP field (Only for forgot password when otpRequired is true) */}
            {authMode === 'forgot' && otpRequired && (
              <motion.div layout key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[13px] font-bold text-emerald-600">
                    รหัสยืนยัน OTP
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 bg-white border border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg outline-none text-emerald-900 text-sm text-center tracking-[0.25em]"
                      required
                      maxLength={6}
                      minLength={6}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password field */}
            <motion.div layout key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={(authMode !== 'login') ? 'mt-4' : ''}>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-zinc-600">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all text-zinc-900 text-sm pr-12"
                    required
                    minLength={8}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Password strength indicator */}
            {authMode === 'signup' && authPassword && (
              <motion.div layout key="strength" className="space-y-1.5 mt-2">
                <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                  <span>ความแข็งแกร่งของรหัสผ่าน:</span>
                  <span className={strength.score >= 4 ? "text-blue-600" : strength.score >= 3 ? "text-amber-500" : "text-rose-500"}>
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Confirm Password field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirmPassword" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[13px] font-bold text-zinc-600">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg outline-none transition-all text-zinc-900 text-sm pr-12"
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Turnstile Integration */}
          {formError && <div className="mt-4 text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-center">{formError}</div>}
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
            className="w-full mt-6 py-3.5 rounded-lg font-bold bg-[#ffe300] hover:bg-[#ffea33] text-zinc-900 disabled:opacity-50 transition-colors text-base flex justify-center items-center gap-2 cursor-pointer shadow-sm"
          >
            {authLoading ? (
              <span className="w-5 h-5 border-2 border-zinc-900/20 border-t-zinc-900 rounded-full animate-spin" />
            ) : (
              <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'เปิดบัญชี'}</span>
            )}
          </button>
        </form>

        {/* Separator */}
        {authMode !== 'forgot' && (
          <>
            <div className="flex items-center my-6">
              <div className="flex-1 border-b border-zinc-200"></div>
              <span className="px-4 text-sm text-zinc-500">หรือ{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัคร'}ด้วย</span>
              <div className="flex-1 border-b border-zinc-200"></div>
            </div>

            {/* Social Logins */}
            <div className="flex flex-col gap-3">
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer text-zinc-700 font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              
              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer text-zinc-700 font-medium">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                </svg>
                Github
              </button>

              <button type="button" className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors cursor-pointer text-zinc-700 font-medium">
                <svg className="w-5 h-5" viewBox="0 0 127.14 96.36" fill="#5865F2">
                  <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a67.73,67.73,0,0,1-10.87,5.19,77.68,77.68,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14c0,0,.04-.06.09-.09C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.2,46,96.12,53,91.08,65.69,84.69,65.69Z" />
                </svg>
                Discord
              </button>
            </div>
          </>
        )}

        {/* Footer Link */}
        <div className="mt-8 text-center font-sans">
          {authMode === 'forgot' ? (
            <button 
              type="button"
              onClick={() => setAuthMode('login')} 
              className="text-[#0052cc] hover:underline transition-all text-[15px] cursor-pointer"
            >
              ย้อนกลับ
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('forgot')}
              className="text-[#0052cc] hover:underline transition-all text-[15px] cursor-pointer"
            >
              ลืมรหัสผ่าน
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

