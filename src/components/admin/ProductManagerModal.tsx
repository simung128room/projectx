import React, { useState } from 'react';
import { Package, X } from 'lucide-react';
import Swal from 'sweetalert2';
import { Product } from '../../types';

export const ProductManagerModal = ({ 
  product, 
  onSave, 
  onClose,
  isEdit,
  categories = []
}: { 
  product?: Product, 
  onSave: (p: Product) => void, 
  onClose: () => void,
  isEdit: boolean,
  categories?: any[]
}) => {
  const [formData, setFormData] = useState<any>(() => {
    if (product) {
      return {
        ...product,
        preOrderOptionsInput: product.preOrderOptions ? product.preOrderOptions.join(', ') : ''
      };
    }
    return {
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      imageUrl: '',
      stock: '',
      category: (categories && categories.length > 0) ? categories[0].id : '',
      isPreOrder: false,
      preOrderOptionsInput: ''
    };
  });

  return (
    <div className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 flex items-center justify-center sm:justify-end p-0 z-[100]" onClick={onClose}>
      <div 
        className="bg-card border-none sm:border-l border-border w-full sm:max-w-md h-full relative overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300 sm:shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors bg-card p-2">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              placeholder="e.g. Netflix Premium"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">รายละเอียด</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm h-24 resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">ราคาปัจจุบัน (THB)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">ราคาเต็ม (ถ้ามี)</label>
              <input 
                type="number" 
                value={formData.originalPrice} 
                onChange={e => setFormData({...formData, originalPrice: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-card border border-border border px-4 py-3 text-foreground/70 font-medium focus:outline-none focus:border-border transition-all text-sm"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">สต๊อก</label>
              <input 
                type="number" 
                min={0}
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">หมวดหมู่</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-card border border-border border px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">ป้ายกำกับ (Tag)</label>
            <select 
              value={formData.tag || ''} 
              onChange={e => setFormData({...formData, tag: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm appearance-none"
            >
              <option value="">ไม่มี (ว่าง)</option>
              <option value="HOT">HOT</option>
              <option value="NEW">NEW</option>
              <option value="แนะนำ">แนะนำ</option>
              <option value="ขายดี">ขายดี</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">URL รูปภาพ</label>
            <input 
              type="text" 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground font-medium focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all text-sm"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-start gap-3 p-3 bg-background/60 rounded border border-border/80 my-2">
            <input 
              type="checkbox"
              id="isPreOrder"
              checked={formData.isPreOrder || false}
              onChange={e => setFormData({ ...formData, isPreOrder: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-primary bg-black border-border rounded focus:ring-emerald-500 focus:ring-offset-0"
            />
            <div className="flex-1">
              <label htmlFor="isPreOrder" className="text-xs font-medium text-foreground select-none cursor-pointer block">
                สินค้า Pre-Order (กำลังจัดหาไอดี)
              </label>
              <span className="text-[10px] text-muted-foreground block mt-0.5">เปิดใช้งานหากสินค้าประเภทนี้ต้องการให้แอดมินจัดหาไอดีให้ภายหลังชำระเงิน</span>
            </div>
          </div>

          {formData.isPreOrder && (
            <div className="p-3 bg-background/30 border border-border/40 rounded space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-[11px] font-medium text-muted-foreground">
                ตัวเลือกประเภทไอดี (แยกด้วยเครื่องหมายจุลภาค , เช่น: AR10, AR30, Garena, Gmail)
              </label>
              <input 
                type="text" 
                value={formData.preOrderOptionsInput || ''} 
                onChange={e => {
                  const val = e.target.value;
                  const opts = val.split(',').map(s => s.trim()).filter(Boolean);
                  setFormData({
                    ...formData,
                    preOrderOptionsInput: val,
                    preOrderOptions: opts
                  });
                }}
                className="w-full bg-card border border-border border px-3 py-2 text-foreground font-medium focus:outline-none focus:border-primary transition-all text-xs"
                placeholder="เช่น: Garena Account, Facebook Account, ID Level 30"
              />
              <div className="text-[10px] text-muted-foreground/80 flex flex-wrap gap-1">
                <span className="font-semibold">ตัวอย่างที่จะแสดง:</span>
                {(formData.preOrderOptions || []).length > 0 ? (
                  (formData.preOrderOptions || []).map((o: string, idx: number) => (
                    <span key={idx} className="bg-background text-zinc-300 px-1.5 py-0.5 rounded text-[9px]">{o}</span>
                  ))
                ) : (
                  <span className="italic">ระบบจะให้ลูกค้าพิมเลือกประเภทเองหากว่างไว้</span>
                )}
              </div>
            </div>
          )}

          {formData.imageUrl && (
            <div className="mt-2 overflow-hidden border border-border border aspect-video bg-card relative flex items-center justify-center">
               <img src={formData.imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-card hover:bg-[#1e1e1e] text-foreground text-sm font-medium transition-all active:scale-95"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => {
              if(!formData.name || formData.price === '' || formData.price === null || formData.price === undefined) {
                 return Swal.fire({title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อและราคาปัจจุบัน', icon: 'warning', background: '#1f1c14', color: '#f5f0e8'});
              }
              if (Number(formData.price) < 0) {
                 return Swal.fire({title: 'ข้อมูลไม่ถูกต้อง', text: 'ราคาไม่สามารถติดลบได้', icon: 'error', background: '#1f1c14', color: '#f5f0e8'});
              }
              onSave(formData as Product);
            }}
            className="flex-1 px-4 py-3 bg-foreground text-background hover:bg-zinc-200 text-sm font-semibold transition-all active:scale-95 border border-white"
          >
            {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </div>
    </div>
  );
};
