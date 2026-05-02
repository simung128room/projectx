import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Database, LogOut, BarChart3, Key, History, ShieldAlert, Activity, Ban, ChevronRight, Settings, Plus, Trash2, Crown, X, Upload, FileText, LayoutDashboard, LineChart, Cpu, HardDrive, ShoppingCart, Package, Users, Wallet, Gift, Globe } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { AccountResult, Product, SiteStats } from '../types';
import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminDashboardProps {
  totalChecked: number;
  validAccounts: AccountResult[];
  firebaseKeys: any[];
  usedKeysHistory: any[];
  blockedIPs: any[];
  adminTab: string;
  setAdminTab: (tab: string) => void;
  products?: Product[];
  setProducts?: (products: Product[]) => void;
  siteStats?: SiteStats;
  setSiteStats?: (stats: SiteStats) => void;
  isDBReady: boolean;
  dbErrorDetail?: string | null;
  adminUsername: string;
  setIsAdmin: (val: boolean) => void;
  addLicenseKey: () => void;
  blockIP: () => void;
  deleteKey: (id: string) => void;
  unblockIP: (ip: string) => void;
}

const ProductManagerModal = ({ 
  product, 
  onSave, 
  onClose,
  isEdit
}: { 
  product?: Product, 
  onSave: (p: Product) => void, 
  onClose: () => void,
  isEdit: boolean 
}) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    stock: 0,
    category: ''
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
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
              <label className="block text-xs font-bold text-zinc-500 mb-1">ราคา (THB)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-1">สต๊อก</label>
              <input 
                type="number" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              />
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
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-1">หมวดหมู่</label>
            <input 
              type="text" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm"
              placeholder="e.g. Account, Item Code"
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
              if(!formData.name || !formData.price) return Swal.fire({title: 'แจ้งเตือน', text: 'กรุณากรอกชื่อและราคา', icon: 'warning'});
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
  onSave, 
  onClose 
}: { 
  product: Product, 
  onSave: (p: Product) => void, 
  onClose: () => void 
}) => {
  const [stockInput, setStockInput] = useState('');
  const [fileStockPreview, setFileStockPreview] = useState<string[]>([]);
  const [singleFilesPreview, setSingleFilesPreview] = useState<{name: string, b64: string}[]>([]);
  const [mode, setMode] = useState<'text'|'file'|'single-file'>('file');
  const fileRef = useRef<HTMLInputElement>(null);
  const singleFileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const lines = text.split('\n')
                          .map(l => l.trim())
                          .filter(l => l.length > 0);
        setFileStockPreview(lines);
      }
    };
    reader.readAsText(file);
  };

  const handleSingleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    
    // Process all selected files to strings (Base64)
    Array.from(fileList).forEach((file: File) => {
      // Check file size (limit 2MB per file to avoid crashing localStorage)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({title: 'ไฟล์ใหญ่เกินไป', text: `ไฟล์ ${file.name} มีขนาดใหญ่กว่า 2MB`, icon: 'error', background: '#09090b', color: '#fff'});
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
  };

  const handleSaveStock = () => {
    let newItems: string[] = [];
    if (mode === 'text' && stockInput.trim()) {
      newItems = stockInput.split('\n').map(x => x.trim()).filter(x => x.length > 0);
    } else if (mode === 'file' && fileStockPreview.length > 0) {
      newItems = [...fileStockPreview];
    } else if (mode === 'single-file' && singleFilesPreview.length > 0) {
      // For single files, we can encode them as JSON strings containing the file data to fit into the string[] array
      newItems = singleFilesPreview.map(f => JSON.stringify({ type: 'file', name: f.name, data: f.b64 }));
    }

    if (newItems.length === 0) {
      return Swal.fire({title: 'ข้อมูลว่างเปล่า', text: 'ไม่ได้เพิ่มสต๊อกใหม่', icon: 'error', background: '#09090b', color: '#fff'});
    }

    const updatedProduct = { ...product };
    updatedProduct.stockData = [...(updatedProduct.stockData || []), ...newItems];
    updatedProduct.stock = updatedProduct.stockData.length;
    onSave(updatedProduct);
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
            {fileStockPreview.length > 0 && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-bold text-indigo-400">พบข้อมูลสต๊อก</p>
                    <p className="text-xs text-indigo-400/80">พร้อมเพิ่ม {fileStockPreview.length} รายการ</p>
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
              <p className="text-xs text-zinc-500 mt-1">สูงสุด 2MB ต่อไฟล์ (เลือกหลายไฟล์ได้)</p>
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
          <div>
            <label className="block text-xs font-bold text-zinc-500 mb-2">วางข้อมูลสต๊อก (1 บรรทัด = 1 รายการ)</label>
            <textarea 
              value={stockInput}
              onChange={e => setStockInput(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-indigo-500 text-sm h-40 resize-none font-mono text-xs leading-relaxed"
              placeholder="user1:pass1&#10;user2:pass2"
            />
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
        <h2 className="text-2xl font-bold text-white tracking-tight">Database Setup Required</h2>
        <p className="text-zinc-500 text-sm mt-1">Supabase tables are missing from the current schema.</p>
      </div>
    </div>
    
    {dbErrorDetail && (
      <div className="mb-8 p-4 bg-red-600/10 border border-red-600/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-red-500" />
          <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest">สถานะปัจจุบัน:</h4>
        </div>
        <p className="text-red-200/80 text-xs font-mono break-all bg-black/40 p-3 rounded-xl border border-white/5">{dbErrorDetail}</p>
      </div>
    )}
    
    <div className="space-y-8">
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">01</div>
        <div className="pt-1">
          <h3 className="text-white font-bold mb-1 tracking-tight">Configure Environment Variables</h3>
          <p className="text-zinc-500 text-sm leading-relaxed mb-4">
            If you haven't already, go to <strong>Settings</strong> {'>'} <strong>Secrets</strong> and set these keys:
          </p>
          <div className="space-y-2">
            {['VITE_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'].map(key => (
              <div key={key} className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-2 border border-white/5">
                <code className="text-[10px] text-zinc-300">{key}</code>
                <span className="text-[10px] text-amber-500 font-bold uppercase tracking-tighter">Required</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">02</div>
        <div className="pt-1">
          <h3 className="text-white font-bold mb-1 tracking-tight">Open Supabase SQL Editor</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">Go to your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline font-bold">Supabase Dashboard</a> and open the SQL Editor.</p>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">03</div>
        <div className="pt-1 flex-grow">
          <h3 className="text-white font-bold mb-1 tracking-tight">Execute Bootstrap SQL</h3>
          <p className="text-zinc-500 text-sm mb-4 leading-relaxed">Copy the code below, paste it into a new query, and click <strong>"Run"</strong>.</p>
          <div className="relative group">
            <pre className="bg-black/80 rounded-2xl p-5 text-[11px] font-mono text-zinc-400 overflow-x-auto border border-white/5 max-h-64 scrollbar-thin scrollbar-thumb-zinc-800 leading-relaxed">
{`-- 1. Table for license keys
CREATE TABLE IF NOT EXISTS license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Table for used keys
CREATE TABLE IF NOT EXISTS used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    used_at timestamptz DEFAULT now()
);

-- 3. Table for blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

-- 4. Table for admins
CREATE TABLE IF NOT EXISTS admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);`}
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS license_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text UNIQUE NOT NULL, plan text NOT NULL, status text NOT NULL DEFAULT 'active', created_at timestamptz DEFAULT now()); CREATE TABLE IF NOT EXISTS used_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text NOT NULL, ip text NOT NULL, details text, used_at timestamptz DEFAULT now()); CREATE TABLE IF NOT EXISTS blocked_ips (ip text PRIMARY KEY, reason text, blocked_at timestamptz DEFAULT now()); CREATE TABLE IF NOT EXISTS admins (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, username text UNIQUE NOT NULL, role text NOT NULL DEFAULT 'admin', granted_at timestamptz DEFAULT now());`);
                Swal.fire({ title: 'Copied!', text: 'SQL Code สำหรับรันใน Supabase ก๊อปปี้แล้ว', icon: 'success', timer: 2000, showConfirmButton: false, background: '#09090b', color: '#fff' });
              }}
              className="absolute top-3 right-3 p-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all border border-white/5 text-amber-500 shadow-xl"
              title="Copy SQL"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between gap-4">
       <div className="flex items-center gap-3 text-zinc-500 text-xs italic">
         <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></div>
         Waiting for tables to be created...
       </div>
       <button 
         onClick={() => window.location.reload()}
         className="text-white text-xs font-bold uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl transition-all border border-white/5"
       >
         Refresh Now
       </button>
    </div>
  </div>
);

import { AdminUserManagement } from './AdminUserManagement';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  totalChecked, validAccounts, firebaseKeys, usedKeysHistory, blockedIPs,
  adminTab, setAdminTab, isDBReady, adminUsername, setIsAdmin,
  addLicenseKey, blockIP, deleteKey, unblockIP,
  products = [], setProducts, siteStats = { users: 0, stock: 0, sales: 0 }, setSiteStats
}) => {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [stockProduct, setStockProduct] = useState<Product | undefined>(undefined);
  
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
    truewallet_phone: '0951378403',
    contact_line: '@apex_studio'
  });

  useEffect(() => {
    if (adminTab === 'settings') {
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
      const res = await axios.post('/api/settings', siteSettings);
      if (res.data.success) {
        Swal.fire({ 
          title: 'สำเร็จ', 
          text: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 
          icon: 'success', 
          confirmButtonColor: '#dc2626',
          background: '#fff',
          color: '#000'
        });
      }
    } catch (err: any) {
      Swal.fire({
        title: 'ผิดพลาด',
        text: err.response?.data?.error || 'ไม่สามารถบันทึกข้อมูลได้',
        icon: 'error'
      });
    }
  };

  // Calculate Stats
  const totalOrders = purchaseHistory.length;
  const totalMoney = topupHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalRevenue = purchaseHistory.reduce((acc, curr) => acc + (curr.price || 0), 0);
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0,0,0,0));
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const salesToday = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfDay).reduce((acc, curr) => acc + (curr.price || 0), 0);
  const salesWeek = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfWeek).reduce((acc, curr) => acc + (curr.price || 0), 0);
  const salesMonth = purchaseHistory.filter(x => new Date(x.timestamp) >= startOfMonth).reduce((acc, curr) => acc + (curr.price || 0), 0);

  const totalKeys = firebaseKeys.length;
  const usedKeys = firebaseKeys.filter(k => k.status === 'used').length + usedKeysHistory.length;
  const remainingKeys = firebaseKeys.filter(k => k.status === 'active').length;
  const usersWhoBought = new Set(purchaseHistory.map(x => x.userId || 'guest')).size;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 p-4 md:p-8 animate-in fade-in duration-700 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-600 rounded-2xl shadow-md shadow-red-600/20">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-zinc-900 tracking-tighter">
                Admin <span className="text-red-600">Dashboard</span>
              </h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Control Center • {adminUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-white border border-zinc-200 shadow-sm rounded-2xl px-4 py-2 flex items-center gap-2 flex-1 md:flex-none">
              <div className={`w-2 h-2 rounded-full ${isDBReady ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase">System: {isDBReady ? 'Stable' : 'DB ERROR'}</span>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm px-6 py-2 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Exit Console
            </button>
          </div>
        </div>

        {!isDBReady ? (
          <DatabaseSetupGuide dbErrorDetail={dbErrorDetail} />
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'users', label: 'จัดการผู้ใช้', icon: Users },
                { id: 'store', label: 'Shop Manager', icon: Package },
                { id: 'keys', label: 'License Keys', icon: Key },
                { id: 'history', label: 'Redeem Logs', icon: History },
                { id: 'ips', label: 'Access Control', icon: ShieldAlert },
                { id: 'settings', label: 'Site Settings', icon: Settings },
                { id: 'system', label: 'System Info', icon: Cpu }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all border shadow-sm whitespace-nowrap ${
                    adminTab === tab.id 
                    ? 'bg-red-600 border-red-600 text-white shadow-red-600/20' 
                    : 'bg-white border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
              ))}
            </div>

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
                  { label: 'ผู้ใช้งานทั้งหมด', value: siteStats.users.toLocaleString(), icon: Users, color: 'text-zinc-900', bg: 'bg-zinc-100' },
                  { label: 'ยอดขายทั้งหมด (สินค้า)', value: totalOrders.toLocaleString(), icon: Package, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'คำสั่งซื้อที่สำเร็จ', value: totalOrders.toLocaleString(), icon: ShoppingCart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                  { label: 'รายได้รวม (บาท)', value: totalRevenue.toLocaleString(), icon: Activity, color: 'text-red-600', bg: 'bg-red-50' },
                  { label: 'คีย์ในระบบทั้งหมด', value: totalKeys.toLocaleString(), icon: Key, color: 'text-zinc-900', bg: 'bg-zinc-100' },
                  { label: 'คีย์ที่ถูกใช้แล้ว', value: usedKeys.toLocaleString(), icon: History, color: 'text-zinc-500', bg: 'bg-zinc-100' },
                  { label: 'คีย์ที่เหลืออยู่', value: remainingKeys.toLocaleString(), icon: Database, color: 'text-red-500', bg: 'bg-red-50' },
                  { label: 'ผู้ใช้ที่ซื้อสินค้า', value: usersWhoBought.toLocaleString(), icon: Users, color: 'text-zinc-900', bg: 'bg-zinc-100' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white border border-zinc-200 p-6 rounded-3xl relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-50 -mr-8 -mt-8 transition-all group-hover:scale-150`}></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tighter">{stat.value}</h3>
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
                  <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                      <h3 className="font-bold flex items-center gap-2 text-zinc-900">
                        <LineChart className="w-5 h-5 text-red-500" /> สถิติยอดขาย (Sales Stats)
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-2">วันนี้ขายไป</p>
                        <p className="text-3xl font-black text-red-600">{salesToday.toLocaleString()} <span className="text-sm font-bold text-zinc-400">บาท</span></p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-2">สัปดาห์นี้ขายไป</p>
                        <p className="text-3xl font-black text-red-600">{salesWeek.toLocaleString()} <span className="text-sm font-bold text-zinc-400">บาท</span></p>
                      </div>
                      <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center">
                        <p className="text-zinc-500 text-xs font-bold uppercase mb-2">เดือนนี้ขายไป</p>
                        <p className="text-3xl font-black text-red-600">{salesMonth.toLocaleString()} <span className="text-sm font-bold text-zinc-400">บาท</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-bold flex items-center gap-2 mb-6 text-zinc-900">
                      <Settings className="w-5 h-5 text-red-500" /> Quick Actions
                    </h3>
                    <div className="space-y-4">
                      <button onClick={() => setAdminTab('keys')} className="w-full bg-red-50 hover:bg-red-100 border border-red-100 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Plus className="w-5 h-5 text-red-600" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-red-600">จัดการคีย์ (Add Keys)</p>
                            <p className="text-[10px] text-red-500/70">เพิ่มจำนวนคีย์เข้าสต๊อก</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-red-600" />
                      </button>
                      <button onClick={() => setAdminTab('users')} className="w-full bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-zinc-700" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-zinc-900">จัดการผู้ใช้ (User Management)</p>
                            <p className="text-[10px] text-zinc-500">เปลี่ยนรหัสผ่านและรายละเอียด</p>
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
                    <p className="text-red-500 text-[10px] mt-1 font-bold">-1% from last month</p>
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
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-red-500" /> ตั้งค่าสถิติหน้าแรก</h3>
                  <button 
                    onClick={() => {
                        let currentUsers = siteStats.users;
                        let currentStock = siteStats.stock;
                        let currentSales = siteStats.sales;
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
                        }).then((result) => {
                            if (result.isConfirmed && setSiteStats) {
                                setSiteStats(result.value!);
                                Swal.fire({ title: 'บันทึกสำเร็จ', icon: 'success', confirmButtonColor: '#16a34a' });
                            }
                        });
                    }}
                    className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-zinc-900">{siteStats.users.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-zinc-900">{siteStats.stock.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-zinc-900">{siteStats.sales.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Package className="w-5 h-5 text-red-500" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600">
                    <thead className="text-xs uppercase bg-zinc-50 text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">สินค้า</th>
                        <th className="px-4 py-3">ราคา</th>
                        <th className="px-4 py-3">สต๊อก</th>
                        <th className="px-4 py-3 text-right rounded-r-xl">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                          <td className="px-4 py-4 flex items-center gap-3">
                            <img src={p.imageUrl || undefined} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-100" />
                            <div>
                                <div className="text-zinc-900 font-bold flex items-center gap-2">
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
                          <td className="px-4 py-4 font-bold text-emerald-600">฿{p.price.toLocaleString()}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => setStockProduct(p)}
                                  className="p-2 border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 rounded-lg transition-colors title='เพิ่มสต๊อก'"
                                >
                                    <Database className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setEditingProduct(p)}
                                  className="p-2 border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 rounded-lg transition-colors"
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
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          setProducts(products.filter(prod => prod.id !== p.id));
                                          Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#09090b', color: '#fff', showConfirmButton: false, timer: 1000 });
                                        }
                                      });
                                    }
                                  }}
                                  className="p-2 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
              className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div>
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Key className="w-5 h-5 text-red-500" /> Key Management</h3>
                  <p className="text-zinc-500 text-xs mt-1">จัดการคีย์และสต๊อก</p>
                </div>
                <button onClick={addLicenseKey} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                  <Plus className="w-4 h-4" /> สร้างคีย์เพิ่ม
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600">
                  <thead className="text-xs uppercase bg-zinc-50 text-zinc-500 font-bold tracking-wider">
                    <tr>
                      <th className="p-4">License Key</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {firebaseKeys.length > 0 ? firebaseKeys.map((key, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                             <span className="text-zinc-900 font-mono font-bold">{key.key}</span>
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
                          <span className="bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded text-[10px] uppercase font-bold">{key.plan}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${key.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-500'}`}>
                            {key.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteKey(key.id)} className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-all">
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
              className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden"
            >
               <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><History className="w-5 h-5 text-red-500" /> Redeem Logs</h3>
                  <p className="text-zinc-500 text-xs mt-1">ประวัติการใช้งานคีย์</p>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600">
                  <thead className="text-xs uppercase bg-zinc-50 text-zinc-500 font-bold tracking-wider">
                    <tr>
                      <th className="p-4">Key Used</th>
                      <th className="p-4">User IP</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                             <span className="text-amber-600 font-bold">{h.key}</span>
                             <button onClick={() => { navigator.clipboard.writeText(h.key); Swal.fire({ title: 'Copied!', text: 'คัดลอกสำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-zinc-400 hover:text-amber-600"><Copy className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-zinc-500">{h.ip}</span>
                            <button onClick={() => { navigator.clipboard.writeText(h.ip); Swal.fire({ title: 'Copied!', text: 'คัดลอก IP สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-zinc-400 hover:text-zinc-600"><Copy className="w-3 h-3" /></button>
                          </div>
                        </td>
                        <td className="p-4 text-zinc-500">{new Date(h.used_at).toLocaleString()}</td>
                        <td className="p-4"><span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded text-[10px]">SUCCESS</span></td>
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
              className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden"
            >
               <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <div>
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Ban className="w-5 h-5 text-red-500" /> IP Access Control</h3>
                    <p className="text-zinc-500 text-xs mt-1">แบนผู้ใช้งานที่ไม่พึงประสงค์</p>
                  </div>
                  <button onClick={blockIP} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm">
                     <Ban className="w-4 h-4" /> แบน IP ใหม่
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-600">
                    <thead className="text-xs uppercase bg-zinc-50 text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Date Blocked</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                        <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-bold tracking-tight">{ip.ip}</span>
                              <button onClick={() => { navigator.clipboard.writeText(ip.ip); Swal.fire({ title: 'Copied!', text: 'คัดลอก IP สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-zinc-400 hover:text-red-600"><Copy className="w-3 h-3" /></button>
                            </div>
                          </td>
                          <td className="p-4 text-zinc-500 italic">"{ip.reason}"</td>
                          <td className="p-4 text-zinc-500">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => unblockIP(ip.ip)} className="text-emerald-600 hover:text-emerald-700 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-100 transition-all">
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

          {adminTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Settings className="w-5 h-5 text-zinc-500" /> Site Settings</h3>
                  <p className="text-zinc-500 text-xs mt-1">ตั้งค่าพารามิเตอร์ต่างๆ ของระบบ</p>
                </div>
                <div className="p-6 space-y-8">
                   <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Globe className="w-4 h-4 text-indigo-500" /> ชื่อเว็บไซต์ (Site Name)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.site_name}
                          onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                          className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 text-sm font-bold focus:outline-none focus:border-indigo-500 shadow-inner"
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
                          className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 text-sm font-bold focus:outline-none focus:border-emerald-500 shadow-inner"
                          placeholder="095xxxxxxx"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-bold text-zinc-700 flex items-center gap-2">
                           <Plus className="w-4 h-4 text-blue-500" /> ติดต่อเรา (LINE ID)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.contact_line}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_line: e.target.value })}
                          className="w-full bg-white border border-zinc-200 rounded-2xl px-5 py-4 text-zinc-900 text-sm font-bold focus:outline-none focus:border-blue-500 shadow-inner"
                          placeholder="@line_id"
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
                    <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                      <div className="p-2 bg-amber-500/20 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-800">หมายเหตุสำคัญ (Vercel Persistence)</p>
                        <p className="text-[10px] text-amber-700/80 mt-1 leading-relaxed">
                          เนื่องจากระบบรันบน Vercel (Serverless), การตั้งค่าที่บันทึกผ่านหน้านี้จะถูกรีเซ็ตหาก Server Restart <br/>
                          เพื่อการตั้งค่าแบบถาวร กรุณาไปที่ Vercel Dashboard {'>'} Settings {'>'} Environment Variables และตั้งค่า VITE_SITE_NAME, TRUEWALLET_PHONE, CONTACT_LINE
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-zinc-100 rounded-3xl">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">API Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-zinc-500 font-bold uppercase">Angpao API</span>
                        <span className="text-emerald-600 font-black">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                        <span className="text-zinc-500 font-bold uppercase">Bank Slip API</span>
                        <span className="text-emerald-600 font-black">ACTIVE</span>
                      </div>
                    </div>
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
              <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <div>
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2"><Cpu className="w-5 h-5 text-indigo-500" /> System Monitoring</h3>
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
                      <div key={i} className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl flex items-center gap-4 transition-colors hover:bg-zinc-100/50">
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-zinc-500 text-[10px] font-bold uppercase">{stat.label}</p>
                          <p className="text-lg font-bold font-mono text-zinc-900">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-zinc-100 pt-8">
                    <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Gift className="w-4 h-4 text-red-500" /> Third-party Integrations
                    </h4>
                    <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-zinc-200 flex items-center justify-center">
                           <Globe className="w-6 h-6 text-zinc-400" />
                         </div>
                         <div className="text-center sm:text-left">
                           <p className="text-sm font-black text-zinc-900">Manybaht TrueWallet API</p>
                           <p className="text-xs font-medium text-zinc-500 select-all">https://github.com/manybaht/Manybaht-Truewallet-API</p>
                         </div>
                       </div>
                       <a href="https://github.com/manybaht/Manybaht-Truewallet-API" target="_blank" rel="noopener noreferrer" className="bg-white border border-zinc-200 text-zinc-700 px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-100 transition-all flex items-center gap-2">
                         <Copy className="w-4 h-4" /> View Source
                       </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Database className="w-4 h-4" /> Environment Information
                    </h4>
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 font-mono text-xs space-y-3">
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                         <span className="text-zinc-500 font-bold">Node JS</span>
                         <span className="text-zinc-700">v22.x.x</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
                         <span className="text-zinc-500 font-bold">Database</span>
                         <span className="text-emerald-600 font-bold">Connected (Supabase)</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-200/60 pb-2">
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
          </>
        )}

        {isAddingProduct && (
          <ProductManagerModal 
            isEdit={false}
            onClose={() => setIsAddingProduct(false)}
            onSave={(p) => {
              if (setProducts) {
                setProducts([...products, p]);
                setIsAddingProduct(false);
                Swal.fire({ title: 'เพิ่มสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
              }
            }}
          />
        )}
        
        {editingProduct && (
          <ProductManagerModal 
            product={editingProduct}
            isEdit={true}
            onClose={() => setEditingProduct(undefined)}
            onSave={(p) => {
              if (setProducts) {
                setProducts(products.map(prod => prod.id === p.id ? p : prod));
                setEditingProduct(undefined);
                Swal.fire({ title: 'แก้ไขสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
              }
            }}
          />
        )}

        {stockProduct && (
          <AddStockModal 
            product={stockProduct}
            onClose={() => setStockProduct(undefined)}
            onSave={(p) => {
              if (setProducts) {
                setProducts(products.map(prod => prod.id === p.id ? p : prod));
                setStockProduct(undefined);
                Swal.fire({ title: 'เพิ่มสต๊อกสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
              }
            }}
          />
        )}
      </div>
    </div>
  );
};
