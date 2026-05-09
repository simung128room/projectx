import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Send, ShieldCheck, Zap, Bot, Power, Smartphone, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  userPlan?: { isPremium: boolean; type?: string };
}

export const TelegramCatcherTool: React.FC<Props> = ({ userPlan }) => {
  const [telegramPhone, setTelegramPhone] = useState('');
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [status, setStatus] = useState<'none' | 'idle' | 'pending_otp' | 'pending_password' | 'connected' | 'error'>('none');
  const [logs, setLogs] = useState<string[]>([]);
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // If we have a phone number, periodic status check
    if (!telegramPhone || status === 'none' || status === 'error') return;
    const interval = setInterval(async () => {
       try {
           const res = await axios.get(`/api/telegram/catcher/status?phone=${encodeURIComponent(telegramPhone)}`);
           if (res.data.status !== 'none' && res.data.status !== status) {
               setStatus(res.data.status);
           }
           if (res.data.logs) {
               setLogs(res.data.logs);
           }
       } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [telegramPhone, status]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramPhone || !truemoneyPhone) return Swal.fire('แจ้งเตือน', 'กรุณากรอกเบอร์โทรให้ครบถ้วน', 'warning');
    setIsLoading(true);
    setStatus('idle');
    setLogs([]);
    try {
        const res = await axios.post('/api/telegram/catcher/request', {
            telegramPhone,
            truemoneyPhone,
            isPremium: userPlan?.isPremium || false
        });
        setStatus(res.data.status || 'idle');
    } catch(err: any) {
        Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.error || String(err), 'error');
        setStatus('none');
    } finally {
        setIsLoading(false);
    }
  };

  const submitOtp = async () => {
    if (!otpCode) return;
    setIsLoading(true);
    try {
        await axios.post('/api/telegram/catcher/submit', { telegramPhone, type: 'otp', value: otpCode });
        setOtpCode('');
        setStatus('idle');
    } catch(e: any) {
        Swal.fire('ข้อผิดพลาด', e.response?.data?.error || String(e), 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const submitPassword = async () => {
    if (!password) return;
    setIsLoading(true);
    try {
        await axios.post('/api/telegram/catcher/submit', { telegramPhone, type: 'password', value: password });
        setPassword('');
        setStatus('idle');
    } catch(e: any) {
        Swal.fire('ข้อผิดพลาด', e.response?.data?.error || String(e), 'error');
    } finally {
        setIsLoading(false);
    }
  };

  const handleStop = async () => {
     try {
         await axios.post('/api/telegram/catcher/stop', { telegramPhone });
         setStatus('none');
         setLogs([]);
         Swal.fire({ title: 'หยุดสำเร็จ', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
     } catch (e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E90FF]/10 text-[#1E90FF] text-xs font-bold mb-4 border border-[#1E90FF]/20 backdrop-blur-sm shadow-[0_0_15px_rgba(30,144,255,0.15)]">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E90FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E90FF]"></span>
                 </span>
                 REAL-TIME VOUCHER CATCHER
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white flex items-center gap-4 tracking-tight drop-shadow-lg">
                 บอทดักซอง <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#1E90FF]">Telegram</span>
              </h2>
              <p className="text-zinc-400 mt-4 text-base leading-relaxed max-w-2xl font-medium">
                 ระบบ AI ดักซองอัจฉริยะ ทำงานตลอด 24/7 เชื่อมต่อ Telegram ของคุณและรอรับเงินเข้า TrueMoney อัตโนมัติเมื่อมีคนแจกซองในกลุ่มทันที!
              </p>
            </div>
            
            <div className="bg-[#0B0F14]/80 backdrop-blur-md border border-white/5 p-5 rounded-3xl shrink-0 shadow-2xl relative overflow-hidden group hover:border-[#1E90FF]/30 transition-all">
               <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#1E90FF]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center justify-between gap-6 mb-2">
                   <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">โควต้าการใช้งาน</div>
                   {userPlan?.isPremium ? <Zap className="w-4 h-4 text-yellow-400" /> : <Loader2 className="w-4 h-4 text-zinc-500" />}
               </div>
               {userPlan?.isPremium ? (
                   <p className="text-white font-black text-xl flex items-center gap-2">
                      ไม่จำกัด <span className="text-[10px] bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold ml-1">VIP</span>
                   </p>
               ) : (
                   <div>
                       <p className="text-white font-black text-xl">100 <span className="text-sm font-medium text-zinc-500">คน/วัน</span></p>
                       <p className="text-zinc-500 font-medium text-xs mt-1">(รีเซ็ตทุก 00:00 น.)</p>
                   </div>
               )}
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="bg-[#0B0F14]/90 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex-1 group">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#1E90FF]/80 to-transparent opacity-20 group-hover:opacity-100 transition-all"></div>
                  
                  {/* Decorative blobs */}
                  <div className="absolute top-0 left-10 w-32 h-32 bg-[#1E90FF]/10 rounded-full blur-3xl -z-10"></div>
                  <div className="absolute bottom-0 right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                  
                  {status === 'none' && (
                      <form onSubmit={handleStart} className="space-y-5 relative z-10 h-full flex flex-col justify-center">
                          <div className="text-center mb-6">
                             <div className="w-16 h-16 bg-gradient-to-br from-[#1E90FF]/20 to-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 shadow-inner">
                                <Bot className="w-8 h-8 text-[#1E90FF]" />
                             </div>
                             <h3 className="text-white font-bold text-xl mb-1">ตั้งค่าบอทของคุณ</h3>
                             <p className="text-sm text-zinc-400">ระบุข้อมูลเพื่อเริ่มการเชื่อมต่อระบบ</p>
                          </div>

                          <div className="space-y-4">
                              <div className="group/input">
                                 <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest pl-4 mb-2 block group-focus-within/input:text-[#1E90FF] transition-colors">เบอร์ Telegram (พร้อมรหัสประเทศ)</label>
                                 <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Smartphone className="w-5 h-5 text-zinc-500 group-focus-within/input:text-[#1E90FF] transition-colors" />
                                     </div>
                                     <input 
                                        type="text" 
                                        value={telegramPhone} 
                                        onChange={(e) => setTelegramPhone(e.target.value)} 
                                        placeholder="+66812345678" 
                                        className="w-full bg-[#05070A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium placeholder-zinc-700 outline-none focus:border-[#1E90FF]/40 focus:bg-white/[0.02] focus:ring-4 focus:ring-[#1E90FF]/10 transition-all shadow-inner"
                                     />
                                 </div>
                              </div>
                              <div className="group/input">
                                 <label className="text-[11px] font-black text-zinc-500 uppercase tracking-widest pl-4 mb-2 block group-focus-within/input:text-orange-400 transition-colors">เบอร์ TrueMoney (รับเงิน)</label>
                                 <div className="relative">
                                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Zap className="w-5 h-5 text-zinc-500 group-focus-within/input:text-orange-400 transition-colors" />
                                     </div>
                                     <input 
                                        type="text" 
                                        value={truemoneyPhone} 
                                        onChange={(e) => setTruemoneyPhone(e.target.value)} 
                                        placeholder="0812345678" 
                                        className="w-full bg-[#05070A] border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white text-sm font-medium placeholder-zinc-700 outline-none focus:border-orange-400/40 focus:bg-white/[0.02] focus:ring-4 focus:ring-orange-400/10 transition-all shadow-inner"
                                     />
                                 </div>
                              </div>
                          </div>
                          
                          <div className="pt-4">
                              <button type="submit" disabled={isLoading} className="relative w-full group/btn overflow-hidden rounded-2xl">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#1E90FF] to-indigo-600 transition-transform duration-300 group-hover/btn:scale-[1.02]"></div>
                                <div className="relative w-full flex items-center justify-center gap-2 py-4 text-white font-bold text-sm shadow-[0_0_20px_rgba(30,144,255,0.3)] group-hover/btn:shadow-[0_0_25px_rgba(30,144,255,0.4)] transition-all">
                                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Power className="w-5 h-5" /> เชื่อมต่อและเริ่มทำงาน</>}
                                </div>
                              </button>
                          </div>
                      </form>
                  )}

                  {status === 'pending_otp' && (
                      <div className="space-y-6 relative z-10 h-full flex flex-col justify-center animate-in fade-in zoom-in duration-300">
                          <div className="text-center">
                             <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <ShieldCheck className="w-10 h-10 text-indigo-400" />
                             </div>
                             <h4 className="text-white font-bold text-xl mb-2">ยืนยันตัวตน Telegram</h4>
                             <p className="text-sm text-zinc-400 leading-relaxed">กรุณาตรวจสอบแอป Telegram ของบัญชี <span className="text-white font-mono">{telegramPhone}</span><br/>เพื่อนำรหัส 5-6 หลักมากรอกที่นี่</p>
                          </div>
                          <div className="px-4">
                             <input 
                                type="text" 
                                value={otpCode} 
                                onChange={(e) => setOtpCode(e.target.value)} 
                                placeholder="----" 
                                className="w-full bg-[#05070A] border border-indigo-500/30 focus:border-indigo-500 rounded-2xl px-4 py-5 text-center tracking-[1em] font-mono text-2xl font-bold text-white placeholder-zinc-700 outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                             />
                          </div>
                          <button onClick={submitOtp} disabled={isLoading || !otpCode} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/25">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> ยืนยันรหัส OTP</>}
                          </button>
                      </div>
                  )}

                  {status === 'pending_password' && (
                      <div className="space-y-6 relative z-10 h-full flex flex-col justify-center animate-in fade-in zoom-in duration-300">
                          <div className="text-center">
                             <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <ShieldCheck className="w-10 h-10 text-purple-400" />
                             </div>
                             <h4 className="text-white font-bold text-xl mb-2">รหัสผ่านบัญชี (2FA)</h4>
                             <p className="text-sm text-zinc-400 leading-relaxed">บัญชีของคุณมีการตั้งค่าการยืนยันแบบสองขั้นตอน<br/>กรุณากรอกรหัสผ่านเพื่อดำเนินการต่อ</p>
                          </div>
                          <div className="px-4">
                             <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                placeholder="รหัสผ่านของคุณ" 
                                className="w-full bg-[#05070A] border border-purple-500/30 focus:border-purple-500 rounded-2xl px-6 py-4 text-center font-mono text-lg text-white placeholder-zinc-700 outline-none focus:ring-4 focus:ring-purple-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.1)]"
                             />
                          </div>
                          <button onClick={submitPassword} disabled={isLoading || !password} className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/25">
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> ยืนยันรหัสผ่าน</>}
                          </button>
                      </div>
                  )}

                  {status === 'connected' && (
                      <div className="space-y-8 relative z-10 h-full flex flex-col justify-center animate-in fade-in zoom-in duration-500">
                          <div className="text-center">
                             <div className="relative w-24 h-24 mx-auto mb-6">
                               <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping opacity-75"></div>
                               <div className="absolute inset-2 bg-green-500/30 rounded-full animate-pulse"></div>
                               <div className="absolute inset-0 flex items-center justify-center rounded-full bg-[#05070A] border-4 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                               </div>
                             </div>
                             <h3 className="text-2xl font-black text-white mb-2 tracking-tight">ระบบทำงานสมบูรณ์</h3>
                             <p className="text-green-400/80 text-sm font-medium">บอทออนไลน์และพร้อมรับซองตลอด 24 ชั่วโมง</p>
                             <p className="text-zinc-500 text-xs mt-2">คุณสามารถปิดหน้านี้ บอทจะยังคงทำงานในพื้นหลัง</p>
                          </div>

                          <div className="bg-[#05070A] border border-white/10 rounded-3xl p-5 text-left shadow-inner">
                             <div className="flex justify-between items-center text-sm mb-3">
                                <span className="text-zinc-500 font-medium flex items-center gap-2"><Smartphone className="w-4 h-4"/> บัญชีมอนิเตอร์</span>
                                <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-full text-xs">{telegramPhone}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 font-medium flex items-center gap-2"><Zap className="w-4 h-4 text-orange-400"/> บัญชีรับเงิน</span>
                                <span className="text-orange-400 font-bold font-mono bg-orange-400/10 px-3 py-1 rounded-full text-xs box-shadow-[0_0_10px_rgba(251,146,60,0.2)]">{truemoneyPhone}</span>
                             </div>
                          </div>

                          <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 border border-red-500/20 py-4 rounded-2xl font-bold transition-all">
                             <Power className="w-5 h-5" /> ยกเลิกการทำงาน
                          </button>
                      </div>
                  )}

                  {(status === 'idle' || status === 'error') && logs.length > 0 && (
                     <div className="absolute inset-0 bg-[#0B0F14]/90 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                         {status === 'idle' ? (
                             <>
                                <div className="relative">
                                    <Loader2 className="w-12 h-12 text-[#1E90FF] animate-spin mb-4 relative z-10" />
                                    <div className="absolute inset-0 bg-[#1E90FF] blur-xl opacity-20 rounded-full animate-pulse"></div>
                                </div>
                                <p className="text-white font-bold text-lg mb-2">กำลังดำเนินการติดต่อเซิร์ฟเวอร์</p>
                                <p className="text-[#1E90FF] text-sm animate-pulse mb-8">{logs[logs.length - 1] || 'กรุณารอสักครู่...'}</p>
                             </>
                         ) : (
                             <>
                                <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                                <p className="text-white font-bold text-lg mb-2">พบข้อผิดพลาด</p>
                                <p className="text-red-400 text-sm mb-6 max-w-xs">{logs[logs.length - 1]}</p>
                             </>
                         )}
                         
                         {status === 'error' && (
                            <button onClick={() => { setStatus('none'); setLogs([]); }} className="px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-full text-sm text-white font-bold transition-colors border border-white/10">
                               ปิดและลองใหม่
                            </button>
                         )}
                     </div>
                  )}
              </div>
           </div>

           <div className="lg:col-span-7 flex flex-col">
               <div className="bg-[#05070A] border border-white/5 rounded-[2.5rem] p-1.5 shadow-2xl h-[550px] flex flex-col relative overflow-hidden ring-1 ring-white/5">
                   <div className="bg-[#0B0F14] rounded-[2.2rem] flex flex-col h-full overflow-hidden">
                       <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0">
                           <h3 className="text-base font-bold text-white flex items-center gap-3">
                               <Terminal className="w-5 h-5 text-[#1E90FF]" />
                               Real-Time Output
                           </h3>
                           <div className="flex items-center gap-2">
                               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mr-2">System Status</span>
                               {status === 'connected' ? (
                                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                                       <span className="relative flex h-1.5 w-1.5">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                       </span>
                                       <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Online</span>
                                   </div>
                               ) : (
                                   <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20">
                                       <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
                                       <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Offline</span>
                                   </div>
                               )}
                           </div>
                       </div>
                       
                       <div className="flex-1 overflow-y-auto p-6 font-mono text-xs sm:text-[13px] leading-relaxed space-y-3 custom-scrollbar">
                          {logs.length === 0 ? (
                             <div className="text-zinc-600 h-full flex flex-col items-center justify-center text-center">
                                <Terminal className="w-12 h-12 text-zinc-800 mb-4" />
                                <p>Waiting for connection...</p>
                                <p className="text-[10px] mt-2 opacity-50">Log output will appear here</p>
                             </div>
                          ) : (
                             logs.map((log, i) => (
                               <div key={i} className={`flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300
                                  ${log.includes('❌') || log.includes('ข้อผิดพลาด') ? 'text-red-400' : 
                                    log.includes('✅') || log.includes('สำเร็จ') ? 'text-green-400 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.2)]' :
                                    log.includes('🎯') ? 'text-yellow-400 font-bold' : 'text-zinc-400'}
                               `}>
                                  <span className="text-zinc-700 shrink-0 select-none opacity-50">{'>'}</span>
                                  <span className="break-words">{log}</span>
                               </div>
                             ))
                          )}
                          <div ref={logEndRef} />
                       </div>
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
