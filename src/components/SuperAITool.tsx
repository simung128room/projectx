import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Trash2, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import Swal from 'sweetalert2';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const SuperAITool: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
      try { if (!apiKey && typeof process !== 'undefined') apiKey = process.env.GEMINI_API_KEY; } catch(e) {}
      if (!apiKey) {
         throw new Error("ไม่มี GEMINI API KEY ในระบบ กรุณาใช้ API Key ของท่าน");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          systemInstruction: "คุณมีนิสัยเย็นชา โรคจิต และมักจะตอบหน้าตายสั้นๆ ห้วนๆ",
        }
      });

      const modelMessage: Message = { role: 'model', text: response.text || "ไม่มีข้อความตอบกลับ" };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.message || 'ไม่สามารถเชื่อมต่อกับ AI ได้',
        background: '#09090b',
        color: '#fff'
      });
      setMessages(prev => [...prev, { role: 'model', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ (Error: ' + err.message + ')' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 flex flex-col h-[600px] bg-[#0a0d12] border border-white/5 rounded-3xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-center pb-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <img src="https://cdn.discordapp.com/attachments/1500441829789663344/1502968845738967070/IMG_6430.jpg?ex=6a01a450&is=6a0052d0&hm=8425874432aa51310b326177befe2b9b66d1ad7540ffed4100de123dfa4ebc48&" alt="AI Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-fuchsia-500/50 shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
            <span className="bg-gradient-to-r from-blue-400 via-fuchsia-500 to-amber-400 bg-clip-text text-transparent">SUPER AI</span>
          </h2>
          <p className="text-zinc-400 mt-1 text-sm font-medium">ผู้ช่วยอัจฉริยะส่วนตัว ขุมพลังจาก apex studio</p>
        </div>
        <button 
          onClick={clearChat}
          className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
        >
          <Trash2 className="w-4 h-4" /> ล้างแชท
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.length === 0 ? (
          <div className="text-center text-zinc-500 h-full flex items-center justify-center flex-col gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500 blur-[40px] opacity-20 rounded-full"></div>
              <img src="https://cdn.discordapp.com/attachments/1500441829789663344/1502968845738967070/IMG_6430.jpg?ex=6a01a450&is=6a0052d0&hm=8425874432aa51310b326177befe2b9b66d1ad7540ffed4100de123dfa4ebc48&" alt="AI Avatar" className="relative w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-2xl" />
            </div>
            <p className="text-xl font-semibold bg-gradient-to-r from-zinc-300 to-white bg-clip-text text-transparent">สวัสดี! มีอะไรให้ SUPER AI ช่วยไหมครับ?</p>
          </div>
        ) : null}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                <img src="https://cdn.discordapp.com/attachments/1500441829789663344/1502968845738967070/IMG_6430.jpg?ex=6a01a450&is=6a0052d0&hm=8425874432aa51310b326177befe2b9b66d1ad7540ffed4100de123dfa4ebc48&" alt="AI Avatar" className="w-full h-full object-cover" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-3xl p-5 text-sm shadow-md ${msg.role === 'user' ? 'bg-[#1E90FF] text-white rounded-tr-sm' : 'bg-[#0a0d12] border border-white/5 text-zinc-200 rounded-tl-sm'}`}>
               {msg.role === 'user' ? (
                 <div className="whitespace-pre-wrap">{msg.text}</div>
               ) : (
                 <div className="markdown-body prose prose-invert max-w-none text-sm break-words">
                    <Markdown>{msg.text}</Markdown>
                 </div>
               )}
            </div>
            {msg.role === 'user' && (
            <div className="w-9 h-9 rounded-full bg-[#1E90FF]/20 flex items-center justify-center shrink-0 text-[#1E90FF]">
              <User className="w-5 h-5" />
            </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden shadow-sm">
                <img src="https://cdn.discordapp.com/attachments/1500441829789663344/1502968845738967070/IMG_6430.jpg?ex=6a01a450&is=6a0052d0&hm=8425874432aa51310b326177befe2b9b66d1ad7540ffed4100de123dfa4ebc48&" alt="AI Avatar" className="w-full h-full object-cover opacity-70" />
             </div>
             <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-4 text-sm flex items-center gap-2 max-w-[80%] shadow-lg">
                <div className="flex gap-1.5 px-1 py-0.5">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-fuchsia-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-fuchsia-500 to-amber-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 border-t border-white/10 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="พิมพ์ข้อความที่นี่ แจ้งสิ่งที่ต้องการให้ SUPER AI ช่วย..."
            className="flex-1 bg-[#0a0d12] border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 shadow-inner placeholder:text-zinc-600 disabled:opacity-50 transition-all"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-blue-500 via-fuchsia-500 to-amber-500 hover:opacity-90 text-white px-6 py-4 rounded-full font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            <Send className="w-5 h-5" /> ส่ง
          </button>
        </form>
      </div>
    </div>
  );
};
