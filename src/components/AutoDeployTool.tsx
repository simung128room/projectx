import React, { useState, useRef } from 'react';
import { Globe, ArrowLeft, Rocket, AlertCircle, CheckCircle2, ChevronRight, Server, ShieldCheck, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'motion/react';

interface AutoDeployToolProps {
  onBack?: () => void;
}

export const AutoDeployTool: React.FC<AutoDeployToolProps> = ({ onBack }) => {
  const [subdomain, setSubdomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [deployResult, setDeployResult] = useState<any>(null);

  const baseDomain = 'apexstore.xyz';

  // Timed step state simulations to make loader exciting
  const timerRefs = useRef<any[]>([]);

  const validateSubdomain = (val: string) => {
    if (!val) return 'กรุณากรอกชื่อซับโดเมน';
    if (!/^[a-z0-9-]+$/.test(val)) return 'ใช้ได้เฉพาะภาษาอังกฤษตัวเล็ก (a-z), ตัวเลข (0-9) และขีดกลาง (-)';
    if (val.length < 3) return 'ชื่อต้องมีความยาวอย่างน้อย 3 ตัวอักษร';
    if (val.length > 20) return 'ชื่อต้องยาวไม่เกิน 20 ตัวอักษร';
    return '';
  };

  const handleStartDeploy = async () => {
    const error = validateSubdomain(subdomain.trim());
    if (error) {
      setErrorMessage(error);
      setStatus('error');
      return;
    }

    setErrorMessage('');
    setStatus('loading');
    setCurrentStep(1);

    // Setup visual step increments to provide rich developer feedback
    timerRefs.current.push(setTimeout(() => setCurrentStep(2), 2500));
    timerRefs.current.push(setTimeout(() => setCurrentStep(3), 5500));
    timerRefs.current.push(setTimeout(() => setCurrentStep(4), 8000));
    timerRefs.current.push(setTimeout(() => setCurrentStep(5), 11000));

    try {
      const fd = new FormData();
      fd.append('action', 'process_deployment');
      fd.append('subdomain', subdomain.toLowerCase().trim());

      // Communicates with secondary domain ssr.apexstore.xyz
      const response = await fetch('https://ssr.apexstore.xyz/index.php', {
        method: 'POST',
        body: fd
      });

      if (!response.ok) {
        throw new Error('การเชื่อมต่อกับเซิร์ฟเวอร์ DirectAdmin ล้มเหลว');
      }

      const data = await response.json();

      // Clear existing simulator timers on completion
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];

      if (data.status === 'success') {
        setCurrentStep(5);
        setDeployResult(data.payload);
        setStatus('success');
        
        Swal.fire({
          icon: 'success',
          title: 'ติดตั้งร้านค้าสำเร็จ!',
          text: `ร้านค้า ${subdomain}.${baseDomain} ของคุณพร้อมใช้งานแล้ว`,
          background: '#0d0d12',
          color: '#ffffff',
          confirmButtonColor: '#7c3aed',
        });
      } else {
        setErrorMessage(data.message || 'เกิดข้อผิดพลาดในการรันคอมมานด์ติดตั้ง');
        setStatus('error');
      }
    } catch (err: any) {
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
      setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ภายนอก');
      setStatus('error');
    }
  };

  const resetTool = () => {
    setSubdomain('');
    setStatus('idle');
    setErrorMessage('');
    setCurrentStep(1);
    setDeployResult(null);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in zoom-in duration-300 max-w-4xl mx-auto">
      {/* Header View Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-emerald-500" />
            ระบบขยายร้านค้า (Auto Deploy Subdomain)
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            เปิดเว็บไซต์ร้านค้าส่วนตัวที่ซับโดเมนย่อยด้วย DirectAdmin API ความเร็วสูง พร้อมดาต้าเบส MySQL และเทมเพลต XWorms ทันทีที่กดปุ่ม
          </p>
        </div>
        {onBack && (
          <button 
            onClick={onBack}
            className="self-start sm:self-center flex items-center gap-2 bg-[#12121e]/80 hover:bg-[#181825] px-4 py-2 border border-border border-2 text-zinc-400 hover:text-white transition-all font-bold text-xs brut-card shrink-0"
          >
            <ArrowLeft className="w-4 h-4" /> ย้อนกลับชุดเครื่องมือ
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: interactive Card or Steps */}
        <div className="lg:col-span-7 bg-[#0d0d12] border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[460px]">
          {/* Glowing element inside card */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-4">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#a855f7] uppercase">STEP 1: CHOOSE SUBDOMAIN</span>
                  <h3 className="text-lg font-black text-white mt-1">ตั้งป้ายโดเมนร้านค้าของคุณ</h3>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider">ระบุชื่อซับโดเมนที่ท่านต้องการ</label>
                  <div className="flex bg-black/40 border border-border border-2 focus-within:border-emerald-500/50 rounded-xl overflow-hidden transition-all duration-300">
                    <input 
                      type="text"
                      placeholder="เช่น: store99, mydeal, hyper"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="flex-1 bg-transparent px-4 py-3.5 text-white font-extrabold text-sm focus:outline-none placeholder:text-zinc-600"
                    />
                    <div className="bg-purple-900/15 text-[#a78bfa] border-l border-zinc-900 px-4 flex items-center font-mono text-xs font-bold select-none">
                      .{baseDomain}
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500Leading-relaxed font-semibold">
                    * จำกัดเฉพาะภาษาอังกฤษตัวพิมพ์เล็กและตัวเลขเท่านั้น (a-z, 0-9) เพื่อความปลอดภัยของโฟลเดอร์เซิร์ฟเวอร์
                  </p>
                </div>

                <div className="bg-emerald-500/[0.02] border border-emerald-500/10 p-4 rounded-xl flex gap-3 text-emerald-400/80 text-xs font-semibold leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>ระบบติดตั้งจะกำหนดค่าฐานเชื่อมข้อมูล PHP Configs แบบอัตโนมัติ ไม่เปลืองเวลา และเปิดพร้อมรัน 24 ชั่วโมง</span>
                </div>

                <button
                  onClick={handleStartDeploy}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 border border-emerald-500/20 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2.5 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.25)] hover:scale-[1.01] transition-transform duration-300"
                >
                  <Rocket className="w-5 h-5" />
                  เริ่มติดตั้งร้านค้าแบบโฮสติ้งฟรี
                </button>
              </motion.div>
            )}

            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3 pb-2">
                  <div className="relative w-14 h-14 mx-auto">
                    <div className="absolute inset-0 rounded-full border-[3px] border-zinc-800"></div>
                    <div className="absolute inset-0 rounded-full border-[3px] border-t-emerald-500 border-r-teal-400 animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">กำลังรัน DirectAdmin Deployer</h3>
                    <p className="text-zinc-500 text-xs font-semibold">ใช้เวลารวมประสานงาน API ประมาณ 10–20 วินาที ห้ามรีเฟรชหน้าเว็บ</p>
                  </div>
                </div>

                {/* Steps Visual List */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4.5 space-y-3.5 text-xs font-medium font-sans">
                  <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'text-white' : 'text-zinc-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${currentStep > 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : currentStep === 1 ? 'bg-purple-900/30 text-purple-400 border border-purple-500/40 animate-pulse' : 'bg-transparent border border-zinc-800'}`}>
                      {currentStep > 1 ? '✓' : '1'}
                    </div>
                    <span className={currentStep > 1 ? 'line-through text-zinc-500' : ''}>สร้างพอร์ตซับโดเมนบน DirectAdmin Panel</span>
                  </div>

                  <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'text-white' : 'text-zinc-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${currentStep > 2 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : currentStep === 2 ? 'bg-purple-900/30 text-purple-400 border border-purple-500/40 animate-pulse' : 'bg-transparent border border-zinc-800'}`}>
                      {currentStep > 2 ? '✓' : '2'}
                    </div>
                    <span className={currentStep > 2 ? 'line-through text-zinc-500' : ''}>คัดลอกไฟล์ต้นแบบระบบเว็บ xworms วางใน public_html</span>
                  </div>

                  <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'text-white' : 'text-zinc-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${currentStep > 3 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : currentStep === 3 ? 'bg-purple-900/30 text-purple-400 border border-purple-500/40 animate-pulse' : 'bg-transparent border border-zinc-800'}`}>
                      {currentStep > 3 ? '✓' : '3'}
                    </div>
                    <span className={currentStep > 3 ? 'line-through text-zinc-500' : ''}>สร้างฐานข้อมูลระบบ SQL และกำหนดสิทธิ์รหัสผ่านสุ่มปลอดภัย</span>
                  </div>

                  <div className={`flex items-center gap-3 ${currentStep >= 4 ? 'text-white' : 'text-zinc-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${currentStep > 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : currentStep === 4 ? 'bg-purple-900/30 text-purple-400 border border-purple-500/40 animate-pulse' : 'bg-transparent border border-zinc-800'}`}>
                      {currentStep > 4 ? '✓' : '4'}
                    </div>
                    <span className={currentStep > 4 ? 'line-through text-zinc-500' : ''}>นำดัมพ์โครงสร้างตารางระบบและอินเซอร์ทตารางเริ่มต้น</span>
                  </div>

                  <div className={`flex items-center gap-3 ${currentStep >= 5 ? 'text-white' : 'text-zinc-600'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 ${currentStep > 5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/50' : currentStep === 5 ? 'bg-purple-900/30 text-purple-400 border border-purple-500/40 animate-pulse' : 'bg-transparent border border-zinc-800'}`}>
                      {currentStep > 5 ? '✓' : '5'}
                    </div>
                    <span>แก้ไขปรับแต่งไฟล์ a_func.php เพื่อเชื่อมฐานระบบ</span>
                  </div>
                </div>
              </motion.div>
            )}

            {status === 'success' && deployResult && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 text-xl mx-auto shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                    ✓
                  </div>
                  <h3 className="text-lg font-black text-white">ติดตั้งระบบออนไลน์สำเร็จ!</h3>
                  <p className="text-emerald-400 text-[10px] tracking-wider uppercase font-extrabold">Auto Deploy Finished Successfully</p>
                </div>

                <div className="bg-black/40 border border-white/5 rounded-2xl p-4.5 font-mono text-[11px] leading-relaxed space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">เว็บไซต์:</span>
                    <a href={deployResult.website_url} target="_blank" rel="noreferrer" className="text-[#a78bfa] hover:underline font-bold overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">{deployResult.website_url}</a>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">แอดมินอินเตอร์เฟซ:</span>
                    <span className="text-white font-bold">admin</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">รหัสผ่านตั้งต้น:</span>
                    <span className="bg-purple-900/30 text-purple-300 px-1.5 py-0.5 border border-purple-500/10 rounded font-black">{deployResult.admin_pass}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500">การนำเข้า SQL:</span>
                    <span className="text-emerald-400 font-bold">{deployResult.sql_queries_num || 0} Commands</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">ใช้สปีดเวลาติดตั้ง:</span>
                    <span className="text-zinc-300 font-bold">{deployResult.time_taken || 'N/A'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={resetTool}
                    className="bg-[#12121e] hover:bg-[#181822] border border-border border-2 text-zinc-400 font-bold py-3.5 rounded-xl text-xs flex justify-center items-center transition-all"
                  >
                    ติดตั้งร้านค้าอื่นต่อ
                  </button>
                  <a
                    href={deployResult.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white font-bold py-3.5 rounded-xl text-xs flex justify-center items-center gap-2 transition-all shadow-[0_5px_15px_-4px_rgba(16,185,129,0.3)]"
                  >
                    เปิดหน้าร้านใหม่ <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-red-500/10 border border-red-500 rounded-full flex items-center justify-center text-red-400 text-xl mx-auto">
                    !
                  </div>
                  <h3 className="text-lg font-black text-white">การติดตั้งขัดข้อง</h3>
                  <p className="text-red-400/80 text-[11px] leading-relaxed max-w-sm mx-auto">{errorMessage || 'เกิดความผิดพลาดในการประมวลผลคำขอติดตั้งซับโดเมน'}</p>
                </div>

                <div className="bg-red-950/20 border border-red-900/30 rounded-2xl p-4 flex gap-3 text-red-300 text-xs">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">คำแนะนำแก้ไขปัญหา:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-zinc-400 select-none">
                      <li>ตรวจสอบว่าไม่ได้เว้นวรรคหรือใช้อักขระที่ห้ามใช้</li>
                      <li>ไอพีของคุณอาจเคยใช้สิทธิ์สร้างร้านค้าจำกัด 1 บัญชีแล้ว</li>
                      <li>เซิร์ฟเวอร์ DirectAdmin อาจมีคิวสร้างหนาแน่นโปรดลองใหม่</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={resetTool}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl border border-zinc-800 flex justify-center items-center transition-all text-sm"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Informative and Specifications Panels */}
        <div className="lg:col-span-5 space-y-6">
          {/* System Specs panel */}
          <div className="bg-[#09090d] border border-white/5 rounded-3xl p-6 space-y-4">
            <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2.5">
              <Server className="w-4 h-4 text-[#a78bfa]" /> รายละเอียดฟีเจอร์เว็บบิวเดอร์
            </h4>
            
            <ul className="space-y-3 text-xs leading-relaxed text-zinc-400">
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-zinc-200">ระบบตะกร้าและซื้อด่วนอัตโนมัติ</p>
                  <p className="text-[10px] mt-0.5">รองรับการจำหน่ายบัตรเติมเงิน ไอดีสกินตัวละคร และแอปพรีเมียมทำงานตอบรับรวดเร็ว</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-zinc-200">ระบบ Truemoney Wallet</p>
                  <p className="text-[10px] mt-0.5">ตรวจจับรายการรับของขวัญออโต้ทันใจ ไม่พลาดทุกรายได้การขาย</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <div>
                  <p className="font-bold text-zinc-200">แผงแดชบอร์ดจัดการแอดมิน (admin/admin)</p>
                  <p className="text-[10px] mt-0.5">ควบคุมสินค้า หมวดหมู่ ประวัติ สต็อกสินค้าครบวงจร สวยงามเข้าใจง่าย</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Secure SSL notice */}
          <div className="bg-purple-950/10 border border-purple-900/10 rounded-3xl p-6 flex gap-3.5 items-start">
            <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-black text-white uppercase tracking-wider">โฮสติ้ง DirectAdmin</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
                ดำเนินการจัดเก็บไฟล์ระบบและบริหารโปรโตคอลความปลอดภัยมาตรฐาน TLS/SSL เต็มรูปแบบบนเซิร์ฟเวอร์เสถียร 99.9% 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
