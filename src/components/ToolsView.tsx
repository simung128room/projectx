import React, { useState } from 'react';
import { Bot, Send, MessageSquare, Terminal, ShieldCheck, Globe, Zap, ArrowRight, Star, ExternalLink, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface ToolsViewProps {
  setActiveView: (view: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ setActiveView }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const tools = [
    {
      id: 'telegram_catcher',
      name: 'ดักซองเทเลแกรม',
      desc: 'ระบบดักรับซองของขวัญอัตโนมัติจากห้องสนทนา Telegram รวดเร็วและแม่นยำ',
      category: 'social',
      icon: Send,
      gradient: 'from-[#0088cc] to-[#00aaff]',
      iconColor: 'text-[#00aaff]',
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(0,170,255,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(88,101,242,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(88,101,242,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(235,69,158,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]',
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
      glowColor: 'group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]',
      premium: false
    }
  ];

  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    tool.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="font-sans px-4 pb-16 w-full max-w-6xl mx-auto mt-6">
        
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">
              <Bot className="w-3.5 h-3.5" /> Workspace Tools
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              เครื่องมือ<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">อัตโนมัติ</span>
            </h1>
            <p className="text-zinc-500 text-sm max-w-md leading-relaxed">
              ชุดเครื่องมือระดับโปรที่จะช่วยลดเวลาการทำงานของคุณให้เป็นเรื่องง่าย เลือกใช้งานได้ทันที
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="ค้นหาเครื่องมือ..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121417] border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-600"
            />
          </div>
        </div>

        {/* Tools Grid Area */}
        {filteredTools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-[#121417]">
            <Search className="w-10 h-10 text-zinc-700 mb-4" />
            <h3 className="text-white font-bold mb-1">ไม่พบเครื่องมือ</h3>
            <p className="text-zinc-500 text-sm">ลองใช้คำค้นหาอื่นดูอีกครั้ง</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredTools.map((tool, idx) => (
                <motion.div
                  layout
                  key={tool.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  onClick={() => {
                    if ((tool as any).link) {
                      window.open((tool as any).link, '_blank');
                    } else {
                      setActiveView(tool.id);
                    }
                  }}
                  className={`group cursor-pointer bg-[#0c1015] border border-white/5 hover:border-white/10 rounded-[28px] p-6 transition-all duration-300 relative overflow-hidden flex flex-col h-full ${tool.glowColor} hover:-translate-y-1`}
                >
                  {/* Subtle Background Accent */}
                  <div className={`absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-10 blur-[60px] rounded-full transition-opacity duration-500 pointer-events-none`}></div>

                  {/* Header Row: Icon & Badges */}
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className={`w-12 h-12 rounded-2xl bg-zinc-900/80 border border-white/5 flex items-center justify-center shadow-inner ${tool.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                      <tool.icon className="w-6 h-6" strokeWidth={1.5} />
                    </div>

                    <div className="flex flex-col items-end gap-2">
                       {tool.premium && (
                          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-wider">VIP</span>
                          </div>
                       )}
                       {tool.tag && (
                          <div className={`px-2.5 py-1 rounded-full backdrop-blur-md text-[9px] font-black uppercase tracking-wider ${
                            tool.tag === 'HOT' 
                              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {tool.tag}
                          </div>
                       )}
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 flex flex-col relative z-10">
                    <h3 className="text-lg font-bold text-zinc-100 mb-2 truncate group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 mb-6">
                      {tool.desc}
                    </p>

                    {/* Bottom Action */}
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                       <span className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${tool.iconColor} opacity-70 group-hover:opacity-100 flex items-center gap-1.5`}>
                          เข้าใช้งาน
                       </span>
                       <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
                          {(tool as any).link ? (
                            <ExternalLink className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                          ) : (
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
        <div className="mt-12 flex justify-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-2xl bg-[#121417] border border-white/5">
               <ShieldCheck className="w-5 h-5 text-zinc-500" /> 
               <p className="text-zinc-400 text-xs text-center">
                 เครื่องมือที่มีตรา <span className="text-amber-500 font-bold px-1">VIP</span> สงวนสิทธิ์การเข้าถึงเฉพาะสมาชิก Premium ขึ้นไป
               </p>
            </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};
