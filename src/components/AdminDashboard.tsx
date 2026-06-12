import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Database, LogOut, BarChart3, Key, History, ShieldAlert, Activity, Ban, ChevronRight, Settings, Plus, Trash2, Crown, X, Menu, Upload, FileText, LayoutDashboard, LineChart, Cpu, HardDrive, ShoppingCart, Package, Users, Wallet, Gift, Globe, Phone, AlertTriangle, Download, Check, Image, MessageSquare, Terminal, RefreshCw, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AccountResult, Product, SiteStats } from '../types';
import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { AdminApiKeys } from './AdminApiKeys';
import { AdminBotManagement } from './AdminBotManagement';
import { ProxyFreeTool } from './ProxyFreeTool';

interface AdminDashboardProps {
  totalChecked: number;
  validAccounts: AccountResult[];
  licenseKeys: any[];
  usedKeysHistory: any[];
  blockedIPs: any[];
  adminTab: string;
  setAdminTab: (tab: string) => void;
  products?: Product[];
  setProducts?: React.Dispatch<React.SetStateAction<Product[]>>;
  siteStats?: SiteStats;
  setSiteStats?: (stats: SiteStats) => void;
  customPages?: any[];
  setCustomPages?: React.Dispatch<React.SetStateAction<any[]>>;
  categories?: any[];
  setCategories?: React.Dispatch<React.SetStateAction<any[]>>;
  usersList?: any[];
  onRefreshData?: () => void;
  isDBReady: boolean;
  dbErrorDetail?: string | null;
  adminUsername: string;
  setIsAdmin: (val: boolean) => void;
  addLicenseKey: () => void;
  blockIP: () => void;
  deleteKey: (id: string) => void;
  bulkDeleteKeys: () => void;
  unblockIP: (ip: string) => void;
}

