import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Plus, Trash2, Edit, Save, X, Image as ImageIcon, ShoppingCart, Check, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { Category, Product } from '../types';

interface AdminCategoriesManagementProps {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  products?: Product[];
  setProducts?: (products: Product[]) => void;
}

export const AdminCategoriesManagement: React.FC<AdminCategoriesManagementProps> = ({ categories, setCategories, products = [], setProducts }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Category>>({
    name: '', title: '', subtitle: '', bannerUrl: ''
  });

  const [managingProductsForCategory, setManagingProductsForCategory] = useState<Category | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isUpdatingProducts, setIsUpdatingProducts] = useState(false);

  useEffect(() => {
    if (managingProductsForCategory) {
      const initialIds = products.filter(p => p.category === managingProductsForCategory.id || p.category === managingProductsForCategory.name || p.category === managingProductsForCategory.title).map(p => p.id);
      setSelectedProductIds(new Set(initialIds));
    }
  }, [managingProductsForCategory, products]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const saveCategoryProducts = async () => {
    if (!managingProductsForCategory || !setProducts) return;
    
    setIsUpdatingProducts(true);
    try {
      const oldProductIdList = products.filter(p => p.category === managingProductsForCategory.id || p.category === managingProductsForCategory.name || p.category === managingProductsForCategory.title).map(p => p.id);
      const oldProductIds = new Set(oldProductIdList);
      
      const idsToAddCategory = Array.from(selectedProductIds).filter(id => !oldProductIds.has(id));
      const idsToRemoveCategory = oldProductIdList.filter(id => !selectedProductIds.has(id));
      
      const updatedProducts = [...products];

      // Execute updates concurrently in small batches to preserve performance
      const updatePromises = [];

      for (const id of idsToAddCategory) {
          updatePromises.push(
            axios.put(`/api/products/${id}`, { category: managingProductsForCategory.id }).then(() => {
              const pIndex = updatedProducts.findIndex(p => p.id === id);
              if(pIndex > -1) updatedProducts[pIndex] = { ...updatedProducts[pIndex], category: managingProductsForCategory.id };
            })
          );
      }
      for (const id of idsToRemoveCategory) {
          updatePromises.push(
            axios.put(`/api/products/${id}`, { category: '' }).then(() => {
              const pIndex = updatedProducts.findIndex(p => p.id === id);
              if(pIndex > -1) updatedProducts[pIndex] = { ...updatedProducts[pIndex], category: '' };
            })
          );
      }
      
      await Promise.all(updatePromises);
      
      setProducts(updatedProducts);
      Swal.fire('สำเร็จ', 'อัปเดตสินค้าในหมวดหมู่เรียบร้อย', 'success');
      setManagingProductsForCategory(null);
    } catch (err) {
      console.error(err);
      Swal.fire('ข้อผิดพลาด', 'ไม่สามารถอัปเดตข้อมูลสินค้าได้', 'error');
    } finally {
      setIsUpdatingProducts(false);
    }
  };

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
          <Package className="w-5 h-5 text-[#2563EB]" />
          จัดการหมวดหมู่สินค้า
        </h2>
        <button 
          onClick={() => { setIsAdding(true); setFormData({ name: '', title: '', subtitle: '', bannerUrl: '' }); }}
          className="bg-purple-600 hover:bg-[#1D4ED8] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> เพิ่มหมวดหมู่
        </button>
      </div>

      {(isAdding || editingCategory) && (
        <div className="bg-[#0B0D0F] border rounded-xl overflow-hidden mb-8 shadow-lg transition-all">
          <div className="bg-[#121417]/50 p-6 sm:p-8 flex items-center justify-between border-b border-white/5">
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                {editingCategory ? 'แก้ไขหมวดหมู่สินค้า' : 'สร้างหมวดหมู่ใหม่'}
              </h3>
              <p className="text-sm font-medium text-zinc-500 mt-1">
                {editingCategory ? 'แก้ไขรายละเอียดหมวดหมู่ที่นี่' : 'เพิ่มรายละเอียดหมวดหมู่สินค้าใหม่ลงในระบบ'}
              </p>
            </div>
            <div className="p-3 bg-[#0B0D0F] shadow-sm border border-white/5 rounded-2xl">
              {editingCategory ? <Edit className="w-6 h-6 text-blue-500" /> : <Package className="w-6 h-6 text-[#2563EB]" />}
            </div>
          </div>
          
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-1">
                <div className="group">
                  <label className="block text-sm font-bold text-zinc-700 mb-2 group-focus-within:text-[#2563EB] transition-colors">
                    ชื่ออ้างอิงของระบบ <span className="text-[#2563EB]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-[#121417] focus:bg-[#0B0D0F] border border-white/10 focus:border-[#3B82F6]/40 focus:ring-4 focus:ring-[#3B82F6]/30 rounded-2xl px-4 py-3 text-sm font-medium transition-all" 
                    placeholder="เช่น game_accounts (อักษรภาษาอังกฤษ)" 
                  />
                  <p className="text-xs text-zinc-400 mt-2 ml-1">สำหรับใช้ในระบบ โปรดใช้ภาษาอังกฤษ</p>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-bold text-zinc-700 mb-2 group-focus-within:text-[#2563EB] transition-colors">
                    ชื่อหมวดหมู่ที่แสดง <span className="text-[#2563EB]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full bg-[#121417] focus:bg-[#0B0D0F] border border-white/10 focus:border-[#3B82F6]/40 focus:ring-4 focus:ring-[#3B82F6]/30 rounded-2xl px-4 py-3 text-sm font-medium transition-all" 
                    placeholder="เช่น บัญชีเกม" 
                  />
                  <p className="text-xs text-zinc-400 mt-2 ml-1">ชื่อหมวดหมู่ที่จะแสดงให้ผู้ใช้งานเห็น</p>
                </div>
              </div>

              <div className="space-y-4 md:col-span-1 flex flex-col">
                <div className="group flex-1">
                  <label className="block text-sm font-bold text-zinc-700 mb-2 group-focus-within:text-[#2563EB] transition-colors">
                    รายละเอียดหมวดหมู่ (ถ้ามี)
                  </label>
                  <textarea 
                    value={formData.subtitle || ''} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                    className="w-full h-[124px] bg-[#121417] focus:bg-[#0B0D0F] border border-white/10 focus:border-[#3B82F6]/40 focus:ring-4 focus:ring-[#3B82F6]/30 rounded-2xl px-4 py-3 text-sm font-medium transition-all resize-none" 
                    placeholder="เขียนอธิบายเกี่ยวกับสินค้านี้..." 
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-white/5">
                <label className="block text-sm font-bold text-zinc-700 mb-3">รูปภาพหน้าปกหมวดหมู่</label>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-zinc-400 group-focus-within:text-[#2563EB] transition-colors" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.bannerUrl || ''} 
                        onChange={e => setFormData({...formData, bannerUrl: e.target.value})} 
                        className="w-full bg-[#121417] focus:bg-[#0B0D0F] border border-white/10 focus:border-[#3B82F6]/40 focus:ring-4 focus:ring-[#3B82F6]/30 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium transition-all" 
                        placeholder="https://example.com/banner.jpg" 
                      />
                    </div>
                    <p className="text-xs text-zinc-500">
                      แนะนำให้ใช้รูปภาพสัดส่วนแนวนอน (16:9) เพื่อการแสดงผลที่ดีที่สุด
                    </p>
                  </div>
                  
                  {formData.bannerUrl ? (
                    <div className="w-full md:w-64 h-32 rounded-2xl overflow-hidden border border-white/10 shadow-sm relative group bg-[#121820] shrink-0">
                      <img loading="lazy" src={formData.bannerUrl || undefined} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-bold text-center px-4 drop-shadow-md">พรีวิวรูปภาพหน้าปก</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-64 h-32 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-400 shrink-0 bg-[#121417]/50">
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">ยังไม่มีรูปภาพ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-6 mb-2 border-t border-white/5">
              <button onClick={() => { setIsAdding(false); setEditingCategory(null); }} className="px-6 py-3 rounded-2xl font-bold bg-[#0B0D0F] border border-white/10 text-zinc-400 hover:bg-[#121417] hover:text-white transition-colors shadow-sm">
                ยกเลิก
              </button>
              <button onClick={saveCategory} className="px-6 py-3 rounded-2xl font-bold bg-purple-600 text-white hover:bg-[#1D4ED8] hover:shadow-lg hover:shadow-lg/20 flex items-center gap-2 transition-all active:scale-95">
                <Save className="w-5 h-5"/> {editingCategory ? 'อัปเดตหมวดหมู่' : 'สร้างหมวดหมู่'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0B0D0F] border text-sm border-white/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#121417] border-b border-white/10 text-zinc-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-5 font-black whitespace-nowrap">แบนเนอร์</th>
                <th className="px-6 py-5 font-black whitespace-nowrap">ข้อมูลหมวดหมู่</th>
                <th className="px-6 py-5 font-black whitespace-nowrap">รายละเอียดเพิ่มเติม</th>
                <th className="px-6 py-5 font-black text-right whitespace-nowrap">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#121417]/80 transition-colors group">
                  <td className="px-6 py-4">
                    {c.bannerUrl ? (
                      <div className="w-24 h-14 rounded-xl overflow-hidden relative shadow-sm border border-white/10 group-hover:border-[#3B82F6]/30 transition-colors">
                        <img loading="lazy" src={c.bannerUrl || undefined} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="w-24 h-14 bg-[#121820] rounded-xl flex flex-col items-center justify-center text-zinc-400 border border-white/10 border-dashed">
                        <ImageIcon className="w-4 h-4 mb-1 opacity-50" />
                        <span className="text-[10px] font-bold uppercase">ไม่มีรูป</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-black text-white text-base">{c.title}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#121820] text-zinc-500 font-mono">
                          {c.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-500 text-sm max-w-[250px] truncate" title={c.subtitle}>
                      {c.subtitle || <span className="text-zinc-300 italic">ไม่ได้ระบุรายละเอียด</span>}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setManagingProductsForCategory(c)} className="p-2 border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-xl transition-colors shadow-sm flex items-center gap-2 px-3" title="เพิ่ม/จัดการสินค้าในหมวดหมู่นี้">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-xs font-bold hidden sm:inline">จัดการสินค้า</span>
                      </button>
                      <button onClick={() => { setEditingCategory(c); setFormData(c); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="p-2 border border-[#3B82F6]/30 bg-purple-600/10 text-white hover:bg-purple-600 hover:text-white rounded-xl transition-colors shadow-sm" title="แก้ไข">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCategory(c.id)} className="p-2 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors shadow-sm" title="ลบ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-400">
                      <Package className="w-12 h-12 mb-3 opacity-20" />
                      <p className="font-bold text-zinc-500">ยังไม่มีข้อมูลหมวดหมู่สินค้าในระบบ</p>
                      <p className="text-sm mt-1">คลิกปุ่ม "เพิ่มหมวดหมู่" เพื่อเริ่มต้นสร้างหมวดหมู่แรกของคุณ</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {managingProductsForCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end p-0 z-50">
          <div className="bg-[#0B0D0F] border-l border-white/5 w-full max-w-2xl h-full shadow-2xl relative p-6 sm:p-8 flex flex-col overflow-y-auto animate-in slide-in-from-right-full duration-300">
            <button 
              onClick={() => setManagingProductsForCategory(null)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 shrink-0">
              <ShoppingCart className="w-5 h-5 text-purple-400" />
              จัดการสินค้าในหมวดหมู่
            </h2>
            <p className="text-sm font-medium text-zinc-500 mb-6 shrink-0">
              เลือกสินค้าที่คุณต้องการให้แสดงในหมวดหมู่ <span className="text-purple-400 font-bold">{managingProductsForCategory.title}</span>
            </p>

            <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-2">
              {products.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Package className="w-12 h-12 mb-3 opacity-20 mx-auto" />
                  <p className="font-bold">ยังไม่มีสินค้าในระบบ</p>
                  <p className="text-sm mt-1">กรุณาเพิ่มสินค้าก่อนจัดการหมวดหมู่</p>
                </div>
              ) : (
                products.map((p) => {
                  const isChecked = selectedProductIds.has(p.id);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => toggleProductSelection(p.id)}
                      className={`flex items-center gap-4 p-3 rounded-2xl border cursor-pointer transition-colors ${
                        isChecked ? 'bg-purple-500/10 border-purple-500/30' : 'bg-zinc-900/50 border-white/5 hover:bg-zinc-900 hover:border-white/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                        isChecked ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-950 border-zinc-800'
                      }`}>
                        {isChecked && <Check className="w-4 h-4" />}
                      </div>
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                         {p.imageUrl ? (
                            <img loading="lazy" src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                         )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500 truncate">฿{p.price}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 shrink-0">
              <button 
                onClick={() => setManagingProductsForCategory(null)} 
                className="px-6 py-3 rounded-xl font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={saveCategoryProducts} 
                disabled={isUpdatingProducts}
                className="px-6 py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-500 flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isUpdatingProducts ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                บันทึกสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
