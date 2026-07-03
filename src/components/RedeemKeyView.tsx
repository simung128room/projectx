import React, { useState } from 'react';
import { Crown, Check, ShoppingCart, Key as KeyIcon, ArrowLeft, Zap, Shield, Sparkles, ChevronRight, Activity, BarChart3, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface RedeemKeyViewProps {
  redeemKey: (key: string, email: string) => void;
  userEmail?: string;
  isLoggedIn: boolean;
  onBack: () => void;
  onGoToStore: () => void;
  onLoginClick: () => void;
}

export const RedeemKeyView: React.FC<RedeemKeyViewProps> = ({ redeemKey, userEmail, isLoggedIn, onBack, onGoToStore, onLoginClick }) => {
  const [keyInput, setKeyInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput && isLoggedIn) {
      redeemKey(keyInput, userEmail || 'ผู้ใช้งานทั่วไป');
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 hover:shadow-sm transition-all group font-medium px-5 py-2.5 bg-card border border-border rounded-full shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-blue-600 text-[10px] font-bold uppercase tracking-[0.2em]">Key Activation</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            {/* Left Column: Info & Benefits */}
            <div className="lg:col-span-12 xl:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-border bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 pointer-events-none -translate-y-1/2 translate-x-1/4 rounded-full"></div>
              
              <div className="mb-10 relative z-10">
                <div className="w-16 h-16 bg-blue-500 text-foreground flex items-center justify-center mb-6 rounded-2xl shadow-md shadow-blue-500/10">
                  <KeyIcon className="w-8 h-8 text-foreground" />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 tracking-tight mb-3">
                  อัพเกรดเป็น <span className="text-blue-650 font-extrabold">Premium</span>
                </h2>
                <p className="text-muted-foreground/80 text-sm leading-relaxed font-medium">
                  เปิดใช้งานคีย์ความปลอดภัยของคุณเพื่อเข้าถึงคอนเทนต์และไฟล์ระดับวีไอพีได้ทันทีอย่างไร้ขีดจำกัด
                </p>
              </div>

              <div className="pt-6 border-t border-border relative z-10">
                <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-3.8 h-3.8" /> ต้องการสั่งซื้อคีย์?
                </p>
                <button 
                  onClick={onGoToStore}
                  className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-slate-50 text-foreground hover:text-blue-600 border border-border rounded-2xl shadow-sm transition-all active:scale-[0.98] group cursor-pointer"
                >
                  <span className="text-xs font-bold flex items-center gap-2">
                    สั่งซื้อผ่านเว็บไซต์เลย
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Right Column: Activation Form */}
            <div className="lg:col-span-12 xl:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-card relative">
              <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 rounded-lg mb-4">
                     <KeyIcon className="w-3 h-3" /> Activation Center
                   </div>
                   <h3 className="text-2xl font-bold text-zinc-900 mb-2">Redeem Code</h3>
                   <p className="text-muted-foreground/80 text-sm font-medium">วางคีย์ 16 หลักของคุณที่นี่เพื่อยืนยันสิทธิ์พรีเมียม</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className={`relative transition-all duration-300 bg-card border ${isFocused ? 'border-blue-500 shadow-md shadow-blue-500/5' : 'border-border hover:border-zinc-300'} rounded-2xl overflow-hidden ${!isLoggedIn ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                      <div className="flex items-center gap-4 px-5">
                        <KeyIcon className={`w-6 h-6 transition-colors duration-300 ${isFocused || keyInput ? 'text-blue-550' : 'text-muted-foreground'}`} />
                        <input 
                          required
                          disabled={!isLoggedIn}
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          type="text" 
                          className="w-full bg-transparent py-5 text-zinc-805 font-mono text-lg md:text-xl font-bold focus:outline-none placeholder:text-zinc-300 tracking-wider disabled:bg-transparent" 
                          placeholder="XXXX-XXXX-XXXX-XXXX" 
                        />
                      </div>
                    </div>
                    {!isLoggedIn && (
                      <div className="mt-4 text-center bg-slate-50 border border-border/80 p-5 rounded-2xl">
                        <p className="text-xs font-bold text-muted-foreground/80 mb-3 flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-muted-foreground" /> กรุณาเข้าสู่ระบบก่อนกรอกคีย์
                        </p>
                        <button type="button" onClick={onLoginClick} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-foreground rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap">เข้าสู่ระบบ / สมัครสมาชิก</button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!keyInput || !isLoggedIn}
                    className="w-full relative group h-16 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-2xl"></div>
                    <div className="relative h-full w-full bg-blue-600 text-foreground hover:bg-blue-700 rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-md">
                      เปิดใช้งานเดี๋ยวนี้
                      <Zap className="w-4 h-4 fill-white flex-shrink-0" />
                    </div>
                  </button>
                </form>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
