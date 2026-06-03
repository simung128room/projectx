import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Server, Link as LinkIcon, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Cpu, Smartphone, Monitor, Download, Eye, Layers } from 'lucide-react';
import { AnimatedScroll } from './AnimatedScroll';

interface FreeWebsiteToolProps {
  userPlan?: any;
  products?: any[];
  onBack: () => void;
}

interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  accentClass: string;
  btnClass: string;
  borderClass: string;
  textColor: string;
  accentGlow: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: 'violet',
    name: 'Violet Glow',
    bgClass: 'bg-[#0B0813]',
    accentClass: 'text-violet-400',
    btnClass: 'bg-violet-600 hover:bg-violet-500 text-gray-900 shadow-violet-500/10',
    borderClass: 'border-violet-500/20',
    textColor: 'text-violet-200',
    accentGlow: 'from-violet-500/20 to-transparent'
  },
  {
    id: 'lime',
    name: 'Lime Cyber',
    bgClass: 'bg-[#040804]',
    accentClass: 'text-lime-400',
    btnClass: 'bg-lime-500 hover:bg-lime-400 text-gray-900 shadow-lime-500/10',
    borderClass: 'border-lime-500/20',
    textColor: 'text-lime-200',
    accentGlow: 'from-lime-500/25 to-transparent'
  },
  {
    id: 'crimson',
    name: 'Crimson Blade',
    bgClass: 'bg-[#0A0505]',
    accentClass: 'text-red-500',
    btnClass: 'bg-red-600 hover:bg-red-500 text-gray-900 shadow-red-500/10',
    borderClass: 'border-red-500/20',
    textColor: 'text-red-200',
    accentGlow: 'from-red-500/20 to-transparent'
  },
  {
    id: 'slate',
    name: 'Onyx Slate',
    bgClass: 'bg-[#090D12]',
    accentClass: 'text-gray-700',
    btnClass: 'bg-zinc-100 hover:bg-white text-gray-900 shadow-zinc-500/10',
    borderClass: 'border-zinc-500/20',
    textColor: 'text-gray-600',
    accentGlow: 'from-zinc-500/15 to-transparent'
  }
];

