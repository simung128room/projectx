import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Calendar, FileText, Image as ImageIcon, Download, Check, X, Folder, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export interface ContentItem {
  id: string;
  categoryId: string;
  type: 'free' | 'premium';
  title: string;
  keyword?: string;
  attachments?: any[];
  unlockAt?: string;
  createdAt?: string;
}

export interface LogCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  isVisible: boolean;
  isVip: boolean;
  order: number;
}

export const AdminToolsManagement = () => {
  const [categories, setCategories] = useState<LogCategory[]>([]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('items');

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSubtitle, setCatSubtitle] = useState('');
  const [catIcon, setCatIcon] = useState('Folder');
  const [catIsVip, setCatIsVip] = useState(false);
  const [catIsVisible, setCatIsVisible] = useState(true);

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemCategoryId, setItemCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [itemType, setItemType] = useState<'free' | 'premium'>('free');
  const [unlockAtDate, setUnlockAtDate] = useState('');
  const [unlockAtTime, setUnlockAtTime] = useState('');
  
  const [attachments, setAttachments] = useState<{type: 'text'|'image'|'file', data: string}[]>([]);
  const [attType, setAttType] = useState<'text'|'image'|'file'>('text');
  const [attData, setAttData] = useState('');

  const loadData = async () => {
    try {
      const res = await axios.get('/api/logs-system');
      setCategories(res.data.categories || []);
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (newCats: LogCategory[], newItems: ContentItem[]) => {
    try {
      await axios.post('/api/logs-system', { categories: newCats, items: newItems });
      setCategories(newCats);
      setItems(newItems);
      Swal.fire({title: 'บันทึกสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false, background:'#09090b', color:'#fff'});
    } catch (err) {
      Swal.fire({title: 'เกิดข้อผิดพลาด', icon: 'error', background:'#09090b', color:'#fff'});
    }
  };

  const handleSaveCategory = () => {
    if (!catName) return Swal.fire({title:'กรอกข้อมูลให้ครบ', icon:'error', background:'#09090b', color:'#fff'});
    const newCat: LogCategory = {
      id: Math.random().toString(36).substring(2,9),
      name: catName,
      subtitle: catSubtitle,
      icon: catIcon,
      isVip: catIsVip,
      isVisible: catIsVisible,
      order: categories.length
    };
    saveData([...categories, newCat], items);
    setIsAddingCategory(false);
    setCatName(''); setCatSubtitle(''); setCatIsVip(false); setCatIsVisible(true);
  };

  const handleDeleteCategory = (id: string) => {
    Swal.fire({ title: 'ยืนยันการลบ?', showCancelButton: true, background: '#09090b', color: '#fff' }).then(r => {
      if (r.isConfirmed) {
        saveData(categories.filter(x => x.id !== id), items.filter(x => x.categoryId !== id));
      }
    });
  };

  const toggleCategoryVisibility = (id: string) => {
    const newCats = categories.map(c => c.id === id ? { ...c, isVisible: !c.isVisible } : c);
    saveData(newCats, items);
  };

  const handleSaveItem = () => {
    if (!title || !itemCategoryId) return Swal.fire({title:'กรอกข้อมูลให้ครบ', icon:'error', background:'#09090b', color:'#fff'});
    if (attachments.length === 0) return Swal.fire({title:'ต้องมีอย่างน้อย 1 ไฟล์/เนื้อหา', icon:'error', background:'#09090b', color:'#fff'});
    
    let unlockAt: string | undefined = undefined;
    if (unlockAtDate && unlockAtTime) {
      unlockAt = new Date(`${unlockAtDate}T${unlockAtTime}`).toISOString();
    }

    const newItem: ContentItem = {
      id: Math.random().toString(36).substring(2,9),
      categoryId: itemCategoryId,
      type: itemType,
      title,
      keyword,
      attachments,
      unlockAt,
      createdAt: new Date().toISOString()
    };

    saveData(categories, [newItem, ...items]);
    setIsAddingItem(false);
    setTitle(''); setKeyword(''); setUnlockAtDate(''); setUnlockAtTime(''); setAttachments([]); setAttData('');
  };

  const handleDeleteItem = (id: string) => {
    Swal.fire({ title: 'ยืนยันการลบ?', showCancelButton: true, background: '#09090b', color: '#fff' }).then(r => {
      if (r.isConfirmed) saveData(categories, items.filter(x => x.id !== id));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Gift className="w-6 h-6 text-indigo-400" />
          ระบบหมวดหมู่ / เนื้อหา
        </h2>
        <div className="flex bg-[#0B0D0F] border border-white/10 rounded-xl p-1">
          <button onClick={() => setActiveTab('categories')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'categories' ? 'bg-[#050505]/10 text-white' : 'text-zinc-500 hover:text-white'}`}>หมวดหมู่</button>
          <button onClick={() => setActiveTab('items')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'items' ? 'bg-[#050505]/10 text-white' : 'text-zinc-500 hover:text-white'}`}>เนื้อหา / ไฟล์</button>
        </div>
      </div>

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!isAddingCategory && <button onClick={() => setIsAddingCategory(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> เพิ่มหมวดหมู่</button>}
          </div>

          {isAddingCategory && (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">สร้างหมวดหมู่ใหม่</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">ชื่อหมวดหมู่</label>
                  <input value={catName} onChange={e=>setCatName(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white" placeholder="เช่น VIP PH LOG" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">ชื่อย่อย (Subtitle)</label>
                  <input value={catSubtitle} onChange={e=>setCatSubtitle(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white" placeholder="คำอธิบาย..." />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="isVipCheck" checked={catIsVip} onChange={e=>setCatIsVip(e.target.checked)} className="w-4 h-4 rounded border-white/10" />
                  <label htmlFor="isVipCheck" className="text-sm text-amber-400 font-bold">VIP หมวดหมู่</label>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <input type="checkbox" id="isVisibleCheck" checked={catIsVisible} onChange={e=>setCatIsVisible(e.target.checked)} className="w-4 h-4 rounded border-white/10" />
                  <label htmlFor="isVisibleCheck" className="text-sm text-blue-600 font-bold">เปิดใช้งาน</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsAddingCategory(false)} className="px-4 py-2 text-sm text-zinc-400 font-bold hover:text-white">ยกเลิก</button>
                <button onClick={handleSaveCategory} className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Check className="w-4 h-4"/> บันทึก</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((c) => (
              <div key={c.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-black text-white">{c.name}</h3>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleCategoryVisibility(c.id)} className={`px-2 py-1 flex items-center text-xs font-bold rounded-full ${c.isVisible ? 'bg-blue-600/20 text-blue-600' : 'bg-[#121212] text-zinc-500'}`}>
                      {c.isVisible ? 'ON' : 'OFF'}
                    </button>
                    <button onClick={() => handleDeleteCategory(c.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400">{c.subtitle}</p>
                {c.isVip && <span className="inline-block mt-2 text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase">VIP</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {!isAddingItem && <button onClick={() => setIsAddingItem(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus className="w-4 h-4"/> เพิ่มเนื้อหา</button>}
          </div>

          {isAddingItem && (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">สร้างเนื้อหาใหม่</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">หัวข้อ</label>
                  <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white" placeholder="อักษรสวยๆ..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">หมวดหมู่</label>
                  <select value={itemCategoryId} onChange={e=>setItemCategoryId(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white">
                    <option value="">-- เลือกหมวดหมู่ --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">สิทธิ์การโหลด (ฟรี / พรีเมียม)</label>
                  <select value={itemType} onChange={e=>setItemType(e.target.value as any)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white">
                    <option value="free">ของฟรี (ทุกคนโหลดได้)</option>
                    <option value="premium">พรีเมียม (เฉพาะวีไอพีโหลดได้)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-1">Keyword (ป้ายกำกับ)</label>
                  <input value={keyword} onChange={e=>setKeyword(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2 text-white" placeholder="เช่น ฟ้อนต์, รูปภาพ" />
                </div>
              </div>

              <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 mb-4">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">ไฟล์แนบ / เนื้อหา</h4>
                {attachments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {attachments.map((a, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#0a0a0a] border border-white/10 rounded-lg p-2 px-3">
                        <div className="flex items-center gap-3 truncate text-sm text-zinc-300">
                          {a.type === 'text' && <FileText className="w-4 h-4 text-blue-600"/>}
                          {a.type === 'image' && <ImageIcon className="w-4 h-4 text-sky-400"/>}
                          {a.type === 'file' && <Download className="w-4 h-4 text-amber-400"/>}
                          <span className="truncate max-w-[200px]">{a.data}</span>
                        </div>
                        <button onClick={() => setAttachments(attachments.filter((_, idx)=>idx!==i))} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                  <select value={attType} onChange={e=>setAttType(e.target.value as any)} className="bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-white text-sm">
                    <option value="text">ข้อความ/สคริปต์</option>
                    <option value="image">รูปภาพ (URL)</option>
                    <option value="file">ลิ้งค์ดาวน์โหลด</option>
                  </select>
                  <input value={attData} onChange={e=>setAttData(e.target.value)} className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-3 py-2 text-white sm:text-sm" placeholder={attType === 'text' ? "วางข้อความที่นี่..." : "วางลิ้งค์ URL"} />
                  <button onClick={() => { if(attData) { setAttachments([...attachments, {type: attType, data: attData}]); setAttData(''); } }} className="bg-[#121212] hover:bg-[#1e1e1e] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1"><Plus className="w-4 h-4"/> แอดไฟล์</button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setIsAddingItem(false)} className="px-4 py-2 text-sm text-zinc-400 font-bold hover:text-white">ยกเลิก</button>
                <button onClick={handleSaveItem} className="bg-blue-700 hover:bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Check className="w-4 h-4"/> บันทึกเนื้อหา</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const cat = categories.find(c => c.id === item.categoryId);
              return (
              <div key={item.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold bg-[#2563EB]/20 text-[#2563EB] px-2 py-0.5 rounded-full uppercase">{cat?.name || 'ไม่ระบุ'}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.type === 'premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-600/20 text-blue-600'}`}>
                      {item.type === 'premium' ? 'Premium' : 'Free'}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 hover:text-red-400 bg-red-500/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4"/></button>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <div className="bg-[#0a0a0a] rounded-xl border border-white/10 p-3 space-y-2 max-h-32 overflow-y-auto mt-2">
                  {(item.attachments || [(item as any)]).map((att: any, i: number) => (
                    <div key={i} className="text-xs text-zinc-400 truncate border-b border-white/10 pb-2 last:border-0 last:pb-0">
                      <span className="font-bold text-zinc-300 mr-2 uppercase">{att.type}:</span>{att.data}
                    </div>
                  ))}
                </div>
              </div>
            )})}
            {items.length === 0 && <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-white/10 rounded-xl">ยังไม่มีเนื้อหา</div>}
          </div>
        </div>
      )}
    </div>
  );
};

