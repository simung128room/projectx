import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MessageSquare, Mail } from 'lucide-react';

interface ContactViewProps {
  onBack: () => void;
  facebookLink?: string;
  discordLink?: string;
  instagramLink?: string;
  contactEmail?: string;
}

export const ContactView: React.FC<ContactViewProps> = ({ 
  onBack, 
  facebookLink = '#',
  discordLink = 'https://discord.gg/2NSuSmkzun',
  instagramLink = '#',
  contactEmail = 'support.apexstoreth@gmail.com'
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-foreground">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-zinc-600 hover:text-foreground hover:shadow-sm text-sm font-medium transition-all bg-white hover:bg-slate-50 px-4 py-2 border border-zinc-200 rounded-full w-fit cursor-pointer shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
      </button>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-4 rounded-xl">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">ติดต่อเรา / ขอความช่วยเหลือ</h1>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest mt-1">Contact & Support</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Discord */}
        <a 
          href={discordLink} 
          target={discordLink !== '#' ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="bg-white border border-zinc-200 hover:border-[#5865F2] hover:shadow-lg transition-all p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm"
          onClick={(e) => {
            if (discordLink === '#') {
              e.preventDefault();
            }
          }}
        >
          <div className="w-20 h-20 bg-slate-50 border border-zinc-100 flex items-center justify-center mb-6 rounded-2xl group-hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 127.14 96.36" fill="#5865F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.68,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.31,60,73.31,53s5-12.74,11.43-12.74S96.1,46,96,53,91,65.69,84.69,65.69Z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Discord Official</h2>
          <p className="text-zinc-500 text-sm font-medium">พูดคุย สอบถามปัญหา และติดตามข่าวสารล่าสุดผ่านทางดิสคอร์ด</p>
          <div className="mt-6 px-6 py-2.5 bg-zinc-50 hover:bg-[#4752C4] border border-zinc-200/80 group-hover:text-white group-hover:border-transparent rounded-xl text-zinc-700 font-bold text-sm transition-all">
            เข้าร่วม Discord
          </div>
          {discordLink === '#' && (
            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md">
              เร็วๆ นี้
            </div>
          )}
        </a>

        {/* Facebook */}
        <a 
          href={facebookLink} 
          target={facebookLink !== '#' ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="bg-white border border-zinc-200 hover:border-[#1877F2] hover:shadow-lg transition-all p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm"
          onClick={(e) => {
            if (facebookLink === '#') {
               e.preventDefault();
            }
          }}
        >
          <div className="w-20 h-20 bg-slate-50 border border-zinc-100 flex items-center justify-center mb-6 rounded-2xl group-hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#1877F2" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Facebook Page</h2>
          <p className="text-zinc-500 text-sm font-medium">ติดตามการอัปเดตและติดต่อสอบถามผ่านทางข้อความแชทเฟสบุ๊ค</p>
          <div className="mt-6 px-6 py-2.5 bg-zinc-50 hover:bg-[#166fe5] border border-zinc-200/80 group-hover:text-white group-hover:border-transparent rounded-xl text-zinc-700 font-bold text-sm transition-all">
            ติดต่อผ่าน Facebook
          </div>
          {facebookLink === '#' && (
            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md">
              เร็วๆ นี้
            </div>
          )}
        </a>

        {/* Instagram */}
        <a 
          href={instagramLink} 
          target={instagramLink !== '#' ? "_blank" : "_self"} 
          rel="noopener noreferrer"
          className="bg-white border border-zinc-200 hover:border-[#E4405F] hover:shadow-lg transition-all p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm"
          onClick={(e) => {
            if (instagramLink === '#') {
              e.preventDefault();
            }
          }}
        >
          <div className="w-20 h-20 bg-slate-50 border border-zinc-100 flex items-center justify-center mb-6 rounded-2xl group-hover:scale-110 transition-transform">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#E4405F" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.28.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Instagram</h2>
          <p className="text-zinc-500 text-sm font-medium">ติดตามบรรยากาศและโปรโมชั่นต่างๆ ผ่านทาง Instagram</p>
          <div className="mt-6 px-6 py-2.5 bg-zinc-50 hover:bg-[#d83753] border border-zinc-200/80 group-hover:text-white group-hover:border-transparent rounded-xl text-zinc-700 font-bold text-sm transition-all">
            ติดตาม Instagram
          </div>
          {instagramLink === '#' && (
            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md">
              เร็วๆ นี้
            </div>
          )}
        </a>

        {/* Email Support */}
        <a 
          href={`mailto:${contactEmail}`} 
          className="bg-white border border-zinc-200 hover:border-[#1e1e1e] hover:shadow-lg transition-all p-8 flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden rounded-2xl shadow-sm"
          onClick={(e) => {
            if (!contactEmail) {
              e.preventDefault();
            }
          }}
        >
          <div className="w-20 h-20 bg-slate-50 border border-zinc-100 flex items-center justify-center mb-6 rounded-2xl group-hover:scale-110 transition-transform">
             <Mail className="w-10 h-10 text-zinc-700" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">Email Support</h2>
          <p className="text-zinc-500 text-sm font-medium">ติดต่อแจ้งปัญหาหรือสอบถามข้อมูลเพิ่มเติมผ่านทางอีเมล</p>
          <div className="mt-6 px-6 py-2.5 bg-zinc-50 hover:bg-[#1e1e1e] border border-zinc-200/80 group-hover:text-white group-hover:border-transparent rounded-xl text-zinc-700 font-bold text-sm transition-all">
            ส่งอีเมลหาเรา
          </div>
          {!contactEmail && (
            <div className="absolute top-4 right-4 bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2.5 py-1 uppercase tracking-wide rounded-md">
              เร็วๆ นี้
            </div>
          )}
        </a>
      </div>

      {/* Trust & Registrations info panel */}
      <div className="mt-8 bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm">
        <h3 className="text-lg font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-3 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full inline-block animate-pulse"></span>
          ข้อมูลจดทะเบียนและการทำธุรกรรมที่ถูกต้อง (Sunoid.shop Trust Center)
        </h3>
        <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-medium">
          สโตร์ของเราอยู่ภายใต้การบริหารงานของบริษัทร่วมค้าหลักสากล จดทะเบียนอย่างถูกต้องเป็นบริษัทพันธมิตรผู้ให้บริการสินค้าดิจิทัลและรหัสคีย์ความปลอดภัย ข้อมูลธุรกรรมทั้งหมดรองรับมาตรการรักษาความปลอดภัยขั้นสูงสุด และมีการตรวจสอบความปลอดภัย (Audited) ทุกสัปดาห์
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-500 font-medium">
          <div className="bg-slate-50/50 p-5 border border-zinc-100 rounded-2xl">
            <span className="text-zinc-800 font-bold block mb-1">ผู้ให้บริการ (Owner/Licensee)</span>
            Sunoid.shop Inc. (สยามยูนิตี้ ซัพพอร์ต ฮับ จำกัด)
          </div>
          <div className="bg-slate-50/50 p-5 border border-zinc-100 rounded-2xl">
            <span className="text-zinc-800 font-bold block mb-1">ที่ทำงานและสำนักงานใหญ่</span>
            123 อาคารเพลินจิตเซ็นเตอร์ ชั้น 14 แขวงลุมพินี เขตปทุมวัน กรุงเทพมหานคร 10330
          </div>
          <div className="bg-slate-50/50 p-5 border border-zinc-100 rounded-2xl">
            <span className="text-zinc-800 font-bold block mb-1">สายด่วนช่วยเหลือ (Phone Hotline)</span>
            02-123-4567 (บริการลูกค้า 09:00 - 22:00 น. ทุกวันไม่มีวันหยุด)
          </div>
        </div>
      </div>
    </div>
  );
};
