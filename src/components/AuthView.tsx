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
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-white text-zinc-800 font-sans">
      {/* Immersive Minimalist Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none bg-white">
        <div className="absolute top-[-5%] left-[50%] -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[10%] w-[400px] h-[400px] bg-indigo-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.99, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-[24px] shadow-2xl shadow-zinc-200/50 relative z-10"
      >
        {/* Header / Brand */}
        <div className="text-center mb-6 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.25 }}
            className="mb-5 cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setActiveView("home")}
          >
            <img src="https://img2.pic.in.th/983B3DCE-90A3-4822-8940-D6B81CCA63A3.png" alt="APEXSTORE Logo" className="h-[44px] md:h-[50px] object-contain drop-shadow-[0_2px_10px_rgba(59,130,246,0.1)] hover:scale-101 transition-transform duration-200" />
          </motion.div>
          
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-2">
            {authMode === 'login' ? 'ยินดีต้อนรับกลับมา' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่านใหม่' : 'สมัครสมาชิกใหม่'}
          </h1>
          <p className="text-xs font-semibold text-zinc-400">
            {authMode === 'login' ? 'กรุณาลงชื่อเข้าใช้เพื่อเปิดใช้งานฟังก์ชั่นทั้งหมด' : authMode === 'forgot' ? 'กรอกข้อมูลรายละเอียดเพื่อตั้งรหัสผ่านใหม่' : 'เริ่มต้นการสั่งซื้อง่ายๆ เพียงไม่กี่ขั้นตอน'}
          </p>
        </div>

        {/* Authentication Mode Switcher Pill */}
        {authMode !== 'forgot' && (
          <div className="p-1 rounded-xl bg-zinc-100/80 border border-zinc-200/40 flex gap-1 mb-6 relative">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setActiveView('login'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold leading-normal transition-colors duration-200 z-10 cursor-pointer ${authMode === 'login' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-650'}`}
            >
              ลงชื่อเข้าใช้
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setActiveView('signup'); }}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold leading-normal transition-colors duration-200 z-10 cursor-pointer ${authMode === 'signup' ? 'text-zinc-900' : 'text-zinc-400 hover:text-zinc-650'}`}
            >
              สมัครสมาชิก
            </button>
            {/* Sliding Pill Background with beautiful shadow */}
            <div 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white border border-zinc-200/50 rounded-lg shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
              style={{ transform: authMode === 'login' ? 'translateX(0)' : 'translateX(calc(100%))' }}
            />
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {/* Username field */}
            <motion.div layout key="username" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.15 }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-500 tracking-wide pl-0.5 flex items-center gap-1.5 uppercase select-none">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ชื่อผู้ใช้ (Username)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 hover:border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all text-zinc-800 font-bold text-sm placeholder:text-zinc-400 font-sans shadow-sm"
                    placeholder="ภาษาอังกฤษหรือตัวเลขเท่านั้น"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Email field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }} transition={{ duration: 0.18 }}>
                <div className="flex flex-col gap-1.5 mt-3.5">
                  <label className="text-[11px] font-bold text-zinc-500 tracking-wide pl-0.5 flex items-center gap-1.5 uppercase select-none">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>อีเมลติดต่อ / กู้คืนบัญชี</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 hover:border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all text-zinc-800 font-bold text-sm placeholder:text-zinc-400 font-sans shadow-sm"
                      placeholder="เช่น cleanemail@example.com"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* OTP field (Only for forgot password when otpRequired is true) */}
            {authMode === 'forgot' && otpRequired && (
              <motion.div layout key="otp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }}>
                <div className="flex flex-col gap-1.5 mt-3.5">
                  <label className="text-[11px] font-bold text-emerald-600 tracking-wide pl-0.5 flex items-center gap-1.5 uppercase select-none">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>รหัสยืนยัน OTP</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500 group-focus-within:text-emerald-600 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-10 pr-4 py-3 bg-emerald-50/20 border border-emerald-200 hover:border-emerald-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl outline-none text-emerald-900 text-sm placeholder:text-emerald-300 font-bold text-center tracking-widest transition-colors shadow-sm"
                      placeholder="ตัวเลข 6 หลักจาก console"
                      required
                      maxLength={6}
                      minLength={6}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password field */}
            <motion.div layout key="password" initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} transition={{ duration: 0.15 }} className={authMode !== 'login' ? 'mt-3.5' : ''}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-zinc-500 tracking-wide pl-0.5 flex items-center gap-1.5 uppercase select-none">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>รหัสผ่าน (Password)</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white border border-zinc-200 hover:border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all text-zinc-800 font-bold text-sm placeholder:text-zinc-400 font-sans shadow-sm"
                    placeholder="ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร"
                    required
                    minLength={8}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3.5 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Password strength indicator */}
            {authMode === 'signup' && authPassword && (
              <motion.div layout key="strength" className="space-y-1 mt-2.5">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 px-0.5">
                  <span>ความแข็งแรงรหัสผ่าน</span>
                  <span className={strength.score >= 4 ? "text-blue-500" : strength.score >= 3 ? "text-amber-500" : "text-rose-500"}>
                    {strength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full transition-all duration-500 ease-out ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }}></div>
                </div>
              </motion.div>
            )}

            {/* Confirm Password field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirmPassword" initial={{ opacity: 0, height: 0, scale: 0.98 }} animate={{ opacity: 1, height: 'auto', scale: 1 }} exit={{ opacity: 0, height: 0, scale: 0.98 }} transition={{ duration: 0.18 }}>
                <div className="flex flex-col gap-1.5 mt-3.5">
                  <label className="text-[11px] font-bold text-zinc-500 tracking-wide pl-0.5 flex items-center gap-1.5 uppercase select-none">
                    <Shield className="w-3.5 h-3.5 text-zinc-400" />
                    <span>ยืนยันรหัสผ่านอีกครั้ง</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                      <Shield className="w-4 h-4" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 bg-white border border-zinc-200 hover:border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl outline-none transition-all text-zinc-800 font-bold text-sm placeholder:text-zinc-400 font-sans shadow-sm"
                      placeholder="กรอกรหัสผ่านเพื่อยืนยันอีกครั้ง"
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-3.5 flex items-center text-zinc-400 hover:text-zinc-700 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forget password trigger for login view */}
          {authMode === 'login' && (
            <div className="flex justify-between items-center px-0.5 mt-2 font-sans select-none">
              <label className="flex items-center gap-2 cursor-pointer group">
                 <input type="checkbox" className="w-4 h-4 rounded border-zinc-300 bg-white text-blue-600 focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer" />
                 <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-650 transition-colors">จดจำฉันไว้</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-xs font-bold text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
              >
                ลืมรหัสผ่านใช่หรือไม่?
              </button>
            </div>
          )}

          {/* Turnstile Integration */}
          {formError && <div className="mt-4 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs font-bold text-center">{formError}</div>}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center relative z-20 py-1 w-full max-w-[300px] mx-auto overflow-hidden">
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
            className="w-full py-3.5 rounded-xl font-bold bg-zinc-900 border border-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border-zinc-100 transition-all text-xs uppercase tracking-wider flex justify-center items-center gap-2 mt-6 cursor-pointer shadow-md active:scale-[0.99]"
          >
            {authLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>กำลังดำเนินการประมวลผล...</span>
              </>
            ) : (
              <>
                <span>{authMode === 'login' ? 'เข้าสู่ระบบบัญชีสโตร์' : authMode === 'forgot' ? 'ยืนยันรหัสกู้คืนผ่านเมล' : 'สมัครสมาชิกบัญชีใหม่'}</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </>
            )}
          </button>
        </form>
        
        {/* Sub Navigation Links */}
        <div className="mt-6 pt-5 border-t border-zinc-150 text-center font-sans">
          {authMode === 'forgot' ? (
            <button 
              onClick={() => setAuthMode('login')} 
              className="text-zinc-500 hover:text-blue-600 text-xs font-bold flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> ย้อนกลับหน้าลงชื่อเข้าใช้
            </button>
          ) : (
            <p className="text-zinc-400 text-[11px] font-medium leading-relaxed">
              การจัดทำบัญชีแสดงว่าคุณยอมรับ <a href="#" onClick={(e)=>{e.preventDefault();setActiveView("custom_page");}} className="text-zinc-500 hover:text-blue-600 cursor-pointer underline underline-offset-2 transition-colors">ข้อตกลงผู้ใช้</a> และ <a href="#" onClick={(e)=>{e.preventDefault();setActiveView("custom_page");}} className="text-zinc-500 hover:text-blue-600 cursor-pointer underline underline-offset-2 transition-colors">นโยบายความเป็นส่วนตัว</a>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
});

