import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Database, LogOut, BarChart3, Key, History, ShieldAlert, Activity, Ban, ChevronRight, Settings, Plus, Trash2, Crown, X, Menu, Upload, FileText, LayoutDashboard, LineChart, Cpu, HardDrive, ShoppingCart, Package, Users, Wallet, Gift, Globe, Phone, AlertTriangle, Download, Check, Image, MessageSquare, Terminal, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AccountResult, Product, SiteStats } from '../types';
import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { AdminApiKeys } from './AdminApiKeys';
import { AdminBotManagement } from './AdminBotManagement';

interface AdminDashboardProps {
  totalChecked: number;
  validAccounts: AccountResult[];
  licenseKeys: any[];
  usedKeysHistory: any[];
  blockedIPs: any[];
  adminTab: string;
  setAdminTab: (tab: string) => void;
  products?: Product[];
  setProducts?: (products: Product[]) => void;
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
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    imageUrl: '',
    stock: 0,
    category: categories.length > 0 ? categories[0].id : ''
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-400" />
          {isEdit ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">ชื่อสินค้า</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="e.g. Netflix Premium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">รายละเอียด</label>
            <textarea 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm h-20 resize-none"
              placeholder="รายละเอียดสินค้า..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">ราคาปัจจุบัน (THB)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1 text-zinc-400">ราคาเต็ม (ถ้ามี)</label>
              <input 
                type="number" 
                value={formData.originalPrice || 0} 
                onChange={e => setFormData({...formData, originalPrice: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white/50 focus:outline-none focus:border-[#1a7fe6] text-sm"
                placeholder="฿0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">สต๊อก</label>
              <input 
                type="number" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">หมวดหมู่</label>
              <select 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">URL รูปภาพ</label>
            <input 
              type="text" 
              value={formData.imageUrl} 
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={() => {
              if(!formData.name || formData.price === undefined || formData.price === null) return Swal.fire({title: 'แจ้งเตือน', text: 'กรุณากรอกชื่อและราคา', icon: 'warning'});
              onSave(formData as Product);
            }}
            className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-bold transition-colors"
          >
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
  const [mode, setMode] = useState<'text'|'file'|'single-file'>('file');
  const [stockCount, setStockCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const singleFileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        // Fast processing
        const lines = text.split('\n').filter(l => l.trim().length > 0).map(l => l.trim());
        setFileStockPreview(lines);
      }
    };
    reader.readAsText(file);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    const maxFileSize = 5 * 1024 * 1024; // 5MB limit
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
        Swal.fire({title: 'พบไฟล์ใหญ่เกิน 5MB', text: `มี ${rejectedFiles.length} ไฟล์ที่มีขนาดใหญ่กว่า 5MB เช่น ${rejectedFiles[0]} ระบบจึงต้องข้ามไฟล์เหล่านี้ไป (เพิ่มไปแค่ไฟล์ที่ขนาดผ่าน)`, icon: 'warning', background: '#09090b', color: '#fff'});
      }
    }
  };

  const updateTextCount = () => {
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

  useEffect(() => {
    updateTextCount();
  }, [linesPerStock]);

  const handleSaveStock = () => {
    let newItems: string[] = [];
    if (mode === 'text' && textRef.current && textRef.current.value.trim()) {
      const text = textRef.current.value;
      const lines = text.split('\n').map(x => x.trim()).filter(x => x.length > 0);
      if (linesPerStock > 1) {
        for (let i = 0; i < lines.length; i += linesPerStock) {
          const chunk = lines.slice(i, i + linesPerStock).join('\n');
          newItems.push(chunk);
        }
      } else {
        newItems = lines;
      }
    } else if (mode === 'file' && fileStockPreview.length > 0) {
      if (linesPerStock > 1) {
        for (let i = 0; i < fileStockPreview.length; i += linesPerStock) {
          const chunk = fileStockPreview.slice(i, i + linesPerStock).join('\n');
          newItems.push(chunk);
        }
      } else {
        newItems = [...fileStockPreview];
      }
    } else if (mode === 'single-file' && singleFilesPreview.length > 0) {
      newItems = singleFilesPreview.map(f => JSON.stringify({ type: 'file', name: f.name, data: f.b64 }));
    }

    if (newItems.length === 0) {
      return Swal.fire({title: 'ข้อมูลว่างเปล่า', text: 'ไม่ได้เพิ่มสต๊อกใหม่', icon: 'error', background: '#09090b', color: '#fff'});
    }

    // Increase message if it's huge so user knows it might take time
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          เพิ่มสต๊อก: {product.name}
        </h2>
        
        <div className="flex bg-zinc-900 p-1 rounded-xl mb-6">
          <button 
            onClick={() => setMode('file')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'file' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ .txt (หลายสต๊อก)
          </button>
          <button 
            onClick={() => setMode('single-file')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'single-file' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            ไฟล์ทั่วไป (1 ไฟล์ = 1 สต๊อก)
          </button>
          <button 
            onClick={() => setMode('text')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mode === 'text' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            วางข้อความ
          </button>
        </div>

        {mode === 'file' && (
          <div className="space-y-4">
            <div 
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-indigo-400 mb-3" />
              <p className="text-sm font-bold text-zinc-300">คลิกเพื่ออัพโหลดไฟล์ .txt</p>
              <p className="text-xs text-zinc-500 mt-1">1 บรรทัด = 1 สต๊อก</p>
              <input 
                type="file" 
                accept=".txt" 
                className="hidden" 
                ref={fileRef}
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <label className="text-sm font-bold text-zinc-400">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-white text-center font-bold"
              />
            </div>

            {fileStockPreview.length > 0 && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-indigo-400">พบข้อมูลสต๊อก</p>
                    <p className="text-xs text-indigo-400/80">พร้อมเพิ่ม {Math.ceil(fileStockPreview.length / linesPerStock)} รายการ (จาก {fileStockPreview.length} บรรทัด)</p>
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
              className="border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 bg-zinc-900/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-indigo-400 mb-3" />
              <p className="text-sm font-bold text-zinc-300">อัพโหลดไฟล์สินค้า</p>
              <p className="text-xs text-zinc-500 mt-1">สูงสุด 5MB ต่อไฟล์ (เลือกหลายไฟล์ได้)</p>
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
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 flex items-center justify-between">
                    <span className="text-xs font-medium truncate max-w-[200px] text-zinc-300">{f.name}</span>
                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Ready</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'text' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <label className="text-sm font-bold text-zinc-400">จำนวนบรรทัดต่อ 1 สต๊อก</label>
              <input 
                type="number" 
                min="1" 
                value={linesPerStock} 
                onChange={(e) => setLinesPerStock(Math.max(1, parseInt(e.target.value) || 1))} 
                className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1 text-white text-center font-bold"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-500">วางข้อมูลสต๊อก</label>
                <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded">
                  คำนวณได้: {stockCount} สต๊อก
                </span>
              </div>
              <textarea 
                ref={textRef}
                onChange={updateTextCount}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 text-sm h-40 resize-none font-mono text-xs leading-relaxed"
                placeholder="ข้อมูลบรรทัดที่ 1&#10;ข้อมูลบรรทัดที่ 2&#10;ข้อมูลบรรทัดที่ 3&#10;..."
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-colors"
          >
            ยกเลิก
          </button>
          <button 
            onClick={handleSaveStock}
            className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-bold transition-colors"
          >
            เพิ่มสต๊อกเข้าสู่ระบบ
          </button>
        </div>
      </div>
    </div>
  );
};


const DatabaseSetupGuide = ({ dbErrorDetail }: { dbErrorDetail?: string | null }) => (
  <div className="bg-zinc-900/50 border border-amber-500/20 rounded-2xl p-8 max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-xl shadow-xl">
    <div className="flex items-center gap-4 mb-8">
      <div className="p-4 bg-amber-500/20 rounded-2xl">
        <Database className="w-8 h-8 text-amber-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Offline / Database Connectivity Issue</h2>
        <p className="text-zinc-500 text-sm mt-1">The application backend or database is currently unreachable.</p>
      </div>
    </div>
    
    {dbErrorDetail && (
      <div className="mb-8 p-4 bg-[#1E90FF]/10 border border-[#1E90FF]/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-[#1a7fe6]" />
          <h4 className="text-[#1a7fe6] text-[10px] font-black uppercase tracking-widest">สถานะปัจจุบัน (Status):</h4>
        </div>
        <p className="text-zinc-400 text-xs font-mono break-all bg-black/40 p-3 rounded-xl border border-white/5">{dbErrorDetail}</p>
      </div>
    )}
    
    <div className="space-y-4">
      <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-2">Troubleshooting Steps</h3>
        <ul className="list-disc list-inside text-sm text-zinc-400 space-y-2">
          <li>Ensure the backend server is running correctly.</li>
          <li>If hosted on Vercel, check the Serverless Function logs for errors.</li>
        </ul>
        <div className="mt-6 flex justify-end">
          <button 
           onClick={() => window.location.reload()}
           className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition"
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

  const [siteSettings, setSiteSettings] = useState({ 
    site_name: 'APEX STUDIO',
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
    spotify_autoplay: false
  });

  const [uploadingMusic, setUploadingMusic] = useState(false);
  const musicFileRef = useRef<HTMLInputElement>(null);

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด',
        text: 'ไฟล์มีขนาดใหญ่เกินไป (จำกัด 50MB)',
        icon: 'error',
        background: '#0B0F14',
        color: '#fff',
        confirmButtonColor: '#1a7fe6'
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
          background: '#0B0F14',
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
        background: '#0B0F14',
        color: '#fff',
        confirmButtonColor: '#1a7fe6'
      });
    } finally {
      setUploadingMusic(false);
      if (musicFileRef.current) musicFileRef.current.value = '';
    }
  };

  useEffect(() => {
    if (adminTab === 'settings' || adminTab === 'banners') {
      const fetchSettings = async () => {
        try {
          const res = await axios.get('/api/settings');
          if (res.data) setSiteSettings(res.data);
        } catch (err) {}
      };
      fetchSettings();
    }
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
          confirmButtonColor: '#1E90FF',
          background: '#0B0F14',
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
        background: '#0B0F14',
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

  const NavItem = ({ id, label, icon: Icon, color }: any) => (
    <button
      onClick={() => {
        setAdminTab(id);
        setIsNavOpen(false);
      }}
      className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl transition-all duration-300 border ${
        adminTab === id 
        ? 'bg-[#1E90FF] border-[#1E90FF] text-white shadow-xl shadow-[#1E90FF]/25' 
        : 'bg-[#121820] border-white/5 text-zinc-400 hover:border-zinc-700 hover:bg-[#1a232d] hover:text-white'
      }`}
    >
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${adminTab === id ? 'bg-white/20' : 'bg-black/20 text-[#1E90FF]'}`}>
        <Icon className="w-8 h-8" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0a0d12] flex flex-col font-sans">
      {/* Navigation Modal */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          >
            <div 
              className="absolute inset-0 bg-[#0a0d12]/95 backdrop-blur-md"
              onClick={() => setIsNavOpen(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl bg-[#0B0F14] border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-[#1E90FF] rounded-3xl shadow-lg shadow-[#1E90FF]/20">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase">Control Center</h2>
                    <p className="text-[#1E90FF] text-sm font-black tracking-[0.2em] opacity-80">APEX DASHBOARD SYSTEM</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsNavOpen(false)}
                  className="p-4 bg-[#121820] text-zinc-500 hover:text-white rounded-2xl transition-all"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="space-y-12 pb-12">
                <section>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 px-2">GENERAL</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <NavItem id="overview" label="หน้าภาพรวม" icon={LayoutDashboard} />
                    <NavItem id="analytics" label="ข้อมูลวิเคราะห์" icon={LineChart} />
                    <NavItem id="settings" label="ตั้งค่าเว็บไซต์" icon={Settings} />
                    <NavItem id="system" label="สถานะระบบ" icon={Cpu} />
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 px-2">SHOP MANAGEMENT</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <NavItem id="store" label="สินค้าในร้าน" icon={Package} />
                    <NavItem id="categories" label="หมวดหมู่สินค้า" icon={LayoutDashboard} />
                    <NavItem id="banners" label="ตั้งค่าแบนเนอร์" icon={Image} />
                    <NavItem id="pages" label="ตั้งค่าหน้าเพจ" icon={FileText} />
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 px-2">USERS & REPORTS</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <NavItem id="users" label="สมาชิกทั้งหมด" icon={Users} />
                    <NavItem id="keys" label="LICENSE KEYS" icon={Key} />
                    <NavItem id="history" label="ประวัติรายการ" icon={History} />
                    <NavItem id="ips" label="ความปลอดภัย" icon={ShieldAlert} />
                  </div>
                </section>

                <section>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 px-2">DEVELOPER TOOLS</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    <NavItem id="bot" label="ระบบบอท" icon={Terminal} />
                    <NavItem id="tools" label="ตัวช่วยแจกของ" icon={Gift} />
                    <NavItem id="api_keys" label="ระบบ API" icon={Key} />
                  </div>
                </section>
              </div>

              <div className="sticky bottom-0 mt-8 pt-8 border-t border-white/5 bg-[#0B0F14] flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#1E90FF] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#1E90FF]/25">
                    {adminUsername.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg font-black text-white uppercase tracking-tight">{adminUsername}</p>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Administrator</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button 
                    onClick={() => setIsAdmin(false)}
                    className="flex-1 md:flex-none px-10 py-5 bg-red-500 hover:bg-red-600 text-white rounded-3xl text-sm font-black transition-all shadow-lg shadow-red-500/20 active:scale-95"
                  >
                    ออกจากแผงควบคุม
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <header className="bg-[#0B0F14] border-b border-white/10 px-6 py-5 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-[#1E90FF] rounded-xl shadow-lg shadow-[#1E90FF]/20">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg tracking-tight uppercase">{getTabLabel(adminTab)}</h1>
              <p className="text-[#1E90FF] text-[9px] font-black tracking-[0.2em] uppercase opacity-70">APEX Console</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNavOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-[#121820] hover:bg-[#1a232d] border border-white/5 hover:border-zinc-700 rounded-2xl text-white text-xs font-black transition-all group active:scale-95 shadow-xl"
            >
              <Menu className="w-5 h-5 text-[#1E90FF] group-hover:scale-110 transition-transform" />
              เมนูควบคุมหน้า
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full overflow-y-auto no-scrollbar">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'ผู้ใช้งานทั้งหมด', value: (siteStats?.users || 0).toLocaleString(), icon: Users, color: 'text-white', bg: 'bg-[#121820]' },
                  { label: 'ยอดขายทั้งหมด (สินค้า)', value: totalOrders.toLocaleString(), icon: Package, color: 'text-[#1a7fe6]', bg: 'bg-[#1E90FF]/10' },
                  { label: 'คำสั่งซื้อที่สำเร็จ', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'รายได้รวม (บาท)', value: totalRevenue.toLocaleString(), icon: Activity, color: 'text-[#1E90FF]', bg: 'bg-[#1E90FF]/10' },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#0B0F14] border border-white/10 p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-50 -mr-8 -mt-8 transition-all group-hover:scale-150`}></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h3>
                      </div>
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#0B0F14] border border-white/10 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0d12]/50">
                      <h3 className="font-bold flex items-center gap-2 text-white">
                        <LineChart className="w-5 h-5 text-[#1a7fe6]" /> รายงานสรุปยอดขาย (Sales Summary)
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#0a0d12]/50 border border-white/5 rounded-2xl p-6 text-center group hover:bg-[#0d1522] transition-colors">
                        <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest">วันนี้</p>
                        <p className="text-2xl font-black text-[#1E90FF]">{salesToday.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-[#0a0d12]/50 border border-white/5 rounded-2xl p-6 text-center group hover:bg-[#0d1522] transition-colors">
                        <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest">สัปดาห์นี้</p>
                        <p className="text-2xl font-black text-[#1E90FF]">{salesWeek.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-[#0a0d12]/50 border border-white/5 rounded-2xl p-6 text-center group hover:bg-[#0d1522] transition-colors">
                        <p className="text-zinc-500 text-[10px] font-black uppercase mb-2 tracking-widest">เดือนนี้</p>
                        <p className="text-2xl font-black text-[#1E90FF]">{salesMonth.toLocaleString()} <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">THB</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-white uppercase text-xs tracking-widest">
                      <Cpu className="w-4 h-4 text-[#1a7fe6]" /> ระบบจัดการด่วน (Quick Management)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'store', label: 'จัดการสินค้า', desc: 'เพิ่ม ลบ แก้ไข สินค้าในร้าน', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                            { id: 'keys', label: 'จัดการ License', desc: 'เพิ่มคีย์และดูประวัติ', icon: Key, color: 'text-[#1E90FF]', bg: 'bg-[#1E90FF]/10' },
                            { id: 'users', label: 'จัดการสมาชิก', desc: 'ดูรายชื่อและแก้ไขยอดเงิน', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            { id: 'settings', label: 'ตั้งค่าเว็บไซต์', desc: 'แก้ไขชื่อเว็บ ช่องทางติดต่อ', icon: Settings, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        ].map((item, i) => (
                           <button 
                             key={i}
                             onClick={() => setAdminTab(item.id)}
                             className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-[#0a0d12] hover:bg-[#121b2a] transition-all text-left group"
                           >
                             <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                               <item.icon className="w-6 h-6" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-black text-white">{item.label}</p>
                               <p className="text-[10px] text-zinc-500 font-bold truncate mt-0.5">{item.desc}</p>
                             </div>
                             <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                           </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-white uppercase text-xs tracking-widest">
                      <Settings className="w-4 h-4 text-[#1a7fe6]" /> อื่นๆ
                    </h3>
                    <div className="space-y-3">
                      <button onClick={() => setAdminTab('banners')} className="w-full bg-[#0a0d12] hover:bg-[#121820] border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Image className="w-5 h-5 text-zinc-700" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white uppercase">ป้ายโฆษณา</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button onClick={() => setAdminTab('pages')} className="w-full bg-[#0a0d12] hover:bg-[#121820] border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-zinc-700" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white uppercase">หน้าเพจ</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button onClick={() => setAdminTab('history')} className="w-full bg-[#0a0d12] hover:bg-[#121820] border border-white/10 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <History className="w-5 h-5 text-zinc-700" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-white uppercase">LOGS</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400" />
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
              <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl opacity-50 rounded-full translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-1 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-indigo-400" />
                    Revenue Analytics
                  </h3>
                  <p className="text-zinc-500 text-xs">Monthly revenue and user growth metrics</p>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Total Revenue</p>
                    <p className="text-2xl font-black text-indigo-400">฿19,550</p>
                    <p className="text-emerald-500 text-[10px] mt-1 font-bold">+12% from last month</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Active Users</p>
                    <p className="text-2xl font-black text-emerald-400">2,420</p>
                    <p className="text-emerald-500 text-[10px] mt-1 font-bold">+5% from last month</p>
                  </div>
                  <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
                    <p className="text-zinc-500 text-xs font-bold uppercase mb-1">Conversion Rate</p>
                    <p className="text-2xl font-black text-amber-400">4.2%</p>
                    <p className="text-[#1a7fe6] text-[10px] mt-1 font-bold">-1% from last month</p>
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
              <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-[#1a7fe6]" /> ตั้งค่าสถิติหน้าแรก</h3>
                  <button 
                    onClick={() => {
                        let currentUsers = (siteStats?.users || 0);
                        let currentStock = (siteStats?.stock || 0);
                        let currentSales = (siteStats?.sales || 0);
                        Swal.fire({
                            title: 'แก้ไขสถิติ',
                            html: `
                              <input id="swal-users" class="swal2-input" placeholder="ผู้ใช้งาน" value="${currentUsers}">
                              <input id="swal-stock" class="swal2-input" placeholder="สต๊อกสินค้า" value="${currentStock}">
                              <input id="swal-sales" class="swal2-input" placeholder="ยอดขาย" value="${currentSales}">
                            `,
                            focusConfirm: false,
                            confirmButtonColor: '#dc2626',
                            preConfirm: () => {
                              return {
                                users: parseInt((document.getElementById('swal-users') as HTMLInputElement).value),
                                stock: parseInt((document.getElementById('swal-stock') as HTMLInputElement).value),
                                sales: parseInt((document.getElementById('swal-sales') as HTMLInputElement).value)
                              }
                            }
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                try {
                                  const u = isNaN(result.value?.users) ? null : result.value?.users;
                                  const st = isNaN(result.value?.stock) ? null : result.value?.stock;
                                  const sa = isNaN(result.value?.sales) ? null : result.value?.sales;
                                  await axios.post('/api/settings', {
                                    stats_users_override: u,
                                    stats_stock_override: st,
                                    stats_sales_override: sa
                                  });
                                  
                                  if (setSiteStats) {
                                    setSiteStats({
                                      ...(siteStats || { users: 0, stock: 0, sales: 0, topups: 0 }),
                                      users: u !== null ? u : (siteStats?.users || 0),
                                      stock: st !== null ? st : (siteStats?.stock || 0),
                                      sales: sa !== null ? sa : (siteStats?.sales || 0)
                                    });
                                  }
                                  
                                  Swal.fire({ title: 'บันทึกสำเร็จ', text: 'รีเฟรชหน้าเว็บเพื่อดูผลลัพธ์', icon: 'success', confirmButtonColor: '#16a34a' });
                                } catch (error) {
                                  Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกสถิติได้: ' + (error.response?.data?.error || error.message), icon: 'error', confirmButtonColor: '#dc2626' });
                                }
                            }
                        });
                    }}
                    className="bg-[#1E90FF]/10 hover:bg-[#1E90FF]/20 text-[#1E90FF] font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#0a0d12] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{(siteStats?.users || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-[#0a0d12] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{(siteStats?.stock || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-[#0a0d12] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{(siteStats?.sales || 0).toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-[#0B0F14] border border-white/10 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-[#1a7fe6]" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#1E90FF] hover:bg-[#166bcc] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-[#0a0d12] text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">สินค้า</th>
                        <th className="px-4 py-3">ราคา</th>
                        <th className="px-4 py-3">สต๊อก</th>
                        <th className="px-4 py-3 text-right rounded-r-xl">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-[#0a0d12]/50 transition-colors">
                          <td className="px-4 py-4 flex items-center gap-3">
                            <img src={p.imageUrl || undefined} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-[#121820]" />
                            <div>
                                <div className="text-white font-bold flex items-center gap-2">
                                  {p.name}
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.name);
                                      Swal.fire({ title: 'Copied!', text: 'คัดลอกชื่อสินค้าแล้ว', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' });
                                    }}
                                    className="text-zinc-300 hover:text-zinc-500 transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{p.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold">
                            <div className="flex flex-col">
                              {p.originalPrice && p.price && p.originalPrice > p.price && (
                                <span className="text-[10px] text-zinc-400 line-through">฿{p.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-emerald-600">฿{(p.price || 0).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#1E90FF]/10 text-[#1E90FF]'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    if (!p.stockData || p.stockData.length === 0) {
                                      return Swal.fire('ไม่มีสต๊อก', 'สินค้านี้ยังไม่มีข้อมูลสต๊อกให้ดาวน์โหลด', 'error');
                                    }
                                    const text = p.stockData.join('\n');
                                    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                                    const url = URL.createObjectURL(blob);
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.download = `stock_${p.name}.txt`;
                                    link.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="p-2 border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="โหลดสต๊อก TXT เพื่อดูรายบรรทัด"
                                >
                                    <FileText className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setStockProduct(p)}
                                  className="p-2 border border-white/10 bg-[#0B0F14] text-zinc-400 hover:bg-[#0a0d12] hover:border-white/20 rounded-lg transition-colors"
                                  title="เพิ่มสต๊อก"
                                >
                                    <Database className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 border border-white/10 bg-[#0B0F14] text-zinc-400 hover:bg-[#0a0d12] hover:border-white/20 rounded-lg transition-colors"
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
                                            await axios.delete(`/api/products/${p.id}`);
                                            setProducts(products.filter(prod => prod.id !== p.id));
                                            Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#09090b', color: '#fff', showConfirmButton: false, timer: 1000 });
                                          } catch (err) {
                                            Swal.fire('Error', 'ไม่สามารถลบสินค้าได้', 'error');
                                          }
                                        }
                                      });
                                    }
                                  }}
                                  className="p-2 border border-[#1E90FF]/30 bg-[#1E90FF]/10 text-[#1E90FF] hover:bg-[#1E90FF]/20 rounded-lg transition-colors"
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
              className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0d12]/50">
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2"><Key className="w-5 h-5 text-[#1a7fe6]" /> Key Management</h3>
                  <p className="text-zinc-500 text-xs mt-1">จัดการคีย์และสต๊อก</p>
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
                  }} className="bg-zinc-800 hover:bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                    <Download className="w-4 h-4" /> บันทึกเป็น TXT
                  </button>
                  <button onClick={bulkDeleteKeys} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                    <Trash2 className="w-4 h-4" /> ลบคีย์หลายรายการ
                  </button>
                  <button onClick={addLicenseKey} className="bg-[#1E90FF] hover:bg-[#166bcc] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                    <Plus className="w-4 h-4" /> สร้างคีย์เพิ่ม
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-[#0a0d12] text-zinc-500 font-bold tracking-wider">
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
                      <tr key={i} className="border-b border-white/5 hover:bg-[#0a0d12]/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                             <span className="text-white font-mono font-bold">{key.key}</span>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(key.key);
                                 Swal.fire({ title: 'Copied!', text: 'คัดลอกคีย์สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' });
                               }}
                               className="text-zinc-400 hover:text-emerald-600 transition-colors p-1"
                               title="Copy Key"
                             >
                               <Copy className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-[#121820] text-zinc-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{key.plan}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${key.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#121820] text-zinc-500'}`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteKey(key.id)} className="p-2 hover:bg-[#1E90FF]/10 text-zinc-400 hover:text-[#1E90FF] rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-12 text-center text-zinc-500"> ไม่มีข้อมูลคีย์ในระบบ </td></tr>
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
              className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden"
            >
               <div className="p-6 border-b border-white/5 bg-[#0a0d12]/50">
                  <h3 className="font-bold text-white flex items-center gap-2"><History className="w-5 h-5 text-[#1a7fe6]" /> Redeem Logs</h3>
                  <p className="text-zinc-500 text-xs mt-1">ประวัติการใช้งานคีย์</p>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-[#0a0d12] text-zinc-500 font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Key Used</th>
                      <th className="p-4">User IP</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-[#0a0d12]/50 transition-colors">
                        <td className="p-4">
                          <span className="text-white font-bold">{h.key}</span>
                        </td>
                        <td className="p-4 text-zinc-500">{h.ip}</td>
                        <td className="p-4 text-zinc-500">{new Date(h.used_at).toLocaleString()}</td>
                        <td className="p-4">
                           <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">Success</span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-12 text-center text-zinc-500"> ไม่มีประวัติการใช้งาน </td></tr>
                    )}
                  </tbody>
                </table>
               </div>
            </motion.div>
          )}

          {adminTab === 'ips' && (
            <motion.div 
              key="ips"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden"
            >
               <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0d12]/50">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Ban className="w-5 h-5 text-[#1a7fe6]" /> IP Access Control</h3>
                    <p className="text-zinc-500 text-xs mt-1">แบนผู้ใช้งานที่ไม่พึงประสงค์</p>
                  </div>
                  <button onClick={blockIP} className="bg-[#1E90FF] hover:bg-[#166bcc] text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                     <Ban className="w-4 h-4" /> แบน IP ใหม่
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-[#0a0d12] text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Date Blocked</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-[#0a0d12]/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#1E90FF] font-bold tracking-tight">{ip.ip}</span>
                              <button onClick={() => { navigator.clipboard.writeText(ip.ip); Swal.fire({ title: 'Copied!', text: 'คัดลอก IP สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-zinc-400 hover:text-[#1E90FF]"><Copy className="w-3 h-3" /></button>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-500 italic">"{ip.reason}"</td>
                          <td className="p-4 text-zinc-500">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => unblockIP(ip.ip)} className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
                                ปลดแบน (Unblock)
                             </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-12 text-center text-zinc-500">ไม่มีรายการแบน</td></tr>
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
              <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[#0a0d12]/50">
                  <h3 className="font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-zinc-500" /> Site Settings</h3>
                  <p className="text-zinc-500 text-xs mt-1">ตั้งค่าพารามิเตอร์ต่างๆ ของระบบ</p>
                </div>
                <div className="p-6 space-y-8">
                   <div className="p-6 bg-[#0a0d12] border border-white/10 rounded-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Globe className="w-4 h-4 text-indigo-500" /> ชื่อเว็บไซต์ (Site Name)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.site_name}
                          onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
                          placeholder="APEX STUDIO"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Phone className="w-4 h-4 text-emerald-500" /> เบอร์รับเงินวอลเล็ต
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.truewallet_phone}
                          onChange={(e) => setSiteSettings({ ...siteSettings, truewallet_phone: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
                          placeholder="095xxxxxxx"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Users className="w-4 h-4 text-blue-500" /> ลิงก์ Discord
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.discord_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, discord_link: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
                          placeholder="https://discord.gg/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Users className="w-4 h-4 text-emerald-500" /> ลิงก์ Facebook Page
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.facebook_link || siteSettings.contact_line}
                          onChange={(e) => setSiteSettings({ ...siteSettings, facebook_link: e.target.value, contact_line: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-blue-500 shadow-inner"
                          placeholder="https://www.facebook.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Users className="w-4 h-4 text-pink-500" /> ลิงก์ Instagram
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.instagram_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram_link: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-pink-500 shadow-inner"
                          placeholder="https://www.instagram.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Users className="w-4 h-4 text-gray-500" /> อีเมลติดต่อ (Support)
                        </label>
                        <input 
                          type="email"
                          value={siteSettings.contact_email}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-zinc-500 shadow-inner"
                          placeholder="support@example.com"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Users className="w-4 h-4 text-purple-500" /> ปรับจํานวนผู้ใช้งาน (User Offset)
                        </label>
                        <input 
                          type="number"
                          value={siteSettings.stats_users_offset}
                          onChange={(e) => setSiteSettings({ ...siteSettings, stats_users_offset: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-purple-500 shadow-inner"
                          placeholder="1250"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Activity className="w-4 h-4 text-[#1a7fe6]" /> ปรับยอดขายสินค้า (Sales Offset)
                        </label>
                        <input 
                          type="number"
                          value={siteSettings.stats_sales_offset}
                          onChange={(e) => setSiteSettings({ ...siteSettings, stats_sales_offset: parseInt(e.target.value) || 0 })}
                          className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-[#1a7fe6] shadow-inner"
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-end">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full bg-zinc-900 text-white px-8 py-5 rounded-2xl text-sm font-black hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-xl shadow-black/10 uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                          <Settings className="w-5 h-5" /> บันทึกการตั้งค่า
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-[#0a0d12] border border-white/10 rounded-3xl">
                      <div className="mb-6">
                        <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-emerald-500" /> แผงควบคุมเพลงพื้นหลัง (Background Music)</h4>
                        <p className="text-zinc-500 text-sm mt-1">ใส่ลิ้งค์ YouTube, Spotify หรืออัพโหลดไฟล์เสียงโดยตรง (.mp3) เพื่อเปิดเพลงอัตโนมัติเมื่อผู้ใช้เข้าเว็บ</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                               ลิ้งค์เพลง (แนะนำ YouTube หรือไฟล์อัพโหลดเพื่อเพลงเต็ม)
                            </label>
                            <div className="relative group">
                              <button 
                                onClick={() => musicFileRef.current?.click()}
                                disabled={uploadingMusic}
                                className="flex items-center gap-2 text-xs font-bold text-[#1E90FF] hover:text-[#1E90FF]/80 transition-colors disabled:opacity-50"
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
                            className="w-full bg-[#0B0F14] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
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
                              <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${siteSettings.spotify_autoplay ? 'bg-emerald-500 border-emerald-500' : 'bg-[#0B0F14] border-white/20 group-hover:border-zinc-400'}`}>
                                {siteSettings.spotify_autoplay && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">เปิดใช้งานเล่นอัตโนมัติ (Autoplay)</span>
                              <span className="text-[10px] text-zinc-500 mt-0.5">* แนะนำใช้ YouTube หรือ ไฟล์อัพโหลดเพื่อให้ได้เพลงเต็ม (Spotify จะติดพรีวิว 30 วิ)</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" /> บันทึกการตั้งค่าเพลง
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/10 border border-amber-100 rounded-2xl flex items-start gap-4">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
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

                  <div className="p-6 border border-white/5 rounded-3xl mt-8">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">API Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="flex items-center justify-between p-3 bg-[#0a0d12] rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-bold uppercase">Angpao API</span>
                        <span className="text-emerald-600 font-black">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#0a0d12] rounded-xl border border-white/5">
                        <span className="text-zinc-500 font-bold uppercase">Bank Slip API</span>
                        <span className="text-emerald-600 font-black">ACTIVE</span>
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
              <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-[#0a0d12]/50">
                  <h3 className="font-bold text-white flex items-center gap-2"><Image className="w-5 h-5 text-zinc-500" /> จัดการป้ายโฆษณา & ป็อปอัพ</h3>
                  <p className="text-zinc-500 text-xs mt-1">ตั้งค่ารูปภาพแบนเนอร์และป็อปอัพประกาศ</p>
                </div>
                <div className="p-6 space-y-8">
                  <div className="p-6 bg-[#0a0d12] border border-white/10 rounded-3xl">
                    <div className="mb-6">
                      <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-zinc-500" /> Popup Banner Announcement</h4>
                      <p className="text-zinc-500 text-sm mt-1">ตั้งค่าป็อปอัพประกาศหน้าแรก แนะนำรูปขนาด 1500x1500px</p>
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
                            <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${siteSettings.popup_enabled ? 'bg-[#1E90FF] border-[#1E90FF]' : 'bg-[#0B0F14] border-white/20 group-hover:border-zinc-400'}`}>
                              {siteSettings.popup_enabled && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white">เปิดใช้งานป็อปอัพประกาศ</span>
                        </label>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                        <label className="block text-sm font-bold text-zinc-400">รูปภาพประกาศ (ขนาดที่แนะนำ 940 x 480 px)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text"
                            value={siteSettings.popup_img_url}
                            onChange={(e) => setSiteSettings({ ...siteSettings, popup_img_url: e.target.value })}
                            className="flex-1 w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1E90FF] transition-all"
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
                            className="px-6 bg-[#1E90FF]/10 text-[#1E90FF] rounded-xl font-bold hover:bg-[#1E90FF]/20 flex items-center justify-center whitespace-nowrap gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4"/> อัพโหลดภาพ
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-zinc-400">ลิ้งค์ปลายทางเมื่อคลิกรูปภาพป็อปอัพ (ปล่อยว่างได้)</label>
                         <input 
                           type="text"
                           value={siteSettings.popup_link}
                           onChange={(e) => setSiteSettings({ ...siteSettings, popup_link: e.target.value })}
                           className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1E90FF] transition-all"
                           placeholder="https://facebook.com/..."
                         />
                      </div>
                    </div>

                    <div className="p-6 bg-[#0a0d12] border border-white/10 rounded-3xl mt-6">
                      <div className="mb-6">
                        <h4 className="text-white font-bold flex items-center gap-2"><Globe className="w-5 h-5 text-indigo-500" /> Proxy Settings</h4>
                        <p className="text-zinc-500 text-xs mt-1">ตั้งค่า Proxy สำหรับระบบเช็คไอดี (หากปล่อยว่าง ระบบจะดึง Free Proxy อัตโนมัติ)</p>
                      </div>
                      
                      <div className="space-y-4">
                         <div className="flex items-center justify-between">
                           <label className="block text-sm font-bold text-zinc-400">Custom Proxy URLs (1 บรรทัดต่อ 1 Proxy - ปล่อยว่างเพื่อใช้ Free Proxy)</label>
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
                                   background: '#0B0F14',
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
                                     background: '#0B0F14',
                                     color: '#fff',
                                     confirmButtonColor: '#1E90FF'
                                   });
                                 }
                               } catch (err: any) {
                                 Swal.fire({
                                   icon: 'error',
                                   title: 'เกิดข้อผิดพลาด',
                                   text: err.message,
                                   background: '#0B0F14',
                                   color: '#fff'
                                 });
                               }
                             }}
                             className="text-xs font-bold text-[#1E90FF] hover:text-[#1E90FF]/80 flex items-center gap-1.5"
                           >
                             <Globe className="w-4 h-4" /> ดึง Proxy ล่าสุด (Proxifly)
                           </button>
                         </div>
                         <textarea 
                           value={(siteSettings.proxies || []).join('\n')}
                           onChange={(e) => setSiteSettings({ ...siteSettings, proxies: e.target.value.split('\n') })}
                           className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all h-32 resize-none leading-relaxed"
                           placeholder="http://user:pass@127.0.0.1:8080&#10;http://user:pass@127.0.0.2:8080"
                           onBlur={(e) => setSiteSettings({ ...siteSettings, proxies: e.target.value.split('\n').map(url => typeof url === 'string' ? url.trim() : '').filter(Boolean) })}
                         />
                         <p className="text-xs text-zinc-500 mt-2">รูปแบบ: http://[user]:[password]@[ip]:[port] หรือ http://[ip]:[port]</p>
                         
                         <label className="flex items-center gap-3 cursor-pointer group mt-4">
                           <div className="relative flex items-center justify-center">
                             <input 
                               type="checkbox" 
                               className="sr-only" 
                               checked={siteSettings.auto_proxy !== false}
                               onChange={(e) => setSiteSettings({ ...siteSettings, auto_proxy: e.target.checked })}
                             />
                             <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center ${siteSettings.auto_proxy !== false ? 'bg-[#1E90FF] border-[#1E90FF]' : 'bg-[#0B0F14] border-white/20 group-hover:border-zinc-400'}`}>
                               {siteSettings.auto_proxy !== false && <Check className="w-3.5 h-3.5 text-white" />}
                             </div>
                           </div>
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">ใช้ Free Proxies อัตโนมัติร่วมกับ Proxy ด้านบน (รวมกัน)</span>
                             <span className="text-xs text-zinc-500 mt-0.5">ระบบจะดึงจาก Proxifly และสลับให้อัตโนมัติในพื้นหลัง (แนะนำให้เปิดไว้เพื่อกันบล็อก)</span>
                           </div>
                         </label>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#0a0d12] border border-white/10 rounded-3xl">
                    <div className="mb-6">
                      <h4 className="text-white font-bold flex items-center gap-2"><Image className="w-5 h-5 text-zinc-500" /> Banners Announcement</h4>
                      <p className="text-zinc-500 text-sm mt-1">ป้ายสไลด์โฆษณาในหน้าแรกของเว็บไซต์</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-bold text-zinc-400">รูปภาพป้ายโฆษณาหน้าแรก (URL 1 บรรทัดต่อ 1 รูปภาพ)</label>
                         <textarea 
                           value={(siteSettings.banners || []).join('\n')}
                           onChange={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n') })}
                           className="w-full bg-[#0B0F14] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#1E90FF] transition-all h-32 resize-none leading-relaxed"
                           placeholder="https://img.th/banner1.png&#10;https://img.th/banner2.png"
                           onBlur={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n').map(url => url.trim()).filter(Boolean) })}
                         />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end pt-4">
                    <button 
                      onClick={handleSaveSettings}
                      className="w-full bg-[#1E90FF] text-white px-8 py-4 rounded-2xl text-sm font-black hover:bg-[#1E90FF]/80 transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#1E90FF]/25"
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
              <div className="bg-[#0B0F14] border border-white/10 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0a0d12]/50">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-indigo-500" /> System Monitoring</h3>
                    <p className="text-zinc-500 text-xs mt-1">Realtime node state and resource allocation</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "CPU Usage", value: "14%", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Memory (RAM)", value: "512MB / 1GB", icon: HardDrive, color: "text-indigo-600", bg: "bg-indigo-50" },
                      { label: "Network IO", value: "24 Mbps", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50" },
                      { label: "Uptime", value: "94 Days", icon: BarChart3, color: "text-cyan-600", bg: "bg-cyan-50" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-[#0a0d12] border border-white/5 p-4 rounded-2xl flex items-center gap-4 transition-colors hover:bg-[#121820]/50">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase">{stat.label}</p>
                          <p className="text-lg font-bold font-mono text-white">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-white/5 pt-8">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Gift className="w-4 h-4 text-[#1a7fe6]" /> Third-party Integrations
                    </h4>
                    <div className="bg-[#0a0d12] border border-white/5 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-[#0B0F14] rounded-2xl shadow-sm border border-white/10 flex items-center justify-center">
                           <Globe className="w-6 h-6 text-zinc-400" />
                         </div>
                         <div className="text-center sm:text-left">
                           <p className="text-sm font-black text-white">Manybaht TrueWallet API</p>
                           <p className="text-xs font-medium text-zinc-500 select-all">https://github.com/manybaht/Manybaht-Truewallet-API</p>
                         </div>
                       </div>
                       <a href="https://github.com/manybaht/Manybaht-Truewallet-API" target="_blank" rel="noopener noreferrer" className="bg-[#0B0F14] border border-white/10 text-zinc-700 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-[#121820] transition-all flex items-center gap-2">
                         <Copy className="w-4 h-4" /> View Source
                       </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Database className="w-4 h-4" /> Environment Information
                    </h4>
                    <div className="bg-[#0a0d12] border border-white/5 rounded-2xl p-4 font-mono text-xs space-y-3">
                      <div className="flex justify-between border-b border-white/10/60 pb-2">
                         <span className="text-zinc-500 font-bold">Node JS</span>
                         <span className="text-zinc-700">v22.x.x</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10/60 pb-2">
                         <span className="text-zinc-500 font-bold">Database</span>
                         <span className="text-emerald-600 font-bold">Connected (Supabase)</span>
                      </div>
                      <div className="flex justify-between border-b border-white/10/60 pb-2">
                         <span className="text-zinc-500 font-bold">Build Mode</span>
                         <span className="text-indigo-600 font-bold">Production</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-zinc-500 font-bold">Vite Config</span>
                         <span className="text-amber-600 font-bold">Optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                  const res = await axios.post('/api/products', p);
                  setProducts([...products, res.data]);
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
                  const res = await axios.put(`/api/products/${p.id}`, p);
                  setProducts(products.map(prod => prod.id === p.id ? res.data : prod));
                  setEditingProduct(undefined);
                  Swal.fire({ title: 'แก้ไขสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                } catch (err: any) {
                  const errMsg = err?.response?.data?.error || err.message || 'Unknown error';
                  console.error('Error updating product:', err);
                  Swal.fire('Error', `ไม่สามารถแก้ไขสินค้าได้: ${errMsg}`, 'error');
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
                  
                  for (const item of newItems) {
                    const itemSize = new Blob([item]).size;
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
                     setProducts(products.map(prod => prod.id === stockProduct.id ? lastRes.data.product : prod));
                  } else {
                     const fresh = await axios.get(`/api/products/${stockProduct.id}`);
                     setProducts(products.map(prod => prod.id === stockProduct.id ? fresh.data : prod));
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
    </div>
  );
};
