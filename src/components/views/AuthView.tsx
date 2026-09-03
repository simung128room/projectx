import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthView: React.FC = () => {
  const { authModalMode, setAuthModalMode, loginUser, setCurrentView } = useApp();
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cfStatus, setCfStatus] = useState<'checking' | 'success'>('checking');

  useEffect(() => {
    setCfStatus('checking');
    const timer = setTimeout(() => setCfStatus('success'), 900);
    return () => clearTimeout(timer);
  }, [authModalMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authModalMode === 'register' && password !== confirmPassword) {
      return;
    }
    if (password && username) {
      loginUser(username, email);
      setCurrentView('dashboard');
    }
  };

  const isSubmitEnabled = 
    authModalMode === 'login' 
      ? (username.length > 0 && password.length > 0 && cfStatus === 'success')
      : (username.length >= 3 && password.length >= 6 && password === confirmPassword && cfStatus === 'success');

  return (
    <div className="w-full flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
      <motion.div 
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[420px] bg-white dark:bg-[#141517] rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6"
      >
        {/* Header - Borderless */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center p-2 shadow-inner overflow-hidden">
            <img 
              src="https://img2.pic.in.th/1000047587.png" 
              alt="MINICLOUD Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">MINICLOUD AUTH</div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white font-prompt">
              <AnimatePresence mode="wait">
                <motion.span
                  key={authModalMode}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {authModalMode === 'login' ? 'เข้าสู่ระบบเพื่อดำเนินการต่อ' : 'สร้างบัญชีเพื่อเข้าใช้งานเว็บไซต์'}
                </motion.span>
              </AnimatePresence>
            </h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
              ชื่อผู้ใช้ <AnimatePresence>{authModalMode === 'register' && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-rose-500">*</motion.span>}</AnimatePresence>
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="block w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/90 text-sm text-neutral-900 dark:text-white outline-none focus:bg-neutral-200/70 dark:focus:bg-neutral-800 transition-all placeholder:text-neutral-400" 
              placeholder={authModalMode === 'login' ? "กรอกชื่อผู้ใช้" : "อย่างน้อย 3 ตัวอักษร"} 
            />
          </div>

          <AnimatePresence initial={false}>
            {authModalMode === 'register' && (
              <motion.div 
                key="email-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 pb-1">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    อีเมล <span className="text-neutral-400 font-normal">(ไม่บังคับ — ใช้กู้คืนรหัสผ่าน)</span>
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/90 text-sm text-neutral-900 dark:text-white outline-none focus:bg-neutral-200/70 dark:focus:bg-neutral-800 transition-all placeholder:text-neutral-400" 
                    placeholder="you@email.com" 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
              รหัสผ่าน <AnimatePresence>{authModalMode === 'register' && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-rose-500">*</motion.span>}</AnimatePresence>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-4 pr-12 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/90 text-sm text-neutral-900 dark:text-white outline-none focus:bg-neutral-200/70 dark:focus:bg-neutral-800 transition-all placeholder:text-neutral-400" 
                placeholder={authModalMode === 'login' ? "กรอกรหัสผ่าน" : "อย่างน้อย 6 ตัวอักษร"} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {authModalMode === 'register' && (
              <motion.div 
                key="confirm-password-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="space-y-1.5 pb-1">
                  <label className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300">
                    ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-4 pr-12 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/90 text-sm text-neutral-900 dark:text-white outline-none focus:bg-neutral-200/70 dark:focus:bg-neutral-800 transition-all placeholder:text-neutral-400" 
                      placeholder="กรอกรหัสผ่านอีกครั้ง" 
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cloudflare Verification Component - Borderless */}
          <div className="mt-1 p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {cfStatus === 'checking' ? (
                <div className="w-5 h-5 rounded-full border-[2px] border-dotted border-emerald-500/70 border-t-transparent animate-spin"></div>
              ) : (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </motion.div>
              )}
              <span className="text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                {cfStatus === 'checking' ? 'กำลังตรวจสอบความปลอดภัย...' : 'ตรวจสอบสำเร็จ'}
              </span>
            </div>
            <div className="flex flex-col items-end justify-center">
              <div className="flex items-center gap-1 mb-0.5">
                <svg viewBox="0 0 24 24" fill="#F38020" className="w-4 h-3.5">
                  <path d="M19.46 10.33c-.09-3.23-2.73-5.83-5.96-5.83-2.52 0-4.68 1.57-5.54 3.79-.31-.1-.65-.16-1-.16-1.65 0-3 1.35-3 3 0 .19.02.37.05.55C2.26 12.13 1 13.71 1 15.6 1 18.03 2.97 20 5.4 20h13.2c2.43 0 4.4-1.97 4.4-4.4 0-2.31-1.78-4.2-4.04-4.37h.5z" />
                </svg>
                <span className="text-[9px] font-bold text-neutral-700 dark:text-neutral-200 tracking-wider leading-none">CLOUDFLARE</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-neutral-400">
                <span>ความเป็นส่วนตัว</span>
                <span>·</span>
                <span>ช่วยเหลือ</span>
              </div>
            </div>
          </div>

          <motion.button 
            type="submit"
            disabled={!isSubmitEnabled}
            whileTap={isSubmitEnabled ? { scale: 0.98 } : {}}
            className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all mt-1 ${
              isSubmitEnabled 
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 cursor-pointer shadow-sm' 
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={authModalMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {authModalMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setAuthModalMode(authModalMode === 'login' ? 'register' : 'login');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {authModalMode === 'login' ? (
                <>ยังไม่มีบัญชี? <span className="text-neutral-900 dark:text-white font-bold">สมัครสมาชิก</span></>
              ) : (
                <>มีบัญชีอยู่แล้ว? <span className="text-neutral-900 dark:text-white font-bold">เข้าสู่ระบบ</span></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
