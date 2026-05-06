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
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-all group font-bold px-4 py-2.5 rounded-xl bg-white border border-zinc-200 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">กลับหน้าหลัก</span>
            <span className="sm:hidden">กลับ</span>
          </button>
          
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <Sparkles className="w-4 h-4 text-red-600" />
            <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.2em]">Key Activation</span>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-xl shadow-zinc-200/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            {/* Left Column: Info & Benefits */}
            <div className="lg:col-span-12 xl:col-span-5 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-zinc-100 bg-zinc-50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/50 blur-[80px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
              
              <div className="mb-10 relative z-10">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-600/20">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-3">
                  อัพเกรดเป็น <span className="text-red-600">Premium</span>
                </h2>
                <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
                  ปลดล็อคประสิทธิภาพสูงสุดของเครื่องมือตรวจสอบ พร้อมสิทธิพิเศษสำหรับผู้ใช้ระดับพรีเมียมโดยเฉพาะ
                </p>
              </div>

              <ul className="space-y-3 mb-10 relative z-10">
                {[
                  "คีย์เป็นคีย์ถาวร",
                  "ใช้งานได้ครั้งเดียวต่อบัญชี",
                  "ได้ของเติมของโคตรดี",
                  "ได้ของฟรีแบบไม่มีคูลดาวน์",
                  "อัพของเรื่อยๆ",
                  "เช็คไอดี rov ไม่มี limit",
                  "เร็วกว่าผู้ใช้ปกติ 2 เท่า",
                  "ราคาแค่ 69 บาท ชื้อเลย!!"
                ].map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-700">
                    <div className="p-1 rounded bg-red-50 text-red-600 shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-zinc-200 relative z-10">
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
            <div className="lg:col-span-12 xl:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
              <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-10">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-600 mb-4">
                     <KeyIcon className="w-3 h-3" /> Activation Center
                   </div>
                   <h3 className="text-2xl font-black text-zinc-900 mb-2">Redeem Code</h3>
                   <p className="text-zinc-500 text-sm">วางคีย์ 16 หลัก บลาๆ</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className={`relative transition-all duration-300 rounded-[1.5rem] bg-white border-2 ${isFocused || keyInput ? 'border-red-500 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]' : 'border-zinc-200 hover:border-zinc-300'} ${!isLoggedIn ? 'opacity-50 select-none pointer-events-none' : ''}`}>
                      <div className="flex items-center gap-4 px-5">
                        <KeyIcon className={`w-6 h-6 transition-colors duration-300 ${isFocused || keyInput ? 'text-red-500' : 'text-zinc-400'}`} />
                        <input 
                          required
                          disabled={!isLoggedIn}
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => setIsFocused(false)}
                          type="text" 
                          className="w-full bg-transparent py-5 text-zinc-900 font-mono text-lg md:text-xl focus:outline-none placeholder:text-zinc-300 tracking-wider disabled:bg-transparent" 
                          placeholder="XXXX-XXXX-XXXX-XXXX" 
                        />
                      </div>
                    </div>
                    {!isLoggedIn && (
                      <div className="mt-3 text-center">
                        <p className="text-sm font-bold text-red-500 mb-2">กรุณาเข้าสู่ระบบก่อนกรอกคีย์</p>
                        <button type="button" onClick={onLoginClick} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors">เข้าสู่ระบบ / สมัครสมาชิก</button>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={!keyInput || !isLoggedIn}
                    className="w-full relative group h-16 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative h-full w-full bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-md active:scale-[0.98] transition-all">
                      เปิดใช้งานเดี๋ยวนี้
                      <Zap className="w-4 h-4 fill-white flex-shrink-0" />
                    </div>
                  </button>
                </form>

                <div className="mt-8 flex items-start gap-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    คีย์ 1 รหัส สามารถใช้เปิดใช้งานบัญชีได้ 1 ครั้งเท่านั้น หากพบปัญหาการใช้งาน กรุณาติดต่อทีมงานผ่านดิสคอร์ด
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
