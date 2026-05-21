import React, { useState } from 'react';
import { Bot, Send, MessageSquare, Terminal, ShieldCheck, Globe, Zap, ArrowRight, Star, Sparkles, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface ToolsViewProps {
  setActiveView: (view: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ setActiveView }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const tools = [
    {
      id: 'telegram_catcher',
      name: 'ดักซองเทเลแกรม',
      desc: 'ระบบดักรับซองของขวัญอัตโนมัติจากห้องสนทนา Telegram',
      category: 'social',
      icon: Send,
      color: 'bg-[#2AABEE]',
      iconColor: 'text-[#2AABEE]',
      tag: 'HOT',
      premium: false
    },
    {
      id: 'discord_catcher',
      name: 'ดักซองดิสคอร์ด',
      desc: 'ดักจับ Nitro และซองของขวัญใน Discord อัตโนมัติ',
      category: 'social',
      icon: MessageSquare,
      color: 'bg-[#5865F2]',
      iconColor: 'text-[#5865F2]',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'discord_on',
      name: 'รันโทเค่นดิสคอร์ด',
      desc: 'ระบบช่วยรันไอดี Discord ให้คงสถานะออนไลน์ตลอดเวลา',
      category: 'social',
      icon: Terminal,
      color: 'bg-[#5865F2]',
      iconColor: 'text-[#5865F2]',
      premium: true
    },
    {
      id: 'discord_badge',
      name: 'รับตราอัตโนมัติ',
      desc: 'ขอรับตรา Developer Badge ใน Discord แบบรวดเร็ว',
      category: 'social',
      icon: ShieldCheck,
      color: 'bg-[#5865F2]',
      iconColor: 'text-[#5865F2]',
      premium: true
    },
    {
      id: 'two_fa_generator',
      name: 'สร้างรหัส 2FA',
      desc: 'เครื่องมือช่วยเจนรหัส Two-Factor Authentication (OTP)',
      category: 'utility',
      icon: Zap,
      color: 'bg-emerald-500',
      iconColor: 'text-emerald-500',
      premium: false
    },
    {
      id: 'proxy_free',
      name: 'พร็อกซี่ฟรี (Proxy)',
      desc: 'แหล่งรวม Proxy รายวันสำหรับใช้งานทั่วไปแบบฟรีๆ',
      category: 'utility',
      icon: Globe,
      color: 'bg-cyan-500',
      iconColor: 'text-cyan-500',
      premium: false
    }
  ];

  const filteredTools = activeCategory === 'all' ? tools : tools.filter(t => t.category === activeCategory);

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="font-sans px-4 pb-12 w-full max-w-4xl mx-auto mt-4">
        
        <div className="mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-2">
            <Bot className="w-6 h-6 text-[#3B82F6]" />
            เครื่องมืออัตโนมัติ
          </h1>
          <p className="text-zinc-500 text-sm leading-relaxed">
            เลือกใช้งานเครื่องมือต่างๆ เพื่อช่วยอำนวยความสะดวกในการจัดการระบบของคุณ
          </p>
        </div>

        {/* Tools List */}
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, idx) => (
              <motion.div
                layout
                key={tool.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                onClick={() => setActiveView(tool.id)}
                className="group cursor-pointer bg-[#0A0D12] border border-white/5 hover:border-white/10 hover:bg-[#111318] rounded-2xl p-4 transition-all flex items-center gap-4"
              >
                <div className={`w-12 h-12 shrink-0 rounded-xl bg-[#111318] border border-white/5 flex items-center justify-center ${tool.iconColor}`}>
                   <tool.icon className="w-5 h-5" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm md:text-base font-bold text-zinc-100 truncate group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {tool.premium && (
                        <span className="bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          VIP
                        </span>
                      )}
                      {tool.tag === 'HOT' && (
                          <span className="bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            HOT
                          </span>
                      )}
                       {tool.tag === 'NEW' && (
                          <span className="bg-[#3B82F6]/10 text-[#3B82F6] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            NEW
                          </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-zinc-500 text-xs truncate">
                    {tool.desc}
                  </p>
                </div>

                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[#111318] group-hover:bg-[#3B82F6]/10 border border-white/5 group-hover:border-[#3B82F6]/20 transition-all text-zinc-500 group-hover:text-[#3B82F6]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-zinc-600 text-xs flex items-center justify-center gap-2">
               <ShieldCheck className="w-3.5 h-3.5" /> เครื่องมือ <span className="text-amber-500 font-bold">VIP</span> สงวนสิทธิ์สำหรับสมาชิก Premium ขึ้นไป
            </p>
        </div>
      </div>
    </AnimatedScroll>
  );
};
