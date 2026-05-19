import React from 'react';
import { Bot, Send, MessageSquare, Terminal, ShieldCheck, Globe, Zap, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedScroll } from './AnimatedScroll';

interface ToolsViewProps {
  setActiveView: (view: any) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({ setActiveView }) => {
  const tools = [
    {
      id: 'telegram_catcher',
      name: 'ดักซองเทเลแกรม',
      desc: 'ระบบดักรับซองของขวัญอัตโนมัติจากห้องสนทนา Telegram',
      icon: Send,
      color: 'bg-[#2AABEE]',
      tag: 'HOT',
      premium: false
    },
    {
      id: 'discord_catcher',
      name: 'ดักซองดิสคอร์ด',
      desc: 'ดักจับ Nitro และซองของขวัญใน Discord อัตโนมัติ',
      icon: MessageSquare,
      color: 'bg-[#5865F2]',
      tag: 'NEW',
      premium: false
    },
    {
      id: 'discord_on',
      name: 'รันโทเค่นดิสคอร์ด',
      desc: 'ระบบช่วยรันไอดี Discord ให้คงสถานะออนไลน์ตลอดเวลา (On 24/7)',
      icon: Terminal,
      color: 'bg-[#5865F2]',
      premium: true
    },
    {
      id: 'discord_badge',
      name: 'รับตราอัตโนมัติ',
      desc: 'ขอรับตรา Developer Badge ใน Discord แบบรวดเร็ว',
      icon: ShieldCheck,
      color: 'bg-[#5865F2]',
      premium: true
    },
    {
      id: 'two_fa_generator',
      name: 'สร้างรหัส 2FA',
      desc: 'เครื่องมือช่วยเจนรหัส Two-Factor Authentication (OTP)',
      icon: Zap,
      color: 'bg-indigo-500',
      premium: false
    },
    {
      id: 'proxy_free',
      name: 'พร็อกซี่ฟรี (Proxy)',
      desc: 'แหล่งรวม Proxy รายวันสำหรับใช้งานทั่วไปแบบฟรีๆ',
      icon: Globe,
      color: 'bg-emerald-500',
      premium: false
    }
  ];

  return (
    <AnimatedScroll direction="up">
      <div className="font-sans px-4 pb-12">
        {/* Header */}
        <div className="max-w-6xl mx-auto mt-4 mb-8 text-center text-zinc-400">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1E90FF]/10 border border-[#1E90FF]/15 rounded-full text-[#1E90FF] text-[10px] font-black uppercase tracking-widest mb-3">
                <Bot className="w-3 h-3" /> Power Tools
            </div>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2 uppercase tracking-tight">
             ศูนย์รวมเครื่องมือ <span className="text-[#1E90FF]">อัตโนมัติ</span>
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto text-xs md:text-sm leading-relaxed opacity-80">
            เลือกใช้งานเครื่องมือเพื่อเพิ่มความสะดวกสบายในการจัดการระบบต่างๆ ของคุณ
          </p>
        </div>

        {/* Tools Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              onClick={() => setActiveView(tool.id)}
              className="group cursor-pointer bg-[#0B0F14]/60 backdrop-blur-md border border-white/5 rounded-xl p-4 md:px-6 md:py-5 hover:border-[#1E90FF]/40 transition-all relative overflow-hidden"
            >
              {/* Background Glow */}
              <div className={`absolute -right-6 -top-6 w-20 h-20 ${tool.color}/5 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700`}></div>
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-lg ${tool.color} flex items-center justify-center text-white shadow-xl shadow-black/40 group-hover:scale-105 transition-transform`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex gap-2">
                    {tool.tag && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                        {tool.tag}
                      </span>
                    )}
                    {tool.premium && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black px-2 py-0.5 rounded-md">
                        VIP
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-black text-white mb-1 group-hover:text-[#1E90FF] transition-colors tracking-tight">
                  {tool.name}
                </h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed mb-4 flex-1 opacity-70">
                  {tool.desc}
                </p>

                <div className="flex items-center gap-2 text-[#1E90FF] text-[10px] font-black uppercase tracking-[0.15em] group-hover:gap-3 transition-all">
                  เปิดใช้งานเลย <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="max-w-2xl mx-auto mt-16 bg-[#0a0d12] border border-white/5 rounded-2xl p-6 text-center">
            <p className="text-zinc-500 text-sm">
                ⚠️ เครื่องมือบางอย่างอาจต้องใช้สิทธิ์ <span className="text-amber-500 font-bold">Premium</span> ในการเข้าถึง หากคุณต้องการใช้งานฟีเจอร์ทั้งหมด โปรดอัปเกรดบัญชีของคุณ
            </p>
        </div>
      </div>
    </AnimatedScroll>
  );
};
