import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Image as ImageIcon, FileText, Download, Lock, Crown, Gift } from 'lucide-react';
import { motion } from 'motion/react';
import Swal from 'sweetalert2';
import { AnimatedScroll } from './AnimatedScroll';

interface ContentItem {
  id: string;
  type: 'free' | 'premium';
  contentType: 'text' | 'image' | 'file';
  title: string;
  content: string;
  keyword: string;
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
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500 font-sans text-zinc-900">
      <AnimatedScroll>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-white border border-zinc-200 shadow-sm rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${type === 'premium' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
            {type === 'premium' ? <Crown className="w-8 h-8"/> : <Gift className="w-8 h-8"/>}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tighter">
              {type === 'premium' ? 'ของเติมของโคตรดี!!' : 'ของฟรีของดี!!'}
            </h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">คลังความรู้และทรัพยากร</p>
          </div>
        </div>
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
            className="w-full bg-white border border-zinc-200 rounded-2xl py-3 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-50 transition-all shadow-sm"
          />
        </div>
        {isAdmin && (
          <button onClick={handleAdd} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-sm">
            <Plus className="w-5 h-5"/> เพิ่มเนื้อหา
          </button>
        )}
      </div>
      </AnimatedScroll>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item, i) => {
          const locked = type === 'premium' && !isAdmin && !isPremiumUser;
          return (
            <AnimatedScroll key={item.id} delay={i * 50}>
            <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white border border-zinc-200 rounded-3xl p-5 relative overflow-hidden group shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full uppercase border border-zinc-200">
                    {item.contentType}
                  </span>
                  {item.keyword && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase border border-red-100">
                      #{item.keyword}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-red-50 rounded-md">
                    <Trash2 className="w-4 h-4"/>
                  </button>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-zinc-900 mb-4 line-clamp-1">{item.title}</h3>

              <div className="bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
                {locked ? (
                  <div className="h-32 flex flex-col items-center justify-center bg-zinc-50 backdrop-blur-sm relative">
                    <Lock className="w-8 h-8 text-amber-500 mb-2"/>
                    <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">วีไอพีเท่านั้น</span>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50"></div>
                  </div>
                ) : (
                  <div className="p-4">
                    {item.contentType === 'text' && (
                      <p className="text-sm text-zinc-700 font-mono whitespace-pre-wrap">{item.content}</p>
                    )}
                    {item.contentType === 'image' && (
                      <div className="w-full flex justify-center">
                        <img src={item.content || undefined} alt={item.title} className="max-h-48 object-contain rounded-lg" onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400/f4f4f5/a1a1aa?text=Image+Not+Found')} />
                      </div>
                    )}
                    {item.contentType === 'file' && (
                      <a href={item.content} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-zinc-900 py-3 rounded-xl border border-zinc-200 transition-all duration-300 w-full shadow-sm hover:shadow-md font-bold">
                        <Download className="w-5 h-5 text-emerald-500"/>
                        <span className="text-sm">ดาวน์โหลดไฟล์</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
            </AnimatedScroll>
          );
        })}
        {filteredItems.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-zinc-400 border-2 border-dashed border-zinc-200 rounded-3xl bg-white shadow-sm">
            ไม่พบเนื้อหาในหมวดหมู่นี้
          </div>
        )}
      </div>
    </div>
  );
};
