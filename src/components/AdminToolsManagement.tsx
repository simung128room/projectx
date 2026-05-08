import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, Calendar, FileText, Image as ImageIcon, Download, Check, X } from 'lucide-react';
import Swal from 'sweetalert2';
export interface ContentItem {
  id: string;
  type: 'free' | 'premium';
  title: string;
  keyword?: string;
  body?: string;
  attachments?: any[];
  links?: string[];
  unlockAt?: string;
  createdAt?: string;
}

export const AdminToolsManagement = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  
  const [title, setTitle] = useState('');
  const [keyword, setKeyword] = useState('');
  const [itemType, setItemType] = useState<'free' | 'premium'>('free');
  const [unlockAtDate, setUnlockAtDate] = useState('');
  const [unlockAtTime, setUnlockAtTime] = useState('');
  
  const [attachments, setAttachments] = useState<{type: 'text'|'image'|'file', data: string}[]>([]);
  
  const [attType, setAttType] = useState<'text'|'image'|'file'>('text');
  const [attData, setAttData] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('apex_contents');
    if (saved) {
      try { setItems(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleSave = () => {
    if (!title) return Swal.fire({title:'กรอกข้อมูลให้ครบ', icon:'error', background:'#09090b', color:'#fff'});
    if (attachments.length === 0) return Swal.fire({title:'ต้องมีอย่างน้อย 1 ไฟล์/เนื้อหา', icon:'error', background:'#09090b', color:'#fff'});
    
    let unlockAt: string | undefined = undefined;
    if (unlockAtDate && unlockAtTime) {
      unlockAt = new Date(`${unlockAtDate}T${unlockAtTime}`).toISOString();
    }

    const newItem: ContentItem = {
      id: Math.random().toString(36).substring(2,9),
      type: itemType,
      title,
      keyword,
      attachments,
      unlockAt,
      createdAt: new Date().toISOString()
    };

    const newItems = [newItem, ...items];
    setItems(newItems);
    localStorage.setItem('apex_contents', JSON.stringify(newItems));
    
    // reset
    setIsAdding(false);
    setTitle('');
    setKeyword('');
    setUnlockAtDate('');
    setUnlockAtTime('');
    setAttachments([]);
    setAttData('');
    
    Swal.fire({title: 'บันทึกสำเร็จ!', icon: 'success', timer: 1500, showConfirmButton: false, background:'#09090b', color:'#fff'});
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      showCancelButton: true,
      background: '#09090b', color: '#fff'
    }).then(r => {
      if (r.isConfirmed) {
        const newItems = items.filter(x => x.id !== id);
        setItems(newItems);
        localStorage.setItem('apex_contents', JSON.stringify(newItems));
      }
    });
  };

  const handleAddAttachment = () => {
    if (!attData) return;
    setAttachments([...attachments, { type: attType, data: attData }]);
    setAttData('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Gift className="w-6 h-6 text-indigo-400" />
          ระบบเครื่องมือ / จัดการทรัพยากร (ของฟรี & พรีเมียม)
        </h2>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
            <Plus className="w-4 h-4"/> เพิ่มเนื้อหาใหม่
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">สร้างเนื้อหาใหม่</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">หัวข้อ</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" placeholder="อักษรสวยๆ..." />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">หมวดหมู่ (ฟรี / พรีเมียม)</label>
              <select value={itemType} onChange={e=>setItemType(e.target.value as any)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white">
                <option value="free">ของฟรี (ทุกคนโหลดได้)</option>
                <option value="premium">พรีเมียม (เฉพาะวีไอพีโหลดได้)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-1">Keyword (ป้ายกำกับ)</label>
              <input value={keyword} onChange={e=>setKeyword(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" placeholder="เช่น ฟ้อนต์, รูปภาพ" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-bold text-blue-400 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> วันที่จะเปิดให้โหลด (ทิ้งว่างเพื่อเปิดทันที)</label>
                <input type="date" value={unlockAtDate} onChange={e=>setUnlockAtDate(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="w-1/3">
                <label className="block text-xs font-bold text-zinc-400 flex items-center gap-1 mb-1">&nbsp;</label>
                <input type="time" value={unlockAtTime} onChange={e=>setUnlockAtTime(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 mb-4">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">ไฟล์แนบ / เนื้อหา</h4>
            
            {attachments.length > 0 && (
              <div className="space-y-2 mb-4">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg p-2 px-3">
                    <div className="flex items-center gap-3 truncate text-sm text-zinc-300">
                      {a.type === 'text' && <FileText className="w-4 h-4 text-emerald-400"/>}
                      {a.type === 'image' && <ImageIcon className="w-4 h-4 text-sky-400"/>}
                      {a.type === 'file' && <Download className="w-4 h-4 text-amber-400"/>}
                      <span className="truncate max-w-[200px]">{a.data}</span>
                    </div>
                    <button onClick={() => setAttachments(attachments.filter((_, idx)=>idx!==i))} className="text-[#1a7fe6] hover:text-[#1E90FF]">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <select value={attType} onChange={e=>setAttType(e.target.value as any)} className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white text-sm">
                <option value="text">ข้อความ/สคริปต์</option>
                <option value="image">รููปภาพ (URL)</option>
                <option value="file">ลิ้งค์ดาวน์โหลดไฟล์</option>
              </select>
              <input value={attData} onChange={e=>setAttData(e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white sm:text-sm" placeholder={attType === 'text' ? "วางข้อความที่นี่..." : "วางลิ้งค์ URL"} />
              <button onClick={handleAddAttachment} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-1 justify-center whitespace-nowrap">
                <Plus className="w-4 h-4"/> แอดไฟล์
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-zinc-400 font-bold hover:text-white">ยกเลิก</button>
            <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Check className="w-4 h-4"/> บันทึกเนื้อหา
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${item.type === 'premium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {item.type === 'premium' ? 'Premium' : 'Free'}
                </span>
                <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                  แนบ {item.attachments?.length || 1} ไฟล์
                </span>
              </div>
              <button onClick={() => handleDelete(item.id)} className="text-[#1a7fe6] hover:text-[#1E90FF] bg-[#1a7fe6]/10 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
            
            {item.unlockAt && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2 flex flex-col items-center">
                <span className="text-xs text-blue-400">กำหนดเปิดให้ใช้งาน:</span>
                <span className="text-sm font-bold text-blue-300">{new Date(item.unlockAt).toLocaleString('th-TH')}</span>
                {new Date(item.unlockAt) > new Date() ? (
                  <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded mt-1">ล็อคอยู่</span>
                ) : (
                  <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded mt-1">เปิดใช้งานแล้ว</span>
                )}
              </div>
            )}
            
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-3 space-y-2 max-h-32 overflow-y-auto mt-2">
              {(item.attachments || [(item as any)]).map((att: any, i: number) => (
                <div key={i} className="text-xs text-zinc-400 truncate border-b border-zinc-800 pb-2 last:border-0 last:pb-0">
                  <span className="font-bold text-zinc-300 mr-2 uppercase">{(att.type || att.contentType)}:</span>
                  {(att.data || att.content)}
                </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl">
            ยังไม่มีเนื้อหา
          </div>
        )}
      </div>
    </div>
  );
};
