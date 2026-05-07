import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Image as ImageIcon, FileText, Download, Lock, Crown, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import { AnimatedScroll } from './AnimatedScroll';

interface ContentAttachment {
  type: 'text' | 'image' | 'file';
  data: string;
}

export interface ContentItem {
  id: string;
  type: 'free' | 'premium';
  title: string;
  keyword: string;
  attachments: ContentAttachment[];
  unlockAt?: string; // ISO date string
  createdAt?: string;
}

export const ContentFeedView: React.FC<{ type: 'free' | 'premium', isAdmin: boolean, isPremiumUser: boolean }> = ({ type, isAdmin, isPremiumUser }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('apex_contents');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apex_contents', JSON.stringify(items));
  }, [items]);

  const filteredItems = items.filter(i => i.type === type && (i.title.includes(search) || i.keyword.includes(search)));

  const handleAdd = () => {
    Swal.fire({
      title: 'เพิ่มเนื้อหาใหม่',
      html: `
        <input id="swal-title" class="swal2-input" placeholder="หัวข้อ" />
        <input id="swal-keyword" class="swal2-input" placeholder="คำค้นหา (Keyword)" />
        <select id="swal-ctype" class="swal2-select">
          <option value="text">ข้อความ</option>
          <option value="image">รูปภาพ (URL)</option>
          <option value="file">ไฟล์ (URL)</option>
        </select>
        <textarea id="swal-content" class="swal2-textarea" placeholder="เนื้อหา หรือ URL"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      background: '#09090b',
      color: '#fff',
      preConfirm: () => {
        const title = (document.getElementById('swal-title') as HTMLInputElement).value;
        const keyword = (document.getElementById('swal-keyword') as HTMLInputElement).value;
        const ctype = (document.getElementById('swal-ctype') as HTMLSelectElement).value as any;
        const content = (document.getElementById('swal-content') as HTMLTextAreaElement).value;
        if (!title || !content) {
          Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบ');
        }
        return { title, keyword, contentType: ctype, content };
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        setItems(prev => [{
          id: Math.random().toString(36).substring(2,9),
          type,
          ...res.value
        }, ...prev]);
      }
    });
  };

  const handleDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-white">
      <AnimatedScroll>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${type === 'premium' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {type === 'premium' ? <Crown className="w-8 h-8"/> : <Gift className="w-8 h-8"/>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tighter">
              {type === 'premium' ? 'ของเติมของโคตรดี!!' : 'ของฟรีของดี!!'}
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">คลังความรู้และทรัพยากร</p>
          </div>
        </div>
        
        {isAdmin && (
          <button 
            onClick={handleAdd}
            className={`px-5 py-3 text-sm font-bold text-white rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 ${type === 'premium' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
          >
            <Plus className="w-5 h-5"/>
            เพิ่มเนื้อหาใหม่
          </button>
        )}
      </div>
      </AnimatedScroll>

      <AnimatedScroll delay={100}>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="ค้นหาจากชื่อ หรือ Keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#1E90FF]/50 focus:ring-4 focus:ring-[#1E90FF]/20 transition-all shadow-sm"
          />
        </div>
      </div>
      </AnimatedScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, i) => {
          // Compatibility with old format
          const attachments: ContentAttachment[] = item.attachments || ((item as any).content ? [{ type: ((item as any).contentType as any) || 'text', data: (item as any).content }] : []);
          
          let isTimeLocked = false;
          let timeRemaining = '';
          if (item.unlockAt) {
            const unlockTime = new Date(item.unlockAt).getTime();
            const now = new Date().getTime();
            if (unlockTime > now) {
              isTimeLocked = true;
              const diff = unlockTime - now;
              const d = Math.floor(diff / (1000 * 60 * 60 * 24));
              const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
              timeRemaining = `เปิดให้ใช้งานใน ${d} วัน ${h} ชั่วโมง ${m} นาที`;
            }
          }

          const locked = (type === 'premium' && !isAdmin && !isPremiumUser) || (isTimeLocked && !isAdmin);

          return (
            <AnimatedScroll key={item.id} delay={i * 50}>
            <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-[#0B0F14] border border-white/10 rounded-3xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-400 bg-[#121820] px-2 py-0.5 rounded-full uppercase border border-white/10">
                    {attachments.length} ไฟล์
                  </span>
                  {item.keyword && (
                    <span className="text-[10px] font-bold text-[#1E90FF] bg-[#1E90FF]/10 px-2 py-0.5 rounded-full uppercase border border-white/10">
                      #{item.keyword}
                    </span>
                  )}
                  {isTimeLocked && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase border border-blue-100">
                      ตั้งเวลาเปิด
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(item.id)} className="text-[#1a7fe6] hover:text-[#1E90FF] opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#1E90FF]/10 rounded-md">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{item.title}</h3>

              <div className="bg-[#0a0d12] rounded-2xl border border-white/5 overflow-hidden">
                {locked && !isAdmin ? (
                  <div className="h-32 flex flex-col items-center justify-center bg-[#0a0d12] backdrop-blur-sm relative">
                    <Lock className="w-8 h-8 text-amber-500 mb-2"/>
                    {isTimeLocked ? (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">{timeRemaining}</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">วีไอพีเท่านั้น</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {attachments.map((att, idx) => (
                      <div key={idx} className="mb-2">
                        {att.type === 'text' && (
                          <div className="relative group/copy cursor-pointer" onClick={() => {
                            navigator.clipboard.writeText(att.data);
                            Swal.fire({title: 'คัดลอกข้อความแล้ว!', timer: 1000, showConfirmButton: false});
                          }}>
                            <p className="text-sm text-zinc-700 font-mono whitespace-pre-wrap bg-[#0B0F14] p-3 rounded-xl border border-white/10 line-clamp-[10]">{att.data}</p>
                            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover/copy:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow">คลิกเพื่อคัดลอก</span>
                            </div>
                          </div>
                        )}
                        {att.type === 'image' && (
                          <div className="w-full flex justify-center relative group/img">
                            <img src={att.data || undefined} alt="attachment" className="max-h-48 object-contain rounded-lg" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/f4f4f5/a1a1aa?text=Image+Not+Found')} />
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/img:opacity-100 transition-opacity">
                              {isAdmin && (
                                <button onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(att.data); Swal.fire({title:'Copy URL แล้ว', timer:1000, showConfirmButton:false}); }} className="bg-black/50 text-white p-2 rounded-lg hover:bg-black text-xs font-bold">Copy URL</button>
                              )}
                              <a href={att.data} target="_blank" rel="noopener noreferrer" className="bg-black/50 text-white p-2 rounded-lg hover:bg-black text-xs font-bold">ดูรูปเต็ม</a>
                            </div>
                          </div>
                        )}
                        {att.type === 'file' && (
                          <a href={att.data} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center justify-between bg-[#0B0F14] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-white overflow-hidden rounded-xl border border-white/10 transition-all duration-300 w-full shadow-sm hover:shadow-md font-bold group/file">
                            <div className="flex bg-emerald-500/10 text-emerald-600 p-4 items-center justify-center">
                               <Download className="w-5 h-5 group-hover/file:scale-110 transition-transform"/>
                            </div>
                            <div className="flex-1 px-4 py-3 truncate text-sm">
                              {att.data.split('/').pop() || 'ดาวน์โหลดไฟล์'}
                            </div>
                            {isAdmin && (
                              <button onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(att.data); Swal.fire({title: 'คัดลอกลิ้งค์แล้ว', timer: 1000, showConfirmButton:false}); }} className="mr-3 text-xs bg-[#121820] px-3 py-1.5 rounded-lg text-zinc-500 hover:bg-zinc-200">Copy URL</button>
                            )}
                          </a>
                        )}
                      </div>
                    ))}
                    {locked && isAdmin && isTimeLocked && (
                      <div className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100 text-center shadow-sm">
                        (มุมมองแอดมิน) สถานะปัจจุบัน: 🔒 ล็อค<br/>จะเปิดให้ผู้ใช้ทั่วไปโหลดจริง:<br/>{new Date(item.unlockAt!).toLocaleString('th-TH')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            </AnimatedScroll>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-zinc-400 border-2 border-dashed border-white/10 rounded-3xl bg-[#0B0F14] shadow-sm">
            ไม่พบเนื้อหาในหมวดหมู่นี้
          </div>
        )}
      </div>
    </div>
  );
};
