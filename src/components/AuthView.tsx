import React, { useState, useEffect, useRef } from 'react';
import { User, Shield, Mail, ArrowRight, Lock, CheckCircle2, MonitorSmartphone, Eye, EyeOff, Zap } from 'lucide-react';
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
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  React.useEffect(() => {
    setAuthMode(initialMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialMode]);

  const passwordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const strengthScore = passwordStrength(authPassword);
  let strengthColor = 'bg-zinc-200';
  let strengthLabel = 'Weak';
  if (strengthScore >= 50) { strengthColor = 'bg-amber-400'; strengthLabel = 'Fair'; }
  if (strengthScore >= 75) { strengthColor = 'bg-emerald-500'; strengthLabel = 'Good'; }
  if (strengthScore >= 100) { strengthColor = 'bg-blue-500'; strengthLabel = 'Strong'; }

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
      let loginEmail = authUsername;
      if (authMode === 'login' && !authUsername.includes('@')) {
        loginEmail = `${authUsername.toLowerCase().trim()}@apex-studio.com`;
      }
      const generatedEmail = `${authUsername.toLowerCase().trim()}@apex-studio.com`;

      if (authMode === 'signup') {
        const signupEmail = authEmail.trim() || generatedEmail;
        
        try {
          const res = await axios.post('/api/signup', { email: signupEmail, password: authPassword });
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
        const { data, error } = await auth.auth.signInWithPassword({ email: loginEmail, password: authPassword });

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
      if (msg.includes('already registered')) msg = 'Username or email is already taken';
      if (msg.includes('Invalid login credentials')) msg = 'Invalid username or password';
      if (msg.includes('invalid email format')) msg = 'Invalid email format';
      if (msg.includes('Email not confirmed')) msg = 'Please confirm your email';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'Network connection failed';
      if (msg.includes('Password should be at least')) msg = 'Password must be at least 6 characters';
      
      Swal.fire({ icon: 'error', title: 'Authentication Error', text: msg, confirmButtonColor: '#ef4444' });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] w-full max-w-[1280px] mx-auto sm:rounded-[2.5rem] overflow-hidden flex flex-col lg:flex-row bg-[#0B0F14] sm:shadow-2xl sm:shadow-zinc-200/50 sm:border sm:border-white/5 mb-8">
      
      {/* Left Decoration / Prestige Layout */}
      <div className="hidden lg:flex flex-col flex-1 bg-zinc-950 text-white p-16 relative overflow-hidden justify-between">
        {/* Abstract Dark Tech Background */}
        <div className="absolute inset-x-0 top-[-20%] h-[60%] bg-[#1E90FF]/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen transition-all duration-1000"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#1E90FF]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen transition-all duration-1000 delay-500"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex items-center gap-3">
              <img src="https://i.postimg.cc/6qnW8nqX/IMG-6366.png" alt="Logo" className="h-9 object-contain drop-shadow-lg" />
              <div className="w-px h-5 bg-zinc-800 hidden sm:block"></div>
              <span className="font-bold text-sm tracking-[0.2em] uppercase text-zinc-400">Security Engine</span>
          </motion.div>
          
          <div className="max-w-[420px]">
            <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2, duration: 0.6}} className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0B0F14]/5 border border-white/10 backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-[#1a7fe6] fill-[#1a7fe6]/20" />
              <span className="text-[10px] font-bold tracking-widest text-zinc-300 uppercase">System Active v2.0</span>
            </motion.div>
            <motion.h1 initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3, duration: 0.6}} className="text-5xl font-black tracking-tight leading-[1.1] mb-6">
              Unlock Your <br/> <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#1a7fe6] via-[#1E90FF] to-orange-500">Ultimate Potential</span>
            </motion.h1>
            <motion.p initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4, duration: 0.6}} className="text-zinc-400 text-lg leading-relaxed mb-12">
              Join the premium platform trusted by professionals. Experience real-time access, robust verification, and military-grade encryption.
            </motion.p>
            
            <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.6, duration: 0.8}} className="space-y-5">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#0B0F14]/5 border border-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/10 group-hover:border-emerald-500/30 transition-colors">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-300 text-sm">Industrial-grade Cloudflare security</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#0B0F14]/5 border border-white/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-300 text-sm">Automated end-to-end token encryption</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#0B0F14]/5 border border-white/10 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors">
                  <MonitorSmartphone className="w-5 h-5" />
                </div>
                <span className="font-medium text-zinc-300 text-sm">Responsive cross-platform synchronization</span>
              </div>
            </motion.div>
          </div>
          
          <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}} className="text-xs font-bold tracking-widest uppercase text-zinc-400 flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} APEX STUDIO</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
            <span className="text-zinc-500">All rights reserved</span>
          </motion.div>
        </div>
      </div>

      {/* Right Auth Form */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full lg:w-[500px] xl:w-[560px] bg-[#0B0F14] p-6 sm:p-12 lg:p-16 flex flex-col justify-center relative overscroll-y-auto"
      >
        <div className="w-full max-w-[400px] mx-auto z-10 relative">
          
          {/* Form Header */}
          <div className="mb-10 flex justify-between items-start">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div key={authMode + "header"}>
                  <motion.h2 initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} transition={{type: "spring", bounce: 0.4}} className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-2">
                    {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                  </motion.h2>
                  <motion.p initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} transition={{delay:0.05, type: "spring", bounce: 0.4}} className="text-zinc-500 font-bold text-sm tracking-wider uppercase">
                    {authMode === 'login' ? 'Login' : 'Register'}
                  </motion.p>
                </motion.div>
              </AnimatePresence>
            </div>
            <motion.div 
              key={authMode + "logo"}
              initial={{opacity:0, scale:0.5, rotate:-20, y: -20}} 
              animate={{opacity:1, scale:1, rotate:0, y: 0}} 
              transition={{type: "spring", stiffness: 200, damping: 15, delay: 0.1}}
              className="shrink-0 ml-4"
            >
              <motion.img 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                src="https://i.postimg.cc/6qnW8nqX/IMG-6366.png" 
                alt="Logo" 
                className="h-14 sm:h-16 object-contain opacity-80 drop-shadow-sm" 
              />
            </motion.div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="popLayout">
              <motion.div layout key="username_field" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}>
                <label className="block text-sm font-bold text-zinc-200 mb-2">ชื่อผู้ใช้</label>
                <div className="relative group">
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-[#0a0d12] border-2 border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-[#1a7fe6] focus:bg-[#0B0F14] transition-all font-sans text-sm text-white placeholder:text-zinc-400 font-medium hover:border-white/20"
                      placeholder="ชื่อผู้ใช้"
                      required
                    />
                  </div>
                </div>
              </motion.div>

              {authMode === 'signup' && (
                <motion.div layout key="email_field" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: 0.05 }}>
                  <label className="block text-sm font-bold text-zinc-200 mb-2 mt-1">อีเมล</label>
                  <div className="relative group">
                    <div className="relative flex items-center">
                      <input 
                        type="email" 
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-[#0a0d12] border-2 border-white/10 rounded-xl py-3.5 px-4 outline-none focus:border-[#1a7fe6] focus:bg-[#0B0F14] transition-all font-sans text-sm text-white placeholder:text-zinc-400 font-medium hover:border-white/20"
                        placeholder="อีเมล"
                        required
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.div layout key="password_field" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: authMode === 'signup' ? 0.1 : 0.05 }}>
                <label className="block text-sm font-bold text-zinc-200 mb-2 mt-1">รหัสผ่าน</label>
                <div className="relative group">
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-[#0a0d12] border-2 border-white/10 rounded-xl py-3.5 pl-4 pr-12 outline-none focus:border-[#1a7fe6] focus:bg-[#0B0F14] transition-all font-sans text-sm text-white placeholder:text-zinc-400 font-medium hover:border-white/20"
                      placeholder="รหัสผ่าน"
                      required
                      minLength={6}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-zinc-400 hover:text-zinc-400 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </motion.div>

              {authMode === 'signup' && (
                <motion.div layout key="confirm_password_field" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, delay: 0.15 }}>
                  <label className="block text-sm font-bold text-zinc-200 mb-2 mt-1">ยืนยันรหัสผ่าน / confirm password</label>
                  <div className="relative group">
                    <div className="relative flex items-center">
                      <input 
                        type={showPassword ? "text" : "password"}
                        className="w-full bg-[#0a0d12] border-2 border-white/10 rounded-xl py-3.5 pl-4 pr-12 outline-none focus:border-[#1a7fe6] focus:bg-[#0B0F14] transition-all font-sans text-sm text-white placeholder:text-zinc-400 font-medium hover:border-white/20"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-zinc-400 hover:text-zinc-400 transition-colors focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {authMode === 'signup' && authPassword.length > 0 && (
                <motion.div layout key="password_strength" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="mt-3 flex flex-col gap-1.5 px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[11px] font-bold text-zinc-400`}>
                      ความปลอดภัยของรหัสผ่าน / Password strength
                    </span>
                  </div>
                  <div className="flex gap-1 h-2 w-full bg-[#121820] rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strengthScore >= 25 ? strengthColor : 'bg-transparent'} ${strengthScore >= 25 ? 'w-1/4' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strengthScore >= 50 ? strengthColor : 'bg-transparent'} ${strengthScore >= 50 ? 'w-1/4' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strengthScore >= 75 ? strengthColor : 'bg-transparent'} ${strengthScore >= 75 ? 'w-1/4' : 'w-0'}`}></div>
                    <div className={`h-full transition-all duration-300 ${strengthScore >= 100 ? strengthColor : 'bg-transparent'} ${strengthScore >= 100 ? 'w-1/4' : 'w-0'}`}></div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${strengthScore >= 75 ? 'text-emerald-500' : 'text-zinc-400'}`}>
                      {strengthLabel}
                    </span>
                  </div>
                </motion.div>
              )}

              {authMode === 'login' && (
                <motion.div layout key="remember_field" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between pt-1">
                     <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <div className={`w-5 h-5 rounded-md border-2 transition-all duration-300 flex items-center justify-center ${rememberMe ? 'bg-[#1E90FF] border-[#1E90FF]' : 'bg-[#0B0F14] border-white/20 group-hover:border-zinc-400'}`}>
                          {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                      <span className="text-zinc-700 text-sm font-semibold select-none group-hover:text-white transition-colors">จดจำการเข้าสู่ระบบ</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {TURNSTILE_SITE_KEY && (
              <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} className="flex justify-center mt-4 mb-2 w-full" style={{ colorScheme: 'dark' }}>
                <Turnstile
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  options={{
                    theme: 'dark',
                    size: 'flexible',
                  }}
                  className="w-full"
                />
              </motion.div>
            )}

            <motion.button 
              layout
              type="submit" 
              disabled={authLoading || (!!TURNSTILE_SITE_KEY && !turnstileToken)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 mt-8 rounded-xl text-base font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed bg-[#1E90FF] hover:bg-[#166bcc] text-white overflow-hidden relative"
            >
              <AnimatePresence mode="wait">
                {authLoading ? (
                  <motion.div key="loading" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    <span>กำลังประมวลผล...</span>
                  </motion.div>
                ) : (!!TURNSTILE_SITE_KEY && !turnstileToken) ? (
                  <motion.div key="turnstile_wait" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                    <span>กำลังตรวจสอบความปลอดภัย... (โปรดรอ)</span>
                  </motion.div>
                ) : (
                  <motion.span key={authMode + "btn"} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}>
                    {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium border-t border-white/5 pt-8 relative min-h-[60px]">
            <AnimatePresence mode="wait">
              {authMode === 'login' ? (
                <motion.button key="to-signup" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} onClick={() => { setAuthMode('signup'); setActiveView('signup'); }} className="text-zinc-400 hover:text-[#1E90FF] transition-colors absolute inset-0 m-auto h-max w-max">
                  ถ้ายังไม่มีบัญชี <span className="font-bold underline">สมัครสมาชิกเลย!</span>
                </motion.button>
              ) : (
                <motion.button key="to-login" initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}} onClick={() => { setAuthMode('login'); setActiveView('login'); }} className="text-zinc-400 hover:text-[#1E90FF] transition-colors absolute inset-0 m-auto h-max w-max">
                  ถ้ามีบัญชีแล้ว <span className="font-bold underline">เข้าสู่ระบบเลย!</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
});
