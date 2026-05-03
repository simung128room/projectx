import React, { useState } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Edit, Save, X, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { Category } from '../types';

interface AdminCategoriesManagementProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
}

export const AdminCategoriesManagement: React.FC<AdminCategoriesManagementProps> = ({ categories, setCategories }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', title: '', subtitle: '', bannerUrl: ''
  });

  const saveCategory = async () => {
    if (!formData.name || !formData.title) {
      Swal.fire('Error', 'กรุณากรอกชื่ออ้างอิงและหัวข้อหลัก', 'error');
      return;
    }
    
    try {
      if (editingCategory) {
        const res = await axios.put(`/api/categories/${editingCategory.id}`, formData);
        setCategories(categories.map(c => c.id === editingCategory.id ? res.data : c));
        setEditingCategory(null);
      } else {
        const res = await axios.post('/api/categories', formData);
        setCategories([res.data, ...categories]);
        setIsAdding(false);
      }
      setFormData({ name: '', title: '', subtitle: '', bannerUrl: '' });
      Swal.fire('สำเร็จ', 'บันทึกหมวดหมู่เรียบร้อย', 'success');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'ไม่สามารถบันทึกได้', 'error');
    }
  };

  const deleteCategory = async (id: string) => {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#dc2626'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/categories/${id}`);
          setCategories(categories.filter(c => c.id !== id));
        } catch (err) {
          Swal.fire('Error', 'ไม่สามารถลบหมวดหมู่ได้', 'error');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Package className="w-5 h-5 text-red-500" />
          จัดการหมวดหมู่สินค้า
        </h2>
        <button 
          onClick={() => { setIsAdding(true); setFormData({ name: '', title: '', subtitle: '', bannerUrl: '' }); }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
        </button>
      </div>

      {(isAdding || editingCategory) && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-bold mb-4">{editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">ชื่ออ้างอิง (หมวดหมู่สินค้า)</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2" placeholder="เช่น game_accounts" />
            </div>
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-2">หัวข้อหลัก</label>
              <input type="text" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2" placeholder="เช่น หมวดหมู่ บัญชีเกม" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-700 mb-2">หัวข้อรอง</label>
              <input type="text" value={formData.subtitle || ''} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2" placeholder="รายละเอียดหมวดหมู่..." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-zinc-700 mb-2">ลิงก์แบนเนอร์ (รูปภาพประกอบ)</label>
              <div className="flex items-center gap-3">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
                <input type="text" value={formData.bannerUrl || ''} onChange={e => setFormData({...formData, bannerUrl: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2" placeholder="https://..." />
              </div>
              {formData.bannerUrl && (
                <div className="mt-3 w-64 rounded-xl overflow-hidden shadow-sm">
                  <img src={formData.bannerUrl || undefined} alt="Preview" className="w-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="px-4 py-2 rounded-xl font-bold bg-zinc-100 text-zinc-600 hover:bg-zinc-200">ยกเลิก</button>
            <button onClick={saveCategory} className="px-4 py-2 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"><Save className="w-4 h-4"/> บันทึก</button>
          </div>
        </div>
      )}

      <div className="bg-white border text-sm border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-6 py-4 font-bold">แบนเนอร์</th>
              <th className="px-6 py-4 font-bold">ชื่ออ้างอิง / หัวข้อหลัก</th>
              <th className="px-6 py-4 font-bold">หัวข้อรอง</th>
              <th className="px-6 py-4 font-bold text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-50">
                <td className="px-6 py-3">
                  {c.bannerUrl ? <img src={c.bannerUrl || undefined} alt="" className="w-16 h-8 object-cover rounded shadow-sm" /> : <div className="w-16 h-8 bg-zinc-100 rounded flex items-center justify-center text-xs">ไม่มีรูป</div>}
                </td>
                <td className="px-6 py-3">
                  <div className="font-bold text-zinc-900">{c.name}</div>
                  <div className="text-zinc-500 text-xs">{c.title}</div>
                </td>
                <td className="px-6 py-3 text-zinc-500">{c.subtitle || '-'}</td>
                <td className="px-6 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setEditingCategory(c); setFormData(c); setIsAdding(false); }} className="p-2 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => deleteCategory(c.id)} className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
