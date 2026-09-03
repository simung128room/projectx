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
          background: '#ffffff',
          color: '#111827',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#2563eb'
       });
       return;
    }

    if (!item.attachments || item.attachments.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'ไม่พบเนื้อหา',
            text: 'ถูกซ่อนหรือไม่มีข้อมูล',
            background: '#ffffff',
            color: '#111827'
        });
        return;
    }

    // Modal to display attachments with HTML Injection & XSS prevention
    const htmlAttachments = item.attachments.map((att: any) => {
        const cleanData = (att.data || '').trim().replace(/"/g, '&quot;');
        // Prevent javascript: and data: protocol execution in URLs
        const safeUrl = /^(javascript:|data:)/i.test(cleanData) ? '#' : cleanData;
        
        if (att.type === 'image') {
          return `<img loading="lazy" src="${safeUrl}" class="w-full rounded-md mb-2" />`;
        }
        if (att.type === 'file') {
          return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center font-bold text-sm mb-2 shadow-sm">ดาวน์โหลดไฟล์</a>`;
        }
        return `<div class="bg-slate-50 border border-zinc-200 p-3.5 rounded-xl mb-3 text-left text-sm text-zinc-800 break-all select-all font-mono max-h-48 overflow-y-auto">${(att.data || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`;
    }).join('');

    Swal.fire({
        title: item.title,
        html: `<div class="mt-4">${htmlAttachments}</div>`,
        background: '#ffffff',
        color: '#111827',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#4b5563'
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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-24 font-sans text-zinc-850">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
             <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-3">
               <Gift className="w-8 h-8 text-blue-600" /> {filterType === 'vip' ? 'VIP PH LOG' : filterType === 'free' ? 'FREE FH LOG' : 'ทรัพยากร / เครื่องมือ'}
             </h1>
             <p className="text-sm font-semibold text-zinc-550 mt-2">ดาวน์โหลดไฟล์และเอกสารฟรี & พรีเมียม</p>
          </div>
          {isAdmin && (
            <button onClick={() => setShowAdmin(!showAdmin)} className="flex bg-white hover:bg-slate-50 text-zinc-800 px-4 py-2 border border-zinc-200 text-sm font-bold shadow-sm rounded-xl self-start md:self-auto hover:-translate-y-0.5 transition-all cursor-pointer">
               {showAdmin ? 'ปิดจัดการเนื้อหา' : 'เพิ่มเนื้อหา (แอดมิน)'}
            </button>
          )}
       </div>

       {showAdmin ? (
          <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 mb-8 shadow-sm">
            <AdminToolsManagement />
          </div>
       ) : selectedCategory ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedCategory(null)} className="px-4 py-2 bg-white hover:bg-slate-50 border border-zinc-200 text-zinc-700 font-bold text-sm rounded-xl shadow-sm cursor-pointer">
                    กลับ
                  </button>
                  <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    {selectedCategory.name}
                    {selectedCategory.isVip && <span className="bg-amber-100 text-amber-705 px-2 py-0.5 rounded text-[10px] uppercase font-bold">VIP</span>}
                  </h2>
                </div>
                <div className="sm:ml-auto w-full sm:w-64 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา..." className="w-full bg-white border border-zinc-200 pl-9 pr-4 py-2 rounded-xl text-sm text-zinc-805 placeholder:text-zinc-300 focus:outline-[#364153] outline-offset-0 focus:border-zinc-400 shadow-sm" />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {currentItems.map((item) => {
                  const isLocked = item.type === 'premium' && !isVip;
                  return (
                     <div key={item.id} onClick={() => handleOpenItem(item)} className={`bg-white border border-zinc-200 rounded-2xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all ${isLocked ? 'opacity-80' : 'hover:-translate-y-1 '}`}>
                       <div className="flex justify-between items-start mb-3">
                         <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${item.type === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                           {item.type === 'premium' ? 'Premium' : 'Free'}
                         </span>
                         {isLocked ? <Lock className="w-4 h-4 text-zinc-400"/> : <Download className="w-4 h-4 text-blue-600"/>}
                       </div>
                       <h3 className="text-lg font-bold text-zinc-900 mb-2">{item.title}</h3>
                       {item.keyword && <span className="text-[10px] text-zinc-450 font-semibold bg-zinc-50 border border-zinc-100 px-2.5 py-1 rounded-md font-mono">#{item.keyword}</span>}
                    </div>
                  );
               })}
               {currentItems.length === 0 && <div className="col-span-full py-12 text-center text-zinc-450 font-bold bg-white border border-zinc-100 rounded-2xl">ไม่พบเนื้อหาในหมวดหมู่นี้</div>}
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
                    className="bg-white border border-zinc-200 hover:border-blue-500 overflow-hidden shadow-sm hover:shadow-lg transition-all rounded-3xl cursor-pointer group flex flex-col pt-2"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                       <div className="flex items-center justify-between mb-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                           <Folder className="w-6 h-6" />
                         </div>
                         {c.isVip && <span className="bg-amber-100 text-amber-500 border border-amber-200/50 px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg">VIP</span>}
                       </div>
                       <h2 className="text-xl font-bold text-zinc-900 group-hover:text-blue-600 transition-colors tracking-tight">{c.name}</h2>
                       <p className="text-sm text-zinc-500 font-medium mt-1 mb-4 flex-1">{c.subtitle}</p>
                       
                       <div className="w-full flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                         <span className="text-xs font-bold text-zinc-500">{catItemsCount} รายการ</span>
                         <div className="w-8 h-8 rounded-full bg-slate-50 border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
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