const ProductManagerModal = ({ 
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center sm:justify-end p-0 z-[100]" onClick={onClose}>
      <div 
        className="bg-card border-none sm:border-l border-border border w-full sm:max-w-md h-full relative overflow-y-auto p-6 sm:p-8 animate-in slide-in-from-bottom-full sm:slide-in-from-right-full duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-muted-foreground hover:text-white transition-colors bg-card p-2">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-[#10b981]" />
          {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
              placeholder="e.g. Netflix Premium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">รายละเอียด</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm h-24 resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">ราคาปัจจุบัน (THB)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">ราคาเต็ม (ถ้ามี)</label>
              <input 
                type="number" 
                value={formData.originalPrice} 
                onChange={e => setFormData({...formData, originalPrice: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-card border border-border border px-4 py-3 text-white/70 font-medium focus:outline-none focus:border-zinc-500 transition-all text-sm"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">สต๊อก</label>
              <input 
                type="number" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value === '' ? '' : Number(e.target.value)})}
                className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">หมวดหมู่</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm appearance-none"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">ป้ายกำกับ (Tag)</label>
            <select 
              value={formData.tag || ''} 
              onChange={e => setFormData({...formData, tag: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm appearance-none"
            >
              <option value="">ไม่มี (ว่าง)</option>
              <option value="HOT">HOT</option>
              <option value="NEW">NEW</option>
              <option value="แนะนำ">แนะนำ</option>
              <option value="ขายดี">ขายดี</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">URL รูปภาพ</label>
            <input 
              type="text" 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-card border border-border border px-4 py-3 text-white font-medium focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981]/50 transition-all text-sm"
              placeholder="https://..."
            />
          </div>

          {/* Pre-Order Selection Toggle & Config */}
          <div className="flex items-start gap-3 p-3 bg-[#050505]/60 rounded border border-border/80 my-2">
            <input 
              type="checkbox"
              id="isPreOrder"
              checked={formData.isPreOrder || false}
              onChange={e => setFormData({ ...formData, isPreOrder: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-[#10b981] bg-black border-border rounded focus:ring-emerald-500 focus:ring-offset-0"
            />
            <div className="flex-1">
              <label htmlFor="isPreOrder" className="text-xs font-bold text-white select-none cursor-pointer block">
                สินค้า Pre-Order (กำลังจัดหาไอดี)
              </label>
              <span className="text-[10px] text-muted-foreground block mt-0.5">เปิดใช้งานหากสินค้าประเภทนี้ต้องการให้แอดมินจัดหาไอดีให้ภายหลังชำระเงิน</span>
            </div>
          </div>

          {formData.isPreOrder && (
            <div className="p-3 bg-[#050505]/30 border border-border/40 rounded space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-[11px] font-bold text-muted-foreground">
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
                className="w-full bg-card border border-border border px-3 py-2 text-white font-medium focus:outline-none focus:border-[#10b981] transition-all text-xs"
                placeholder="เช่น: Garena Account, Facebook Account, ID Level 30"
              />
              <div className="text-[10px] text-zinc-500 flex flex-wrap gap-1">
                <span className="font-semibold">ตัวอย่างที่จะแสดง:</span>
                {(formData.preOrderOptions || []).length > 0 ? (
                  (formData.preOrderOptions || []).map((o: string, idx: number) => (
                    <span key={idx} className="bg-[#0a0a0a] text-zinc-300 px-1.5 py-0.5 rounded text-[9px]">{o}</span>
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
            className="flex-1 px-4 py-3 bg-card hover:bg-[#1e1e1e] text-white text-sm font-bold transition-all active:scale-95"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => {
              if(!formData.name || formData.price === '' || formData.price === null || formData.price === undefined) {
                 return Swal.fire({title: 'ข้อมูลไม่ครบ', text: 'กรุณากรอกชื่อและราคาปัจจุบัน', icon: 'warning', background: '#09090b', color: '#fff'});
              }
              const { preOrderOptionsInput, ...cleanFormData } = formData;
              const p = {
                ...cleanFormData,
                price: Number(formData.price) || 0,
                originalPrice: Number(formData.originalPrice) || 0,
                stock: Number(formData.stock) || 0,
                isPreOrder: !!formData.isPreOrder,
                preOrderOptions: formData.preOrderOptions || []
              };
              
              if (isEdit && product) {
                const updatedProduct = {
                  ...product,
                  ...p,
                  id: product.id,
                  _version: product._version || 0,
                };
                onSave(updatedProduct as Product);
              } else {
                onSave(p as Product);
              }
            }}
            className="flex-1 px-4 py-3 bg-primary text-primary-foreground hover:bg-[#10b981] text-white text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
          >
             <Check className="w-4 h-4" />
            บันทึกสินค้า
          </button>
        </div>
      </div>
    </div>
  );
};

const AddStockModal = ({ 
  product, 
  onAppendStock, 
  onClose 
}: { 
  product: Product, 
  onAppendStock: (newItems: string[]) => void, 
  onClose: () => void 
}) => {
  const [linesPerStock, setLinesPerStock] = useState(1);
  const [fileStockPreview, setFileStockPreview] = useState<string[]>([]);
  const [singleFilesPreview, setSingleFilesPreview] = useState<{name: string, b64: string}[]>([]);
  const [mode, setMode] = useState<'text'|'file'|'single-file'>('text');
  const [stockCount, setStockCount] = useState(0);
  const [isBigTextMode, setIsBigTextMode] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const singleFileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const largeTextRef = useRef<string>("");
  const [uploadProgress, setUploadProgress] = useState(-1);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadProgress(0);
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentLoaded = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentLoaded);
      }
    };

    reader.onload = (event) => {
      setUploadProgress(100);
      setTimeout(() => {
        const text = event.target?.result as string;
        if (text) {
          largeTextRef.current = text;
          // Optimizing counting further
          let newlines = 0;
          for (let i = 0; i < text.length; i++) {
            if (text[i] === '\n') newlines++;
          }
          const linesCount = newlines + 1;
          setFileStockPreview(new Array(linesCount)); // Just to keep math accurate
          setIsBigTextMode(true);
        }
        setUploadProgress(-1);
      }, 50);
    };
    reader.readAsText(file);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const maxFileSize = 5 * 1024 * 1024;
    const rejectedFiles: string[] = [];

    Array.from(fileList).forEach((file: File) => {
      if (file.size > maxFileSize) {
        rejectedFiles.push(file.name);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const b64 = event.target?.result as string;
        if (b64) {
          setSingleFilesPreview(prev => [...prev, {name: file.name, b64}]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (rejectedFiles.length > 0) {
      if (rejectedFiles.length === 1) {
        Swal.fire({title: 'ไฟล์ใหญ่เกินไป', text: `ไฟล์ ${rejectedFiles[0]} มีขนาดใหญ่กว่า 5MB. ให้ใช้วิธีอัพโหลดไฟล์แล้ววางลิงก์แทน`, icon: 'error', background: '#09090b', color: '#fff'});
      } else {
        Swal.fire({title: 'พบไฟล์ใหญ่เกิน 5MB', text: `มี ${rejectedFiles.length} ไฟล์ที่มีขนาดใหญ่กว่า 5MB เช่น ${rejectedFiles[0]} ระบบจึงต้องข้ามไฟล์เหล่านี้ไป`, icon: 'warning', background: '#09090b', color: '#fff'});
      }
    }
  };

  const updateTextCount = () => {
    if (isBigTextMode) {
       const val = largeTextRef.current;
       if (!val) { setStockCount(0); return; }
       
       // Use fast V8-optimized built-ins for counting newlines without regex
       let matches = val.split('\n').length - 1;
       setStockCount(Math.ceil((matches + 1) / linesPerStock));
       return;
    }
    
    if (!textRef.current) return;
    const val = textRef.current.value;
    if (!val.trim()) {
      setStockCount(0);
      return;
    }
    let matches = val.match(/\n/g);
    let rawLines = matches ? matches.length + 1 : 1;
    setStockCount(Math.ceil(rawLines / linesPerStock));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const text = e.clipboardData.getData('text');
    if (text.length > 100000) {
      e.preventDefault();
      largeTextRef.current = text;
      setIsBigTextMode(true);
      if (textRef.current) {
         textRef.current.value = "=== พบข้อมูลขนาดใหญ่มาก (โหมด Big Data) ===\n\nระบบซ่อนตัวอย่างเพื่อความลื่นไหล รองรับแล้ว 3,000,000+ บรรทัด\n\n(หากต้องการแก้ไขกรุณากดปุ่มล้างข้อมูลด้านล่าง)";
      }
      setTimeout(updateTextCount, 0);
    }
  };

  const resetBigData = () => {
     largeTextRef.current = "";
     setIsBigTextMode(false);
     if (textRef.current) textRef.current.value = "";
     setStockCount(0);
     setFileStockPreview([]);
  };

  useEffect(() => {
    updateTextCount();
  }, [linesPerStock, isBigTextMode]);

  const handleSaveStock = () => {
    let newItems: string[] = [];
    const sourceText = isBigTextMode ? largeTextRef.current : (textRef.current?.value || "");
    
    if (mode === 'text' || mode === 'file') {
      if (!sourceText.trim() && fileStockPreview.length === 0) return;
      
      let lines: string[] = [];
      const splitLines = sourceText.split('\n');
      for (let i = 0; i < splitLines.length; i++) {
         const t = splitLines[i].trim();
         if (t.length > 0) lines.push(t);
      }

      if (linesPerStock > 1) {
        for (let i = 0; i < lines.length; i += linesPerStock) {
          const chunk = lines.slice(i, i + linesPerStock).join('\n');
          newItems.push(chunk);
        }
      } else {
        newItems = lines;
      }
    } else if (mode === 'single-file' && singleFilesPreview.length > 0) {
      newItems = singleFilesPreview.map(f => JSON.stringify({ type: 'file', name: f.name, data: f.b64 }));
    }

    if (newItems.length === 0) {
      return Swal.fire({title: 'ข้อมูลว่างเปล่า', text: 'ไม่ได้เพิ่มสต๊อกใหม่', icon: 'error', background: '#09090b', color: '#fff'});
    }

    if (newItems.length > 500) {
      Swal.fire({
        title: 'กำลังประมวลผล',
        text: `กำลังเตรียมบันทึกสต๊อก ${newItems.length.toLocaleString()} รายการ โปรดรอสักครู่และห้ามปิดหน้าต่างนี้...`,
        icon: 'info',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: '#09090b', color: '#fff'
      });
    }

    onAppendStock(newItems);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end p-0 z-50">
      <div className="bg-card border-l border-border border w-full max-w-md h-full relative p-6 sm:p-8 overflow-y-auto animate-in slide-in-from-right-full duration-300">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-[#10b981]" />
          เพิ่มสต๊อก: {product.name}
        </h2>
        
        <div className="flex bg-card p-1 mb-6">
          <button 
            onClick={() => setMode('file')}
            className={`flex-1 py-2 text-xs font-bold transition-all ${mode === 'file' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ .txt (หลายสต๊อก)
          </button>
          <button 
            onClick={() => setMode('single-file')}
            className={`flex-1 py-2 text-xs font-bold transition-all ${mode === 'single-file' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ทั่วไป (1 ไฟล์ = 1 สต๊อก)
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-2 text-xs font-bold transition-all ${mode === 'text' ? 'bg-[#121212] text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            วางข้อความ
          </button>
        </div>

        {mode === 'file' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-border hover:border-emerald-500/50 bg-card p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[#10b981] mb-3" />
              <p className="text-sm font-bold text-muted-foreground">คลิกเพื่ออัพโหลดไฟล์ .txt</p>
              <p className="text-xs text-muted-foreground mt-1">1 บรรทัด = 1 สต๊อก</p>
              <input 
                type="file" 
                accept=".txt" 
                className="hidden" 
                ref={fileRef}
                onChange={handleFileUpload}
              />
            </div>

            {uploadProgress >= 0 && (
              <div className="bg-card border border-border border p-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-muted-foreground">กำลังประมวลผลไฟล์...</span>
                  <span className="text-xs font-bold text-[#10b981]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-card h-1.5 object-cover overflow-hidden">
                  <div className="bg-[#10b981] h-1.5 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between bg-card p-3 border border-border border">
              <label className="text-sm font-bold text-muted-foreground">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-card border border-zinc-700 px-3 py-1 text-white text-center font-bold"
              />
            </div>

            {fileStockPreview.length > 0 && (
              <div className="bg-[#10b981]/10 border border-emerald-500/20 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#10b981]" />
                  <div>
                    <p className="text-sm font-bold text-[#10b981]">พบข้อมูลสต๊อก</p>
                    <p className="text-xs text-[#10b981]/80">พร้อมเพิ่ม {Math.ceil(fileStockPreview.length / linesPerStock)} รายการ (จาก {fileStockPreview.length} บรรทัด)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === 'single-file' && (
          <div className="space-y-4">
            <div 
              onClick={() => singleFileRef.current?.click()}
              className="border border-dashed border-border hover:border-emerald-500/50 bg-card p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-[#10b981] mb-3" />
              <p className="text-sm font-bold text-muted-foreground">อัพโหลดไฟล์สินค้า</p>
              <p className="text-xs text-muted-foreground mt-1">สูงสุด 5MB ต่อไฟล์ (เลือกหลายไฟล์ได้)</p>
              <input 
                type="file" 
                multiple
                className="hidden" 
                ref={singleFileRef}
                onChange={handleSingleFileUpload}
              />
            </div>
            {singleFilesPreview.length > 0 && (
              <div className="flex flex-col gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                {singleFilesPreview.map((f, i) => (
                  <div key={i} className="bg-card border border-border border p-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium truncate max-w-[200px] text-muted-foreground">{f.name}</span>
                    <span className="text-[10px] text-[#10b981] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card p-3 border border-border border">
              <label className="text-sm font-bold text-muted-foreground">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-card border border-zinc-700 px-3 py-1 text-white text-center font-bold"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-muted-foreground">วางข้อมูลสต๊อก</label>
                <div className="flex items-center gap-2">
                  {isBigTextMode && (
                    <button onClick={resetBigData} className="text-[10px] bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-0.5 rounded font-bold transition-colors">
                      ล้างข้อมูล (Clear)
                    </button>
                  )}
                  <span className="text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded">
                    คำนวณได้: {stockCount} สต๊อก
                  </span>
                </div>
              </div>
              <textarea 
                ref={textRef}
                onChange={updateTextCount}
                onPaste={handlePaste}
                disabled={isBigTextMode}
                className="w-full bg-card border border-border border p-4 text-white focus:outline-none focus:border-emerald-500 text-sm h-40 resize-none font-mono text-xs leading-relaxed disabled:opacity-50"
                placeholder="ข้อมูลบรรทัดที่ 1&#10;ข้อมูลบรรทัดที่ 2&#10;ข้อมูลบรรทัดที่ 3&#10;..."
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-card hover:bg-[#1e1e1e] text-white text-sm font-bold transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSaveStock}
            className="flex-1 px-4 py-3 bg-[#10b981] hover:bg-[#10b981] text-white text-sm font-bold transition-colors"
          >
            เพิ่มสต๊อกเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};


const DatabaseSetupGuide = ({ dbErrorDetail }: { dbErrorDetail?: string | null }) => (
  <div className="bg-card border border-amber-500/20 p-8 max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 ">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-amber-500/20">
        <Database className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Offline / Database Connectivity Issue</h2>
        <p className="text-muted-foreground text-sm mt-1">The application backend or database is currently unreachable.</p>
      </div>
    </div>
    
    {dbErrorDetail && (
      <div className="mb-8 p-4 bg-primary text-primary-foreground border border-[#10b981]/20">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-[#10b981]" />
          <h4 className="text-[#10b981] text-[10px] font-semibold uppercase tracking-widest">สถานะปัจจุบัน (Status):</h4>
        </div>
        <p className="text-muted-foreground text-xs font-mono break-all bg-black/40 backdrop-blur-sm p-3 border border-border border">{dbErrorDetail}</p>
      </div>
    )}
    
    <div className="space-y-4">
      <div className="bg-black/40 backdrop-blur-sm border border-border border p-6">
        <h3 className="text-white font-bold mb-2">Troubleshooting Steps</h3>
        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
          <li>Ensure the backend server is running correctly.</li>
          <li>If hosted on Vercel, check the Serverless Function logs for errors.</li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-[#10b981] hover:bg-[#10b981] text-white text-sm font-bold transition"
          >
           Refresh Application
          </button>
        </div>
      </div>
    </div>
  </div>
);

import { AdminUserManagement } from './AdminUserManagement';
import { AdminPagesManagement } from './AdminPagesManagement';
import { AdminCategoriesManagement } from './AdminCategoriesManagement';
import { AdminToolsManagement } from './AdminToolsManagement';
import AdminStockManagement from './AdminStockManagement';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  totalChecked, validAccounts, licenseKeys = [], usedKeysHistory = [], blockedIPs = [],
  adminTab, setAdminTab, isDBReady, dbErrorDetail, adminUsername, setIsAdmin,
  addLicenseKey, blockIP, deleteKey, unblockIP, bulkDeleteKeys,
  products = [], setProducts, siteStats = { users: 0, stock: 0, sales: 0, topups: 0 }, setSiteStats,
  customPages = [], setCustomPages,
  categories = [], setCategories,
  usersList = [], onRefreshData
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [stockProduct, setStockProduct] = useState<Product | undefined>(undefined);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  const [purchaseHistory, setPurchaseHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('apex_purchase_history');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });

  const [topupHistory, setTopupHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('apex_topup_history');
    if (saved) { try { return JSON.parse(saved); } catch (e) { return []; } }
    return [];
  });

  const [siteSettings, setSiteSettings] = useState<{ [key: string]: any }>({ 
    site_name: 'APEXSTORE',
    truewallet_phone: '',
    contact_line: 'https://www.facebook.com/share/18emwBsqUf/?mibextid=wwXIfr',
    discord_link: '',
    facebook_link: '',
    instagram_link: '',
    contact_email: '',
    stats_users_offset: 1278,
    stats_sales_offset: 4432,
    popup_img_url: 'https://img2.pic.in.th/Red-Black-White-Anime-Podcast-Discord-Logocc6d3bfe807340af.png',
    popup_enabled: true,
    popup_link: '',
    banners: ["https://img2.pic.in.th/24B843A8-C705-48F6-84FB-50AAA5EFAAA6.png"],
    proxies: ['http://e7221fa7-20b7-43a7-9f76-c69fbc35cdef@lv3.gen5.netmld.shop:8080'],
    auto_proxy: true,
    spotify_url: '',
    spotify_autoplay: false,
    announcement_text: 'ยินดีต้อนรับสู่ APEXSTORE ศูนย์รวมสินค้าไอดีและข้อเสนอยอดฮิต ระบบซื้อขายทำงานอัตโนมัติ 24 ชั่วโมง - กรณีมีปัญหาโปรดติดต่อแอดมิน',
    bank_name: 'ธนาคารกสิกรไทย',
    bank_account_number: '196-3-87032-5',
    bank_account_holder: 'นาย กรวิชญ์',
    bank_qr_image: '',
    stats_users_override: null,
    stats_sales_override: null,
    stats_stock_override: null
  });

  const [uploadingMusic, setUploadingMusic] = useState(false);
  const musicFileRef = useRef<HTMLInputElement>(null);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);
  const [preorderFilter, setPreorderFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [preorderSearch, setPreorderSearch] = useState('');

  useEffect(() => {
    if (adminTab === 'preorders') {
      setIsPurchasesLoading(true);
      axios.get('/api/purchases?limit=100')
        .then(res => {
          setPurchases(res.data.data || []);
        })
        .catch(err => {
          console.error('Error loading purchases in admin:', err);
        })
        .finally(() => {
          setIsPurchasesLoading(false);
        });
    }
  }, [adminTab]);

  const handleFulfillPreorder = async (purchaseId: string, secretData: string) => {
    try {
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      await axios.put(`/api/purchases/${purchaseId}`, {
        secretData,
        preOrderStatus: 'delivered'
      });
      
      setPurchases(prev => prev.map(p => p.id === purchaseId ? { ...p, secretData, preOrderStatus: 'delivered' } : p));
      
      Swal.fire({
        icon: 'success',
        title: 'ส่งมอบพรีออเดอร์สำเร็จ!',
        text: 'ระบบได้ส่งรหัสสินค้าไปยังลูกค้าและปรับสถานะเป็น "ส่งข้อมูลแล้ว" เรียบร้อยแล้ว',
        confirmButtonColor: '#10b981',
        background: '#09090b',
        color: '#fff'
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: err.response?.data?.error || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้',
        confirmButtonColor: '#dc2626',
        background: '#09090b',
        color: '#fff'
      });
    }
  };

  const filteredPreorders = purchases.filter(purchase => {
    // Only pre-orders
    if (!purchase.isPreOrder) return false;
    
    // Status filter
    if (preorderFilter === 'pending' && purchase.preOrderStatus === 'delivered') return false;
    if (preorderFilter === 'delivered' && purchase.preOrderStatus !== 'delivered') return false;
    
    // Search filter
    if (preorderSearch.trim()) {
      const q = preorderSearch.toLowerCase();
      const matchBill = (purchase.billNumber || '').toLowerCase().includes(q);
      const matchProduct = (purchase.productName || '').toLowerCase().includes(q);
      const matchUser = (purchase.username || purchase.userId || '').toLowerCase().includes(q);
      return matchBill || matchProduct || matchUser;
    }
    return true;
  });

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไฟล์มีขนาดใหญ่เกินไป (จำกัด 50MB)',
        icon: 'error',
        background: '#0B0D0F',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
      return;
    }

    setUploadingMusic(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data?.url) {
        setSiteSettings(prev => ({ ...prev, spotify_url: response.data.url }));
        Swal.fire({
          title: 'สำเร็จ',
          text: 'อัพโหลดเพลงสำเร็จแล้ว',
          icon: 'success',
          background: '#0B0D0F',
          color: '#fff',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err: any) {
      console.error('Music upload error:', err);
      const errorMsg = err.response?.data?.error || 'ไม่สามารถอัพโหลดเพลงได้';
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: errorMsg,
        icon: 'error',
        background: '#0B0D0F',
        color: '#fff',
        confirmButtonColor: '#10b981'
      });
    } finally {
      setUploadingMusic(false);
      if (musicFileRef.current) musicFileRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings');
        if (res.data) setSiteSettings(res.data);
      } catch (err) {}
    };
    fetchSettings();
  }, [adminTab]);

  const handleSaveSettings = async () => {
    try {
      const payload = {
        ...siteSettings,
        banners: (siteSettings.banners || []).map(b => typeof b === 'string' ? b.trim() : '').filter(Boolean),
        proxies: (siteSettings.proxies || []).map(p => typeof p === 'string' ? p.trim() : '').filter(Boolean)
      };
      setSiteSettings(payload);
      const res = await axios.post('/api/settings', payload);
      if (res.data.success || res.status === 200) {
        Swal.fire({ 
          title: 'สำเร็จ', 
          text: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 
          icon: 'success', 
          confirmButtonColor: '#10b981',
          background: '#0B0D0F',
          color: '#fff'
        });
      }
    } catch (err: any) {
      console.error('Save Settings Error:', err);
      const errorMsg = err.response?.data?.error || err.message || 'ไม่สามารถบันทึกข้อมูลได้';
      Swal.fire({
        title: 'ผิดพลาด',
        text: errorMsg,
        icon: 'error',
        background: '#0B0D0F',
        color: '#fff'
      });
    }
  };

  // Calculate Stats
  const totalOrders = siteStats.sales !== undefined ? (siteStats as any).totalOrders || purchaseHistory.length : purchaseHistory.length;
  const totalMoney = (siteStats as any).topups || topupHistory.reduce((acc, curr) => acc + (curr.amount || curr.money || 0), 0);
  const totalRevenue = siteStats.sales || purchaseHistory.reduce((acc, curr) => acc + (curr.price || 0), 0);
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0,0,0,0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const salesToday = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfDay).reduce((acc, curr) => acc + (curr.price || 0), 0);
  const salesWeek = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfWeek).reduce((acc, curr) => acc + (curr.price || 0), 0);
  const salesMonth = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfMonth).reduce((acc, curr) => acc + (curr.price || 0), 0);

  const totalKeys = licenseKeys.length;
  const usedKeys = licenseKeys.filter(k => k.status === 'used').length + usedKeysHistory.length;
  const remainingKeys = licenseKeys.filter(k => k.status === 'active').length;
  const usersWhoBought = new Set(purchaseHistory.map(x => x.userId || 'guest')).size;

  const getTabLabel = (id: string) => {
    const items: Record<string, string> = {
      overview: 'หน้าภาพรวม',
      analytics: 'ข้อมูลวิเคราะห์',
      store: 'สินค้าในร้าน',
      categories: 'หมวดหมู่สินค้า',
      banners: 'ตั้งค่าแบนเนอร์',
      pages: 'ตั้งค่าหน้าเพจ',
      users: 'สมาชิกทั้งหมด',
      keys: 'LICENSE KEYS',
      history: 'ประวัติรายการ',
      ips: 'ความปลอดภัย',
      bot: 'ระบบบอท',
      tools: 'ตัวช่วยแจกของ',
      api_keys: 'ระบบ API',
      settings: 'ตั้งค่าเว็บไซต์',
      system: 'สถานะระบบ'
    };
    return items[id] || id;
  };

  const NavItem = ({ id, label, icon: Icon, color }: any) => {
    const isActive = adminTab === id;
    return (
      <button
        onClick={() => {
          setAdminTab(id);
          setIsNavOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 relative group rounded-md ${
          isActive 
            ? 'bg-[#050505]/60 text-[#10b981] font-bold shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
            : 'text-zinc-400 hover:bg-[#050505]/20 hover:text-white'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#10b981] rounded-r-md shadow-[0_0_10px_#10b981]" />
        )}
        <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-[#10b981]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
        <span className="text-xs font-semibold tracking-wide">{label}</span>
        {isActive && (
          <ChevronRight className="w-3 h-3 ml-auto opacity-75 text-[#10b981]" />
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-card flex font-sans text-white">
      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 bg-card border-r border-border border w-[280px] z-50 transform transition-transform duration-300 lg:translate-x-0 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full overflow-hidden`}>
        {/* Brand/Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-border border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#10b981] text-white flex items-center justify-center flex-shrink-0 rounded-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold tracking-tight leading-none text-md uppercase">APEXSTORE</h2>
              <p className="text-[9px] text-[#10b981] font-bold uppercase tracking-widest mt-1">Admin Console</p>
            </div>
          </div>
          <button onClick={() => setIsNavOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:text-white bg-card rounded-md">
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto w-full p-4 space-y-6 progress-track scrollbar-none">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">ระบบจัดการหลัก</p>
            <NavItem id="overview" label="หน้าภาพรวม" icon={LayoutDashboard} />
            <NavItem id="analytics" label="ข้อมูลวิเคราะห์" icon={LineChart} />
            <NavItem id="settings" label="ตั้งค่าเว็บไซต์" icon={Settings} />
            <NavItem id="system" label="สถานะระบบ" icon={Cpu} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">ร้านค้า & สินค้า</p>
            <NavItem id="store" label="สินค้าในร้าน" icon={Package} />
            <NavItem id="categories" label="หมวดหมู่สินค้า" icon={LayoutDashboard} />
            <NavItem id="stock" label="จัดการสต็อก" icon={Database} />
            <NavItem id="banners" label="ตั้งค่าแบนเนอร์" icon={Image} />
            <NavItem id="pages" label="ตั้งค่าหน้าเพจ" icon={FileText} />
            <NavItem id="preorders" label="จัดการ Pre-Order" icon={Clock} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">ผู้ใช้งาน & ประวัติ</p>
            <NavItem id="users" label="สมาชิกทั้งหมด" icon={Users} />
            <NavItem id="keys" label="LICENSE KEYS" icon={Key} />
            <NavItem id="history" label="ประวัติรายการ" icon={History} />
            <NavItem id="ips" label="ความปลอดภัย" icon={ShieldAlert} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 px-3">เครื่องมือเสริม</p>
            <NavItem id="bot" label="ระบบบอท" icon={Terminal} />
            <NavItem id="tools" label="ตัวช่วยแจกของ" icon={Gift} />
            <NavItem id="api_keys" label="ระบบ API" icon={Key} />
          </div>
        </div>

        {/* Admin User Profile Bottom */}
        <div className="p-4 border-t border-border border bg-card shrink-0">
          <div className="flex items-center gap-3 p-3 bg-card">
            <div className="w-10 h-10 bg-gradient-to-br from-[#10b981] to-[#1D4ED8] flex flex-shrink-0 items-center justify-center text-white font-bold">
              {adminUsername.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-white truncate">{adminUsername}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Administrator</p>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="p-2 text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex-shrink-0"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden lg:pl-[280px]">
        {/* Top Header */}
        <header className="h-[72px] bg-card backdrop-blur-md border-b border-border border flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNavOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-white bg-card"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-primary text-primary-foreground  hidden sm:block"></span>
              {getTabLabel(adminTab)}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-card px-3 py-1.5 border border-border border">
               <Activity className="w-3 h-3 text-[#10b981]" />
               SYSTEM ONLINE
             </div>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full max-w-[1400px] mx-auto">
          {!isDBReady ? (
          <DatabaseSetupGuide dbErrorDetail={dbErrorDetail} />
        ) : (
          <AnimatePresence mode="wait">
            {adminTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'ผู้ใช้งานทั้งหมด', value: (siteStats?.users || 0).toLocaleString(), icon: Users, color: 'text-[#10b981]', bg: 'bg-[#10b981]/5', border: 'hover:border-[#10b981]/40' },
                  { label: 'ยอดขายทั้งหมด (สินค้า)', value: totalOrders.toLocaleString(), icon: Package, color: 'text-zinc-400', bg: 'bg-zinc-500/5', border: 'hover:border-zinc-500/40' },
                  { label: 'คำสั่งซื้อที่สำเร็จ', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'hover:border-amber-500/40' },
                  { label: 'รายได้รวม (บาท)', value: totalRevenue.toLocaleString(), icon: Activity, color: 'text-[#10b981]', bg: 'bg-[#10b981]/5', border: 'hover:border-emerald-500/40' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-card border border-zinc-800 rounded-md p-6 relative overflow-hidden group transition-all duration-300 hover:translate-y-[-2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] ${stat.border}`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#050505]/40 blur-3xl rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125"></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                        <h3 className="text-3xl font-semibold text-white tracking-tight font-mono">{stat.value}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${stat.bg} ${stat.color} shadow-[0_2px_8px_rgba(0,0,0,0.2)]`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-zinc-800 rounded-md overflow-hidden">
                    <div className="p-6 border-b border-zinc-800/80 flex justify-between items-center bg-card">
                      <h3 className="font-bold flex items-center gap-2 text-white">
                        <LineChart className="w-5 h-5 text-[#10b981]" /> รายงานสรุปยอดขาย (Sales Summary)
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#050505]/40 border border-zinc-800/60 p-6 text-center group hover:bg-[#050505]/80 hover:border-zinc-700/60 transition-all duration-200 rounded-md">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase mb-2 tracking-widest">วันนี้</p>
                        <p className="text-2xl font-semibold text-[#10b981] font-mono">{salesToday.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-[#050505]/40 border border-zinc-800/60 p-6 text-center group hover:bg-[#050505]/80 hover:border-zinc-700/60 transition-all duration-200 rounded-md">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase mb-2 tracking-widest">สัปดาห์นี้</p>
                        <p className="text-2xl font-semibold text-[#10b981] font-mono">{salesWeek.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-[#050505]/40 border border-zinc-800/60 p-6 text-center group hover:bg-[#050505]/80 hover:border-zinc-700/60 transition-all duration-200 rounded-md">
                        <p className="text-zinc-500 text-[10px] font-semibold uppercase mb-2 tracking-widest">เดือนนี้</p>
                        <p className="text-2xl font-semibold text-[#10b981] font-mono">{salesMonth.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-zinc-800 rounded-md p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-white uppercase text-xs tracking-widest">
                      <Cpu className="w-4 h-4 text-[#10b981]" /> ระบบจัดการด่วน (Quick Management)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'store', label: 'จัดการสินค้า', desc: 'เพิ่ม ลบ แก้ไข สินค้าในร้าน', icon: Package, color: 'text-[#10b981]', bg: 'bg-[#10b981]/5' },
                            { id: 'keys', label: 'จัดการ License', desc: 'เพิ่มคีย์และดูประวัติ', icon: Key, color: 'text-zinc-400', bg: 'bg-zinc-500/5' },
                            { id: 'users', label: 'จัดการสมาชิก', desc: 'ดูรายชื่อและแก้ไขยอดเงิน', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                            { id: 'settings', label: 'ตั้งค่าเว็บไซต์', desc: 'แก้ไขชื่อเว็บ ช่องทางติดต่อ', icon: Settings, color: 'text-[#10b981]', bg: 'bg-[#10b981]/5' },
                        ].map((item, i) => (
                           <button 
                             key={i}
                             onClick={() => setAdminTab(item.id)}
                             className="flex items-center gap-4 p-4 border border-zinc-800/80 bg-[#050505]/30 hover:bg-zinc-950 hover:border-zinc-600 transition-all text-left group rounded-md"
                           >
                             <div className={`w-12 h-12 rounded-md ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200 shadow-sm`}>
                               <item.icon className="w-5 h-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors">{item.label}</p>
                               <p className="text-[10px] text-zinc-500 font-semibold truncate mt-0.5">{item.desc}</p>
                             </div>
                             <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                           </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card border border-zinc-800 rounded-md p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-white uppercase text-xs tracking-widest">
                      <Settings className="w-4 h-4 text-[#10b981]" /> เครื่องมือเพิ่มเติม
                    </h3>
                    <div className="space-y-3">
                      <button onClick={() => setAdminTab('banners')} className="w-full bg-[#050505]/30 hover:bg-zinc-950 border border-zinc-800/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Image className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors uppercase">ป้ายโฆษณา</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </button>
                      <button onClick={() => setAdminTab('pages')} className="w-full bg-[#050505]/30 hover:bg-zinc-950 border border-zinc-800/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors uppercase">หน้าเพจ</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </button>
                      <button onClick={() => setAdminTab('history')} className="w-full bg-[#050505]/30 hover:bg-zinc-950 border border-zinc-800/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <History className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white group-hover:text-[#10b981] transition-colors uppercase">LOGS ของระบบ</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {adminTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border border p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/10 blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#10b981]" />
                    Revenue Analytics
                  </h3>
                  <p className="text-muted-foreground text-xs">Monthly revenue and user growth metrics</p>
                </div>

                <div className="h-72 w-full mt-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { name: 'Jan', revenue: 4000, users: 2400 },
                        { name: 'Feb', revenue: 3000, users: 1398 },
                        { name: 'Mar', revenue: 2000, users: 9800 },
                        { name: 'Apr', revenue: 2780, users: 3908 },
                        { name: 'May', revenue: 1890, users: 4800 },
                        { name: 'Jun', revenue: 2390, users: 3800 },
                        { name: 'Jul', revenue: 3490, users: 4300 },
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `฿${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-border border">
                  <div className="bg-card p-4 border border-border border">
                    <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Total Revenue</p>
                    <p className="text-2xl font-semibold text-[#10b981]">฿19,550</p>
                    <p className="text-[#10b981] text-[10px] mt-1 font-bold">+12% from last month</p>
                  </div>
                  <div className="bg-card p-4 border border-border border">
                    <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Active Users</p>
                    <p className="text-2xl font-semibold text-[#10b981]">2,420</p>
                    <p className="text-[#10b981] text-[10px] mt-1 font-bold">+5% from last month</p>
                  </div>
                  <div className="bg-card p-4 border border-border border">
                    <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Conversion Rate</p>
                    <p className="text-2xl font-semibold text-amber-400">4.2%</p>
                    <p className="text-[#10b981] text-[10px] mt-1 font-bold">-1% from last month</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'users' && (
            <motion.div 
              key="users"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <AdminUserManagement 
                purchaseHistory={purchaseHistory} 
                topupHistory={topupHistory} 
                usedKeysHistory={usedKeysHistory} 
                users={usersList}
                onRefresh={onRefreshData || (() => {})}
              />
            </motion.div>
          )}
          {adminTab === 'store' && (
            <motion.div 
              key="store"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Site Stats */}
              <div className="bg-card border border-zinc-800 rounded-md p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#10b981]" /> ตั้งค่าสถิติหน้าแรก
                  </h3>
                  <button 
                    onClick={() => {
                        let currentUsers = (siteStats?.users || 0);
                        let currentStock = (siteStats?.stock || 0);
                        let currentSales = (siteStats?.sales || 0);
                        let currentCategories = categories?.length || 0;
                        Swal.fire({
                            title: 'แก้ไขสถิติระบบ',
                            html: `
                              <div class="text-left space-y-4 font-sans text-sm text-zinc-300 px-1 py-2">
                                <div class="p-3 bg-[#10b981]/10 border border-emerald-500/20 rounded-md text-xs text-[#10b981] mb-4 leading-relaxed">
                                  💡 แนะนำสั่งใช้ <b>"โตอัตโนมัติ (Auto-Grow)"</b> เมื่อมีสมาชิกสมัครใหม่หรือซื้อสินค้าจริงเข้ามา ตัวเลขจะบวกเพิ่มขึ้นเรื่อยๆ เสมอ!
                                </div>
                                
                                <div class="mb-4">
                                  <label class="block text-xs font-bold text-zinc-400 uppercase mb-1.5">👥 จำนวนผู้ใช้งานสะสม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-users" type="number" class="col-span-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 1500" value="${currentUsers}">
                                    <select id="swal-users-type" class="bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_users_override === null || siteSettings.stats_users_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_users_override !== null && siteSettings.stats_users_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-4">
                                  <label class="block text-xs font-bold text-zinc-400 uppercase mb-1.5">💰 ยอดขายสะสมรวม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-sales" type="number" class="col-span-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 45000" value="${currentSales}">
                                    <select id="swal-sales-type" class="bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_sales_override === null || siteSettings.stats_sales_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_sales_override !== null && siteSettings.stats_sales_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-4">
                                  <label class="block text-xs font-bold text-zinc-400 uppercase mb-1.5">📦 คลังสินค้าสะสมรวม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-stock" type="number" class="col-span-2 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 850" value="${currentStock}">
                                    <select id="swal-stock-type" class="bg-zinc-950 border border-zinc-800 rounded px-2 py-2 text-white text-xs font-bold outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_stock_override === null || siteSettings.stats_stock_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_stock_override !== null && siteSettings.stats_stock_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-2">
                                  <label class="block text-xs font-bold text-zinc-400 uppercase mb-1.5">📂 จำนวนหมวดหมู่สินค้า</label>
                                  <input id="swal-categories" type="number" class="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-white outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 5" value="${currentCategories}">
                                </div>
                              </div>
                            `,
                            background: '#09090b',
                            color: '#fff',
                            focusConfirm: false,
                            confirmButtonColor: '#10b981',
                            cancelButtonColor: '#27272a',
                            showCancelButton: true,
                            confirmButtonText: 'บันทึกสถิติ',
                            cancelButtonText: 'ยกเลิก',
                            preConfirm: () => {
                              const uVal = parseInt((document.getElementById('swal-users') as HTMLInputElement).value);
                              const uType = (document.getElementById('swal-users-type') as HTMLSelectElement).value;
                              
                              const sVal = parseInt((document.getElementById('swal-sales') as HTMLInputElement).value);
                              const sType = (document.getElementById('swal-sales-type') as HTMLSelectElement).value;

                              const stVal = parseInt((document.getElementById('swal-stock') as HTMLInputElement).value);
                              const stType = (document.getElementById('swal-stock-type') as HTMLSelectElement).value;

                              const cVal = parseInt((document.getElementById('swal-categories') as HTMLInputElement).value);

                              return {
                                users: isNaN(uVal) ? null : uVal,
                                usersType: uType,
                                sales: isNaN(sVal) ? null : sVal,
                                salesType: sType,
                                stock: isNaN(stVal) ? null : stVal,
                                stockType: stType,
                                categories: isNaN(cVal) ? null : cVal
                              }
                            }
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                  const targetUsers = result.value?.users;
                                  const targetSales = result.value?.sales;
                                  const targetStock = result.value?.stock;
                                  const targetCategories = result.value?.categories;

                                  const res = await axios.post('/api/settings', {
                                    stats_users_target: targetUsers,
                                    stats_users_type: result.value?.usersType,
                                    stats_sales_target: targetSales,
                                    stats_sales_type: result.value?.salesType,
                                    stats_stock_target: targetStock,
                                    stats_stock_type: result.value?.stockType,
                                    stats_categories_override: targetCategories
                                  });
                                  
                                  if (setSiteSettings) {
                                    setSiteSettings(res.data.settings || res.data);
                                  }
                                  
                                  if (setSiteStats) {
                                    setSiteStats({
                                      ...(siteStats || { users: 0, stock: 0, sales: 0, topups: 0 }),
                                      users: targetUsers !== null ? targetUsers : (siteStats?.users || 0),
                                      stock: targetStock !== null ? targetStock : (siteStats?.stock || 0),
                                      sales: targetSales !== null ? targetSales : (siteStats?.sales || 0)
                                    });
                                  }
                                  
                                  Swal.fire({ title: 'บันทึกสำเร็จ', text: 'สถิติระบบปรับปรุงเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#10B981', background: '#09090b', color: '#fff' });
                                } catch (error: any) {
                                  Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกสถิติได้: ' + (error.response?.data?.error || error.message), icon: 'error', confirmButtonColor: '#EF4444', background: '#09090b', color: '#fff' });
                                }
                            }
                        });
                    }}
                    className="border border-zinc-800 bg-[#050505]/60 hover:bg-[#0a0a0a] text-zinc-300 hover:text-white font-bold py-1.5 px-3 text-xs rounded-md transition-all duration-150"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-950 p-4 border border-zinc-800/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-white font-mono">{(siteStats?.users || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-zinc-950 p-4 border border-zinc-800/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-white font-mono">{(siteStats?.stock || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-zinc-950 p-4 border border-zinc-800/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-white font-mono">{(siteStats?.sales || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>
                  {/* Products List */}
              <div className="bg-card border border-zinc-800 rounded-md p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-[#10b981]" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#10b981] hover:bg-[#10b981] text-white font-bold py-2 px-4 text-xs transition-colors flex items-center gap-2 rounded-md shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm text-zinc-400 hidden md:table">
                    <thead className="text-xs uppercase bg-zinc-950 text-zinc-500 font-bold tracking-wider rounded-md border-b border-zinc-800">
                      <tr>
                        <th className="px-5 py-4">สินค้า</th>
                        <th className="px-5 py-4">ราคา</th>
                        <th className="px-5 py-4">สต๊อก</th>
                        <th className="px-5 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-zinc-800/80 hover:bg-[#050505]/30 transition-all duration-200">
                          <td className="px-5 py-4 flex items-center gap-3">
                            <img loading="lazy" src={p.imageUrl || undefined} alt={p.name} className="w-12 h-12 object-cover bg-zinc-950 border border-zinc-800 rounded-md shadow-sm" />
                            <div>
                                <div className="text-white font-bold flex items-center gap-2">
                                  {p.name}
                                  {p.tag && (
                                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
                                      {p.tag}
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.name);
                                      Swal.fire({ title: 'Copied!', text: 'คัดลอกชื่อสินค้าแล้ว', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' });
                                    }}
                                    className="text-zinc-500 hover:text-white transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-xs text-zinc-500 truncate max-w-[240px] mt-0.5">{p.description}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-bold">
                            <div className="flex flex-col">
                              {p.originalPrice && p.price && p.originalPrice > p.price && (
                                <span className="text-[10px] text-zinc-500 line-through">฿{p.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-[#10b981] font-mono">฿{(p.price || 0).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wide ${
                              p.stock > 0 
                                ? 'bg-[#10b981]/10 text-[#10b981] border border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {p.stock > 0 ? `พร้อมส่ง (${p.stock})` : 'สินค้าหมด'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={async () => {
                                    if (p.stock === 0) {
                                      return Swal.fire('ไม่มีสต๊อก', 'สินค้านี้ยังไม่มีข้อมูลสต๊อกให้ดาวน์โหลด', 'error');
                                    }
                                    try {
                                      const res = await axios.get(`/api/products/${p.id}/stock`);
                                      const sd = res.data.stockData;
                                      if (!sd || sd.length === 0) {
                                        return Swal.fire('ไม่มีสต๊อก', 'สินค้านี้ยังไม่มีข้อมูลสต๊อกให้ดาวน์โหลด', 'error');
                                      }
                                      const text = sd.join('\n');
                                      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `stock_${p.name}.txt`;
                                      link.click();
                                      URL.revokeObjectURL(url);
                                    } catch (err: any) {
                                      Swal.fire('ข้อผิดพลาด', err.response?.data?.error || err.message, 'error');
                                    }
                                  }}
                                  className="p-2 border border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981] hover:bg-[#10b981]/15 hover:border-[#10b981]/60 rounded-md transition-all duration-150"
                                  title="โหลดสต๊อก TXT เพื่อดูรายบรรทัด"
                                >
                                     <FileText className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setStockProduct(p)}
                                  className="p-2 border border-emerald-500/30 bg-[#10b981]/5 text-[#10b981] hover:bg-[#10b981]/15 hover:border-emerald-500/60 rounded-md transition-all duration-150"
                                  title="เพิ่มสต๊อก"
                                >
                                     <Database className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/60 rounded-md transition-all duration-150"
                                  title="แก้ไขสินค้า"
                                >
                                     <Settings className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if(setProducts && products.length > 0) {
                                      Swal.fire({
                                        title: 'ยืนยันการลบ',
                                        text: 'คุณต้องการลบสินค้านี้ใช่หรือไม่?',
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#dc2626',
                                        cancelButtonColor: '#71717a',
                                        confirmButtonText: 'ลบ',
                                        cancelButtonText: 'ยกเลิก',
                                        background: '#09090b',
                                        color: '#fff'
                                      }).then(async (result) => {
                                        if (result.isConfirmed) {
                                          try {
                                            await axios.delete(`/api/products/${p.id}`, {
                                              headers: { 'Idempotency-Key': `delete_product_${p.id}_${Date.now()}_${Math.random()}` }
                                            });
                                            setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                            if (onRefreshData) onRefreshData();
                                            Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#09090b', color: '#fff', showConfirmButton: false, timer: 1000 });
                                          } catch (err: any) {
                                            Swal.fire('Error', 'ไม่สามารถลบสินค้าได้: ' + (err?.response?.data?.error || err.message), 'error');
                                          }
                                        }
                                      });
                                    }
                                  }}
                                  className="p-2 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/60 rounded-md transition-all duration-150"
                                  title="ลบสินค้า"
                                >
                                     <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Mobile Card Layout */}
                  <div className="grid grid-cols-1 gap-4 md:hidden p-4">
                    {products.map((p, i) => (
                      <div key={i} className="bg-card border border-border border p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <img loading="lazy" src={p.imageUrl || undefined} alt={p.name} className="w-12 h-12 object-cover bg-card" />
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold flex items-center gap-2 truncate">
                              <span className="truncate">{p.name}</span>
                              {p.tag && (
                                <span className="shrink-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5">
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-border border">
                          <div>
                            <div className="text-xs text-muted-foreground">ราคา</div>
                            <div className="font-bold flex items-center gap-1.5">
                              {p.originalPrice && p.price && p.originalPrice > p.price && (
                                <span className="text-[10px] text-muted-foreground line-through">฿{p.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-[#10b981]">฿{(p.price || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">สต๊อก</div>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold mt-1 inline-block ${p.stock > 0 ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-zinc-600/10 text-[#10b981]'}`}>
                              {p.stock}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-border border">
                            <button 
                              onClick={async () => {
                                if (p.stock === 0) {
                                  return Swal.fire('ไม่มีสต๊อก', 'สินค้านี้ยังไม่มีข้อมูลสต๊อกให้ดาวน์โหลด', 'error');
                                }
                                try {
                                  const res = await axios.get(`/api/products/${p.id}/stock`);
                                  const sd = res.data.stockData;
                                  if (!sd || sd.length === 0) {
                                    return Swal.fire('ไม่มีสต๊อก', 'สินค้านี้ยังไม่มีข้อมูลสต๊อกให้ดาวน์โหลด', 'error');
                                  }
                                  const text = sd.join('\n');
                                  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                                  const url = URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `stock_${p.name}.txt`;
                                  link.click();
                                  URL.revokeObjectURL(url);
                                } catch (err: any) {
                                  Swal.fire('ข้อผิดพลาด', err.response?.data?.error || err.message, 'error');
                                }
                              }}
                              className="p-2 border border-emerald-200 bg-primary text-primary-foreground text-[#10b981] hover:bg-emerald-100 flex justify-center items-center"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setStockProduct(p)}
                              className="p-2 border border-border border bg-card text-muted-foreground hover:bg-[#121212] hover:border-white/[0.06] flex justify-center items-center"
                            >
                                <Database className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingProduct(p)}
                              className="p-2 border border-border border bg-card text-muted-foreground hover:bg-[#121212] hover:border-white/[0.06] flex justify-center items-center"
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if(setProducts && products.length > 0) {
                                  Swal.fire({
                                    title: 'ยืนยันการลบ',
                                    text: 'คุณต้องการลบสินค้านี้ใช่หรือไม่?',
                                    icon: 'warning',
                                    showCancelButton: true,
                                    confirmButtonColor: '#dc2626',
                                    cancelButtonColor: '#71717a',
                                    confirmButtonText: 'ลบ',
                                    cancelButtonText: 'ยกเลิก',
                                    background: '#09090b',
                                    color: '#fff'
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      try {
                                        await axios.delete(`/api/products/${p.id}`);
                                        setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                        if (onRefreshData) onRefreshData();
                                        Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#09090b', color: '#fff', showConfirmButton: false, timer: 1000 });
                                      } catch (err: any) {
                                        Swal.fire('Error', 'ไม่สามารถลบสินค้าได้', 'error');
                                      }
                                    }
                                  });
                                }
                              }}
                              className="p-2 border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 flex justify-center items-center"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'keys' && (
            <motion.div 
              key="keys"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border border overflow-hidden"
            >
              <div className="p-6 border-b border-border border flex justify-between items-center bg-card">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-[#10b981]" /> Key Management</h3>
                  <p className="text-muted-foreground text-xs mt-1">จัดการคีย์และสต๊อก</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    const activeKeys = licenseKeys.filter(k => k.status === 'active').map(k => k.key).join('\n');
                    const usedKeysStr = licenseKeys.filter(k => k.status === 'used').map(k => k.key).join('\n');
                    const historyKeysStr = usedKeysHistory.map(k => k.key).join('\n');
                    const text = `=== ACTIVE (ยังไม่ได้ใช้) ===\n${activeKeys || 'ไม่มี'}\n\n=== USED (ใช้แล้ว) ===\n${usedKeysStr || historyKeysStr ? `${usedKeysStr}${usedKeysStr && historyKeysStr ? '\n' : ''}${historyKeysStr}` : 'ไม่มี'}`;
                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `license_keys_${new Date().toISOString().slice(0, 10)}.txt`;
                    link.click();
                    URL.revokeObjectURL(url);
                  }} className="bg-card hover:bg-[#050505] text-white px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ">
                    <Download className="w-4 h-4" /> บันทึกเป็น TXT
                  </button>
                  <button onClick={bulkDeleteKeys} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ">
                    <Trash2 className="w-4 h-4" /> ลบคีย์หลายรายการ
                  </button>
                  <button onClick={addLicenseKey} className="bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-white px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ">
                    <Plus className="w-4 h-4" /> สร้างคีย์เพิ่ม
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-card text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="p-4">License Key</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {licenseKeys.length > 0 ? licenseKeys.map((key, i) => (
                      <tr key={i} className="border-b border-border border hover:bg-[#121212]/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 bg-[#10b981]"></div>
                             <span className="text-white font-mono font-bold">{key.key}</span>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(key.key);
                                 Swal.fire({ title: 'Copied!', text: 'คัดลอกคีย์สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' });
                               }}
                               className="text-muted-foreground hover:text-[#10b981] transition-colors p-1"
                               title="Copy Key"
                             >
                               <Copy className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-card text-muted-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold">{key.plan}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${key.status === 'active' ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#121212] text-muted-foreground'}`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteKey(key.id)} className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-12 text-center text-muted-foreground"> ไม่มีข้อมูลคีย์ในระบบ </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {adminTab === 'history' && (
            <motion.div 
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border border overflow-hidden"
            >
               <div className="p-6 border-b border-border border bg-card">
                  <h3 className="font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-[#10b981]" /> Redeem Logs</h3>
                  <p className="text-muted-foreground text-xs mt-1">ประวัติการใช้งานคีย์</p>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-card text-muted-foreground font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Key Used</th>
                      <th className="p-4">User IP</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                      <tr key={i} className="border-b border-border border hover:bg-[#121212]/50 transition-colors">
                        <td className="p-4">
                          <span className="text-white font-bold">{h.key}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{h.ip}</td>
                        <td className="p-4 text-muted-foreground">{new Date(h.used_at).toLocaleString()}</td>
                        <td className="p-4">
                           <span className="bg-primary text-primary-foreground text-[#10b981] px-2 py-0.5 rounded text-[10px] uppercase font-bold">Success</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-12 text-center text-muted-foreground"> ไม่มีประวัติการใช้งาน </td></tr>
                    )}
                  </tbody>
                </table>
               </div>
            </motion.div>
          )}

          {adminTab === 'preorders' && (
            <motion.div 
              key="preorders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Header */}
              <div className="bg-card border border-border border p-6 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#10b981]" /> ระบบจัดการ Pre-Order
                  </h3>
                  <p className="text-muted-foreground text-xs mt-1">
                    จัดการ ยืนยันการสั่งซื้อ เสาะหาไอดี และนำส่งคีย์ข้อมูลให้กับลูกค้า
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      setIsPurchasesLoading(true);
                      const res = await axios.get('/api/purchases?limit=100');
                      setPurchases(res.data.data || []);
                      Swal.fire({
                        icon: 'success',
                        title: 'รีเฟรชข้อมูลสำเร็จ',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 1500,
                        background: '#09090b',
                        color: '#fff'
                      });
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsPurchasesLoading(false);
                    }
                  }}
                  className="bg-[#050505] hover:bg-zinc-850 text-white px-4 py-2 border border-zinc-805 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPurchasesLoading ? 'animate-spin' : ''}`} />
                  ดึงข้อมูลล่าสุด
                </button>
              </div>

              {/* Filtering bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 w-full sm:w-auto">
                  {['all', 'pending', 'delivered'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPreorderFilter(filter as any)}
                      className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold transition-all border ${
                        preorderFilter === filter
                          ? 'bg-[#10b981]/10 text-[#10b981] border-emerald-500/30 font-bold'
                          : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-[#050505] font-bold'
                      }`}
                    >
                      {filter === 'all' && 'ทั้งหมด'}
                      {filter === 'pending' && '⏳ กำลังจัดหาไอดี'}
                      {filter === 'delivered' && '✅ ส่งข้อมูลแล้ว'}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="ค้นหาบิล, ชื่อสินค้า, หรือลูกค้า..."
                    value={preorderSearch}
                    onChange={(e) => setPreorderSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 text-xs font-medium rounded-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Preorders List Table */}
              <div className="bg-card border border-border border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-card text-muted-foreground font-bold tracking-wider border-b border-border border">
                      <tr>
                        <th className="p-4">บิลจัดซื้อ / ผู้ใช้</th>
                        <th className="p-4">สินค้าพรีออเดอร์</th>
                        <th className="p-4">ประเภทที่เลือก</th>
                        <th className="p-4">ยอดเงิน</th>
                        <th className="p-4">สถานะสั่งพรี</th>
                        <th className="p-4">ข้อมูลลับ (ส่งให้ลูกค้า)</th>
                        <th className="p-4 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-mono">
                      {isPurchasesLoading ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground">
                            กำลังโหลดออเดอร์พรีออเดอร์...
                          </td>
                        </tr>
                      ) : filteredPreorders.length > 0 ? (
                        filteredPreorders.map((purchase) => {
                          const isDelivered = purchase.preOrderStatus === 'delivered';
                          const inlineInputKey = `input_${purchase.id}`;
                          
                          return (
                            <tr key={purchase.id} className="border-b border-border border hover:bg-[#050505]/10 transition-colors">
                              {/* Order ID & User */}
                              <td className="p-4">
                                <p className="text-white font-bold">{purchase.billNumber || `#${purchase.id?.slice(0, 8)}`}</p>
                                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{purchase.username || purchase.userId}</p>
                                <p className="text-[9px] text-zinc-500 mt-0.5">{new Date(purchase.date || purchase.timestamp).toLocaleString()}</p>
                              </td>
                              
                              {/* Product Info */}
                              <td className="p-4 font-sans max-w-[200px]">
                                <p className="text-zinc-200 font-bold truncate" title={purchase.productName}>
                                  {purchase.productName}
                                </p>
                                <p className="text-[9px] text-zinc-500 font-mono mt-0.5">ID: {purchase.productId}</p>
                              </td>

                              {/* Selected option */}
                              <td className="p-4">
                                <span className="bg-[#050505] border border-zinc-800 text-zinc-300 px-2.5 py-1 rounded-sm text-[10px] font-semibold">
                                  {purchase.preOrderOption || 'ไม่ได้เลือก'}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 font-sans font-bold text-[#10b981]">
                                ฿{(purchase.price || purchase.money || 0).toLocaleString()}
                              </td>

                              {/* Stock status indicator */}
                              <td className="p-4 font-sans">
                                {isDelivered ? (
                                  <span className="bg-[#10b981]/10 text-[#10b981] border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                                    ✅ ส่งข้อมูลแล้ว
                                  </span>
                                ) : (
                                  <span className="bg-[#10b981]/10 text-[#10b981] border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ">
                                    ⏳ กำลังจัดหาไอดี
                                  </span>
                                )}
                              </td>

                              {/* Secret Input or Output */}
                              <td className="p-4 w-[280px]">
                                {isDelivered ? (
                                  <div className="space-y-1">
                                    <div className="bg-zinc-950 border border-zinc-800 text-zinc-400 p-2 text-[10px] max-h-16 overflow-y-auto font-mono whitespace-pre-wrap break-all rounded">
                                      {purchase.secretData}
                                    </div>
                                  </div>
                                ) : (
                                  <textarea
                                    id={inlineInputKey}
                                    placeholder="ใส่ข้อมูลไอดีที่จะจัดส่ง เช่น Username:Password..."
                                    className="w-full h-12 px-2 py-1.5 bg-zinc-950 border border-zinc-800 text-[11px] rounded focus:outline-none focus:border-emerald-500/40 text-white placeholder-zinc-600 font-mono resize-none"
                                  />
                                )}
                              </td>

                              {/* Submit/Edit Action */}
                              <td className="p-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  {isDelivered ? (
                                    <button
                                      onClick={() => {
                                        Swal.fire({
                                          title: 'แก้ไขข้อมูลที่จัดส่งเลี้ยว',
                                          input: 'textarea',
                                          inputValue: purchase.secretData,
                                          inputPlaceholder: 'กรอกชุดข้อมูลใหม่...',
                                          showCancelButton: true,
                                          confirmButtonText: 'บันทึกใหม่',
                                          cancelButtonText: 'ยกเลิก',
                                          background: '#09090b',
                                          color: '#fff',
                                          confirmButtonColor: '#10b981',
                                          cancelButtonColor: '#27272a'
                                        }).then((result) => {
                                          if (result.isConfirmed && result.value !== undefined) {
                                            handleFulfillPreorder(purchase.id, result.value);
                                          }
                                        });
                                      }}
                                      className="px-2 py-1.5 bg-[#0a0a0a] hover:bg-zinc-700 text-zinc-300 font-sans font-bold text-[10px] rounded hover:text-white transition-colors cursor-pointer"
                                    >
                                      แก้ไข
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        const inputElem = document.getElementById(inlineInputKey) as HTMLTextAreaElement;
                                        const codeInput = inputElem?.value || '';
                                        if (!codeInput.trim()) {
                                          Swal.fire({
                                            icon: 'warning',
                                            title: 'โปรดกรอกข้อมูลไอดีก่อนส่ง',
                                            text: 'ท่านจำเป็นต้องป้อนข้อมูลที่จะจัดส่งให้กับลูกค้า',
                                            confirmButtonColor: '#dc2626',
                                            background: '#09090b',
                                            color: '#fff'
                                          });
                                          return;
                                        }
                                        handleFulfillPreorder(purchase.id, codeInput);
                                      }}
                                      className="px-3 py-1.5 bg-[#10b981] hover:bg-[#10b981] text-white font-sans font-bold text-[10px] rounded transition-colors cursor-pointer"
                                    >
                                      ส่งข้อมูลสำเร็จ
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-muted-foreground">
                            ไม่พบรายการ Pre-Order ที่ค้นหา
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'ips' && (
            <motion.div 
              key="ips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card border border-border border overflow-hidden"
            >
               <div className="p-6 border-b border-border border flex justify-between items-center bg-card">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Ban className="w-5 h-5 text-[#10b981]" /> IP Access Control</h3>
                    <p className="text-muted-foreground text-xs mt-1">แบนผู้ใช้งานที่ไม่พึงประสงค์</p>
                  </div>
                  <button onClick={blockIP} className="bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-white px-6 py-2.5 text-xs font-bold transition-all flex items-center gap-2 ">
                     <Ban className="w-4 h-4" /> แบน IP ใหม่
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                    <thead className="text-xs uppercase bg-card text-muted-foreground font-bold tracking-wider">
                      <tr>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Date Blocked</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                        <tr key={i} className="border-b border-border border hover:bg-[#121212]/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#10b981] font-bold tracking-tight">{ip.ip}</span>
                              <button onClick={() => { navigator.clipboard.writeText(ip.ip); Swal.fire({ title: 'Copied!', text: 'คัดลอก IP สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-muted-foreground hover:text-[#10b981]"><Copy className="w-3 h-3" /></button>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground italic">"{ip.reason}"</td>
                          <td className="p-4 text-muted-foreground">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => unblockIP(ip.ip)} className="text-[#10b981] hover:text-emerald-700 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-emerald-100 px-3 py-1.5 border border-emerald-100 transition-all">
                                ปลดแบน (Unblock)
                             </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-12 text-center text-muted-foreground">ไม่มีรายการแบน</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </motion.div>
          )}

          {adminTab === 'pages' && (
            <motion.div 
              key="pages"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminPagesManagement customPages={customPages} setCustomPages={setCustomPages} />
            </motion.div>
          )}

          {adminTab === 'categories' && (
            <motion.div 
              key="categories"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminCategoriesManagement 
                categories={categories} 
                setCategories={setCategories} 
                products={products}
                setProducts={setProducts}
              />
            </motion.div>
          )}

          {adminTab === 'tools' && (
            <motion.div 
              key="tools"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminToolsManagement />
            </motion.div>
          )}

          {adminTab === 'bot' && (
            <motion.div 
              key="bot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminBotManagement />
            </motion.div>
          )}

          {adminTab === 'proxy' && (
            <motion.div 
              key="proxy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <ProxyFreeTool />
            </motion.div>
          )}

          {adminTab === 'api_keys' && (
            <motion.div 
              key="api_keys"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminApiKeys />
            </motion.div>
          )}

          {adminTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border border overflow-hidden">
                <div className="p-6 border-b border-border border bg-card">
                  <h3 className="font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-muted-foreground" /> Site Settings</h3>
                  <p className="text-muted-foreground text-xs mt-1">ตั้งค่าพารามิเตอร์ต่างๆ ของระบบ</p>
                </div>
                <div className="p-6 space-y-8">
                   <div className="p-6 bg-card border border-border border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#10b981]" /> ชื่อเว็บไซต์ (Site Name)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.site_name}
                          onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="APEXSTORE"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Phone className="w-4 h-4 text-[#10b981]" /> เบอร์รับเงินวอลเล็ต
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.truewallet_phone}
                          onChange={(e) => setSiteSettings({ ...siteSettings, truewallet_phone: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="095xxxxxxx"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#10b981]" /> ชื่อธนาคาร (เช่น ธนาคารกสิกรไทย)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_name || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_name: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="ธนาคารกสิกรไทย"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#10b981]" /> เลขบัญชีบัญชาการ (เช่น 196-3-87032-5)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_account_number || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_number: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="196-3-87032-5"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#10b981]" /> ชื่อเจ้าของบัญชี (เช่น นาย กรวิชญ์)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_account_holder || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_holder: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="นาย กรวิชญ์"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#10b981]" /> ลิงก์รูปภาพ QR Code พร้อมเพย์ / ธนาคาร (ปล่อยว่างเพื่อใช้แบบ Dynamic QR)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_qr_image || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_qr_image: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-[#10b981]" /> ลิงก์ Discord
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.discord_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, discord_link: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="https://discord.gg/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-[#10b981]" /> ลิงก์ Facebook Page
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.facebook_link || siteSettings.contact_line}
                          onChange={(e) => setSiteSettings({ ...siteSettings, facebook_link: e.target.value, contact_line: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="https://www.facebook.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-pink-500" /> ลิงก์ Instagram
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.instagram_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram_link: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-pink-500"
                          placeholder="https://www.instagram.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <MessageSquare className="w-4 h-4 text-[#10b981]" /> ข้อความประกาศ (Announcement Bar)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.announcement_text || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                          placeholder="พิมพ์ข้อความที่ต้องการให้วิ่งบนแถบประกาศ..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-muted-foreground" /> อีเมลติดต่อ (Support)
                        </label>
                        <input 
                          type="email"
                          value={siteSettings.contact_email}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                          className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-zinc-500"
                          placeholder="support@example.com"
                        />
                      </div>

                      <div className="flex items-end">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full bg-card text-white px-8 py-5 text-sm font-semibold hover:bg-[#1e1e1e] transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                          <Settings className="w-5 h-5" /> บันทึกการตั้งค่า
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-card border border-border border">
                      <div className="mb-6">
                        <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-[#10b981]" /> แผงควบคุมเพลงพื้นหลัง (Background Music)</h4>
                        <p className="text-muted-foreground text-sm mt-1">ใส่ลิ้งค์ YouTube, Spotify หรืออัพโหลดไฟล์เสียงโดยตรง (.mp3) เพื่อเปิดเพลงอัตโนมัติเมื่อผู้ใช้เข้าเว็บ</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-muted-foreground flex items-center gap-2">
                               ลิ้งค์เพลง (แนะนำ YouTube หรือไฟล์อัพโหลดเพื่อเพลงเต็ม)
                            </label>
                            <div className="relative group">
                              <button 
                                onClick={() => musicFileRef.current?.click()}
                                disabled={uploadingMusic}
                                className="flex items-center gap-2 text-xs font-bold text-[#10b981] hover:text-[#10b981]/80 transition-colors disabled:opacity-50"
                              >
                                {uploadingMusic ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                อัพโหลดไฟล์เสียง
                              </button>
                              <input 
                                type="file" 
                                ref={musicFileRef} 
                                onChange={handleMusicUpload} 
                                className="hidden" 
                                accept="audio/*"
                              />
                            </div>
                          </div>
                          <input 
                            type="text"
                            value={siteSettings.spotify_url || ''}
                            onChange={(e) => setSiteSettings({ ...siteSettings, spotify_url: e.target.value })}
                            className="w-full bg-card border border-border border px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
                            placeholder="https://... YouTube, Spotify หรือ ไฟล์อัพโหลด"
                          />
                        </div>
                        <div className="flex items-center space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer group mt-8">
                            <div className="relative flex items-center justify-center">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={siteSettings.spotify_autoplay}
                                onChange={(e) => setSiteSettings({ ...siteSettings, spotify_autoplay: e.target.checked })}
                              />
                              <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${siteSettings.spotify_autoplay ? 'bg-[#10b981] border-emerald-500' : 'bg-[#121212] border-border group-hover:border-zinc-400'}`}>
                                {siteSettings.spotify_autoplay && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">เปิดใช้งานเล่นอัตโนมัติ (Autoplay)</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">* แนะนำใช้ YouTube หรือ ไฟล์อัพโหลดเพื่อให้ได้เพลงเต็ม (Spotify จะติดพรีวิว 30 วิ)</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-[#10b981] text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> บันทึกการตั้งค่าเพลง
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-100 flex items-start gap-4">
                      <div className="p-2 bg-amber-500/20">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-800">หมายเหตุเกี่ยวกับข้อมูลสถิติ</p>
                        <p className="text-[10px] text-amber-700/80 mt-1 leading-relaxed">
                          ผู้ใช้งาน = ยอดปรับแต่ง (Offset) + ผู้ใช้งานจริงที่เคยสั่งซื้อ <br/>
                          ยอดขาย = ยอดปรับแต่ง (Offset) + ยอดเงินจริงจากออเดอร์
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-border border mt-8">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">API Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="flex items-center justify-between p-3 bg-card border border-border border">
                        <span className="text-muted-foreground font-bold uppercase">Angpao API</span>
                        <span className="text-[#10b981] font-semibold">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-card border border-border border">
                        <span className="text-muted-foreground font-bold uppercase">Bank Slip API</span>
                        <span className="text-[#10b981] font-semibold">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'banners' && (
            <motion.div 
              key="banners"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border border overflow-hidden">
                <div className="p-6 border-b border-border border bg-card">
                  <h3 className="font-bold text-white flex items-center gap-2"><Image className="w-5 h-5 text-muted-foreground" /> จัดการป้ายโฆษณา & ป็อปอัพ</h3>
                  <p className="text-muted-foreground text-xs mt-1">ตั้งค่ารูปภาพแบนเนอร์และป็อปอัพประกาศ</p>
                </div>
                <div className="p-6 space-y-8">
                  <div className="p-6 bg-card border border-border border">
                    <div className="mb-6">
                      <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-muted-foreground" /> Popup Banner Announcement</h4>
                      <p className="text-muted-foreground text-sm mt-1">ตั้งค่าป็อปอัพประกาศหน้าแรก แนะนำรูปขนาด 1500x1500px</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 col-span-1 md:col-span-2">
                        <label className="flex items-center gap-3 cursor-pointer group w-fit">
                          <div className="relative flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              className="sr-only" 
                              checked={siteSettings.popup_enabled}
                              onChange={(e) => setSiteSettings({ ...siteSettings, popup_enabled: e.target.checked })}
                            />
                            <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${siteSettings.popup_enabled ? 'bg-zinc-600 border-[#10b981]' : 'bg-[#121212] border-border group-hover:border-zinc-400'}`}>
                              {siteSettings.popup_enabled && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white">เปิดใช้งานป็อปอัพประกาศ</span>
                        </label>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-muted-foreground">รูปภาพประกาศ (ขนาดที่แนะนำ 940 x 480 px)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text"
                            value={siteSettings.popup_img_url}
                            onChange={(e) => setSiteSettings({ ...siteSettings, popup_img_url: e.target.value })}
                            className="flex-1 w-full bg-card border border-border border px-4 py-3 text-white text-sm focus:outline-none focus:border-[#10b981] transition-all"
                            placeholder="https://images.unsplash.com/photo-..."
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const formData = new FormData();
                                  formData.append('file', file);
                                  Swal.fire({ title: 'กำลังอัพโหลด...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                                  const res = await axios.post('/api/upload', formData);
                                  if (res.data?.url) {
                                     setSiteSettings({ ...siteSettings, popup_img_url: res.data.url });
                                     Swal.fire({ icon: 'success', title: 'อัพโหลดสำเร็จ', timer: 1500, showConfirmButton: false });
                                  }
                                } catch (err: any) {
                                  Swal.fire('Error', 'อัพโหลดล้มเหลว: ' + (err.response?.data?.error || err.message), 'error');
                                }
                              };
                              input.click();
                            }}
                            className="px-6 bg-primary text-primary-foreground text-[#10b981] font-bold hover:bg-zinc-600/20 flex items-center justify-center whitespace-nowrap gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4"/> อัพโหลดภาพ
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-muted-foreground">ลิ้งค์ปลายทางเมื่อคลิกรูปภาพป็อปอัพ (ปล่อยว่างได้)</label>
                         <input 
                           type="text"
                           value={siteSettings.popup_link}
                           onChange={(e) => setSiteSettings({ ...siteSettings, popup_link: e.target.value })}
                           className="w-full bg-card border border-border border px-4 py-3 text-white text-sm focus:outline-none focus:border-[#10b981] transition-all"
                           placeholder="https://facebook.com/..."
                         />
                      </div>
                    </div>

                    <div className="p-6 bg-card border border-border border mt-6">
                      <div className="mb-6">
                        <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-[#10b981]" /> Proxy Settings</h4>
                        <p className="text-muted-foreground text-xs mt-1">ตั้งค่า Proxy สำหรับระบบเช็คไอดี (หากปล่อยว่าง ระบบจะดึง Free Proxy อัตโนมัติ)</p>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <label className="block text-sm font-bold text-muted-foreground">Custom Proxy URLs (1 บรรทัดต่อ 1 Proxy - ปล่อยว่างเพื่อใช้ Free Proxy)</label>
                           <button
                             type="button"
                             onClick={async () => {
                               try {
                                 Swal.fire({
                                   title: 'กำลังโหลดข้อมูล...',
                                   text: 'กรุณารอสักครู่',
                                   allowOutsideClick: false,
                                   didOpen: () => {
                                     Swal.showLoading();
                                   },
                                   background: '#0B0D0F',
                                   color: '#fff'
                                 });
                                 const res = await axios.get('https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/protocols/http/data.txt');
                                 if (typeof res.data === 'string') {
                                   let px = res.data.split('\n').filter((p: string) => p.trim().length > 5);
                                   px = px.map((p: string) => p.startsWith('http') ? p : `http://${p}`);
                                   setSiteSettings({ ...siteSettings, proxies: px });
                                   Swal.fire({
                                     icon: 'success',
                                     title: 'สำเร็จ',
                                     text: `ดึง Proxy ได้ทั้งหมด ${px.length} รายการ`,
                                     background: '#0B0D0F',
                                     color: '#fff',
                                     confirmButtonColor: '#10b981'
                                   });
                                 }
                               } catch (err: any) {
                                 Swal.fire({
                                   icon: 'error',
                                   title: 'เกิดข้อผิดพลาด',
                                   text: err.message,
                                   background: '#0B0D0F',
                                   color: '#fff'
                                 });
                               }
                             }}
                             className="text-xs font-bold text-[#10b981] hover:text-[#10b981]/80 flex items-center gap-1.5"
                           >
                             <Globe className="w-4 h-4" /> ดึง Proxy ล่าสุด (Proxifly)
                           </button>
                         </div>
                         <textarea 
                           value={(siteSettings.proxies || []).join('\n')}
                           onChange={(e) => setSiteSettings({ ...siteSettings, proxies: e.target.value.split('\n') })}
                           className="w-full bg-card border border-border border px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-all h-32 resize-none leading-relaxed"
                           placeholder="http://user:pass@127.0.0.1:8080&#10;http://user:pass@127.0.0.2:8080"
                           onBlur={(e) => setSiteSettings({ ...siteSettings, proxies: e.target.value.split('\n').map(url => typeof url === 'string' ? url.trim() : '').filter(Boolean) })}
                         />
                         <p className="text-xs text-muted-foreground mt-2">รูปแบบ: http://[user]:[password]@[ip]:[port] หรือ http://[ip]:[port]</p>
                         
                         <label className="flex items-center gap-3 cursor-pointer group mt-4">
                           <div className="relative flex items-center justify-center">
                             <input 
                               type="checkbox" 
                               className="sr-only" 
                               checked={siteSettings.auto_proxy !== false}
                               onChange={(e) => setSiteSettings({ ...siteSettings, auto_proxy: e.target.checked })}
                             />
                             <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${siteSettings.auto_proxy !== false ? 'bg-zinc-600 border-[#10b981]' : 'bg-[#121212] border-border group-hover:border-zinc-400'}`}>
                               {siteSettings.auto_proxy !== false && <Check className="w-3.5 h-3.5 text-white" />}
                             </div>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">ใช้ Free Proxies อัตโนมัติร่วมกับ Proxy ด้านบน (รวมกัน)</span>
                             <span className="text-xs text-muted-foreground mt-0.5">ระบบจะดึงจาก Proxifly และสลับให้อัตโนมัติในพื้นหลัง (แนะนำให้เปิดไว้เพื่อกันบล็อก)</span>
                           </div>
                         </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-card border border-border border">
                    <div className="mb-6">
                      <h4 className="text-white font-bold flex items-center gap-2"><Image className="w-5 h-5 text-muted-foreground" /> Banners Announcement</h4>
                      <p className="text-muted-foreground text-sm mt-1">ป้ายสไลด์โฆษณาในหน้าแรกของเว็บไซต์</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-muted-foreground">รูปภาพป้ายโฆษณาหน้าแรก (URL 1 บรรทัดต่อ 1 รูปภาพ)</label>
                         <textarea 
                           value={(siteSettings.banners || []).join('\n')}
                           onChange={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n') })}
                           className="w-full bg-card border border-border border px-4 py-3 text-white text-sm focus:outline-none focus:border-[#10b981] transition-all h-32 resize-none leading-relaxed"
                           placeholder="https://img.th/banner1.png&#10;https://img.th/banner2.png"
                           onBlur={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n').map(url => url.trim()).filter(Boolean) })}
                         />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end pt-4">
                    <button 
                      onClick={handleSaveSettings}
                      className="w-full bg-primary text-primary-foreground text-white px-8 py-4 text-sm font-semibold hover:bg-zinc-600/80 transition-all flex items-center justify-center gap-3 "
                    >
                      <Image className="w-5 h-5" /> บันทึกการตั้งค่าป้ายโฆษณา
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'system' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-card border border-border border overflow-hidden">
                <div className="p-6 border-b border-border border flex justify-between items-center bg-card">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-[#10b981]" /> System Monitoring</h3>
                    <p className="text-muted-foreground text-xs mt-1">Realtime node state and resource allocation</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "CPU Usage", value: "14%", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Memory (RAM)", value: "512MB / 1GB", icon: HardDrive, color: "text-[#10b981]", bg: "bg-indigo-50" },
                      { label: "Network IO", value: "24 Mbps", icon: Activity, color: "text-[#10b981]", bg: "bg-emerald-50" },
                      { label: "Uptime", value: "94 Days", icon: BarChart3, color: "text-[#10b981]", bg: "bg-cyan-50" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-card border border-border border p-4 flex items-center gap-4 transition-colors hover:bg-[#121212]/50">
                        <div className={`p-3 ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-bold uppercase">{stat.label}</p>
                          <p className="text-lg font-bold font-mono text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-border border pt-8">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Gift className="w-4 h-4 text-[#10b981]" /> Third-party Integrations
                    </h4>
                    <div className="bg-card border border-border border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-card border border-border border flex items-center justify-center">
                           <Globe className="w-6 h-6 text-muted-foreground" />
                         </div>
                         <div className="text-center sm:text-left">
                           <p className="text-sm font-semibold text-white">Manybaht TrueWallet API</p>
                           <p className="text-xs font-medium text-muted-foreground select-all">https://github.com/manybaht/Manybaht-Truewallet-API</p>
                         </div>
                       </div>
                       <a href="https://github.com/manybaht/Manybaht-Truewallet-API" target="_blank" rel="noopener noreferrer" className="bg-card border border-border border text-muted-foreground px-6 py-2.5 text-xs font-bold hover:bg-[#121212] transition-all flex items-center gap-2">
                         <Copy className="w-4 h-4" /> View Source
                       </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Database className="w-4 h-4" /> Environment Information
                    </h4>
                    <div className="bg-card border border-border border p-4 font-mono text-xs space-y-3">
                      <div className="flex justify-between border-b border-white/[0.04]/60 pb-2">
                         <span className="text-muted-foreground font-bold">Node JS</span>
                         <span className="text-muted-foreground">v22.x.x</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.04]/60 pb-2">
                         <span className="text-muted-foreground font-bold">Database</span>
                         <span className="text-[#10b981] font-bold">Connected (Supabase)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/[0.04]/60 pb-2">
                         <span className="text-muted-foreground font-bold">Build Mode</span>
                         <span className="text-[#10b981] font-bold">Production</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-muted-foreground font-bold">Vite Config</span>
                         <span className="text-amber-600 font-bold">Optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {adminTab === 'stock' && (
            <motion.div 
              key="stock"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AdminStockManagement
                products={products}
                categories={categories}
                setProducts={setProducts}
              />
            </motion.div>
          )}

        </AnimatePresence>
        )}

        {isAddingProduct && (
          <ProductManagerModal 
            isEdit={false}
            categories={categories}
            onClose={() => setIsAddingProduct(false)}
            onSave={async (p) => {
              if (setProducts) {
                try {
                  const res = await axios.post('/api/products', p, {
                    headers: { 'Idempotency-Key': `post_product_${Date.now()}_${Math.random()}` }
                  });
                  setProducts(prev => [...prev, res.data]);
                  if (onRefreshData) onRefreshData();
                  setIsAddingProduct(false);
                  Swal.fire({ title: 'เพิ่มสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                } catch (err: any) {
                  const errMsg = err?.response?.data?.error || err.message || 'Unknown error';
                  console.error('Error adding product:', err);
                  Swal.fire('Error', `ไม่สามารถเพิ่มสินค้าได้: ${errMsg}`, 'error');
                }
              }
            }}
          />
        )}
        
        {editingProduct && (
          <ProductManagerModal 
            product={editingProduct}
            isEdit={true}
            categories={categories}
            onClose={() => setEditingProduct(undefined)}
            onSave={async (p) => {
              if (setProducts) {
                try {
                  const res = await axios.put(`/api/products/${p.id}`, p, {
                    headers: { 'Idempotency-Key': `put_product_${p.id}_${p._version}_${Date.now()}_${Math.random()}` }
                  });
                  setProducts(prev => prev.map(prod => prod.id === p.id ? res.data : prod));
                  if (onRefreshData) onRefreshData();
                  setEditingProduct(undefined);
                  Swal.fire({ title: 'แก้ไขสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                } catch (err: any) {
                  const status = err?.response?.status;
                  const errMsg = err?.response?.data?.error || err.message || 'Unknown error';
                  if (status === 409) {
                    Swal.fire('ข้อขัดข้อง', errMsg, 'warning');
                    if (onRefreshData) onRefreshData();
                  } else {
                    console.error('Error updating product:', err);
                    Swal.fire('Error', `ไม่สามารถแก้ไขสินค้าได้: ${errMsg}`, 'error');
                  }
                }
              }
            }}
          />
        )}

        {stockProduct && (
          <AddStockModal 
            product={stockProduct}
            onClose={() => setStockProduct(undefined)}
            onAppendStock={async (newItems) => {
              if (setProducts) {
                try {
                  const maxBytesPerChunk = 400 * 1024; // 400KB payload chunking
                  const chunks: string[][] = [];
                  let currentChunk: string[] = [];
                  let currentChunkSize = 0;
                  
                  for (let i = 0; i < newItems.length; i++) {
                    const item = newItems[i];
                    const itemSize = item.length * 2; // Approximate byte size to be safe (UTF-16)
                    if (currentChunkSize + itemSize > maxBytesPerChunk && currentChunk.length > 0) {
                      chunks.push(currentChunk);
                      currentChunk = [item];
                      currentChunkSize = itemSize;
                    } else {
                      currentChunk.push(item);
                      currentChunkSize += itemSize;
                    }
                  }
                  if (currentChunk.length > 0) {
                    chunks.push(currentChunk);
                  }
                  
                  if (chunks.length > 1) {
                    Swal.fire({
                      title: 'กำลังอัพโหลดสต๊อก',
                      text: `กำลังส่งข้อมูล ${chunks.length} ชุด ป้องกันขนาดเกินกำหนด...`,
                      icon: 'info',
                      showConfirmButton: false,
                      allowOutsideClick: false,
                      background: '#09090b', color: '#fff'
                    });
                  }

                  let lastRes;
                  let addedCount = 0;
                  for (let i = 0; i < chunks.length; i++) {
                    lastRes = await axios.post(`/api/products/${stockProduct.id}/stock`, { newItems: chunks[i] });
                    addedCount += chunks[i].length;
                  }
                  
                  if (lastRes && lastRes.data?.product) {
                     setProducts(prev => prev.map(prod => prod.id === stockProduct.id ? lastRes.data.product : prod));
                  } else {
                     const fresh = await axios.get(`/api/products/${stockProduct.id}`);
                     setProducts(prev => prev.map(prod => prod.id === stockProduct.id ? fresh.data : prod));
                  }

                  setStockProduct(undefined);
                  Swal.fire({ title: 'เพิ่มสต๊อกสำเร็จ', text: `เพิ่มแล้ว ${addedCount} รายการ`, icon: 'success', background: '#09090b', color: '#fff' });
                } catch (err: any) {
                  const errorExt = err.response?.data?.error || err.message || JSON.stringify(err);
                  console.error("Update stock error:", err.response?.data || err);
                  Swal.fire('Error', `ไม่สามารถอัพเดตสต๊อกได้: ${typeof errorExt === 'object' ? JSON.stringify(errorExt) : errorExt}`, 'error');
                }
              }
            }}
          />
        )}
      </div>
      </main>
    </div>
  );
};
