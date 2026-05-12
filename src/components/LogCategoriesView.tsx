import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, Lock, Search, Download, FileText, Image as ImageIcon, ChevronRight, Gift } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { LogCategory, ContentItem, AdminToolsManagement } from './AdminToolsManagement';

interface LogCategoriesViewProps {
  userPlan: any;
  onNavigateAction: (action: string) => void;
  filterType?: 'all' | 'vip' | 'free';
  isAdmin?: boolean;
}

export const LogCategoriesView: React.FC<LogCategoriesViewProps> = ({ userPlan, filterType = 'all', isAdmin = false }) => {
  const [categories, setCategories] = useState<LogCategory[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | null>(null);
  const [search, setSearch] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/logs-system');
        setCategories((res.data.categories || []).filter((c: any) => c.isVisible));
        setItems(res.data.items || []);
        setIsVip(res.data.isVip || false);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleOpenItem = (item: ContentItem) => {
    if (item.type === 'premium' && !isVip) {
       Swal.fire({
          icon: 'warning',
          title: 'สำหรับสมาชิก VIP เท่านั้น!',
          text: 'คุณต้องเป็น VIP จึงจะสามารถดูหรือดาวน์โหลดได้',
          background: '#09090b',
          color: '#fff',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#1a7fe6'
       });
       return;
    }

    if (!item.attachments || item.attachments.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบเนื้อหา',
            text: 'ถูกซ่อนหรือไม่มีข้อมูล',
            background: '#09090b',
            color: '#fff'
        });
        return;
    }

    // Modal to display attachments
    const htmlAttachments = item.attachments.map((att: any) => {
        if (att.type === 'image') return `<img src="${att.data}" class="w-full rounded-lg mb-2" />`;
        if (att.type === 'file') return `<a href="${att.data}" target="_blank" class="block w-full py-2 bg-[#1a7fe6] text-white rounded-lg text-center font-bold mb-2">ดาวน์โหลดไฟล์</a>`;
        return `<div class="bg-zinc-900 border border-white/10 p-3 rounded-lg mb-2 text-left text-sm text-zinc-300 break-all select-all font-mono max-h-48 overflow-y-auto">${att.data.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    }).join('');

    Swal.fire({
        title: item.title,
        html: `<div class="mt-4">${htmlAttachments}</div>`,
        background: '#09090b',
        color: '#fff',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#333'
    });
  };

  useEffect(() => {
    setSelectedCategory(null);
  }, [filterType]);

  const currentItems = selectedCategory 
    ? items.filter(i => i.categoryId === selectedCategory.id && i.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  const filteredCategories = categories.filter(c => {
    if (filterType === 'vip') return c.isVip;
    if (filterType === 'free') return !c.isVip;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <Gift className="w-8 h-8 text-[#1a7fe6]" /> {filterType === 'vip' ? 'VIP PH LOG' : filterType === 'free' ? 'FREE FH LOG' : 'ทรัพยากร / เครื่องมือ'}
            </h1>
            <p className="text-sm font-medium text-zinc-500 mt-2">ดาวน์โหลดไฟล์และเอกสารฟรี & พรีเมียม</p>
         </div>
         {isAdmin && (
           <button onClick={() => setShowAdmin(!showAdmin)} className="flex bg-[#1a7fe6] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#1a7fe6]/20 self-start md:self-auto hover:-translate-y-1 transition-all">
              {showAdmin ? 'ปิดจัดการเนื้อหา' : 'เพิ่มเนื้อหา (แอดมิน)'}
           </button>
         )}
       </div>

       {showAdmin ? (
         <div className="bg-black/20 border border-white/5 rounded-3xl p-4 sm:p-6 mb-8">
           <AdminToolsManagement />
         </div>
       ) : selectedCategory ? (
         <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-4 mb-6">
               <button onClick={() => setSelectedCategory(null)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm">
                 กลับ
               </button>
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 {selectedCategory.name}
                 {selectedCategory.isVip && <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full text-[10px] uppercase">VIP</span>}
               </h2>
               <div className="ml-auto w-48 relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                 <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentItems.map((item) => {
                 const isLocked = item.type === 'premium' && !isVip;
                 return (
                   <div key={item.id} onClick={() => handleOpenItem(item)} className={`bg-[#0B0F14] border border-white/10 rounded-3xl p-5 cursor-pointer hover:border-[#1E90FF]/30 transition-all ${isLocked ? 'opacity-80' : 'hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1E90FF]/10'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.type === 'premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {item.type === 'premium' ? 'Premium' : 'Free'}
                        </span>
                        {isLocked ? <Lock className="w-4 h-4 text-zinc-500"/> : <Download className="w-4 h-4 text-[#1a7fe6]"/>}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                      {item.keyword && <span className="text-[10px] text-zinc-400 font-medium">#{item.keyword}</span>}
                   </div>
                 );
              })}
              {currentItems.length === 0 && <div className="col-span-full py-12 text-center text-zinc-500">ไม่พบเนื้อหาในหมวดหมู่นี้</div>}
            </div>
         </motion.div>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <AnimatePresence>
             {filteredCategories.sort((a,b)=>a.order-b.order).map((c, i) => {
               const catItemsCount = items.filter(it => it.categoryId === c.id).length;
               return (
                 <motion.div
                   key={c.id} 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => { setSelectedCategory(c); setSearch(''); }}
                   className="bg-[#0B0F14] border border-white/10 hover:border-[#1a7fe6]/30 hover:shadow-xl hover:shadow-[#1a7fe6]/10 rounded-3xl overflow-hidden transition-all cursor-pointer group flex flex-col pt-2"
                 >
                   <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#1a7fe6] group-hover:scale-110 transition-transform">
                          <Folder className="w-6 h-6" />
                        </div>
                        {c.isVip && <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">VIP</span>}
                      </div>
                      <h2 className="text-xl font-black text-white group-hover:text-[#1a7fe6] transition-colors tracking-tight">{c.name}</h2>
                      <p className="text-sm text-zinc-500 mt-1 mb-4 flex-1">{c.subtitle}</p>
                      
                      <div className="w-full flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <span className="text-xs font-bold text-zinc-400">{catItemsCount} รายการ</span>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-[#1E90FF]/10 group-hover:text-[#1a7fe6] transition-all">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                   </div>
                 </motion.div>
               );
             })}
           </AnimatePresence>
         </div>
       )}
    </div>
  );
};
