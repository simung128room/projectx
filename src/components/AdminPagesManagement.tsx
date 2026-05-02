import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface AdminPagesManagementProps {
  customPages: any[];
  setCustomPages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const AdminPagesManagement: React.FC<AdminPagesManagementProps> = ({ customPages, setCustomPages }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  });

  const handleCreateNew = () => {
    setFormData({ title: '', slug: '', content: '' });
    setEditingPage(null);
    setIsEditing(true);
  };

  const handleEdit = (page: any) => {
    setFormData({ title: page.title, slug: page.slug, content: page.content });
    setEditingPage(page);
    setIsEditing(true);
  };

  const handleDelete = (page: any) => {
    Swal.fire({
      title: 'ลบหน้าเพจ',
      text: `คุณต้องการลบหน้าเพจ ${page.title} ใช่หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/pages/${page.id}`);
          setCustomPages(prev => prev.filter(p => p.id !== page.id));
          Swal.fire('ลบสำเร็จ', '', 'success');
        } catch (err) {
          Swal.fire('Error', 'ไม่สามารถลบได้', 'error');
        }
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      Swal.fire('Error', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
      return;
    }

    try {
      if (editingPage) {
        const res = await axios.put(`/api/pages/${editingPage.id}`, formData);
        setCustomPages(prev => prev.map(p => p.id === editingPage.id ? res.data : p));
        Swal.fire('อัพเดตสำเร็จ', '', 'success');
      } else {
        const res = await axios.post('/api/pages', formData);
        setCustomPages(prev => [...prev, res.data]);
        Swal.fire('สร้างสำเร็จ', '', 'success');
      }
      setIsEditing(false);
    } catch (err) {
      Swal.fire('Error', 'เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8">
        <h3 className="font-black text-xl mb-6">{editingPage ? 'แก้ไขหน้าเพจ' : 'สร้างหน้าเพจใหม่'}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block font-bold text-sm mb-2 text-zinc-900">ชื่อหน้าเพจ (Title)</label>
            <input 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-colors"
              placeholder="e.g. Terms of Service, About Us"
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-2 text-zinc-900">Slug (URL endpoint)</label>
            <input 
              type="text" 
              value={formData.slug}
              onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
              className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-colors"
              placeholder="e.g. terms, about"
            />
          </div>
          <div>
            <label className="block font-bold text-sm mb-2 text-zinc-900">เนื้อหา (Markdown supported)</label>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-zinc-50 border-2 border-zinc-200 rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none transition-colors h-64 font-mono"
              placeholder="Write markdown here..."
            />
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 font-bold text-sm rounded-xl border border-zinc-200 hover:bg-zinc-50"
            >
              ยกเลิก
            </button>
            <button 
              type="submit"
              className="px-6 py-3 font-bold text-sm rounded-xl bg-red-600 text-white hover:bg-red-700"
            >
              บันทึก
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900">Sub Pages / จัดการหน้าเพจย่อย</h2>
          <p className="text-sm text-zinc-500 mt-1">สร้างหน้าเพจต่างๆ เช่น กฎข้อบังคับ, ช่องทางติดต่อ, ข้อมูลเว็บไซต์</p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 font-bold text-sm rounded-xl shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> สร้างหน้าเพจใหม่
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
        {customPages.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium">
            ยังไม่มีหน้าเพจ ข้อมูลที่คุณสร้างจะมาที่นี่
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {customPages.map(page => (
              <div key={page.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{page.title}</h4>
                    <p className="text-xs text-zinc-500">Slug: /{page.slug}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(page)} className="p-2 text-zinc-500 hover:text-red-600 bg-white rounded-xl border border-zinc-200 shadow-sm transition-all"><Edit className="w-4 h-4"/></button>
                  <button onClick={() => handleDelete(page)} className="p-2 text-zinc-500 hover:text-red-600 bg-white rounded-xl border border-zinc-200 shadow-sm transition-all"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
