import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Send, ShieldCheck, Zap, Bot, Power, Smartphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  userPlan?: { isPremium: boolean; type?: string };
}

export const DiscordCatcherTool: React.FC<Props> = ({ userPlan }) => {
  const [discordToken, setDiscordToken] = useState('');
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [status, setStatus] = useState<'none' | 'idle' | 'connected' | 'error'>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const isPremium = userPlan?.isPremium || false;
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStatus = async () => {
      if (!discordToken) return;
      try {
          const res = await axios.get(`/api/discord/catcher/status?token=${encodeURIComponent(discordToken)}`);
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
       if (!discordToken || !truemoneyPhone) {
           Swal.fire({
               icon: 'warning',
               title: 'ข้อมูลไม่ครบ',
               text: 'กรุณากรอก Discord Token และเบอร์ทรูมันนี่',
               background: '#0B0F14',
               color: '#fff'
           });
           return;
       }

       if (!truemoneyPhone.match(/^[0-9]{10}$/)) {
           Swal.fire({
               icon: 'warning',
               title: 'เบอร์ทรูมันนี่ไม่ถูกต้อง',
               text: 'กรุณากรอกเบอร์โทรศัพท์ 10 หลัก (เช่น 0812345678)',
               background: '#0B0F14',
               color: '#fff'
           });
           return;
       }
       
       try {
           setStatus('idle');
           setLogs(['กำลังส่งคำขอเข้าสู่ระบบ...']);
           const res = await axios.post('/api/discord/catcher/request', {
               discordToken: discordToken.trim(),
               truemoneyPhone: truemoneyPhone.trim(),
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
               title: 'เกิดข้อผิดพลาด',
               text: err.response?.data?.error || String(err),
               background: '#0B0F14',
               color: '#fff'
           });
       }
  };

  const handleStop = async () => {
       try {
           await axios.post('/api/discord/catcher/stop', { discordToken });
           setStatus('none');
           setLogs([]);
       } catch(e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-white/5 pb-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5865F2]/10 text-[#5865F2] text-xs font-bold mb-4">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5865F2] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5865F2]"></span>
                 </span>
                 DISCORD CATCHER
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                 ระบบดักซอง Discord
              </h2>
              <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-2xl">
                 ระบบจะทำการดักจับซองทรูมันนี่ในเซิร์ฟเวอร์และแชท Discord ของคุณอัตโนมัติ 
                 เมื่อพบซอง ระบบจะเติมเงินเข้าเบอร์มือถือของคุณทันทีด้วยความเร็วสูงสุด
              </p>
            </div>
            
            <div className="bg-[#05070A] border border-white/5 px-5 py-4 rounded-2xl shrink-0 flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-white/5 text-zinc-400'}`}>
                   {isPremium ? <Zap className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
               </div>
               <div>
                   <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">โควต้าการใช้งานวันนี้</p>
                   {isPremium ? (
                      <p className="text-lg font-black text-white flex items-center gap-2">ไม่จำกัด <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.5 rounded uppercase font-bold">VIP</span></p>
                   ) : (
                      <p className="text-lg font-black text-white">100 <span className="text-xs font-medium text-zinc-500">ซอง</span></p>
                   )}
               </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           <div className="lg:col-span-4 flex flex-col space-y-4">
               <div className="bg-[#0A0D12] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex-1 flex flex-col">
                   <div className="space-y-4 relative z-10 flex flex-col h-full">
                       {status === 'none' && (
                           <>
                               <div className="mb-4">
                                  <h3 className="text-white font-bold text-lg">ตั้งค่าบอท</h3>
                                  <p className="text-xs text-zinc-500 mt-1">ระบุข้อมูลบัญชีเพื่อเข้าสู่ระบบ</p>
                               </div>

                               <div className="space-y-3">
                                   <div>
                                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 gap-2">Discord Token</label>
                                       <input 
                                           type="password" 
                                           value={discordToken}
                                           onChange={(e) => setDiscordToken(e.target.value)}
                                           disabled={status !== 'none'}
                                           placeholder="MTA...." 
                                           className="w-full bg-[#05070A] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 outline-none focus:border-[#5865F2]/40 focus:ring-2 focus:ring-[#5865F2]/10 transition-all font-mono"
                                       />
                                   </div>

                                   <div>
                                       <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5 gap-2">เบอร์ TrueMoney (ดึงเงินเข้า)</label>
                                       <input 
                                           type="text" 
                                           value={truemoneyPhone}
                                           onChange={(e) => setTruemoneyPhone(e.target.value)}
                                           disabled={status !== 'none'}
                                           placeholder="08X-XXX-XXXX" 
                                           className="w-full bg-[#05070A] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 outline-none focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/10 transition-all font-mono"
                                       />
                                   </div>
                               </div>

                               <div className="pt-4 mt-auto">
                                   <button 
                                       onClick={handleStart} 
                                       className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-xl py-3.5 text-sm font-bold transition-all shadow-[0_0_15px_rgba(88,101,242,0.2)] flex items-center justify-center gap-2"
                                   >
                                       <Power className="w-4 h-4" /> เริ่มทำงาน
                                   </button>
                               </div>
                           </>
                       )}

                       {status !== 'none' && (
                           <div className="space-y-6 relative z-10 flex flex-col h-full justify-center text-center">
                               {status === 'connected' ? (
                                   <div>
                                      <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                         <CheckCircle2 className="w-8 h-8 text-green-400" />
                                      </div>
                                      <h3 className="text-lg font-bold text-white mb-1">ทำงานสมบูรณ์</h3>
                                      <p className="text-green-400/80 text-xs font-medium">เชื่อมต่อระบบ Discord สำเร็จ</p>
                                   </div>
                               ) : status === 'error' ? (
                                   <div>
                                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                                         <AlertCircle className="w-8 h-8 text-red-500" />
                                      </div>
                                      <h3 className="text-lg font-bold text-white mb-1">เกิดข้อผิดพลาด</h3>
                                      <p className="text-red-400/80 text-xs font-medium">ระบบขัดข้อง โปรดลองใหม่</p>
                                   </div>
                               ) : (
                                   <div>
                                      <div className="w-16 h-16 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mx-auto mb-4">
                                         <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin" />
                                      </div>
                                      <h3 className="text-lg font-bold text-white mb-1">กำลังดำเนินการ</h3>
                                      <p className="text-[#5865F2]/80 text-xs font-medium">ตรวจสอบการเชื่อมต่อ...</p>
                                   </div>
                               )}

                               <div className="bg-[#05070A] border border-white/5 rounded-xl p-4 text-left">
                                  <div className="flex justify-between items-center text-xs mb-2">
                                     <span className="text-zinc-500">Token</span>
                                     <span className="text-zinc-300 font-mono">{discordToken ? discordToken.substring(0,6) + '...' + discordToken.substring(discordToken.length-4) : ''}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs">
                                     <span className="text-zinc-500">รับเงินเข้า</span>
                                     <span className="text-orange-400 font-mono">{truemoneyPhone}</span>
                                  </div>
                               </div>

                               <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 py-3.5 rounded-xl text-sm font-bold transition-all mt-auto">
                                  <Power className="w-4 h-4" /> ปิดระบบ (Stop)
                               </button>
                           </div>
                       )}
                   </div>
               </div>
           </div>

           <div className="lg:col-span-8 flex flex-col">
               <div className="bg-[#0A0D12] border border-white/5 rounded-3xl h-[500px] flex flex-col overflow-hidden">
                   <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                           <Terminal className="w-4 h-4 text-zinc-400" /> System Logs
                       </h3>
                       <div className="flex items-center gap-2">
                           {status === 'connected' ? (
                               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[9px] font-bold text-green-400 uppercase tracking-wider">
                                   <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> ONLINE
                               </div>
                           ) : (
                               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-white/5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                   <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span> OFFLINE
                               </div>
                           )}
                       </div>
                   </div>

                   <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] sm:text-xs leading-relaxed space-y-2.5 custom-scrollbar bg-[#05070A] relative">
                      {(status === 'idle' || status === 'error') && logs.length > 0 && (
                          <div className="absolute inset-0 bg-[#0A0D12]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
                              {status === 'idle' ? (
                                  <>
                                     <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin mb-3" />
                                     <p className="text-white font-bold text-sm mb-1">กำลังดำเนินการ...</p>
                                     <p className="text-[#5865F2]/80 text-xs">{logs[logs.length - 1]}</p>
                                  </>
                              ) : (
                                  <>
                                     <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                                     <p className="text-white font-bold text-sm mb-1">เกิดข้อผิดพลาด!</p>
                                     <p className="text-red-400 text-xs mb-4 max-w-[250px]">{logs[logs.length - 1]}</p>
                                     <button onClick={handleStop} className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white font-bold transition-colors">
                                         ลองใหม่อีกครั้ง
                                     </button>
                                  </>
                              )}
                          </div>
                      )}

                      {logs.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                             <Terminal className="w-8 h-8 opacity-50 mb-2 text-zinc-800" />
                             <p>ยังไม่มีบันทึกระบบปฏิบัติการ (Logs)</p>
                          </div>
                      ) : (
                          logs.map((log, i) => {
                             let colorClass = "text-zinc-400";
                             let icon = <span className="text-zinc-700 shrink-0 select-none opacity-50 text-[10px] leading-5 mr-2">{'>'}</span>;
                             if (log.includes('✅')) { colorClass = "text-green-400"; icon = <CheckCircle2 className="w-3.5 h-3.5 text-green-500 inline mr-2 shrink-0" />; }
                             else if (log.includes('❌') || log.includes('ข้อผิดพลาด')) { colorClass = "text-red-400"; icon = <AlertCircle className="w-3.5 h-3.5 text-red-500 inline mr-2 shrink-0" />; }
                             else if (log.includes('🎯')) { colorClass = "text-yellow-400 font-bold"; icon = <Zap className="w-3.5 h-3.5 text-yellow-400 inline mr-2 shrink-0" />; }
                             
                             return (
                               <div key={i} className={`flex items-start break-all ${colorClass}`}>
                                   {icon}
                                   <span className="leading-5">
                                      {log.replace(/\[.*?\] /, '')}
                                      {log.match(/\[(.*?)\]/) && (
                                         <span className="text-[10px] text-zinc-600 opacity-50 ml-2 whitespace-nowrap">
                                            {log.match(/\[(.*?)\]/)?.[1] || ''}
                                         </span>
                                      )}
                                   </span>
                               </div>
                             );
                          })
                      )}
                      <div ref={logsEndRef} />
                  </div>
               </div>
           </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
        `}} />
    </div>
  );
};
