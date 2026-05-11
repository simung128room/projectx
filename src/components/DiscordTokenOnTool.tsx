import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Bot, Power, Loader2, CheckCircle2, AlertCircle, Shield, Globe, Zap } from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  userPlan?: { isPremium: boolean; type?: string };
}

export const DiscordTokenOnTool: React.FC<Props> = ({ userPlan }) => {
  const [discordToken, setDiscordToken] = useState('');
  const [status, setStatus] = useState<'none' | 'idle' | 'connected' | 'error'>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const isPremium = userPlan?.isPremium || false;
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
    if (!discordToken) return;
    try {
      const res = await axios.get(`/api/discord/token-on/status?token=${encodeURIComponent(discordToken)}`);
      if (res.data.status !== 'none') {
        setStatus(res.data.status);
        setLogs(res.data.logs);
      } else {
        if (status !== 'none') {
          setStatus('none');
          setLogs([]);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (discordToken && status !== 'none') {
      const interval = setInterval(fetchStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [discordToken, status]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleStart = async () => {
    if (!discordToken) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please enter your Discord Token',
        background: '#0B0F14',
        color: '#fff'
      });
      return;
    }

    try {
      setStatus('idle');
      setLogs(['Starting token process...']);
      const res = await axios.post('/api/discord/token-on/start', {
        discordToken: discordToken.trim(),
        isPremium
      });

      if (res.data.status) {
        setStatus(res.data.status);
        fetchStatus();
      }
    } catch (err: any) {
      setStatus('error');
      setLogs([err.response?.data?.error || String(err)]);
      Swal.fire({
        icon: 'error',
        title: 'Error Occurred',
        text: err.response?.data?.error || String(err),
        background: '#0B0F14',
        color: '#fff'
      });
    }
  };

  const handleStop = async () => {
    try {
      await axios.post('/api/discord/token-on/stop', { discordToken });
      setStatus('none');
      setLogs([]);
    } catch (e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-white/5 pb-8">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5865F2]/10 text-[#5865F2] text-xs font-bold mb-4">
            <Globe className="w-3.5 h-3.5 animate-pulse" />
            DISCORD TOKEN ON
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Discord Token Online
          </h2>
          <p className="text-zinc-400 mt-3 text-base leading-relaxed max-w-2xl">
            Keep your Discord account online 24/7 
            with client simulation for maximum security.
          </p>
        </div>

        <div className="bg-[#05070A] border border-white/5 px-6 py-5 rounded-3xl shrink-0 flex items-center gap-5 shadow-inner">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPremium ? 'bg-amber-400/10 text-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'bg-white/5 text-zinc-400'}`}>
            {isPremium ? <Zap className="w-7 h-7" /> : <Bot className="w-7 h-7" />}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-1">User Status</p>
            {isPremium ? (
              <p className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
                PREMIUM <span className="text-[9px] bg-amber-400 text-black px-2 py-0.5 rounded-lg uppercase font-black">VIP</span>
              </p>
            ) : (
              <p className="text-xl font-black text-white tracking-tight">FREE USER</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col space-y-6">
          <div className="bg-[#0A0D12] border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden flex-1 flex flex-col shadow-2xl">
            <div className="space-y-6 relative z-10 flex flex-col h-full">
              {status === 'none' && (
                <>
                  <div className="mb-2">
                    <h3 className="text-white font-black text-xl tracking-tight">Token Setup</h3>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">Provide your User Token to start</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest block mb-2 px-1">Discord Token</label>
                      <input 
                        type="password" 
                        value={discordToken}
                        onChange={(e) => setDiscordToken(e.target.value)}
                        disabled={status !== 'none'}
                        placeholder="MTA...." 
                        className="w-full bg-[#05070A] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl px-6 py-4 text-white text-sm font-medium placeholder-zinc-800 outline-none focus:border-[#5865F2]/40 focus:ring-4 focus:ring-[#5865F2]/10 transition-all font-mono shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-6 mt-auto">
                    <button 
                      onClick={handleStart} 
                      className="w-full bg-[#5865F2] hover:bg-indigo-600 text-white rounded-2xl py-4 text-base font-black transition-all shadow-[0_10px_20px_rgba(88,101,242,0.2)] flex items-center justify-center gap-3 active:scale-95"
                    >
                      <Power className="w-5 h-5" /> Start Token
                    </button>
                  </div>
                </>
              )}

              {status !== 'none' && (
                <div className="space-y-8 relative z-10 flex flex-col h-full justify-center text-center">
                  {status === 'connected' ? (
                    <div className="animate-in zoom-in duration-500">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Token is Online</h3>
                      <p className="text-emerald-400/80 text-sm font-bold uppercase tracking-widest">Active & Connected</p>
                    </div>
                  ) : status === 'error' ? (
                    <div className="animate-in shake duration-500">
                      <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Error Occurred</h3>
                      <p className="text-red-400/80 text-sm font-bold uppercase tracking-widest">Connection Failed</p>
                    </div>
                  ) : (
                    <div>
                      <div className="w-20 h-20 rounded-full bg-[#5865F2]/10 border-2 border-[#5865F2]/20 flex items-center justify-center mx-auto mb-6">
                        <Loader2 className="w-10 h-10 text-[#5865F2] animate-spin" />
                      </div>
                      <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Authorizing</h3>
                      <p className="text-[#5865F2]/80 text-sm font-bold uppercase tracking-widest">Authorizing...</p>
                    </div>
                  )}

                  <div className="bg-[#05070A] border border-white/5 rounded-2xl p-5 text-left shadow-inner">
                    <div className="flex justify-between items-center text-xs mb-3 font-bold">
                      <span className="text-zinc-600 uppercase tracking-widest">Token ID</span>
                      <span className="text-zinc-400 font-mono text-[10px] bg-white/5 px-2 py-1 rounded">
                        {discordToken ? discordToken.substring(0, 10) + '...' : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-zinc-600 uppercase tracking-widest">Runtime</span>
                      <span className="text-[#5865F2] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5865F2] animate-pulse"></span>
                        Backend Node
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={handleStop} 
                    className="w-full flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 py-4 rounded-2xl text-base font-black transition-all mt-auto active:scale-95"
                  >
                    <Power className="w-5 h-5" /> Stop System
                  </button>
                </div>
              )}
            </div>
            
            {/* Background Accent */}
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#5865F2]/5 blur-[60px] rounded-full pointer-events-none"></div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-[#0A0D12] border border-white/5 rounded-[2.5rem] h-[600px] flex flex-col overflow-hidden shadow-2xl">
            <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
              <h3 className="text-sm font-black text-white flex items-center gap-3 tracking-tight">
                <Terminal className="w-4 h-4 text-zinc-500" /> 
                BOT OPERATION LOGS
              </h3>
              <div className="flex items-center gap-3">
                {status === 'connected' ? (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Running
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 border border-white/5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                    Standby
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 font-mono text-[13px] leading-relaxed space-y-4 custom-scrollbar bg-[#05070A] relative">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-800 gap-4 opacity-50">
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-zinc-800 flex items-center justify-center">
                    <Terminal className="w-8 h-8" />
                  </div>
                  <p className="font-bold uppercase tracking-widest text-[10px]">No activity logs yet</p>
                </div>
              ) : (
                logs.map((log, i) => {
                  let colorClass = "text-zinc-500";
                  let prefix = <span className="text-zinc-800 mr-3 opacity-50 shrink-0">::</span>;
                  
                  if (log.includes('✅') || log.includes('สำเร็จ')) {
                    colorClass = "text-emerald-400";
                    prefix = <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-3 shrink-0 mt-0.5" />;
                  } else if (log.includes('❌') || log.includes('ผิดพลาด')) {
                    colorClass = "text-red-400";
                    prefix = <AlertCircle className="w-4 h-4 text-red-500 mr-3 shrink-0 mt-0.5" />;
                  } else if (log.includes('🎯') || log.includes('เริ่ม')) {
                    colorClass = "text-[#5865F2] font-black";
                    prefix = <Zap className="w-4 h-4 text-[#5865F2] mr-3 shrink-0 mt-0.5" fill="currentColor" />;
                  }

                  return (
                    <div key={i} className={`flex items-start break-all ${colorClass} animate-in fade-in slide-in-from-left-2 duration-300`}>
                      {prefix}
                      <span className="leading-6 font-medium">
                        {log}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>
            
            <div className="px-8 py-4 bg-[#0A0D12] border-t border-white/5 flex gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600">
               <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-zinc-700" /> Anti-Detection v2.1
               </div>
               <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-zinc-700" /> Tokyo Server (Edge)
               </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 2px solid #05070A;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}} />
    </div>
  );
};
