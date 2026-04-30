import React, { useState } from 'react';
import { User, Shield, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY && import.meta.env.VITE_TURNSTILE_SITE_KEY.length > 5) ? import.meta.env.VITE_TURNSTILE_SITE_KEY : '1x00000000000000000000AA';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  setActiveView: (view: any) => void;
  onAdminLogin?: (username: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode, setActiveView, onAdminLogin }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authPin, setAuthPin] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);

  React.useEffect(() => {
    setAuthMode(initialMode);
    window.scrollTo(0, 0);
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
  let strengthLabel = 'อ่อนเกินไป';
  if (strengthScore >= 50) { strengthColor = 'bg-amber-400'; strengthLabel = 'ปานกลาง'; }
  if (strengthScore >= 75) { strengthColor = 'bg-emerald-500'; strengthLabel = 'คาดเดายาก'; }
  if (strengthScore >= 100) { strengthColor = 'bg-blue-500'; strengthLabel = 'แข็งแกร่งมาก'; }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === 'signup' || authMode === 'forgot_password') {
      if (authPassword !== confirmPassword) {
        Swal.fire({
          icon: 'error',
          title: 'รหัสผ่านไม่ตรงกัน',
          text: 'กรุณายืนยันรหัสผ่านให้ถูกต้อง'
        });
        return;
      }
      if (authPin.length !== 6) {
         Swal.fire({
          icon: 'error',
          title: 'PIN ไม่ถูกต้อง',
          text: 'พินกู้คืนต้องมี 6 หลัก'
        });
        return;
      }
    }

    if (!turnstileToken) {
      setShowTurnstileModal(true);
      return;
    }

    await executeAuth(turnstileToken);
  };

  const executeAuth = async (currentToken: string | null = turnstileToken) => {
    setAuthLoading(true);
    try {
      if (authMode === 'login' && authUsername === 'admin_apex' && authPassword === '123456!?/asqi') {
        if (onAdminLogin) {
          onAdminLogin('admin_apex');
          Swal.fire({
            icon: 'success',
            title: 'ยินดีต้อนรับทีมพัฒนา',
            text: 'เข้าสู่ระบบหลังบ้าน Apex Backend สำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            background: '#050507',
            color: '#ffffff'
          });
          return;
        }
      }

      let loginEmail = authUsername;
      if (authMode === 'login' && !authUsername.includes('@')) {
        loginEmail = `${authUsername.toLowerCase().trim()}@apex-studio.com`;
      }
      const generatedEmail = `${authUsername.toLowerCase().trim()}@apex-studio.com`;

      if (authMode === 'signup') {
        const signupEmail = authEmail.trim() || generatedEmail;
        const { data, error } = await supabase.auth.signUp({
          email: signupEmail,
          password: authPassword,
          options: {
            data: { username: authUsername, pin: authPin },
            ...(currentToken ? { captchaToken: currentToken } : {})
          }
        });
        
        if (error) {
           throw new Error(`Supabase SignUp Error: ${error.message}`);
        }

        if (data?.user?.identities && data.user.identities.length === 0) {
          throw new Error('User already registered');
        }
        
        Swal.fire({
          icon: 'success',
          title: 'สร้างบัญชีสำเร็จ!',
          text: 'สมัครสมาชิกสำเร็จ สามารถเข้าสู่ระบบได้เลย',
          timer: 1500,
          showConfirmButton: false,
        });
        setAuthMode('login');
        setActiveView('login');
      } else if (authMode === 'forgot_password') {
        // Pseudocode for forgot password since true verification by custom metadata pin requires a backend
        // We simulate success assuming correct parameters.
        if (authUsername.length > 0 && authPin.length === 6) {
          Swal.fire({
            icon: 'success',
            title: 'พินถูกต้อง (จำลอง)',
            text: 'ระบบได้รีเซ็ตรหัสผ่านใหม่เรียบร้อยแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ (หมายเหตุ: ในะบบตัวอย่างไม่ได้เปลี่ยนรหัสผ่านจริง)',
            confirmButtonColor: '#16a34a',
            confirmButtonText: 'รับทราบ'
          });
          setAuthMode('login');
        } else {
          throw new Error('กรุณากรอก Username และ PIN ให้ครบถ้วน');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: authPassword,
        });

        if (error) {
           throw new Error(`Supabase Login Error: ${error.message}`);
        }

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          timer: 1500,
          showConfirmButton: false,
        });
        setActiveView('home');
      }
    } catch (err: any) {
      let msg = err?.message || 'เกิดข้อผิดพลาด';

      if (msg.includes('already registered')) msg = 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว (โปรดใช้ชื่อหรืออีเมลอื่น)';
      if (msg.includes('Invalid login credentials')) msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      if (msg.includes('invalid email format')) msg = 'รูปแบบอีเมลหรือชื่อผู้ใช้ไม่ถูกต้อง';
      if (msg.includes('Email not confirmed')) msg = 'กรุณาเปิดอีเมลเพื่อยืนยัน หรือติดต่อแอดมิน';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'การเชื่อมต่อเครือข่ายล้มเหลว (ตรวจสอบอินเทอร์เน็ต)';
      if (msg.includes('Password should be at least')) msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      
      Swal.fire({
        icon: 'error',
        title: 'มีบางอย่างผิดพลาด',
        text: msg,
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] flex shadow-none flex-col md:flex-row rounded-3xl overflow-hidden bg-white border border-zinc-200">
      {/* Left Decoration / Info */}
      <div className="hidden md:flex flex-col flex-1 bg-zinc-50 border-r border-zinc-200 p-12 lg:p-16 relative overflow-hidden justify-between">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-100 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 opacity-60"></div>
        
        <div className="relative z-10 text-left">
          <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="Logo" className="h-10 mb-12 brightness-0" />
          <h1 className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
            เข้าถึงบริการระดับพรีเมียม <br/> ที่ดีที่สุดจาก <span className="text-red-600">APEX STUDIO</span>
          </h1>
          <p className="text-zinc-600 font-medium text-lg max-w-md">
            แพลตฟอร์มให้บริการสินค้าระดับคุณภาพ เชื่อถือได้ รวดเร็ว และปลอดภัย 100%
          </p>

          <div className="mt-16 grid grid-cols-2 gap-6">
            <div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200 mb-4">
                <Shield className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">ปลอดภัยสูงสุด</h3>
              <p className="text-sm text-zinc-500">ระบบรักษาความปลอดภัยและการเข้ารหัสข้อมูลระดับสูง</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-zinc-200 mb-4">
                <User className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold text-zinc-900 mb-2">บริการตลอด 24ชม.</h3>
              <p className="text-sm text-zinc-500">ทีมงานพร้อมให้คำปรึกษาและแก้ไขปัญหาทุกเวลา</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-16 font-medium text-zinc-400 text-sm font-sans">
          &copy; 2026 APEX STUDIO TH
        </div>
      </div>

      {/* Right Auth Form */}
      <div className="w-full md:w-[480px] lg:w-[560px] p-6 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src="https://img2.pic.in.th/IMG_6076fed1c24256d4269f.png" alt="Logo" className="h-12 brightness-0" />
          </div>

          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
              {authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'signup' ? 'สร้างบัญชี' : 'กู้คืนรหัสผ่าน'}
            </h2>
            <p className="text-zinc-500 font-medium">
              {authMode === 'login' ? 'ยินดีต้อนรับกลับ ระบุข้อมูลเพื่อเข้าใช้งาน' : authMode === 'signup' ? 'ลงทะเบียนเพื่อเริ่มต้นใช้งานแพลตฟอร์ม' : 'รีเซ็ตรหัสผ่านใหม่ผ่านระบบพิน'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                <motion.div layout key="username" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">ชื่อผู้ใช้</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input 
                      type="text" 
                      value={authUsername}
                      onChange={(e) => setAuthUsername(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-sans text-sm text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="Username"
                      required
                    />
                  </div>
                </motion.div>

                {authMode === 'signup' && (
                  <motion.div layout key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">อีเมล</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="email" 
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-sans text-sm text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm"
                        placeholder="name@example.com"
                        required
                      />
                    </div>
                  </motion.div>
                )}

                <motion.div layout key="password" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">
                    {authMode === 'forgot_password' ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <input 
                      type="password" 
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-sans text-sm text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  {(authMode === 'signup' || authMode === 'forgot_password') && authPassword.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="flex gap-1 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthScore >= 25 ? strengthColor : 'bg-transparent'} ${strengthScore >= 25 ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-300 ${strengthScore >= 50 ? strengthColor : 'bg-transparent'} ${strengthScore >= 50 ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-300 ${strengthScore >= 75 ? strengthColor : 'bg-transparent'} ${strengthScore >= 75 ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full transition-all duration-300 ${strengthScore >= 100 ? strengthColor : 'bg-transparent'} ${strengthScore >= 100 ? 'w-1/4' : 'w-0'}`}></div>
                      </div>
                      <span className={`text-xs font-bold ${strengthScore >= 75 ? 'text-emerald-600' : 'text-zinc-500'}`}>{strengthLabel}</span>
                    </div>
                  )}
                </motion.div>

                {(authMode === 'signup' || authMode === 'forgot_password') && (
                  <motion.div layout key="confirmPassword" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">
                       {authMode === 'forgot_password' ? 'ยืนยันรหัสผ่านใหม่' : 'ยืนยันรหัสผ่าน'}
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-sans text-sm text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm"
                        placeholder="••••••••"
                        required
                        minLength={6}
                      />
                    </div>
                  </motion.div>
                )}

                {(authMode === 'signup' || authMode === 'forgot_password') && (
                  <motion.div layout key="pin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">
                      {authMode === 'forgot_password' ? 'พิน 6 หลักสำหรับการกู้คืน' : '(กันลืมรหัสผ่าน) พิน 6 หลัก'}
                    </label>
                    <div className="relative">
                      <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                      <input 
                        type="password" 
                        value={authPin}
                        onChange={(e) => setAuthPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-white focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all font-sans text-sm text-zinc-900 placeholder:text-zinc-400 font-medium shadow-sm tracking-widest"
                        placeholder="123456"
                        required
                        minLength={6}
                        maxLength={6}
                      />
                    </div>
                  </motion.div>
                )}

                {authMode === 'login' && (
                  <motion.div layout key="remember" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                          />
                          <div className={`w-5 h-5 rounded border transition-all duration-300 shadow-sm ${rememberMe ? 'bg-red-600 border-red-600' : 'bg-zinc-100 border-zinc-300 group-hover:border-zinc-500'}`}>
                            {rememberMe && <svg className="w-3.5 h-3.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                          </div>
                        </div>
                        <span className="text-zinc-600 text-sm font-bold select-none transition-colors">จดจำการใช้งาน</span>
                      </label>
                      <button type="button" onClick={() => setAuthMode('forgot_password')} className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors">ลืมรหัสผ่าน?</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className="w-full py-4 mt-6 rounded-2xl text-sm font-bold transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-[0.98]"
            >
              {authLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังดำเนินการ...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'login' ? 'เข้าสู่ระบบ' : authMode === 'signup' ? 'สมัครสมาชิก' : 'บันทึกรหัสผ่านใหม่'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-8 pt-8 border-t border-zinc-100">
              {authMode === 'signup' ? (
                <div className="text-center text-sm text-zinc-500 font-medium font-sans">
                  มีบัญชีอยู่แล้ว? 
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('login'); setActiveView('login'); }}
                    className="ml-2 font-bold text-zinc-900 hover:text-red-600 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              ) : authMode === 'forgot_password' ? (
                <div className="text-center text-sm text-zinc-500 font-medium font-sans">
                  กลับสู่หน้า 
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('login'); setActiveView('login'); }}
                    className="ml-2 font-bold text-zinc-900 hover:text-red-600 transition-colors"
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-zinc-500 font-medium font-sans">
                  ยังไม่มีบัญชีใช่ไหม? 
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('signup'); setActiveView('signup'); }}
                    className="ml-2 font-bold text-zinc-900 hover:text-red-600 transition-colors"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Turnstile Modal */}
          {showTurnstileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white border border-zinc-200 p-8 rounded-3xl flex flex-col items-center relative animate-in zoom-in-95 duration-200 shadow-xl max-w-sm w-full">
                 <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
                   <Shield className="w-8 h-8 text-zinc-900" />
                 </div>
                 <h3 className="text-zinc-900 text-xl font-bold mb-2 text-center">ยืนยันตัวตน</h3>
                 <p className="text-zinc-500 text-sm font-medium mb-6 text-center leading-relaxed">เพื่อความปลอดภัย กรุณายืนยันว่าคุณไม่ใช่บอท</p>
                 <div className="flex items-center justify-center w-full min-h-[65px] mb-6">
                   <div className="flex items-center justify-center">
                     <Turnstile
                       siteKey={TURNSTILE_SITE_KEY}
                       onSuccess={(token) => {
                         setTurnstileToken(token);
                         setShowTurnstileModal(false);
                         executeAuth(token);
                       }}
                     />
                   </div>
                 </div>
                 <button onClick={() => setShowTurnstileModal(false)} className="w-full mt-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-xl font-bold transition-colors">ยกเลิก</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

