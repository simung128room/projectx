import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Gamepad2, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { CloudflareTurnstile } from './CloudflareTurnstile';
import Swal from 'sweetalert2';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register, theme } = useStore();
  
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync mode with parent when modal opens
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMessage('');
    setIsCaptchaVerified(false);
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('กรุณากรอกชื่อผู้ใช้งาน');
      return;
    }

    if (mode === 'register') {
      if (!email.trim() || !email.includes('@')) {
        setErrorMessage('กรุณากรอกอีเมลที่ถูกต้อง');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('รหัสผ่านยืนยันไม่ตรงกัน');
        return;
      }
    }

    if (!isCaptchaVerified) {
      setErrorMessage('กรุณากดคลิกยืนยันตัวตน Cloudflare ก่อนทำรายการ');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await login(username, password);
        Swal.fire({
          icon: 'success',
          title: `ยินดีต้อนรับกลับ, ${username}!`,
          text: 'เข้าสู่ระบบสำเร็จ พร้อมใช้งานแล้ว',
          timer: 1800,
          showConfirmButton: false,
          background: theme === 'dark' ? '#121216' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000'
        });
      } else {
        await register(username, email, password);
        Swal.fire({
          icon: 'success',
          title: 'สมัครสมาชิกสำเร็จ!',
          text: 'ยินดีต้อนรับสมาชิกใหม่ รับฟรีโบนัส ฿300 ในกระเป๋าเงิน!',
          timer: 2000,
          showConfirmButton: false,
          background: theme === 'dark' ? '#121216' : '#ffffff',
          color: theme === 'dark' ? '#ffffff' : '#000000'
        });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการทำรายการ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAuthModal}
          className="absolute inset-0"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className={`relative w-full max-w-[440px] rounded-2xl border shadow-2xl overflow-hidden z-10 ${
            theme === 'dark'
              ? 'bg-[#0f1015] border-zinc-800 text-white shadow-black/80'
              : 'bg-white border-zinc-200 text-zinc-900 shadow-xl'
          }`}
        >
          {/* Header Banner */}
          <div className="relative px-6 pt-6 pb-4 border-b border-zinc-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  NEXUS STORE <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GAME ID</span>
                </h3>
                <p className="text-xs text-zinc-400 font-medium">
                  {mode === 'login' ? 'เข้าสู่ระบบบัญชีของคุณ' : 'สร้างบัญชีสมาชิกใหม่'}
                </p>
              </div>
            </div>

            <button
              onClick={closeAuthModal}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="p-2 mx-6 mt-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex gap-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              เข้าสู่ระบบ (Login)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              สมัครสมาชิก (Register)
            </button>
          </div>

          {/* Form Content with AnimatePresence */}
          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'login' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? 15 : -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Username Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                    <span>ชื่อผู้ใช้งาน (Username)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="เช่น ProGamer99"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Email Input (Register only) */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-semibold text-zinc-300">อีเมล (Email สำหรับกู้คืน)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="yourname@gmail.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Password Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">รหัสผ่าน (Password)</label>
                    {mode === 'login' && (
                      <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                        ลืมรหัสผ่าน?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Register only) */}
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1"
                  >
                    <label className="text-xs font-semibold text-zinc-300">ยืนยันรหัสผ่าน (Confirm Password)</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm bg-zinc-900/80 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Cloudflare Verification Component */}
            <div className="pt-2">
              <CloudflareTurnstile
                isVerified={isCaptchaVerified}
                onVerified={(v) => setIsCaptchaVerified(v)}
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium text-center"
              >
                {errorMessage}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'เข้าสู่ระบบทันที' : 'สร้างบัญชีผู้ใช้ใหม่'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Footer notice */}
            <p className="text-[11px] text-center text-zinc-500 pt-1">
              ระบบปลอดภัยด้วยการเข้ารหัส SSL 256-bit ป้องกันข้อมูล 100%
            </p>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
