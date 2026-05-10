import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Send, ShieldCheck, Zap, Bot, Power, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
        setStatus('error');
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
     } catch(e) {}
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div>
                <h4 className="text-emerald-500 font-bold text-sm">ปลอดภัย 100% (Secure Server Request)</h4>
                <p className="text-emerald-500/80 text-xs mt-1">ระบบดักซองทำงานผ่าน Server โดยตรงและจะถูกเข้ารหัสระดับสูงทางเราไม่มีการจัดเก็บข้อมูลรหัสผ่านใดๆของคุณไว้ในฐานข้อมูล ระบบจะดักจับเฉพาะซองอั่งเปา TrueMoney ตามที่กำหนดเท่านั้น ปิดหน้าเว็บแอปจะหยุดทำงานทันที</p>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-white/5 pb-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E90FF]/10 text-[#1E90FF] text-xs font-bold mb-4">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E90FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E90FF]"></span>
                 </span>
                 TELEGRAM CATCHER
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                 ระบบดักซอง Telegram
              </h2>
              <p className="text-zinc-400 mt-3 text-sm leading-relaxed max-w-2xl">
                 รับซองอัตโนมัติจากกลุ่มต่างๆ ส่งตรงเข้าบัญชี TrueMoney ของคุณได้ทันทีตลอด 24 ชั่วโมง โดยไม่ต้องเปิดหน้าจอทิ้งไว้
              </p>
            </div>
            
            <div className="bg-[#05070A] border border-white/5 px-5 py-4 rounded-2xl shrink-0 flex items-center gap-4">
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${userPlan?.isPremium ? 'bg-amber-400/10 text-amber-400' : 'bg-white/5 text-zinc-400'}`}>
                   {userPlan?.isPremium ? <Zap className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
               </div>
               <div>
                   <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">โควต้าการใช้งานวันนี้</p>
                   {userPlan?.isPremium ? (
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
                  
                  {status === 'none' && (
                      <form onSubmit={handleStart} className="space-y-4 relative z-10 flex flex-col h-full">
                          <div className="mb-4">
                             <h3 className="text-white font-bold text-lg">ตั้งค่าบอท</h3>
                             <p className="text-xs text-zinc-500 mt-1">ระบุข้อมูลบัญชีเพื่อเข้าสู่ระบบ</p>
                          </div>

                          <div className="space-y-3">
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">เบอร์ Telegram (เช่น +66812345678)</label>
                                 <input 
                                    type="text" 
                                    value={telegramPhone} 
                                    onChange={(e) => setTelegramPhone(e.target.value)} 
                                    placeholder="+66..." 
                                    className="w-full bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 outline-none focus:border-[#1E90FF]/40 focus:ring-2 focus:ring-[#1E90FF]/10 transition-all font-mono"
                                 />
                              </div>
                              <div>
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">เบอร์ TrueMoney (ดึงเงินเข้า)</label>
                                 <input 
                                    type="text" 
                                    value={truemoneyPhone} 
                                    onChange={(e) => setTruemoneyPhone(e.target.value)} 
                                    placeholder="08X-XXX-XXXX" 
                                    className="w-full bg-[#05070A] border border-white/5 rounded-xl px-4 py-3 text-white text-sm placeholder-zinc-700 outline-none focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/10 transition-all font-mono"
                                 />
                              </div>
                          </div>
                          
                          <div className="pt-4 mt-auto">
                              <button type="submit" disabled={isLoading} className="w-full bg-[#1E90FF] hover:bg-[#1E90FF]/90 text-white rounded-xl py-3.5 text-sm font-bold transition-all shadow-[0_0_15px_rgba(30,144,255,0.2)] disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Power className="w-4 h-4" /> เริ่มทำงาน</>}
                              </button>
                          </div>
                      </form>
                  )}

                  {status === 'pending_otp' && (
                      <div className="space-y-4 relative z-10 flex flex-col h-full justify-center">
                          <div className="text-center mb-2">
                             <ShieldCheck className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                             <h4 className="text-white font-bold text-base">เราได้ส่ง OTP ไปที่แอป Telegram</h4>
                             <p className="text-xs text-zinc-400 mt-1">บัญชี {telegramPhone}</p>
                          </div>
                          <input 
                             type="text" 
                             value={otpCode} 
                             onChange={(e) => setOtpCode(e.target.value)} 
                             placeholder="CODE" 
                             className="w-full bg-[#05070A] border border-indigo-500/30 focus:border-indigo-500 rounded-xl px-4 py-3 text-center tracking-[0.5em] font-mono text-lg font-bold text-white outline-none transition-all"
                          />
                          <button onClick={submitOtp} disabled={isLoading || !otpCode} className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 mt-4">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> ยืนยัน OTP</>}
                          </button>
                      </div>
                  )}

                  {status === 'pending_password' && (
                      <div className="space-y-4 relative z-10 flex flex-col h-full justify-center">
                          <div className="text-center mb-2">
                             <ShieldCheck className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                             <h4 className="text-white font-bold text-base">รหัสผ่าน 2FA</h4>
                             <p className="text-xs text-zinc-400 mt-1">กรุณากรอกรหัสผ่าน 2-Step Verification</p>
                          </div>
                          <input 
                             type="password" 
                             value={password} 
                             onChange={(e) => setPassword(e.target.value)} 
                             placeholder="Password" 
                             className="w-full bg-[#05070A] border border-purple-500/30 focus:border-purple-500 rounded-xl px-4 py-3 text-center font-mono text-sm text-white outline-none transition-all"
                          />
                          <button onClick={submitPassword} disabled={isLoading || !password} className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/20 mt-4">
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> ยืนยันรหัสผ่าน</>}
                          </button>
                      </div>
                  )}

                  {status === 'connected' && (
                      <div className="space-y-6 relative z-10 flex flex-col h-full justify-center text-center">
                          <div>
                             <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8 text-green-400" />
                             </div>
                             <h3 className="text-lg font-bold text-white mb-1">ทำงานสมบูรณ์</h3>
                             <p className="text-green-400/80 text-xs font-medium">เชื่อมต่อกับระบบสำเร็จ</p>
                          </div>

                          <div className="bg-[#05070A] border border-white/5 rounded-xl p-4 text-left">
                             <div className="flex justify-between items-center text-xs mb-2">
                                <span className="text-zinc-500">บัญชี Telegram</span>
                                <span className="text-zinc-300 font-mono">{telegramPhone}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">รับเงินเข้า</span>
                                <span className="text-orange-400 font-mono">{truemoneyPhone}</span>
                             </div>
                          </div>

                          <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 py-3.5 rounded-xl text-sm font-bold transition-all mt-auto">
                             <Power className="w-4 h-4" /> หยุดทำงาน
                          </button>
                      </div>
                  )}
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
                                     <Loader2 className="w-8 h-8 text-[#1E90FF] animate-spin mb-3" />
                                     <p className="text-white font-bold text-sm mb-1">กำลังเชื่อมต่อ...</p>
                                     <p className="text-[#1E90FF]/80 text-xs">{logs[logs.length - 1]}</p>
                                  </>
                              ) : (
                                  <>
                                     <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                                     <p className="text-white font-bold text-sm mb-1">เกิดข้อผิดพลาด</p>
                                     <p className="text-red-400 text-xs mb-4 max-w-[250px]">{logs[logs.length - 1]}</p>
                                     <button onClick={() => { setStatus('none'); setLogs([]); }} className="px-5 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white font-bold transition-colors">
                                        ปิดหน้าต่างนี้
                                     </button>
                                  </>
                              )}
                          </div>
                      )}

                      {logs.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-zinc-600">
                            <Bot className="w-8 h-8 text-zinc-800 mb-2 opacity-50" />
                            <p>ยังไม่มีบันทึกระบบปฏิบัติการ (Logs)</p>
                         </div>
                      ) : (
                         logs.map((log, i) => (
                           <div key={i} className={`flex items-start gap-2 break-all
                              ${log.includes('❌') || log.includes('ข้อผิดพลาด') ? 'text-red-400' : 
                                log.includes('✅') || log.includes('สำเร็จ') ? 'text-green-400' :
                                log.includes('🎯') ? 'text-yellow-400' : 'text-zinc-400'}
                           `}>
                              <span className="text-zinc-700 shrink-0 select-none opacity-50 text-[10px] leading-5">{'>'}</span>
                              <span className="leading-5">{log}</span>
                           </div>
                         ))
                      )}
                      <div ref={logEndRef} />
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
