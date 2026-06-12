import React, { useState } from 'react';
import { Bot, Send, MessageSquare, Terminal, ShieldCheck, Globe, Zap, ArrowRight, Star, ExternalLink, Search, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface ToolsViewProps {
  setActiveView: (view: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ setActiveView }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const tools = [
    {
      id: 'auto_deploy',
      name: 'สร้างร้านค้าฟรี',
      desc: 'ระบบสั่งจำลองโคลนติดตั้งเว็บไซต์ร้านค้าส่วนตัวออโต้บนซับโดเมนของคุณเอง พร้อมฐานข้อมูล MySQL และระบบจัดการครบวงจร',
      category: 'premium',
      icon: Globe,
      gradient: 'from-[#059669] to-[#10B981]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-sm',
      tag: 'HOT',
      premium: false
    },
    {
      id: 'api_proxy_gen',
      name: 'API Proxy',
      desc: 'สร้าง API ลิงก์สำหรับดึง Proxy ไปใช้งานกับโปรแกรมของคุณ อัปเดตเรียลไทม์ ดึงได้ทุก 0.1 วิ',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#8B5CF6] to-[#C084FC]',
      iconColor: 'text-[#C084FC]',
      glowColor: 'group-hover:shadow-sm',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'two_fa_generator',
      name: 'สร้างรหัส 2FA',
      desc: 'เครื่องมือช่วยสร้างรหัสผ่านชั้นที่สอง (OTP) สำหรับยืนยันตัวตนทุกแพลตฟอร์ม',
      category: 'utility',
      icon: Zap,
      gradient: 'from-[#10B981] to-[#34D399]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-sm',
      premium: false
    },
    {
      id: 'proxy_free',
      name: 'รายการพร็อกซี่ฟรี',
      desc: 'แหล่งรวม Proxy สดใหม่ อัปเดตรายวัน สำหรับใช้งานทั่วไปแบบฟรีๆ ไม่จำกัด',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#06b6d4] to-[#22d3ee]',
      iconColor: 'text-[#06b6d4]',
      glowColor: 'group-hover:shadow-sm',
      premium: false
    }
  ];

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'utility', label: 'ยูทิลิตี้ทั่วไป' },
    { id: 'social', label: 'โซเชียลคอมมูนิตี้' },
    { id: 'premium', label: 'ฟีเจอร์พรีเมียม' },
  ];

  const filteredTools = tools.filter(tool => {
    const matchSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       tool.desc.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchCategory = true;
    if (activeCategory === 'premium') {
      matchCategory = tool.premium;
    } else if (activeCategory !== 'all') {
      matchCategory = tool.category === activeCategory;
    }

    return matchSearch && matchCategory;
  });

  return (
    <AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-20 w-full max-w-7xl mx-auto mt-6 lg:mt-10">
        
        {/* Header Section: Hero Style */}
        <div className="relative mb-14 overflow-hidden bg-[#09090b] border border-[#1e1e1e]  p-8 md:p-12 lg:p-16 isolate">
          {/* Decorative Blooms */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary text-primary-foreground  pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#10b981]/10  pointer-events-none -z-10 -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#09090b] border border-[#1e1e1e]  text-[#10b981] text-xs font-semibold uppercase tracking-widest mb-6 backdrop-blur-sm ">
                <Sparkles className="w-4 h-4 text-[#10b981]" /> ชุดเครื่องมือ APEX
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white tracking-tight mb-6 leading-tight">
                ขับเคลื่อน<br/>ด้วยเครื่องมือ<span className="text-white"> ทรงพลัง</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                ลดขั้นตอนที่น่าเบื่อด้วยระบบอัตโนมัติ ไม่ว่าจะเป็นโปรแกรมดึงของขวัญ หรือสร้างเว็บไซต์ส่วนตัว ทั้งหมดนี้เปิดให้ใช้งานฟรีและพรีเมียม
              </p>
            </div>

            <div className="w-full lg:w-80 space-y-4 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="ค้นหาเครื่องมือ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-sm backdrop-blur-md border border-[#1e1e1e]  py-4 pl-12 pr-4 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters / Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="hidden md:flex items-center gap-2 mr-4 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-widest">หมวดหมู่</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${ activeCategory === cat.id ? 'bg-zinc-600 text-white border border-emerald-500' : 'bg-[#121212] text-muted-foreground border-[#1e1e1e]  hover:bg-[#121212] hover:text-white' }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tools Grid Area */}
        {filteredTools.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center  border-dashed border-[#1e1e1e] bg-[#09090b] "
          >
            <div className="w-20 h-20 bg-[#09090b] flex items-center justify-center mb-6 ">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">ไม่พบเครื่องมือที่ต้องการ</h3>
            <p className="text-muted-foreground text-sm">ลองปรับการค้นหา หรือเลือกหมวดหมู่อื่นดูอีกครั้ง</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, idx) => (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.95, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => {
                    if ((tool as any).link) {
                      window.open((tool as any).link, '_blank');
                    } else {
                      setActiveView(tool.id);
                    }
                  }}
                  className={`group cursor-pointer bg-[#09090b] border border-[#1e1e1e]  hover:border-[#1e1e1e] p-7 transition-all duration-500 relative overflow-hidden flex flex-col h-full ${tool.glowColor} .5 `}
                >
                  {/* Subtle Background Accent inside card */}
                  <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-15  transition-opacity duration-700 pointer-events-none`}></div>

                  {/* Header Row: Icon & Badges */}
                  <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                    <div className={`w-14 h-14 bg-[#09090b] border border-[#1e1e1e]  flex items-center justify-center ${tool.iconColor} group-hover:scale-110  ease-out `}>
                      <tool.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                       {tool.premium && (
                          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 backdrop-blur-md">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-[10px] font-semibold uppercase tracking-wider">VIP</span>
                          </div>
                       )}
                       {tool.tag && (
                          <div className={`px-3 py-1.5 backdrop-blur-md text-[10px] font-semibold uppercase tracking-wider ${ tool.tag === 'HOT' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : tool.tag === 'FREE' ? 'bg-[#10b981]/10 text-[#10b981] border-emerald-500/20' : 'bg-[#10b981]/10 text-[#10b981] border-emerald-500/20' }`}>
                            {tool.tag}
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col relative z-10">
                    <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-zinc-600 group-hover:to-emerald-600 transition-all">
                      {tool.name}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-8 font-medium">
                      {tool.desc}
                    </p>

                    {/* Bottom Action */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-[#1e1e1e] ">
                       <span className={`text-xs font-medium uppercase tracking-widest transition-colors ${tool.iconColor} opacity-70 group-hover:opacity-100 flex items-center gap-2`}>
                          เข้าใช้งานระบบ
                       </span>
                       <div className="w-10 h-10 bg-[#09090b] flex items-center justify-center text-muted-foreground group-hover:text-white group-hover:bg-white/10 transition-colors duration-200 shrink-0 ">
                          {(tool as any).link ? (
                            <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                          ) : (
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          )}
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Informational Footer */}
        <div className="mt-16 flex justify-center pb-8">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 bg-[#09090b] border border-[#1e1e1e]  backdrop-blur-sm ">
               <div className="w-10 h-10 bg-amber-500/10 flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-5 h-5 text-amber-500" /> 
               </div>
               <p className="text-muted-foreground text-sm text-center font-medium">
                 เครื่องมือที่มีตรา <span className="text-amber-500 font-semibold px-1">VIP</span> สงวนสิทธิ์การเข้าถึงเฉพาะสมาชิก Premium ขึ้นไป
               </p>
            </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};