export const FreeWebsiteTool: React.FC<FreeWebsiteToolProps> = ({ userPlan, products = [], onBack }) => {
  const [step, setStep] = useState(1);
  const [storeName, setStoreName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(THEMES[0]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deploymentStatus, setDeploymentStatus] = useState('');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const handleDeploy = () => {
    if (!storeName || !subdomain) return;
    setIsDeploying(true);
    setStep(2);
    
    const pipeline = [
      { p: 15, msg: 'กำลังเตรียมระบบระเบียงเซิร์ฟเวอร์ (Sandboxed Environment)...' },
      { p: 45, msg: 'กำลังติดตั้งธีมสไตล์สี ' + selectedTheme.name + '...' },
      { p: 70, msg: 'กำลังนำเข้าสินค้าอัตโนมัติ (' + products.length + ' รายการ)...' },
      { p: 90, msg: 'กำลังยืนยันแคตตาล็อกสินค้าและระบบคำนวณราคาหน้าบ้าน...' },
      { p: 100, msg: 'สังเคราะห์ซอร์สโค้ดและโครงสร้างเว็บสำเร็จเรียบร้อย!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < pipeline.length) {
        const stepData = pipeline[currentStep];
        setProgress(stepData.p);
        setDeploymentStatus(stepData.msg);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStep(3);
          setIsDeploying(false);
        }, 800);
      }
    }, 1200);
  };

  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const finalUrl = `https://${cleanSubdomain || 'demo'}.apex.xyz`;

  // Generate downloadable standalone web storefront
  const downloadStoreHTML = () => {
    const activeProducts = products && products.length > 0 ? products : [
      { name: 'VIP Premium Access Pass', price: 150, imageUrl: 'https://img2.pic.in.th/-71_20260516210303.png', tag: 'Hot' },
      { name: 'Ultra Legit Key License', price: 350, imageUrl: 'https://img2.pic.in.th/-71_20260516210303.png', tag: 'Fast' },
      { name: 'Elite Member Key Token', price: 90, imageUrl: 'https://img2.pic.in.th/-71_20260516210303.png', tag: 'New' }
    ];

    const isLime = selectedTheme.id === 'lime';
    const isCrimson = selectedTheme.id === 'crimson';
    const isSlate = selectedTheme.id === 'slate';

    const bgHex = isLime ? '#040804' : (isCrimson ? '#0A0505' : (isSlate ? '#090D12' : '#0B0813'));
    const borderHex = isLime ? 'rgba(132, 204, 22, 0.2)' : (isCrimson ? 'rgba(239, 68, 68, 0.2)' : (isSlate ? 'rgba(255, 255, 255, 0.1)' : 'rgba(139, 92, 246, 0.2)'));
    const accentHex = isLime ? '#a3e635' : (isCrimson ? '#ef4444' : (isSlate ? '#d4d4d8' : '#a78bfa'));
    const buttonBg = isLime ? '#84cc16' : (isCrimson ? '#dc2626' : (isSlate ? '#e4e4e7' : '#7c3aed'));
    const buttonText = isLime || isSlate ? '#000000' : '#ffffff';

    const productsHtml = activeProducts.map(p => `
      <div style="background: rgba(255,255,255,0.02); border: 1px solid ${borderHex}; border-radius: 1.25rem; overflow: hidden; display: flex; flex-direction: column;">
        <div style="aspect-ratio: 1; background: #15181e; position: relative;">
          ${p.tag ? `<span style="position: absolute; top: 0.75rem; right: 0.75rem; background: ${accentHex}; color: ${buttonText}; font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.5rem; border-radius: 9999px; text-transform: uppercase;">${p.tag}</span>` : ''}
          <img src="${p.imageUrl || 'https://img2.pic.in.th/-71_20260516210303.png'}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="padding: 1rem; flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <h3 style="font-weight: 700; font-size: 0.95rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.name}</h3>
            <p style="color: ${accentHex}; font-weight: 800; font-size: 1.1rem; margin-bottom: 0.75rem;">฿${(p.price || 0).toLocaleString()}</p>
          </div>
          <button style="width: 100%; background: ${buttonBg}; color: ${buttonText}; font-weight: 700; font-size: 0.8rem; padding: 0.6rem 0; border-radius: 0.75rem; border: none; cursor: pointer;">สั่งซื้อสินค้า</button>
        </div>
      </div>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${storeName} - แหล่งรวมสินค้าคุณภาพระดับพรีเมียม</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: ${bgHex};
            color: #ffffff;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem 1rem;
        }
        header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            margin-bottom: 3rem;
        }
        h1 {
            margin: 0;
            font-size: 1.5rem;
            font-weight: 900;
            letter-spacing: -0.025em;
        }
        h2 {
            font-size: 1.75rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
        }
        .grid {
            display: grid;
            grid-template-cols: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
        }
        .footer {
            margin-top: 5rem;
            text-align: center;
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${storeName}</h1>
            <div style="font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); font-family: monospace;">
                ${subdomain}.apex.xyz
            </div>
        </header>
        
        <main>
            <h2>สินค้ามาใหม่ล่าสุด</h2>
            <div class="grid">
                ${productsHtml}
            </div>
        </main>
        
        <div class="footer">
            &copy; 2026 ${storeName}. สร้างฟรีด้วยเครื่องมือเปิดเว็บจาก APEXSTORE.
        </div>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanSubdomain || 'index'}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const previewProducts = products && products.length > 0 ? products.slice(0, 3) : [
    { id: '1', name: 'VIP Pass 24hr', price: 150, imageUrl: null, tag: 'Hot' },
    { id: '2', name: 'License Key Standard', price: 350, imageUrl: null, tag: 'Popular' },
    { id: '3', name: 'Premium Coin Token', price: 50, imageUrl: null, tag: 'New' }
  ];

  return (
    <AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-12 w-full max-w-5xl mx-auto mt-4 min-h-[600px]">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white/5 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] bg-blue-600/10 text-blue-600 border border-purple-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Web Builder
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5 mt-1.5">
              <Globe className="w-6 h-6 text-[#A78BFA]" />
              เครื่องมือสร้างและดาวน์โหลดหน้าร้านฟรี
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              สร้างเว็บไซต์สำเร็จรูปพร้อมแคตตาล็อกสินค้าของคุณ สามารถดาวน์โหลดโค้ด HTML ไปใช้ตั้งต้นเว็บได้ทันที
            </p>
          </div>
        </div>

        <div className="bg-[#0A0D12] border border-gray-200 rounded-3xl p-6 md:p-10 relative overflow-hidden shadow-2xl">
          {/* Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                <div className="mb-8 p-4 rounded-2xl bg-blue-600/10 text-blue-600 border border-purple-500/20 flex items-start gap-4">
                  <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">ระบบพัฒนาเว็บไซต์สำเร็จรูป (Exportable HTML Pipeline)</h3>
                    <p className="text-sm opacity-80 leading-relaxed">
                      กำหนดโปรไฟล์และเลือกสไตล์การออกแบบที่ชอบ ระบบจะจัดแจงเรียบเรียงแคตตาล็อกสินค้าและโค้ดหน้าตาเว็บของคุณออกมาเป็นไฟล์ HTML แบบเบา กะทัดรัด และนำไปใช้ได้ทันที
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Form */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-gray-600 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">ชื่อร้านค้า (Store Name)</label>
                      <input 
                        type="text" 
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        placeholder="ตัวอย่าง: APEX Premium Shop"
                        className="w-full bg-[#111318] border border-gray-200 rounded-2xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-xs font-bold mb-2 ml-1 uppercase tracking-wider">ลิงก์ซับโดเมนระบบ (Subdomain)</label>
                      <div className="flex border border-gray-200 rounded-2xl bg-[#111318] overflow-hidden focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                        <div className="bg-white/5 px-3 flex items-center justify-center text-gray-500 border-r border-gray-200 font-mono text-xs shrink-0 select-none">
                          https://
                        </div>
                        <input 
                          type="text" 
                          value={subdomain}
                          onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                          placeholder="my-store"
                          className="w-full bg-transparent py-3 px-2 text-sm text-gray-900 focus:outline-none font-mono"
                        />
                        <div className="bg-white/5 px-3 flex items-center justify-center text-gray-500 border-l border-gray-200 font-mono text-xs shrink-0 select-none">
                          .apex.xyz
                        </div>
                      </div>
                      <p className="text-gray-500 text-[10px] mt-2 ml-1">* อักษรภาษาอังกฤษ ตัวเลข และขีดกลาง (-) เท่านั้น</p>
                    </div>
                  </div>

                  {/* Select Theme */}
                  <div>
                    <label className="block text-gray-600 text-xs font-bold mb-3.5 ml-1 uppercase tracking-wider">เลือกสไตล์การดีไซน์ (Design Theme)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {THEMES.map((theme) => {
                        const isSelected = selectedTheme.id === theme.id;
                        return (
                          <div
                            key={theme.id}
                            onClick={() => setSelectedTheme(theme)}
                            className={`p-4 rounded-2xl border cursor-pointer select-none transition-all ${isSelected ? 'border-purple-500 bg-blue-600/5 shadow-lg shadow-purple-500/5' : 'border-gray-200 bg-black/30 hover:border-gray-300'}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`w-3.5 h-3.5 rounded-full ${theme.bgClass} border border-gray-300`}></span>
                              <span className="text-xs font-bold text-gray-900">{theme.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <span className="w-4 h-1.5 rounded-full bg-gray-200"></span>
                              <span className={`w-5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-zinc-500'}`}></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeploy}
                  disabled={!storeName || !subdomain}
                  className="w-full hover:-translate-y-0.5 bg-purple-600 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none text-gray-900 py-4 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-purple-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Cpu className="w-4 h-4" /> เริ่มกระบวนการวิเคราะห์และจัดดีไซน์
                </button>
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
                <div className="w-20 h-20 mb-8 relative">
                   <div className="absolute inset-0 border-4 border-purple-500/20 rounded-full"></div>
                   <motion.div 
                     className="absolute inset-0 border-4 border-purple-400 rounded-full border-t-transparent"
                     animate={{ rotate: 360 }}
                     transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                   ></motion.div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Server className="w-7 h-7 text-blue-600" />
                   </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-2">กำลังรวบรวมเนื้อหาแลนด์ดิ้งเพจ...</h2>
                <div className="w-full max-w-sm mt-4">
                  <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-2">
                    <span className="text-blue-600">{deploymentStatus}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600 rounded-full"
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
              >
                {/* Control details left */}
                <div className="lg:col-span-5 flex flex-col justify-between py-2">
                  <div>
                    <div className="w-14 h-14 bg-blue-600/10 border border-emerald-500/25 rounded-2xl flex items-center justify-center mb-5">
                       <CheckCircle2 className="w-7 h-7 text-blue-600" />
                    </div>
                    
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">ออกแบบเว็บเสร็จแล้ว!</h2>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">
                      ระบบได้จัดแจงจัดโครงสร้างโค้ดหน้าตาเกมช็อป <strong>{storeName}</strong> โดยอิงจากแคตตาล็อกสินค้าในระบบ และธีมสีสไตล์ <strong>{selectedTheme.name}</strong> เรียบร้อยแล้ว
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="bg-[#111318] border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0">
                               <LinkIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="text-left overflow-hidden">
                              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">ลิงก์ตัวอย่างสำหรับการอ้างอิง</div>
                              <div className="text-blue-600 font-mono text-xs font-bold truncate">
                                {finalUrl}
                              </div>
                            </div>
                         </div>
                      </div>

                      <div className="bg-white/80 border border-gray-200 rounded-2xl p-4 flex flex-col gap-2">
                        <div className="text-xs font-bold text-gray-600 flex items-center gap-2">
                          <Layers className="w-3.5 h-3.5 text-blue-600" /> สมบัติต้นแบบที่จะได้รับ:
                        </div>
                        <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-5">
                          <li>สไตล์ชีตระดับโปรพร้อมโมดูล Grid การแสดงผลการ์ดสินค้า</li>
                          <li>ทำงานได้ทันทีแบบ Single Static Page โหลดไว</li>
                          <li>ใช้เครื่องจักรเฟรมเวิร์ก CSS ยอดนิยม (Tailwind CSS CDN)</li>
                          <li>ไม่จำกัดสิทธิ์ผู้ดูแลระบบ นำไปเข้าชุดเซิร์ฟเวอร์จริงได้ฟรี</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={downloadStoreHTML}
                      className="w-full hover:-translate-y-0.5 bg-blue-700 hover:bg-blue-600 text-gray-900 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" /> ดาวน์โหลดไฟล์เว็บ (index.html)
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="w-full bg-[#111318] hover:bg-[#16181f] text-gray-600 hover:text-gray-900 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      แก้ไขสไตล์ใหม่
                    </button>
                  </div>
                </div>

                {/* Right Interactive Live Mockup Device Preview! */}
                <div className="lg:col-span-7 flex flex-col">
                  <div className="flex items-center justify-between mb-3.5">
                    <div className="text-xs font-bold text-gray-600 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      พรีวิวหน้าสดบนอุปกรณ์จำลอง (Live Mockup Frame)
                    </div>
                    <div className="bg-[#111318] p-1 border border-gray-200 rounded-xl flex gap-1">
                      <button 
                        onClick={() => setPreviewDevice('desktop')}
                        className={`p-1.5 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-purple-600 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setPreviewDevice('mobile')}
                        className={`p-1.5 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-purple-600 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Simulated Device Frame Container */}
                  <div className={`w-full flex justify-center items-center p-4 bg-[#111318]/50 border border-gray-200 rounded-2xl min-h-[400px] overflow-hidden`}>
                    <motion.div 
                      layout
                      className={`relative flex flex-col shadow-2xl transition-all duration-300 overflow-hidden ${selectedTheme.bgClass} ${previewDevice === 'mobile' ? 'w-[320px] h-[525px] rounded-[36px] border-[8px] border-gray-200' : 'w-full h-[380px] rounded-xl border border-gray-200'}`}
                    >
                      {/* Mobile Notch Indicator */}
                      {previewDevice === 'mobile' && (
                        <div className="absolute top-0 inset-x-0 h-5 bg-gray-100 flex justify-center items-center z-20">
                          <div className="w-16 h-3.5 bg-white rounded-b-xl"></div>
                        </div>
                      )}

                      {/* Web Header inside Mockup */}
                      <header className={`px-4 sm:px-6 py-4 flex items-center justify-between border-b ${selectedTheme.borderClass} ${previewDevice === 'mobile' ? 'pt-7' : ''} shrink-0`}>
                        <span className="text-xs font-black text-gray-900 leading-tight truncate max-w-[120px]">{storeName || 'My GameShop'}</span>
                        <span className="font-mono text-[9px] text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                          {subdomain || 'demo'}.apex.xyz
                        </span>
                      </header>

                      {/* Mockup Body Content */}
                      <div className="flex-1 overflow-y-auto p-4 content-scroll text-left">
                        <div className="relative mb-5 p-4 rounded-xl bg-gradient-to-r overflow-hidden border border-gray-200 select-none pointer-events-none">
                          <div className={`absolute inset-0 bg-gradient-to-tr ${selectedTheme.accentGlow} opacity-30`}></div>
                          <div className="relative z-10">
                            <span className={`text-[8px] font-black uppercase tracking-wider ${selectedTheme.accentClass}`}>
                              ยินดีต้อนรับพรีเมียม
                            </span>
                            <h3 className="text-xs sm:text-sm font-black text-gray-900 mt-1 leading-tight">{storeName || 'My Store'}</h3>
                          </div>
                        </div>

                        <h4 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">สินค้าทั้งหมด</h4>
                        <div className={`grid ${previewDevice === 'mobile' ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                          {previewProducts.map((p) => (
                            <div key={p.id} className="bg-white/5 border border-gray-200 p-2 rounded-xl flex flex-col justify-between h-36">
                              <div>
                                <div className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center text-[8px] text-gray-500 font-bold mb-1.5 overflow-hidden">
                                  {p.tag && <span className={`absolute top-1 left-1 font-extrabold text-[7px] uppercase px-1 rounded ${selectedTheme.accentClass}`}>{p.tag}</span>}
                                  IMAGE PREVIEW
                                </div>
                                <h5 className="text-[9px] font-bold text-gray-900 truncate">{p.name}</h5>
                              </div>
                              <div className="mt-2 text-left">
                                <p className={`text-[10px] font-black ${selectedTheme.accentClass}`}>฿{(p.price || 0).toLocaleString()}</p>
                                <button className={`w-full text-[8px] font-bold mt-1 py-1 rounded ${selectedTheme.btnClass} pointer-events-none`}>
                                  ซื้อเลย
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Simulated Home Button of Phone */}
                      {previewDevice === 'mobile' && (
                        <div className="absolute bottom-1 inset-x-0 flex justify-center">
                          <div className="w-24 h-1 bg-gray-200 rounded-full"></div>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AnimatedScroll>
  );
};
