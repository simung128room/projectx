import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface ContactViewProps {
  onBack: () => void;
  facebookLink?: string;
}

export const ContactView: React.FC<ContactViewProps> = ({ onBack, facebookLink = '#' }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors font-medium bg-[#0B0F14] px-4 py-2 rounded-xl border border-white/10 shadow-sm w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
      </button>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-500 p-4 rounded-2xl">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tighter">ติดต่อเรา / ขอความช่วยเหลือ</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Contact & Support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discord */}
        <a 
          href="https://discord.gg/2NSuSmkzun" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#0B0F14] border border-white/10 hover:border-[#5865F2] hover:shadow-md hover:shadow-[#5865F2]/10 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="w-20 h-20 bg-[#5865F2]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 127.14 96.36" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.68,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
            </svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Discord Official</h2>
          <p className="text-zinc-500 text-sm font-medium">พูดคุย สอบถามปัญหา และติดตามข่าวสารล่าสุดผ่านทางดิสคอร์ด</p>
          <div className="mt-6 px-6 py-2.5 bg-[#5865F2] text-white rounded-xl font-bold text-sm shadow-sm group-hover:bg-[#4752C4] transition-colors">
            เข้าร่วม Discord
          </div>
        </a>

        {/* Facebook */}
        <a 
          href={facebookLink} 
          target={facebookLink !== '#' ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="bg-[#0B0F14] border border-white/10 hover:border-[#1877F2] hover:shadow-md hover:shadow-[#1877F2]/10 transition-all rounded-3xl p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden"
          onClick={(e) => {
            if (facebookLink === '#') {
              e.preventDefault();
            }
          }}
        >
          <div className="w-20 h-20 bg-[#1877F2]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Facebook Page</h2>
          <p className="text-zinc-500 text-sm font-medium">ติดตามการอัปเดตและติดต่อสอบถามผ่านทางข้อความแชทเฟสบุ๊ค</p>
          <div className="mt-6 px-6 py-2.5 bg-[#1877F2] text-white rounded-xl font-bold text-sm shadow-sm group-hover:bg-[#166fe5] transition-colors">
            ติดต่อผ่าน Facebook
          </div>
          {facebookLink === '#' && (
            <div className="absolute top-4 right-4 bg-[#121820] text-zinc-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              เร็วๆ นี้
            </div>
          )}
        </a>
      </div>
    </div>
  );
};
