import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export const AIChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        text: 'สวัสดีจ้าพี่ชาย! วันนี้อยากรู้อะไรเกี่ยวกับเซิร์ฟ หรือเมาท์มอยอะไรจัดมาเลย เอ๋อรอตอบอยู่~'
      }]);
    }
  }, [messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Dummy "AI" response
    setTimeout(() => {
      const responses = [
        "พี่ก็รู้ เอ๋อไม่ค่อยเก่งเรื่องนี้ แต่ขอเดาว่า... สุดยอดไปเลยพี่!",
        "ถ้าพี่ว่าดี เอ๋อก็ว่าดี! แต่อย่าลืมกด VIP นะจ๊ะ หยอกๆ",
        "จัดหัวร้อยมาสักใบสิ เดี๋ยวเอ๋อจะบอกความลับให้ฟัง อิอิ",
        "คำถามล้ำหน้าเกิ๊น เอ๋อตามไม่ทัน! ขอภาษาคนง่ายๆ หน่อยได้ป่ะ?",
        "โอเค เข้าใจละ... เอ๊ะ หรือไม่เข้าใจนะ...",
      ];
      const botMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        text: responses[Math.floor(Math.random() * responses.length)] 
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6 bg-[#0B0F14] border border-white/10 shadow-sm rounded-2xl p-4 shrink-0 relative overflow-hidden">
        {/* Background glow for header */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-[#1a7fe6]/5 blur-[40px] pointer-events-none"></div>
        <div className="relative shrink-0">
          <img src="https://img1.pic.in.th/images/IMG_60530d2699f6c4572a4d.jpeg" alt="AI ไอเอ๋อ" className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#1E90FF]/30" />
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-amber-500 animate-pulse drop-shadow-sm" />
        </div>
        <div className="relative z-10">
          <h1 className="text-xl font-bold text-white">คุยกับไอเอ๋อ (Beta)</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">ผู้ช่วยสุดเพี้ยนประจำเซิร์ฟ</p>
        </div>
      </div>

      <div className="flex-1 bg-[#0B0F14] border border-white/10 rounded-3xl overflow-hidden flex flex-col relative shadow-sm">
        {/* Chat window */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
           <img src="https://i.postimg.cc/6qnW8nqX/IMG-6366.png" alt="Logo Background" className="w-64 md:w-96 object-contain" />
        </div>
        <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-4 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent relative z-10">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex items-start gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${msg.role === 'user' ? 'bg-[#1E90FF]/10 border-white/10 text-[#1E90FF]' : 'bg-transparent border-white/10'}`}>
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <img src="https://img1.pic.in.th/images/IMG_60530d2699f6c4572a4d.jpeg" alt="AI" className="w-full h-full object-cover"/>}
                </div>
                <div className={`p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#1E90FF] text-white rounded-tr-sm shadow-sm' : 'bg-[#0a0d12] text-white rounded-tl-sm border border-white/5'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-transparent border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src="https://img1.pic.in.th/images/IMG_60530d2699f6c4572a4d.jpeg" alt="AI" className="w-full h-full object-cover"/>
                </div>
                <div className="bg-[#0a0d12] p-4 rounded-2xl rounded-tl-sm border border-white/5 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-[#1E90FF] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#1E90FF] rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-[#1E90FF] rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-[#0a0d12] border-t border-white/5 shrink-0">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์ข้อความคุยกับไอเอ๋อ..."
              className="w-full bg-[#0B0F14] border border-white/10 rounded-full py-3.5 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-[#1E90FF]/50 focus:ring-4 focus:ring-[#1E90FF]/20 transition-all placeholder:text-zinc-400 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-2 bg-[#1E90FF] hover:bg-[#1a7fe6] disabled:bg-zinc-200 disabled:text-zinc-400 text-white rounded-full transition-colors flex items-center justify-center shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
