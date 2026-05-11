import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Zap, Bot, Power, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

interface Props {
  userPlan?: { isPremium: boolean; type?: string };
}

export const DiscordCatcherTool: React.FC<Props> = ({ userPlan }) => {
  const [discordToken, setDiscordToken] = useState('');
  const [truemoneyPhone, setTruemoneyPhone] = useState('');
  const [status, setStatus] = useState<'none' | 'idle' | 'connected' | 'error'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const isPremium = userPlan?.isPremium || false;

  useEffect(() => {
    if (!discordToken || status === 'none' || status === 'error') return;
    const interval = setInterval(async () => {
       try {
           const res = await axios.get(`/api/discord/catcher/status?token=${encodeURIComponent(discordToken)}`);
           if (res.data.status !== 'none' && res.data.status !== status) {
               setStatus(res.data.status);
           }
       } catch (e) {}
    }, 2000);
    return () => clearInterval(interval);
  }, [discordToken, status]);

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
       
       setIsLoading(true);
       setStatus('idle');
       
       Swal.fire({
           title: 'กำลังเชื่อมต่อ...',
           text: 'กรุณารอสักครู่ ระบบกำลังสื่อสารกับเซิร์ฟเวอร์',
           allowOutsideClick: false,
           background: '#0B0F14',
           color: '#fff',
           didOpen: () => Swal.showLoading()
       });

       try {
           const res = await axios.post('/api/discord/catcher/request', {
               discordToken,
               truemoneyPhone,
               isPremium
           });
           setStatus(res.data.status || 'idle');
           Swal.fire({
               icon: 'success',
               title: 'เชื่อมต่อสำเร็จ',
               text: 'ระบบได้เริ่มดักซอง Discord แล้ว หากเจอซองจะถูกเติมเงินเข้าเบอร์อัตโนมัติ',
               background: '#0B0F14',
               color: '#fff'
           });
       } catch (err: any) {
           setStatus('error');
           Swal.fire({
               icon: 'error',
               title: 'เกิดข้อผิดพลาด',
               text: err.response?.data?.error || String(err),
               background: '#0B0F14',
               color: '#fff'
           });
       } finally {
           setIsLoading(false);
       }
  };

  const handleStop = async () => {
       try {
           await axios.post('/api/discord/catcher/stop', { discordToken });
           setStatus('none');
           Swal.fire({ title: 'หยุดสำเร็จ', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, background: '#0B0F14', color: '#fff' });
       } catch(e) {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 mt-4 md:mt-8 animate-in fade-in duration-500">
        
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
                 ระบบจะทำการดักจับซองทรูมันนี่ในเซิร์ฟเวอร์และแชท Discord ของคุณอัตโนมัติตลอด 24 ชั่วโมง
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

        <div className="bg-[#0A0D12] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex-col flex items-center justify-center min-h-[350px]">
           <div className="space-y-4 relative z-10 flex flex-col w-full max-w-md">
               {status === 'none' && (
                   <>
                       <div className="mb-4 text-center">
                          <h3 className="text-white font-bold text-lg">ตั้งค่าบอท</h3>
                          <p className="text-xs text-zinc-500 mt-1">ระบุข้อมูลบัญชีเพื่อเข้าสู่ระบบ</p>
                       </div>

                       <div className="space-y-3">
                           <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">Discord Token</label>
                               <input 
                                   type="password" 
                                   value={discordToken}
                                   onChange={(e) => setDiscordToken(e.target.value)}
                                   disabled={status !== 'none' || isLoading}
                                   placeholder="MTA...." 
                                   className="w-full bg-[#05070A] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-white text-base md:text-sm placeholder-zinc-700 outline-none focus:border-[#5865F2]/40 focus:ring-2 focus:ring-[#5865F2]/10 transition-all font-mono"
                               />
                           </div>

                           <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">เบอร์ TrueMoney (ดึงเงินเข้า)</label>
                               <input 
                                   type="text" 
                                   value={truemoneyPhone}
                                   onChange={(e) => setTruemoneyPhone(e.target.value)}
                                   disabled={status !== 'none' || isLoading}
                                   placeholder="08X-XXX-XXXX" 
                                   className="w-full bg-[#05070A] border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-white text-base md:text-sm placeholder-zinc-700 outline-none focus:border-orange-400/40 focus:ring-2 focus:ring-orange-400/10 transition-all font-mono"
                               />
                           </div>
                       </div>

                       <div className="pt-4 mt-auto">
                           <button 
                               onClick={handleStart} 
                               disabled={isLoading}
                               className="w-full bg-[#5865F2] hover:bg-[#5865F2]/90 text-white rounded-xl py-3.5 text-sm font-bold transition-all shadow-[0_0_15px_rgba(88,101,242,0.2)] disabled:opacity-50 flex items-center justify-center gap-2"
                           >
                               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Power className="w-4 h-4" /> เริ่มทำงาน</>}
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
                              <p className="text-red-400/80 text-xs font-medium">ระบบขัดข้อง โปรดตรวจสอบ Token</p>
                           </div>
                       ) : (
                           <div>
                              <div className="w-16 h-16 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center mx-auto mb-4">
                                 <Loader2 className="w-8 h-8 text-[#5865F2] animate-spin" />
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1">กำลังดำเนินการ</h3>
                              <p className="text-[#5865F2]/80 text-xs font-medium">รอการตอบสนองจากเซิร์ฟเวอร์...</p>
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

                       <button onClick={handleStop} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/20 py-3.5 rounded-xl text-sm font-bold transition-all">
                          <Power className="w-4 h-4" /> ปิดระบบ (Stop)
                       </button>
                   </div>
               )}
           </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 mt-8 flex flex-col md:flex-row md:items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
               <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
                <h4 className="text-emerald-400 font-bold text-sm mb-1.5 leading-none">ปลอดภัย 100% (Secure Server Request)</h4>
                <p className="text-emerald-500/80 text-xs leading-relaxed max-w-xl text-pretty space-y-1 block">
                    ระบบดักซองทำงานผ่าน Server โดยตรงและจะถูกเข้ารหัสระดับสูงทางเราไม่มีการจัดเก็บข้อมูลรหัสผ่านใดๆของคุณไว้ในฐานข้อมูล 
                    ระบบจะดักจับเฉพาะซองอั่งเปา TrueMoney ตามที่กำหนดเท่านั้น ปิดหน้าเว็บแอปจะหยุดทำงานทันที
                </p>
            </div>
        </div>
    </div>
  );
};
