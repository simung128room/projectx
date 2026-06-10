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

      await axios.put('/api/products/bulk/category', {
        idsToAdd: idsToAddCategory,
        idsToRemove: idsToRemoveCategory,
        categoryId: managingProductsForCategory.id
      });
      
      // Update local state safely
      for (const id of idsToAddCategory) {
        const pIndex = updatedProducts.findIndex(p => p.id === id);
        if(pIndex > -1) updatedProducts[pIndex] = { ...updatedProducts[pIndex], category: managingProductsForCategory.id };
      }
      for (const id of idsToRemoveCategory) {
        const pIndex = updatedProducts.findIndex(p => p.id === id);
        if(pIndex > -1) updatedProducts[pIndex] = { ...updatedProducts[pIndex], category: '' };
      }
      
      setProducts(updatedProducts);
      Swal.fire({ title: '', text: '', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#3B82F6' });
      setManagingProductsForCategory(null);
    } catch (err) {
      console.error(err);
      Swal.fire({ title: '', text: '', icon: 'error', background: '#09090b', color: '#fff', confirmButtonColor: '#EF4444' });
    } finally {
      setIsUpdatingProducts(false);
    }
  };

  const saveCategory = async () => {
    if (!formData.name || !formData.title) {
      Swal.fire({ title: '', text: '', icon: 'error', background: '#09090b', color: '#fff', confirmButtonColor: '#EF4444' });
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
      Swal.fire({ title: '', text: '', icon: 'success', background: '#09090b', color: '#fff', confirmButtonColor: '#3B82F6' });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: '', icon: 'error', background: '#09090b', color: '#fff', confirmButtonColor: '#EF4444' });
    }
  };

  const deleteCategory = async (id: string) => {
    Swal.fire({
      title: '',
      text: '',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '',
      cancelButtonText: '',
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#71717a',
      background: '#09090b',
      color: '#fff'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/categories/${id}`);
          setCategories(categories.filter(c => c.id !== id));
          Swal.fire({ title: '', text: '', icon: 'success', background: '#09090b', color: '#fff', timer: 1000, showConfirmButton: false });
        } catch (err) {
          Swal.fire({ title: 'Error', text: '', icon: 'error', background: '#09090b', color: '#fff' });
        }
      }
    });
  };

  return (<div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#3B82F6]" />
            </h2>
          <p className="text-xs text-zinc-500 mt-0.5"></p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setFormData({ name: '', title: '', subtitle: '', bannerUrl: '' }); }}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-2 px-4 text-xs transition-colors flex items-center gap-2 rounded-md shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
        >
          <Plus className="w-4 h-4" /> </button>
      </div>

      {(isAdding || editingCategory) && (
        <div className="bg-[#0B0C0E] border border-zinc-800 rounded-lg overflow-hidden mb-8 transition-all duration-200 shadow-xl">
          <div className="bg-zinc-950 p-6 flex items-center justify-between border-b border-zinc-850">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {editingCategory ? '' : ''}</h3>
              <p className="text-xs text-zinc-500 mt-1">
                {editingCategory ? '' : ''}</p>
            </div>
            <div className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-md">
              {editingCategory ? <Edit className="w-5 h-5 text-amber-500" /> : <Package className="w-5 h-5 text-[#3B82F6]" />}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5 md:col-span-1">
                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">
                    (English )<span className="text-[#3B82F6]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors" 
                    placeholder=" game_accounts" 
                  /><p className="text-[10px] text-zinc-500 mt-1.5 ml-1"></p>
                </div>
                
                <div className="group">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">
                    <span className="text-[#3B82F6]">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors" 
                    placeholder=" " 
                  /><p className="text-[10px] text-zinc-500 mt-1.5 ml-1"></p>
                </div>
              </div>

              <div className="space-y-5 md:col-span-1 flex flex-col">
                <div className="group flex-1">
                  <label className="block text-xs font-bold text-zinc-400 mb-2">
                    ()</label>
                  <textarea 
                    value={formData.subtitle || ''} 
                    onChange={e => setFormData({...formData, subtitle: e.target.value})} 
                    className="w-full h-[122px] bg-zinc-950 border border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors resize-none" 
                    placeholder="  ..." 
                  /></div>
              </div>

              <div className="md:col-span-2 pt-4 border-t border-zinc-850">
                <label className="block text-xs font-bold text-zinc-400 mb-2">(URL)</label>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <ImageIcon className="h-4 w-4 text-zinc-500" />
                      </div>
                      <input 
                        type="text" 
                        value={formData.bannerUrl || ''} 
                        onChange={e => setFormData({...formData, bannerUrl: e.target.value})} 
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-[#3B82F6]/60 rounded-md pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none transition-colors" 
                        placeholder="https://example.com/banner.jpg" 
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      (16:9)</p>
                  </div>
                  
                  {formData.bannerUrl ? (
                    <div className="w-full md:w-56 h-28 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 shrink-0 relative group">
                      <img loading="lazy" src={formData.bannerUrl || undefined} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-[10px] font-bold"></p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-56 h-28 border border-dashed border-zinc-850 bg-zinc-950/20 rounded-md flex flex-col items-center justify-center text-zinc-600 shrink-0">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                      <span className="text-[10px] font-medium"></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 justify-end pt-5 border-t border-zinc-850">
              <button 
                onClick={() => { setIsAdding(false); setEditingCategory(null); }} 
                className="border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2 text-xs font-bold rounded-md transition-colors"
              ></button>
              <button 
                onClick={saveCategory} 
                className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-md transition-colors active:scale-95"
              >
                <Save className="w-4 h-4"/> {editingCategory ? '' : ''}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-zinc-400">
            <thead className="bg-[#0B0C0E] border-b border-zinc-800 text-zinc-500 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold whitespace-nowrap"></th>
                <th className="px-6 py-4 font-bold whitespace-nowrap"></th>
                <th className="px-6 py-4 font-bold whitespace-nowrap"></th>
                <th className="px-6 py-4 font-bold text-right whitespace-nowrap"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/10 transition-all group">
                  <td className="px-6 py-4">
                    {c.bannerUrl ? (
                      <div className="w-20 h-11 overflow-hidden rounded-md border border-zinc-850 group-hover:border-[#3B82F6]/40 transition-colors">
                        <img loading="lazy" src={c.bannerUrl || undefined} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="w-20 h-11 bg-zinc-950 flex flex-col items-center justify-center text-zinc-700 border border-dashed border-zinc-800 rounded-md">
                        <ImageIcon className="w-3.5 h-3.5 mb-0.5 opacity-40" />
                        <span className="text-[9px] font-bold"></span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm">{c.title}</span>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-zinc-950 text-zinc-500 font-mono border border-zinc-800/80 rounded">
                          {c.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-zinc-500 text-xs max-w-[240px] truncate" title={c.subtitle}>
                      {c.subtitle || <span className="text-zinc-600 italic"></span>}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setManagingProductsForCategory(c)} 
                        className="p-2 border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/60 rounded-md transition-all duration-150 flex items-center gap-1 px-3" 
                        title=""
                      ><ShoppingCart className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold"></span>
                      </button>
                      <button 
                        onClick={() => { setEditingCategory(c); setFormData(c); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                        className="p-2 border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/60 rounded-md transition-all duration-150" 
                        title=""
                      ><Edit className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deleteCategory(c.id)} 
                        className="p-2 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/60 rounded-md transition-all duration-150" 
                        title=""
                      ><Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Package className="w-10 h-10 mb-2 opacity-35" />
                      <p className="font-bold"></p>
                      <p className="text-xs text-zinc-650 mt-1">"" </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {managingProductsForCategory && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-end p-0 z-50">
          <div className="bg-zinc-950 border-l border-zinc-800 w-full max-w-xl h-full relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl">
            <button 
              onClick={() => setManagingProductsForCategory(null)}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col min-h-0 flex-1">
              <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                : {managingProductsForCategory.title}</h2>
              <p className="text-xs text-zinc-500 mb-6 font-medium">
                </p>

              <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-2 max-h-[calc(100vh-210px)]">
                {products.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600">
                    <Package className="w-10 h-10 mb-2 opacity-30 mx-auto" />
                    <p className="font-bold">items</p>
                    <p className="text-xs mt-1"></p>
                  </div>
                ) : (
                  products.map((p) => {
                    const isChecked = selectedProductIds.has(p.id);
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => toggleProductSelection(p.id)}
                        className={`flex items-center gap-3.5 p-3 rounded-lg border cursor-pointer transition-all ${ 
                          isChecked 
                            ? 'bg-emerald-500/5 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.05)]' 
                            : 'bg-zinc-900/30 border-zinc-900 hover:bg-zinc-900/60 hover:border-zinc-800' 
                        }`}
                      >
                        <div className={`w-5 h-5 flex items-center justify-center shrink-0 rounded border transition-colors ${ 
                          isChecked 
                            ? 'bg-emerald-500 border-emerald-400 text-black' 
                            : 'bg-zinc-950 border-zinc-800' 
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="w-11 h-11 bg-zinc-900 rounded-md overflow-hidden shrink-0 border border-zinc-850">
                           {p.imageUrl ? (
                              <img loading="lazy" src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                           )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-xs truncate">{p.name}</p>
                          <p className="text-[10px] text-emerald-400 font-bold font-mono tracking-wide mt-0.5">{(p.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t border-zinc-900 shrink-0">
              <button 
                onClick={() => setManagingProductsForCategory(null)} 
                className="px-4 py-2 text-xs font-bold border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
              ></button>
              <button 
                onClick={saveCategoryProducts} 
                disabled={isUpdatingProducts}
                className="px-5 py-2 text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center gap-2 rounded-md transition-colors disabled:opacity-50"
              >
                {isUpdatingProducts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
