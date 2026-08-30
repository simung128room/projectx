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
            className="flex items-center gap-2 text-muted-foreground hover:text-white transition-all group font-medium px-4 py-2.5 bg-[#121212] border border-[#374151]  "
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground border border-[#374151] ">
            <Sparkles className="w-4 h-4 text-[#364153]" />
            <span className="text-[#364153] text-[10px] font-semibold uppercase tracking-[0.2em]">Key Activation</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#374151]  overflow-hidden ">
          <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            {/* Left Column: Info & Benefits */}
            <div className="lg:col-span-12 xl:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-[#374151]  bg-[#121212] relative overflow-hidden ">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary text-primary-foreground pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="mb-10 relative z-10">
                <div className="w-16 h-16 bg-primary text-primary-foreground flex items-center justify-center mb-6">
                  <KeyIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-semibold text-white tracking-tight mb-3">
                  อัพเกรดเป็น <span className="text-[#364153]">Premium</span>
                </h2>
              </div>

              <div className="pt-6 border-t border-[#374151]  relative z-10">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-3 h-3" /> ต้องการสั่งซื้อคีย์?
                </p>
                <button 
                  onClick={onGoToStore}
                  className="w-full flex items-center justify-between px-5 py-4 bg-[#121212] hover:bg-[#050505] text-white transition-all active:scale-[0.98] group "
                >
                  <span className="text-xs font-medium flex items-center gap-2">
                    สั่งซื้อผ่านเว็บไซต์เลย
                  </span>
                  <ChevronRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            </div>

            {/* Right Column: Activation Form */}
            <div className="lg:col-span-12 xl:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-[#121212] relative ">
              <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#121212] border border-[#374151]  text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-4 ">
                     <KeyIcon className="w-3 h-3" /> Activation Center
                   </div>
                   <h3 className="text-2xl font-semibold text-white mb-2">Redeem Code</h3>
                   <p className="text-muted-foreground text-sm">วางคีย์ 16 หลัก บลาๆ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className={`relative transition-all duration-300 bg-[#121212]  ${isFocused || keyInput ? 'border-[#374151]' : 'border-[#374151] hover:border-[#374151]'} ${!isLoggedIn ? 'opacity-50 select-none pointer-events-none' : ''} `}>
                      <div className="flex items-center gap-4 px-5">
                        <KeyIcon className={`w-6 h-6 transition-colors duration-300 ${isFocused || keyInput ? 'text-[#364153]' : 'text-zinc-400'}`} />
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
                        <p className="text-sm font-medium text-[#364153] mb-2">กรุณาเข้าสู่ระบบก่อนกรอกคีย์</p>
                        <button type="button" onClick={onLoginClick} className="px-4 py-2 bg-primary text-primary-foreground text-[#364153] text-sm font-medium hover:bg-zinc-600/20 transition-colors">เข้าสู่ระบบ / สมัครสมาชิก</button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!keyInput || !isLoggedIn}
                    className="w-full relative group h-16 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="absolute inset-0 bg-primary text-primary-foreground blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative h-full w-full bg-primary text-primary-foreground text-white font-medium text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
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
