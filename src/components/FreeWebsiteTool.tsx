import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Server, Link as LinkIcon, ArrowRight, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import { AnimatedScroll } from './AnimatedScroll';

interface FreeWebsiteToolProps {
  userPlan?: any;
  onBack: () => void;
}

export const FreeWebsiteTool: React.FC<FreeWebsiteToolProps> = ({ userPlan, onBack }) => {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState('');
  const [finalUrl, setFinalUrl] = useState('');

  const handleDeploy = () => {
    if (!storeName || !subdomain) return;
    setIsDeploying(true);
    setStep(2);
    
    // Simulate deployment pipeline
    const pipeline = [
      { p: 15, msg: 'กำลังเริ่มต้นระบบแยก (Container)...' },
      { p: 35, msg: 'กำลังคัดลอกไฟล์ระบบตัวเต็ม...' },
      { p: 65, msg: 'กำลังเชื่อมโยงข้อมูลไดเรกทอรีโดเมน (Auto-Map Pipeline)...' },
      { p: 85, msg: 'กำลังติดตั้ง SSL Certificate...' },
      { p: 100, msg: 'กระจายไฟล์ระบบตัวเต็มสำเร็จเรียบร้อย' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      const stepData = pipeline[currentStep];
      setProgress(stepData.p);
      setDeploymentStatus(stepData.msg);
      currentStep++;

      if (currentStep >= pipeline.length) {
        clearInterval(interval);
        setTimeout(() => {
          setFinalUrl(`https://${subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '')}.apex.xyz`);
          setStep(3);
          setIsDeploying(false);
        }, 1000);
      }
    }, 1500);
  };

  return (
    <AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-12 w-full max-w-3xl mx-auto mt-4 min-h-[600px]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              <Globe className="w-6 h-6 text-[#C084FC]" />
              เปิดเว็บไซต์ฟรีอัตโนมัติ
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              สร้างเว็บไซต์ร้านค้าของคุณ แจกฟรีสำหรับสมาชิกทุกคน
            </p>
          </div>
        </div>

        <div className="bg-[#0A0D12] border border-white/5 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className="mb-8 p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">ระบบพร้อมใช้งาน</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      เพียงกรอกชื่อร้านและ URL ที่ต้องการ ระบบจะสร้างร้านค้าแบบตัวเต็ม (Full version) พร้อมฐานข้อมูลแยกของคุณทันที ทำงานรวดเร็วใน 5 วินาที
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-2 ml-1">ชื่อร้านค้า (Store Name)</label>
                    <input 
                      type="text" 
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="ตัวอย่าง: APEX GameShop"
                      className="w-full bg-[#111318] border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 text-sm font-bold mb-2 ml-1">โดเมนเนม (Subdomain)</label>
                    <div className="flex border border-white/10 rounded-2xl bg-[#111318] overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                      <div className="bg-white/5 px-4 flex items-center justify-center text-zinc-500 border-r border-white/5 font-mono text-sm shrink-0">
                        https://
                      </div>
                      <input 
                        type="text" 
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="my-store"
                        className="w-full bg-transparent py-3.5 px-3 text-white focus:outline-none font-mono"
                      />
                      <div className="bg-white/5 px-4 flex items-center justify-center text-zinc-500 border-l border-white/5 font-mono text-sm shrink-0">
                        .apex.xyz
                      </div>
                    </div>
                    <p className="text-zinc-600 text-xs mt-2 ml-1">* ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และขีดกลาง (-) เท่านั้น</p>
                  </div>

                  <button
                    onClick={handleDeploy}
                    disabled={!storeName || !subdomain}
                    className="w-full mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Cpu className="w-5 h-5" /> ยืนยันการสร้างเว็บไซต์
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-12 relative z-10"
              >
                <div className="w-24 h-24 mb-8 relative">
                   <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                   <motion.div 
                     className="absolute inset-0 border-4 border-[#C084FC] rounded-full border-t-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                   ></motion.div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Server className="w-8 h-8 text-[#C084FC] animate-pulse" />
                   </div>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight mb-2">กำลังคลี่ไฟล์ระบบ...</h2>
                <div className="w-full max-w-sm mt-6">
                  <div className="flex justify-between text-xs font-bold text-zinc-500 mb-2">
                    <span className="text-purple-400">{deploymentStatus}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#C084FC] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.5 }}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-8 relative z-10 text-center"
              >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                
                <h2 className="text-3xl font-black text-white tracking-tight mb-3">สร้างเว็บไซต์สำเร็จ!</h2>
                <p className="text-zinc-400 text-sm max-w-sm leading-relaxed mb-8">
                  ร้านค้า <strong>{storeName}</strong> ของคุณพร้อมใช้งานแล้ว คุณสามารถเข้าสู่ระบบหลังบ้านเพื่อจัดการสินค้าได้ทันที
                </p>

                <div className="w-full bg-[#111318] border border-white/10 rounded-2xl p-4 mb-8 flex items-center justify-between gap-4">
                   <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center shrink-0">
                         <LinkIcon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-left overflow-hidden">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-0.5">ลิงก์เว็บไซต์ของคุณ</div>
                        <div className="text-[#C084FC] font-mono font-bold truncate">
                          {finalUrl}
                        </div>
                      </div>
                   </div>
                </div>

                <button
                  onClick={() => window.open(finalUrl, '_blank')}
                  className="w-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-4 rounded-2xl font-black tracking-wide shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  ไปที่ร้านค้าของคุณ <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={onBack}
                  className="mt-4 w-full bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white py-4 rounded-2xl font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  กลับหน้าหลัก
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedScroll>
  );
};
