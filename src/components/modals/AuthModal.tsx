import React, { useState } from 'react';
import { User, Shield, X, Mail } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { supabase as auth } from '../../lib/supabase';

import { Turnstile } from '@marsidev/react-turnstile';

const rawEnvKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
const TURNSTILE_SITE_KEY = rawEnvKey.length > 5 ? rawEnvKey : null;

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
      const generatedEmail = `${authUsername.toLowerCase().replace(/\s+/g, '')}@apex-studio.com`;

      if (authMode === 'signup') {
        try {
          const res = await axios.post('/api/signup', { email: generatedEmail, password: authPassword, turnstileToken: currentToken });
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
          background: '#1f1c14',
          color: '#f5f0e8'
        });
        setAuthMode('login');
      } else {
        let error;
        try {
           const res = await auth.auth.signInWithPassword({ email: generatedEmail, password: authPassword });
           error = res.error;
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
          background: '#1f1c14',
          color: '#f5f0e8'
        });
        onClose();
      }
    } catch (err: any) {
      // Intentionally not logging expected auth errors to console to avoid user confusion
      let msg = err?.message || 'เกิดข้อผิดพลาด';

      if (msg.includes('already registered')) msg = 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว (โปรดใช้ชื่ออื่น)';
      if (msg.includes('Invalid login credentials')) msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (หากเคยใช้ระบบทดสอบเก่า กรุณาสมัครสมาชิกใหม่)';
      if (msg.includes('invalid email format')) msg = 'รูปแบบชื่อผู้ใช้ไม่ถูกต้อง';
      if (msg.includes('Email not confirmed')) msg = 'กรุณาปิดการตั้งค่า "Confirm Email" ในเมนู Authentication -> Providers ของ Supabase Dashboard (เพราะระบบใช้ Username ไม่ใช่อีเมลจริง)';
      if (msg.includes('Load failed') || msg.includes('Failed to fetch')) msg = 'การเชื่อมต่อเครือข่ายล้มเหลว (ตรวจสอบอินเทอร์เน็ต)';
      if (msg.includes('Password should be at least')) msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
      if (msg.includes('rate limit exceeded')) msg = 'คุณสมัครสมาชิกหรือพยายามเข้าสู่ระบบถี่เกินไป โปรดรอสักครู่ หรือตั้งค่า Rate Limit ใหม่ในระบบ Supabase';
      
      Swal.fire({
        icon: 'error',
        title: 'มีบางอย่างผิดพลาด',
        text: msg,
        background: '#1f1c14',
        color: '#f5f0e8'
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 " role="dialog" aria-modal="true" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }} tabIndex={-1} autoFocus>
      <div className="w-full max-w-sm bg-card border border-border p-8 rounded-2xl shadow-xl shadow-black/50 animate-in fade-in zoom-in duration-300 overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 ${authMode === 'login' ? 'bg-primary/10' : 'bg-primary/10'}`}></div>
      <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted rounded-full p-1.5 z-20">
        <X className="w-4 h-4" />
      </button>
      <div className="flex flex-col items-center text-center mb-6 relative z-10">
        <div className={`w-16 h-16 flex items-center justify-center mb-4 border rounded-2xl ${authMode === 'login' ? 'bg-primary/10 border-primary/20' : 'bg-primary/10 border-primary/20'}`}>
          {authMode === 'login' ? <User className="w-8 h-8 text-primary" /> : <User className="w-8 h-8 text-primary" />}
        </div>
        <h2 className="text-xl font-medium tracking-tight">{authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}</h2>
        <p className="text-muted-foreground text-xs mt-1">
          {authMode === 'login' ? 'ลงชื่อเข้าใช้เพื่อเข้าถึง APEXSTORE' : 'เข้าร่วมกับเราเพื่อเริ่มต้นใช้งานเครื่องมือต่างๆ'}
        </p>
      </div>
      
      {/* Mode Tabs */}
      <div className="flex p-1 bg-muted rounded-xl mb-6 relative z-10 border border-border/50">
        <button
          type="button"
          onClick={() => setAuthMode('login')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === 'login' ? 'bg-card text-primary shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
        >
          เข้าสู่ระบบ / Login
        </button>
        <button
          type="button"
          onClick={() => setAuthMode('signup')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${authMode === 'signup' ? 'bg-card text-primary shadow-sm border border-border/50' : 'text-muted-foreground hover:text-foreground'}`}
        >
          สมัครสมาชิก / Sign up
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          <>
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-sans text-sm"
                  placeholder=""
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-primary/50 transition-all font-sans text-sm"
                  placeholder=""
                  required
                  minLength={6}
                />
              </div>
            </div>
          </>

        <button 
          type="submit"
          disabled={authLoading}
          className={`w-full py-4 mt-6 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {authLoading ? (
            <div className="w-5 h-5  border-border border-t-white animate-spin"></div>
          ) : (
            authMode === 'login' ? 'เข้าสู่ระบบ / Login' : 'สมัครสมาชิก / Sign up'
          )}
        </button>

        
      </form>
    </div>

      {showTurnstileModal && (
        <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-2xl flex items-center justify-center p-4 z-[80] animate-in zoom-in-95 duration-200">
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl max-w-sm w-full relative overflow-hidden flex flex-col items-center">
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
                  <div className="p-3 text-primary text-center text-[10px] font-medium">
                    ยังไม่ได้ตั้งค่า TURNSTILE_SITE_KEY<br/>Bypass Mode Active
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
                className="w-full bg-primary hover:bg-primary text-foreground font-medium py-3.5 transition-all mb-4 text-xs"
              >
                ดำเนินการต่อ (Bypass)
              </button>
            )}
            <button 
              onClick={() => setShowTurnstileModal(false)}
              className="text-[10px] font-medium text-muted-foreground hover:text-muted-foreground transition-colors uppercase tracking-widest mt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
  </div>
  );
};
