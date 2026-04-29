import React, { useState } from 'react';
import { User, Shield, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabase';
import { Turnstile } from '@marsidev/react-turnstile';

const TURNSTILE_SITE_KEY = (import.meta.env.VITE_TURNSTILE_SITE_KEY && import.meta.env.VITE_TURNSTILE_SITE_KEY.length > 5) ? import.meta.env.VITE_TURNSTILE_SITE_KEY : '1x00000000000000000000AA';

interface AuthViewProps {
  initialMode: 'login' | 'signup';
  setActiveView: (view: any) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ initialMode, setActiveView }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);

  React.useEffect(() => {
    setAuthMode(initialMode);
    window.scrollTo(0, 0);
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!turnstileToken) {
      setShowTurnstileModal(true);
      return;
    }

    await executeAuth(turnstileToken);
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
        const { data, error } = await supabase.auth.signUp({
          email: signupEmail,
          password: authPassword,
          options: {
            data: { username: authUsername },
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
          background: '#000',
          color: '#fff',
          confirmButtonColor: '#fff',
          customClass: { confirmButton: 'text-black' }
        });
        setAuthMode('login');
        setActiveView('login');
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
          background: '#000',
          color: '#fff'
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
        background: '#000',
        color: '#fff',
        confirmButtonColor: '#fff',
        customClass: { confirmButton: 'text-black' }
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-88px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none transition-all duration-1000 ${authMode === 'login' ? 'bg-cyan-500' : 'bg-emerald-500'}`}></div>
      <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full mix-blend-screen filter blur-[100px] opacity-20 pointer-events-none transition-all duration-1000 ${authMode === 'login' ? 'bg-blue-600' : 'bg-teal-500'}`}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          {/* Subtle top border glow */}
          <div className={`absolute top-0 left-0 w-full h-[1px] opacity-50 transition-colors duration-500 ${authMode === 'login' ? 'bg-gradient-to-r from-transparent via-cyan-500 to-transparent' : 'bg-gradient-to-r from-transparent via-emerald-500 to-transparent'}`}></div>
          
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <div className="relative mb-6 group-hover:scale-105 transition-transform duration-500">
              <div className={`absolute inset-0 blur-2xl opacity-40 transition-colors duration-500 ${authMode === 'login' ? 'bg-cyan-500' : 'bg-emerald-500'}`}></div>
              <img 
                src="https://img2.pic.in.th/-59_20260425171043.png" 
                alt="Logo" 
                className="h-16 relative z-10 object-contain drop-shadow-2xl"
              />
            </div>
            {authMode === 'signup' ? (
              <>
                <h2 className="text-3xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-2">สร้างบัญชีใหม่</h2>
                <p className="text-zinc-500 font-medium tracking-wide text-sm">Join Apex Studio</p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold font-sans text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 mb-2">ยินดีต้อนรับกลับ</h2>
                <p className="text-zinc-500 font-medium tracking-wide text-sm">Sign in to your account</p>
              </>
            )}
          </div>

          <form onSubmit={handleAuth} className="space-y-5 relative z-10">
            <div className="space-y-4">
              <div className="group/field">
                <label className="block text-xs font-semibold text-zinc-400 mb-2 px-1 uppercase tracking-wider group-focus-within/field:text-white transition-colors">ชื่อผู้ใช้ / Username</label>
                <div className="relative">
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${authMode === 'login' ? 'text-zinc-500 group-focus-within/field:text-cyan-400' : 'text-zinc-500 group-focus-within/field:text-emerald-400'}`} />
                  <input 
                    type="text" 
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-black/80 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all text-white font-sans text-sm placeholder:text-zinc-600"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              {authMode === 'signup' && (
                <div className="group/field animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-xs font-semibold text-zinc-400 mb-2 px-1 uppercase tracking-wider group-focus-within/field:text-white transition-colors">อีเมล / Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/field:text-emerald-400 transition-colors duration-300" />
                    <input 
                      type="email" 
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-black/80 focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/10 transition-all text-white font-sans text-sm placeholder:text-zinc-600"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="group/field">
                <label className="block text-xs font-semibold text-zinc-400 mb-2 px-1 uppercase tracking-wider group-focus-within/field:text-white transition-colors">รหัสผ่าน / Password</label>
                <div className="relative">
                  <Shield className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${authMode === 'login' ? 'text-zinc-500 group-focus-within/field:text-cyan-400' : 'text-zinc-500 group-focus-within/field:text-emerald-400'}`} />
                  <input 
                    type="password" 
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:bg-black/80 focus:border-white/20 focus:ring-4 focus:ring-white/5 transition-all text-white font-sans text-sm placeholder:text-zinc-600"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              {authMode === 'login' && (
                <div className="flex items-center px-2 pt-1 animate-in fade-in duration-500">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <div className={`w-5 h-5 rounded-md border transition-all duration-300 ${rememberMe ? 'bg-cyan-500 border-cyan-500' : 'bg-black/50 border-zinc-700 group-hover:border-cyan-400'}`}>
                        {rememberMe && <svg className="w-3 h-3 text-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </div>
                    <span className="text-zinc-400 text-sm font-medium select-none group-hover:text-white transition-colors">จดจำการเข้าสู่ระบบ</span>
                  </label>
                </div>
              )}
            </div>

            <button 
              type="submit"
              disabled={authLoading}
              className={`w-full py-4 mt-4 rounded-2xl text-sm font-bold transition-all overflow-hidden relative group disabled:opacity-50 disabled:cursor-not-allowed ${
                authMode === 'login' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_30px_rgba(8,145,178,0.3)]' 
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'
              }`}
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {authLoading ? (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <span className="relative z-10 uppercase tracking-widest">{authMode === 'login' ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>

            <div className="mt-8 text-center pt-8 border-t border-white/5">
              {authMode === 'signup' ? (
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthMode('login');
                    setActiveView('login');
                  }}
                  className="text-sm font-sans text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer group"
                >
                  มีบัญชีอยู่แล้ว? <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors ml-1">เข้าสู่ระบบที่นี่</span>
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    setAuthMode('signup');
                    setActiveView('signup');
                  }}
                  className="text-sm font-sans text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer group"
                >
                  ยังไม่มีบัญชีใช่ไหม? <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors ml-1">สมัครสมาชิกที่นี่</span>
                </button>
              )}
            </div>
          </form>

          {/* Turnstile Sub-Modal */}
          {showTurnstileModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-3xl">
              <div className="bg-zinc-900 border border-white/10 p-8 rounded-3xl flex flex-col items-center relative animate-in zoom-in-95 duration-200 shadow-2xl">
                 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
                   <Shield className="w-6 h-6 text-blue-400" />
                 </div>
                 <p className="text-white text-sm font-semibold mb-6 tracking-wide">Security Check</p>
                 <div className="min-h-[65px] flex items-center justify-center w-full overflow-hidden rounded-xl bg-zinc-950 p-2 border border-white/5">
                   <Turnstile
                     siteKey={TURNSTILE_SITE_KEY}
                     onSuccess={(token) => {
                       setTurnstileToken(token);
                       setShowTurnstileModal(false);
                       executeAuth(token);
                     }}
                     options={{ theme: 'dark' }}
                   />
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

