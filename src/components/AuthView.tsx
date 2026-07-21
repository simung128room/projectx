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
    return { score, label: 'ปลอดภัย (Strong)', color: 'bg-primary' };
  };

  const strength = getPasswordStrength(authPassword);

  const handleSocialLogin = () => {
    Swal.fire({
      title: 'แจ้งเตือน',
      text: 'ระบบยังไม่รองรับช่องทางนี้ในขณะนี้',
      icon: 'info',
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#de7356',
      background: '#1f1c14',
      color: '#f5f0e8'
    });
  };

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
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'รหัสผ่านไม่ตรงกัน', confirmButtonColor: '#de7356' });
      return;
    }

    setAuthLoading(true);
    try {
      const generatedEmail = `${authUsername.toLowerCase().replace(/\s+/g, '')}@apex-studio.com`;

      if (authMode === 'signup') {
        try {
          const res = await axios.post('/api/signup', { email: generatedEmail, password: authPassword, recoveryEmail: authEmail, turnstileToken: currentToken });
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
            otp: otpRequired ? otp : undefined, turnstileToken: currentToken
          });
          if (res.data.otpRequired) {
            setOtpRequired(true);
            Swal.fire({
              icon: 'info',
              title: 'กรุณากรอกรหัส OTP',
              text: res.data.message || 'ส่งรหัส OTP เรียบร้อยแล้ว (ตรวจสอบได้ใน console log ของเซิร์ฟเวอร์)',
              confirmButtonColor: '#de7356'
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
      
      Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: msg, confirmButtonColor: '#de7356' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-52px)] w-full flex items-center justify-center p-4 sm:p-8 relative overflow-hidden bg-background text-foreground font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] bg-card p-8 sm:p-10 rounded-lg border border-border relative z-10 mx-auto"
      >
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
              {authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : authMode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
            </h1>
            <p className="text-base text-muted-foreground font-semibold tracking-wide uppercase">
              {authMode === 'forgot' ? 'RESET PASSWORD' : authMode === 'login' ? 'LOGIN' : 'REGISTER'}
            </p>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              type: 'spring', 
              bounce: 0.5 
            }}
            className="w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center overflow-hidden ml-4"
          >
            <motion.img 
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              src="https://img1.pic.in.th/images/1000045512.png" 
              alt="Logo" 
              className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
            />
          </motion.div>
        </div>

        {/* Tab Switcher - Using simple text buttons at the bottom instead of tabs for this card design */}
        <form onSubmit={handleAuth} className="space-y-0">
          <AnimatePresence mode="popLayout">
            {/* Username field */}
            <motion.div layout key="username" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-zinc-300">
                  ชื่อผู้ใช้
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full pl-[40px] pr-4 py-2.5 bg-secondary border border-border focus:border-ring rounded-lg outline-none transition-all text-foreground text-[14px] font-medium"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* Email field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="email" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[13px] font-bold text-zinc-300">
                    อีเมล
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Mail className="w-[18px] h-[18px]" />
                    </div>
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-[40px] pr-4 py-2.5 bg-secondary border border-border focus:border-ring rounded-lg outline-none transition-all text-foreground text-[14px] font-medium"
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
                  <label className="text-[13px] font-bold text-primary">
                    รหัส OTP
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Shield className="w-[18px] h-[18px]" />
                    </div>
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full pl-[40px] pr-4 py-2.5 bg-secondary border border-border focus:border-ring rounded-lg outline-none transition-all text-foreground text-[14px] text-center tracking-[0.25em] font-medium"
                      required
                      maxLength={6}
                      minLength={6}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Password field */}
            <motion.div layout key="password" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-[13px] font-bold text-zinc-300">
                  รหัสผ่าน
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Lock className="w-[18px] h-[18px]" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full pl-[40px] pr-12 py-2.5 bg-secondary border border-border focus:border-ring rounded-lg outline-none transition-all text-foreground text-[14px] font-medium"
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-muted-foreground/80 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              {authMode === 'login' && (
                <div className="flex justify-end mt-3 mr-1">
                  <button type="button" onClick={() => setAuthMode('forgot')} className="text-[13px] font-bold text-muted-foreground hover:text-foreground transition-colors">
                    ลืมรหัสผ่าน?
                  </button>
                </div>
              )}
            </motion.div>

            {/* Password strength indicator */}
            {authMode === 'signup' && authPassword && (
              <motion.div layout key="strength" className="space-y-1.5 mt-2.5 px-1">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground/80">
                  <span>ความแข็งแกร่งของรหัสผ่าน:</span>
                  <span className={strength.score >= 4 ? "text-primary" : strength.score >= 3 ? "text-amber-500" : "text-rose-500"}>
                    {strength.label}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Confirm Password field (Only for signup/forgot) */}
            {(authMode === 'signup' || authMode === 'forgot') && (
              <motion.div layout key="confirmPassword" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex flex-col gap-2 mt-4">
                  <label className="text-[13px] font-bold text-zinc-300">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                      <Lock className="w-[18px] h-[18px]" />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={authConfirmPassword}
                      onChange={(e) => setAuthConfirmPassword(e.target.value)}
                      className="w-full pl-[40px] pr-12 py-2.5 bg-secondary border border-border focus:border-ring rounded-lg outline-none transition-all text-foreground text-[14px] font-medium"
                      required
                      minLength={6}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-4 flex items-center text-muted-foreground/80 hover:text-zinc-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Turnstile Integration */}
          {formError && <div className="mt-4 text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-sm text-center font-medium">{formError}</div>}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center relative z-20 py-2 mt-2 w-full max-w-[300px] mx-auto overflow-hidden">
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
            className="w-full mt-6 py-2.5 rounded-lg font-semibold bg-primary hover:opacity-90 text-primary-foreground disabled:opacity-50 transition-colors text-sm flex justify-center items-center gap-2 cursor-pointer"
          >
            {authLoading ? (
              <span className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'forgot' ? 'รีเซ็ตรหัสผ่าน' : 'เปิดบัญชี XENOBUX'}</span>
            )}
          </button>
        </form>

        {/* Separator */}
        {authMode !== 'forgot' && (
          <>
            <div className="relative flex items-center my-6">
              <div className="flex-grow border-t border-zinc-800" style={{ borderTopWidth: '1px' }}></div>
              <span className="flex-shrink-0 mx-4 text-[12px] text-muted-foreground/80 font-medium">หรือเข้าสู่ระบบด้วย</span>
              <div className="flex-grow border-t border-zinc-800" style={{ borderTopWidth: '1px' }}></div>
            </div>

            {/* Social Logins */}
            <div className="flex justify-center gap-4">
              <button onClick={handleSocialLogin} type="button" className="w-[44px] h-[44px] flex items-center justify-center bg-secondary hover:bg-border border border-border rounded-lg transition-colors cursor-pointer text-foreground shrink-0">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              
              <button onClick={handleSocialLogin} type="button" className="w-[44px] h-[44px] flex items-center justify-center bg-secondary hover:bg-border border border-border rounded-lg transition-colors cursor-pointer text-foreground shrink-0">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
              </button>

              <button onClick={handleSocialLogin} type="button" className="w-[44px] h-[44px] flex items-center justify-center bg-secondary hover:bg-border border border-border rounded-lg transition-colors cursor-pointer text-foreground shrink-0">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.641-.026 2.669-1.48 3.666-2.947 1.152-1.688 1.631-3.325 1.657-3.411-.039-.013-3.182-1.22-3.182-4.857 0-3.052 2.502-4.52 2.605-4.585-1.428-2.09-3.633-2.376-4.423-2.415-2.08-.182-4.065 1.143-4.608 1.143zM15.467 4.254c.831-1.006 1.39-2.402 1.24-3.802-1.182.047-2.656.786-3.513 1.805-.76.864-1.403 2.288-1.22 3.667 1.32.102 2.662-.662 3.493-1.67z" />
                </svg>
              </button>
            </div>
          </>
        )}

        {/* Footer Link */}
        <div className="mt-6 text-center text-[11px]">
          {authMode === 'login' ? (
            <p className="text-muted-foreground/80">
              ไม่มีบัญชีใช่หรือไม่?{' '}
              <button type="button" onClick={() => setAuthMode('signup')} className="font-semibold text-zinc-300 hover:text-foreground transition-colors">
                สร้างบัญชี
              </button>
            </p>
          ) : authMode === 'signup' ? (
            <p className="text-muted-foreground/80">
              มีบัญชีอยู่แล้ว?{' '}
              <button type="button" onClick={() => setAuthMode('login')} className="font-semibold text-zinc-300 hover:text-foreground transition-colors">
                เข้าสู่ระบบ
              </button>
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="font-semibold text-zinc-300 hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> กลับหน้าเข้าสู่ระบบ
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
});

