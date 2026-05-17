import React, { useState, useEffect, useRef } from 'react';
import { Send, LogOut, CheckCircle2, AlertCircle, Bot, Loader2, Phone, Wallet, Lock, KeyRound, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatedScroll } from './AnimatedScroll';

interface DiscordCatcherToolProps {
  userPlan: any;
}

export const DiscordCatcherTool: React.FC<DiscordCatcherToolProps> = ({ userPlan }) => {
  const [discordToken, setDiscordToken] = useState('');
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [status, setStatus] = useState<string>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  const isPremium = userPlan?.isPremium || false;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status !== 'none' && discordToken) {
      interval = setInterval(fetchStatus, 1500);
    }
    return () => clearInterval(interval);
  }, [status, discordToken]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`/api/discord/catcher/status?token=${encodeURIComponent(discordToken)}`);
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
    if (!discordToken || !truemoneyPhone) {
      Swal.fire({
          icon: 'warning',
          title: 'Missing Details',
          text: 'Please enter your Discord Token and TrueMoney Phone Number',
          background: '#0B0F14',
          color: '#fff'
      });
      return;
    }

    if (!truemoneyPhone.match(/^[0-9]{10}$/)) {
        Swal.fire({
            icon: 'warning',
            title: 'Invalid TrueMoney Phone',
            text: 'Please enter a valid 10-digit phone number (e.g. 0812345678)',
            background: '#0B0F14',
            color: '#fff'
        });
        return;
    }
    
    setIsLoading(true);
    setStatus('idle');
    try {
      const res = await axios.post('/api/discord/catcher/request', {
        discordToken,
        truemoneyPhone,
        isPremium
      });
      
      if (res.data.error) {
        Swal.fire({
            icon: 'error',
            title: 'Error Occurred',
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

  const stopCatcher = async () => {
    try {
      await axios.post('/api/discord/catcher/stop', { discordToken });
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
             <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
             </div>
             <div>
               <h2 className="text-white font-bold text-lg leading-tight">ดักซองดิสคอร์ด</h2>
               <p className="text-[#5865F2] text-xs font-medium">TrueMoney Catcher</p>
             </div>
          </div>
          
          <form onSubmit={handleStart} className="flex flex-col gap-4 mt-2">
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">Discord Token</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="password" 
                  value={discordToken}
                  onChange={e => setDiscordToken(e.target.value)}
                  placeholder="MTA...."
                  className="w-full bg-[#0a0d12] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#5865F2]/50 focus:ring-1 focus:ring-[#5865F2]/20 transition-all font-mono"
                  disabled={status !== 'none' && status !== 'error'}
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1.5 block">TrueMoney Phone</label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={truemoneyPhone}
                  onChange={e => setTruemoneyPhone(e.target.value)}
                  placeholder="08X-XXX-XXXX"
                  className="w-full bg-[#0a0d12] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#5865F2]/50 focus:ring-1 focus:ring-[#5865F2]/20 transition-all font-mono"
                  disabled={status !== 'none' && status !== 'error'}
                />
              </div>
            </div>
            
            <div className="h-px bg-white/5 my-2" /> 

            {(status === 'none' || status === 'error') && (
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-black rounded-xl py-3 text-sm transition-all shadow-lg shadow-[#5865F2]/20 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 active:scale-[0.98]"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>
                ) : (
                  <><Bot className="w-5 h-5" /> Connect Bot</>
                )}
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
        </div>

        {/* Discord Chat Area */}
        <div className="w-full md:w-2/3 bg-[#0e1621] flex flex-col h-[600px] relative">
          
          <div className="bg-[#1c242d] px-6 py-4 flex items-center border-b border-white/5 z-10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5865F2] to-[#4752C4] flex items-center justify-center mr-4">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">TrueMoney Catcher Bot</div>
              <div className={`text-xs mt-0.5 font-medium transition-colors ${
                status === 'connected' ? 'text-emerald-400' : 
                status === 'idle' || status === 'connecting' ? 'text-amber-400' :
                status === 'error' ? 'text-red-400' : 'text-indigo-300'
              }`}>
                {status === 'connected' ? '● Online & Ready' : 
                 status === 'none' ? 'Waiting for connection...' : 
                 status === 'idle' || status === 'connecting' ? 'Establishing connection...' : 
                 status === 'error' ? 'Connection failed' : 'Processing...'}
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
                  Add token and phone number to start
                </div>
              </div>
            ) : (
              logs.map((log, i) => {
                const isSuccess = log.includes('✅') || log.includes('เชื่อมต่อ') || log.includes('สำเร็จ');
                const isError = log.includes('❌') || log.includes('ข้อผิดพลาด') || log.includes('Error');
                const isAction = log.includes('🎯');
                
                return (
                  <div key={i} className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    log.includes('เริ่ม') || isSuccess || isAction
                      ? 'bg-[#5865F2]/20 text-[#C1C8FF] self-start ml-2 shadow-sm rounded-bl-sm border border-[#5865F2]/30'
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
