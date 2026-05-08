import React, { useState } from 'react';
import { User, Shield, X, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import { supabase as auth } from '../../lib/supabase';

import { Turnstile } from '@marsidev/react-turnstile';

const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : '0x4AAAAAADDurF1TEj8IRq9g';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, initialMode = 'login' }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>(initialMode);
  const [authUsername, setAuthUsername] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);

  React.useEffect(() => {
    if (show) {
      setAuthMode(initialMode);
      setAuthUsername('');
      setAuthEmail('');
      setAuthPassword('');
      setAuthLoading(false);
      setTurnstileToken(null);
      setShowTurnstileModal(false);
    }
  }, [show, initialMode]);

  const isVerifying = !!TURNSTILE_SITE_KEY && !turnstileToken;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setShowTurnstileModal(true);
      return;
    }

    await executeAuth(turnstileToken || 'bypass');
  };

  const executeAuth = async (currentToken: string | null = turnstileToken) => {
    setAuthLoading(true);
    try {
      const defaultEmail = `${authUsername.toLowerCase().trim()}@apex-studio.com`;
      let loginEmail = authUsername;
      if (authMode === 'login' && !authUsername.includes('@')) {
         loginEmail = defaultEmail;
      }

      if (authMode === 'signup') {
        const signupEmail = authEmail.trim() || defaultEmail;
        
        try {
          const res = await axios.post('/api/signup', { email: signupEmail, password: authPassword });
          if (res.data.error) {
             throw new Error(res.data.error);
          }
        } catch (e: any) {
          throw new Error(e.response?.data?.error || e.message);
        }
        
        Swal.fire({
          icon: 'success',
          title: 'สร้างบัญชีสำเร็จ!',
          text: 'กรุณาเข้าสู่ระบบอีกครั้ง...',
          timer: 1500,
          showConfirmButton: false,
          background: '#09090b',
          color: '#fff'
        });
        setAuthMode('login');
      } else {
        let error;
        try {
           await auth.auth.signInWithPassword({ email: loginEmail, password: authPassword });
        } catch(e) {
           error = e;
        }

        if (error) {
           const errObj = error as Error;
           throw new Error(`Supabase Login Error: ${errObj.message}`);
        }

        Swal.fire({
          icon: 'success',
          title: 'เข้าสู่ระบบสำเร็จ',
          timer: 1500,
          showConfirmButton: false,
          background: '#09090b',
          color: '#fff'
        });
        onClose();
      }
    } catch (err: any) {
      // Intentionally not logging expected auth errors to console to avoid user confusion
      let msg = err?.message || 'เกิดข้อผิดพลาด';

      if (msg.includes('already registered')) msg = 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว (โปรดใช้ชื่ออื่น)';
      if (msg.includes('Invalid login credentials')) msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      if (msg.includes('invalid email format')) msg = 'รูปแบบชื่อผู้ใช้ไม่ถูกต้อง';
      if (msg.includes('Email not confirmed')) msg = 'กรุณาปิดการตั้งค่า "Confirm Email" ในเมนู Authentication -> Providers ของ Supabase Dashboard (เพราะระบบใช้ Username ไม่ใช่อีเมลจริง)';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'การเชื่อมต่อเครือข่ายล้มเหลว (ตรวจสอบอินเทอร์เน็ต)';
      if (msg.includes('Password should be at least')) msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      if (msg.includes('rate limit exceeded')) msg = 'คุณสมัครสมาชิกหรือพยายามเข้าสู่ระบบถี่เกินไป โปรดรอสักครู่ หรือตั้งค่า Rate Limit ใหม่ในระบบ Supabase';
      
      Swal.fire({
        icon: 'error',
        title: 'มีบางอย่างผิดพลาด',
        text: msg,
        background: '#09090b',
        color: '#fff'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-sm bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 shadow-xl animate-in fade-in zoom-in duration-300 overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -mr-16 -mt-16 ${authMode === 'login' ? 'bg-cyan-500/10' : 'bg-emerald-500/10'}`}></div>
      <div className="flex flex-col items-center text-center mb-6 relative z-10">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${authMode === 'login' ? 'bg-cyan-500/10 border-cyan-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
          {authMode === 'login' ? <User className="w-8 h-8 text-cyan-500" /> : <User className="w-8 h-8 text-emerald-500" />}
        </div>
        <h2 className="text-xl font-bold tracking-tight">{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
        <p className="text-zinc-500 text-xs mt-1">
          {authMode === 'login' ? 'ลงชื่อเข้าใช้เพื่อเข้าถึง APEX STUDIO' : 'เข้าร่วมกับเราเพื่อเริ่มต้นใช้งานเครื่องมือต่างๆ'}
        </p>
      </div>
      
      {/* Mode Tabs */}
      <div className="flex p-1 bg-zinc-900/80 rounded-2xl mb-6 relative z-10 border border-white/5">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'login' ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'}`}
        >
          เข้าสู่ระบบ / Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${authMode === 'signup' ? 'bg-emerald-500/20 text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
        >
          สมัครสมาชิก / Sign up
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                  placeholder="ชื่อผู้ใช้ / Username"
                  required
                />
              </div>
            </div>

            {authMode === 'signup' && (
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input 
                    type="email" 
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                    placeholder="อีเมล / Email"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-sans text-sm"
                  placeholder="รหัสผ่าน / Password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </>

        <button 
          type="submit"
          disabled={authLoading}
          className={`w-full py-4 mt-6 rounded-2xl text-sm font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
            authMode === 'login' 
              ? 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/10' 
              : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/10'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {authLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            authMode === 'login' ? 'เข้าสู่ระบบ / Login' : 'สมัครสมาชิก / Sign up'
          )}
        </button>

        <button 
          type="button"
          onClick={onClose}
          className="w-full text-zinc-700 hover:text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-4"
        >
          ปิดหน้าต่าง
        </button>
      </form>
    </div>

      {showTurnstileModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[80] backdrop-blur-sm animate-in zoom-in-95 duration-200">
          <div className="bg-[#050507] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="mb-2 flex items-center justify-center w-full overflow-hidden" style={{ colorScheme: 'dark' }}>
              <div className="flex items-start justify-center w-full">
                {TURNSTILE_SITE_KEY ? (
                  <Turnstile
                    siteKey={TURNSTILE_SITE_KEY}
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setShowTurnstileModal(false);
                      executeAuth(token);
                    }}
                    options={{ theme: 'dark', size: 'flexible' }}
                    className="w-full"
                  />
                ) : (
                  <div className="p-3 text-[#1a7fe6] rounded-xl text-center text-[10px] font-bold">
                    ยังไม่ได้ตั้งค่า VITE_TURNSTILE_SITE_KEY<br/>Bypass Mode Active
                  </div>
                )}
              </div>
            </div>
            {!TURNSTILE_SITE_KEY && (
              <button
                onClick={() => {
                  setShowTurnstileModal(false);
                  executeAuth("bypass");
                }}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-sm mb-4 text-xs"
              >
                ดำเนินการต่อ (Bypass)
              </button>
            )}
            <button 
              onClick={() => setShowTurnstileModal(false)}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
  </div>
  );
};
