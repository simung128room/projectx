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
            className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group font-bold px-4 py-2.5 rounded-xl bg-[#0B0D0F] border border-white/10 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#3B82F6]/10 border border-white/10">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-[#3B82F6] text-[10px] font-black uppercase tracking-[0.2em]">Key Activation</span>
          </div>
        </div>

        <div className="bg-[#0B0D0F] border border-white/10 rounded-xl overflow-hidden shadow-xl shadow-zinc-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            {/* Left Column: Info & Benefits */}
            <div className="lg:col-span-12 xl:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-white/5 bg-[#121417] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B82F6]/20/50  rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="mb-10 relative z-10">
                <div className="w-16 h-16 bg-[#3B82F6] rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-lg/20">
                  <KeyIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-3">
                  อัพเกรดเป็น <span className="text-[#3B82F6]">Premium</span>
                </h2>
              </div>

              <div className="pt-6 border-t border-white/10 relative z-10">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-3 h-3" /> ต้องการสั่งซื้อคีย์?
                </p>
                <button 
                  onClick={onGoToStore}
                  className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900 hover:bg-black text-white rounded-xl transition-all shadow-md active:scale-[0.98] group"
                >
                  <span className="text-xs font-bold flex items-center gap-2">
                    สั่งซื้อผ่านเว็บไซต์เลย
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Right Column: Activation Form */}
            <div className="lg:col-span-12 xl:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#0B0D0F] relative">
              <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121820] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">
                     <KeyIcon className="w-3 h-3" /> Activation Center
                   </div>
                   <h3 className="text-2xl font-black text-white mb-2">Redeem Code</h3>
                   <p className="text-zinc-500 text-sm">วางคีย์ 16 หลัก บลาๆ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className={`relative transition-all duration-300 rounded-xl bg-[#0B0D0F] border-2 ${isFocused || keyInput ? 'border-[#2563EB] shadow-lg' : 'border-white/10 hover:border-white/20'} ${!isLoggedIn ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                      <div className="flex items-center gap-4 px-5">
                        <KeyIcon className={`w-6 h-6 transition-colors duration-300 ${isFocused || keyInput ? 'text-[#2563EB]' : 'text-zinc-400'}`} />
                        <input 
                          required
                          disabled={!isLoggedIn}
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          type="text" 
                          className="w-full bg-transparent py-5 text-white font-mono text-lg md:text-xl focus:outline-none placeholder:text-zinc-300 tracking-wider disabled:bg-transparent" 
                          placeholder="XXXX-XXXX-XXXX-XXXX" 
                        />
                      </div>
                    </div>
                    {!isLoggedIn && (
                      <div className="mt-3 text-center">
                        <p className="text-sm font-bold text-[#2563EB] mb-2">กรุณาเข้าสู่ระบบก่อนกรอกคีย์</p>
                        <button type="button" onClick={onLoginClick} className="px-4 py-2 bg-[#3B82F6]/10 text-[#3B82F6] rounded-lg text-sm font-bold hover:bg-[#3B82F6]/20 transition-colors">เข้าสู่ระบบ / สมัครสมาชิก</button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!keyInput || !isLoggedIn}
                    className="w-full relative group h-16 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="absolute inset-0 bg-[#3B82F6] rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative h-full w-full bg-[#3B82F6] text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all">
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
