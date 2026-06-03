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
      id: 'api_proxy_gen',
      name: 'API Proxy',
      desc: 'สร้าง API ลิงก์สำหรับดึง Proxy ไปใช้งานกับโปรแกรมของคุณ อัปเดตเรียลไทม์ ดึงได้ทุก 0.1 วิ',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#8B5CF6] to-[#C084FC]',
      iconColor: 'text-[#C084FC]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(192,132,252,0.4)]',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'free_website',
      name: 'เปิดเว็บไซต์ฟรี',
      desc: 'เครื่องมือสร้างเว็บไซต์ร้านค้าของคุณ แจกฟรีสำหรับสมาชิกทุกคน พร้อมใช้งานทันทีใน 5 วินาที',
      category: 'utility',
      icon: Globe,
      gradient: 'from-[#8B5CF6] to-[#C084FC]',
      iconColor: 'text-[#C084FC]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(192,132,252,0.4)]',
      tag: 'FREE',
      premium: false
    },
    {
      id: 'telegram_catcher',
      name: 'ดักซองเทเลแกรม',
      desc: 'ระบบดักรับซองของขวัญอัตโนมัติจากห้องสนทนา Telegram รวดเร็วและแม่นยำ',
      category: 'social',
      icon: Send,
      gradient: 'from-[#0088cc] to-[#00aaff]',
      iconColor: 'text-[#00aaff]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(0,170,255,0.4)]',
      tag: 'HOT',
      premium: false
    },
    {
      id: 'discord_catcher',
      name: 'ดักซองดิสคอร์ด',
      desc: 'ดักจับ Nitro และซองของขวัญใน Discord อัตโนมัติ สามารถทำงานได้ตลอดเวลา 24/7',
      category: 'social',
      icon: MessageSquare,
      gradient: 'from-[#5865F2] to-[#7289DA]',
      iconColor: 'text-[#7289DA]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(88,101,242,0.4)]',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'discord_on',
      name: 'รันโทเค่นดิสคอร์ด',
      desc: 'ระบบช่วยรันไอดี Discord ให้คงสถานะออนไลน์ตลอดเวลา สร้างความน่าเชื่อถือให้บัญชีของคุณ',
      category: 'social',
      icon: Terminal,
      gradient: 'from-[#4F545C] to-[#5865F2]',
      iconColor: 'text-[#5865F2]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(88,101,242,0.4)]',
      premium: true
    },
    {
      id: 'discord_badge',
      name: 'รับตราอัตโนมัติ',
      desc: 'ขอรับตรา Active Developer Badge ใน Discord แบบรวดเร็วและปลอดภัย',
      category: 'social',
      icon: ShieldCheck,
      gradient: 'from-[#FEE75C] to-[#EB459E]',
      iconColor: 'text-[#EB459E]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(235,69,158,0.4)]',
      premium: true
    },
    {
      id: 'two_fa_generator',
      name: 'สร้างรหัส 2FA',
      desc: 'เครื่องมือช่วยสร้างรหัสผ่านชั้นที่สอง (OTP) สำหรับยืนยันตัวตนทุกแพลตฟอร์ม',
      category: 'utility',
      icon: Zap,
      gradient: 'from-[#10B981] to-[#34D399]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
      premium: false
    },
    {
      id: 'proxy_ff_ios',
      name: 'PROXY FREE FIRE IOS',
      desc: 'พร็อกซี่สำหรับใช้งานกับ Free Fire บนระบบ iOS พร้อมไฟล์ Certificate นำไปเชื่อมต่อได้ทันที',
      category: 'premium',
      icon: ShieldCheck,
      gradient: 'from-[#10B981] to-[#34D399]',
      iconColor: 'text-[#10B981]',
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]',
      tag: 'NEW',
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
      glowColor: 'group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.4)]',
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
        <div className="relative mb-14 rounded-[32px] overflow-hidden bg-gradient-to-br from-[#0B0D11] to-[#12161D] border border-gray-200 p-8 md:p-12 lg:p-16 isolate">
          {/* Decorative Blooms */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10 -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-gray-200 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-blue-400" /> ชุดเครื่องมือ APEX
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6 leading-tight">
                ขับเคลื่อน<br/>ด้วยเครื่องมือ<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">คุณภาพ</span>
              </h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-xl">
                ลดขั้นตอนที่น่าเบื่อด้วยระบบอัตโนมัติ ไม่ว่าจะเป็นโปรแกรมดึงของขวัญ หรือสร้างเว็บไซต์ส่วนตัว ทั้งหมดนี้เปิดให้ใช้งานฟรีและพรีเมียม
              </p>
            </div>

            <div className="w-full lg:w-80 space-y-4 shrink-0">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="ค้นหาเครื่องมือ..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 backdrop-blur-sm backdrop-blur-md border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium placeholder:text-gray-500 shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters / Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="hidden md:flex items-center gap-2 mr-4 text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">หมวดหมู่</span>
          </div>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeCategory === cat.id 
                  ? 'bg-purple-600 text-gray-900 shadow-[0_0_20px_-5px_rgba(37,99,235,0.4)] border border-blue-500' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'
              }`}
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
            className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-[#0c1015]"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <Search className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">ไม่พบเครื่องมือที่ต้องการ</h3>
            <p className="text-gray-500 text-sm">ลองปรับการค้นหา หรือเลือกหมวดหมู่อื่นดูอีกครั้ง</p>
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
                  className={`group cursor-pointer bg-[#0c1015] border border-gray-200 hover:border-gray-200 rounded-[32px] p-7 transition-all duration-500 relative overflow-hidden flex flex-col h-full ${tool.glowColor} hover:-translate-y-1.5`}
                >
                  {/* Subtle Background Accent inside card */}
                  <div className={`absolute -right-16 -top-16 w-48 h-48 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-15 blur-[60px] rounded-full transition-opacity duration-700 pointer-events-none`}></div>

                  {/* Header Row: Icon & Badges */}
                  <div className="flex justify-between items-start mb-6 relative z-10 w-full">
                    <div className={`w-14 h-14 rounded-2xl bg-[#12161D] border border-gray-200 flex items-center justify-center shadow-inner ${tool.iconColor} group-hover:scale-110 transition-transform duration-500 ease-out`}>
                      <tool.icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                       {tool.premium && (
                          <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-wider">VIP</span>
                          </div>
                       )}
                       {tool.tag && (
                          <div className={`px-3 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-wider ${
                            tool.tag === 'HOT' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : tool.tag === 'FREE' 
                              ? 'bg-blue-600/10 text-blue-600 border border-emerald-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {tool.tag}
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col relative z-10">
                    <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 transition-all">
                      {tool.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-8 font-medium">
                      {tool.desc}
                    </p>

                    {/* Bottom Action */}
                    <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-200">
                       <span className={`text-xs font-bold uppercase tracking-widest transition-colors ${tool.iconColor} opacity-70 group-hover:opacity-100 flex items-center gap-2`}>
                          เข้าใช้งานระบบ
                       </span>
                       <div className="w-10 h-10 rounded-full bg-[#12161D] flex items-center justify-center text-gray-600 group-hover:text-gray-900 group-hover:bg-blue-50 transition-all duration-300 shrink-0">
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
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-5 rounded-3xl bg-white/80 border border-gray-200 backdrop-blur-sm">
               <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                 <ShieldCheck className="w-5 h-5 text-amber-500" /> 
               </div>
               <p className="text-gray-600 text-sm text-center font-medium">
                 เครื่องมือที่มีตรา <span className="text-amber-500 font-black px-1">VIP</span> สงวนสิทธิ์การเข้าถึงเฉพาะสมาชิก Premium ขึ้นไป
               </p>
            </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};

