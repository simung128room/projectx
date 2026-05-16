import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, CheckCircle2, AlertCircle, Bot, Loader2, Phone, Wallet, Lock, KeyRound } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatedScroll } from './AnimatedScroll';

interface TelegramCatcherToolProps {
  userPlan: any;
}

export const TelegramCatcherTool: React.FC<TelegramCatcherToolProps> = ({ userPlan }) => {
  const [telegramPhone, setTelegramPhone] = useState('');
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [status, setStatus] = useState<string>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const isPremium = userPlan?.isPremium || false;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status !== 'none' && telegramPhone) {
      interval = setInterval(fetchStatus, 1500);
    }
    return () => clearInterval(interval);
  }, [status, telegramPhone]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`/api/telegram/catcher/status?phone=${encodeURIComponent(telegramPhone)}`);
      if (res.data) {
        setStatus(res.data.status);
        setLogs(res.data.logs);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const tgPhone = telegramPhone.replace(/\s+/g, '');
    const tmPhone = truemoneyPhone.replace(/\s+/g, '');
    
    if (!tgPhone || !tmPhone) {
      Swal.fire({
          icon: 'warning',
          title: 'Missing Details',
          text: 'Please enter both phone numbers',
          background: '#0B0F14',
          color: '#fff'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post('/api/telegram/catcher/request', {
        telegramPhone: tgPhone,
        truemoneyPhone: tmPhone,
        isPremium
      });
      
      if (res.data.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: res.data.error,
          background: '#0B0F14',
          color: '#fff'
        });
        setStatus('error');
      } else {
        setStatus(res.data.status);
      }
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred',
        text: error.response?.data?.error || error.message,
        background: '#0B0F14',
        color: '#fff'
      });
    } finally {
      setIsLoading(false);
      fetchStatus();
    }
  };

  const submitValue = async (type: 'otp' | 'password', value: string) => {
    if (!value) return;
    setIsLoading(true);
    try {
      await axios.post('/api/telegram/catcher/submit', {
        telegramPhone: telegramPhone.replace(/\s+/g, ''),
        type,
        value
      });
      if (type === 'otp') setOtp('');
      else setPassword('');
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred',
        text: error.response?.data?.error || error.message,
        background: '#0B0F14',
        color: '#fff'
      });
    } finally {
      setIsLoading(false);
      fetchStatus();
    }
  };

  const stopCatcher = async () => {
    try {
      await axios.post('/api/telegram/catcher/stop', { telegramPhone: telegramPhone.replace(/\s+/g, '') });
      setStatus('none');
      setLogs([]);
      Swal.fire({ title: 'Stopped Successfully', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, background: '#0B0F14', color: '#fff' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="max-w-4xl mx-auto pb-10 mt-6">
        <div className="bg-[#1c242d] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        
        {/* Sidebar Settings Area */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 p-6 flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#2AABEE] flex items-center justify-center text-white">
                <Send className="w-5 h-5 -ml-1" />
             </div>
             <div>
               <h2 className="text-white font-bold text-lg leading-tight">Telegram Setup</h2>
               <p className="text-[#2AABEE] text-xs font-medium">TrueMoney Catcher</p>
             </div>
          </div>
          
          <form onSubmit={handleStart} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Telegram Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={telegramPhone}
                  onChange={e => setTelegramPhone(e.target.value)}
                  placeholder="+66XXXXXXXXX"
                  className="w-full bg-[#0e1621] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#2AABEE]/50 transition-colors"
                  disabled={status !== 'none' && status !== 'error'}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">TrueMoney Phone</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={truemoneyPhone}
                  onChange={e => setTruemoneyPhone(e.target.value)}
                  placeholder="0XXXXXXXXX"
                  className="w-full bg-[#0e1621] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#2AABEE]/50 transition-colors"
                  disabled={status !== 'none' && status !== 'error'}
                />
              </div>
            </div>
            
            {(status === 'none' || status === 'error') && (
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2AABEE] hover:bg-[#229ED9] text-white font-bold rounded-xl py-3 text-sm transition-all shadow-lg shadow-[#2AABEE]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Bot className="w-5 h-5" /> Connect</>}
              </button>
            )}
            
            {(status !== 'none' && status !== 'error') && (
              <button 
                type="button"
                onClick={stopCatcher}
                className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-xl py-3 text-sm transition-all border border-red-500/30 flex items-center justify-center gap-2 mt-2"
              >
                <LogOut className="w-4 h-4" /> Disconnect
              </button>
            )}
          </form>

          {status === 'pending_otp' && (
            <div className="mt-4 bg-[#0e1621] p-4 rounded-xl border border-[#2AABEE]/30">
               <label className="text-xs font-bold text-[#2AABEE] block mb-2"><KeyRound className="inline w-3 h-3 mr-1" /> Enter OTP Code</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={otp}
                   onChange={e => setOtp(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && submitValue('otp', otp)}
                   className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#2AABEE]"
                   placeholder="12345"
                 />
                 <button 
                   onClick={() => submitValue('otp', otp)}
                   disabled={isLoading || !otp}
                   className="bg-[#2AABEE] text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                 >
                   Verify
                 </button>
               </div>
            </div>
          )}

          {status === 'pending_password' && (
            <div className="mt-4 bg-[#0e1621] p-4 rounded-xl border border-amber-500/30">
               <label className="text-xs font-bold text-amber-500 block mb-2"><Lock className="inline w-3 h-3 mr-1" /> 2FA Password</label>
               <div className="flex gap-2">
                 <input 
                   type="password" 
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && submitValue('password', password)}
                   className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                   placeholder="Password"
                 />
                 <button 
                   onClick={() => submitValue('password', password)}
                   disabled={isLoading || !password}
                   className="bg-amber-500 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                 >
                   Unlock
                 </button>
               </div>
            </div>
          )}
        </div>

        {/* Telegram Chat Area */}
        <div className="w-full md:w-2/3 bg-[#0e1621] flex flex-col h-[600px] relative">
          
          <div className="bg-[#1c242d] px-6 py-4 flex items-center border-b border-white/5 z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2AABEE] to-[#229ED9] flex items-center justify-center mr-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">TrueMoney Catcher Bot</div>
              <div className="text-[#2AABEE] text-xs mt-0.5">
                {status === 'connected' ? 'online' : status === 'none' ? 'waiting for connection...' : 'connecting...'}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {logs.length === 0 ? (
              <div className="mt-auto mb-auto text-center">
                <div className="w-16 h-16 bg-[#1c242d] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                  <Bot className="w-8 h-8 text-zinc-500" />
                </div>
                <div className="bg-white/5 text-zinc-400 text-xs px-4 py-1.5 rounded-full inline-block font-medium">
                  Add phone numbers and connect to start
                </div>
              </div>
            ) : (
              logs.map((log, i) => {
                const isSuccess = log.includes('✅') || log.includes('เชื่อมต่อบัญชีสำเร็จ');
                const isError = log.includes('❌') || log.includes('ข้อผิดพลาด');
                const isAction = log.includes('🎯');
                
                return (
                  <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    log.includes('เริ่ม') || isSuccess || isAction
                      ? 'bg-[#2b5278] text-white self-start ml-2 shadow-sm rounded-bl-sm'
                      : isError 
                        ? 'bg-red-500/20 text-red-100 border border-red-500/30 self-start ml-2 rounded-bl-sm'
                        : 'bg-[#182533] text-white self-end mr-2 shadow-sm rounded-br-sm'
                  }`}>
                    <div className="flex flex-col">
                      <span className="leading-relaxed">{log}</span>
                      <span className="text-[10px] text-white/40 self-end mt-1 font-mono">
                        {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
        
      </div>
     </div>
    </AnimatedScroll>
  );
};
