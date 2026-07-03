import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Database, LogOut, BarChart3, Key, History, ShieldAlert, Activity, Ban, ChevronRight, Settings, Plus, Trash2, Crown, X, Menu, Upload, FileText, LayoutDashboard, LineChart, Cpu, HardDrive, ShoppingCart, Package, Users, Wallet, Gift, Globe, Phone, AlertTriangle, Download, Check, Image, MessageSquare, Terminal, RefreshCw, Clock } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Product, SiteStats } from '../types';
import { useState, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import { AdminApiKeys } from './AdminApiKeys';
import { ProductManagerModal } from './admin/ProductManagerModal';
import { AddStockModal } from './admin/AddStockModal';
import { DatabaseSetupGuide } from './admin/DatabaseSetupGuide';
import { AdminUserManagement } from './AdminUserManagement';
import { AdminPagesManagement } from './AdminPagesManagement';
import { AdminCategoriesManagement } from './AdminCategoriesManagement';
import { AdminToolsManagement } from './AdminToolsManagement';
import AdminStockManagement from './AdminStockManagement';


interface AdminDashboardProps {
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  licenseKeys,
  usedKeysHistory,
  blockedIPs,
  adminTab,
  setAdminTab,
  products = [],
  setProducts,
  siteStats,
  setSiteStats = () => {},
  customPages = [],
  setCustomPages = () => {},
  categories = [],
  setCategories = () => {},
  usersList = [],
  onRefreshData,
  isDBReady,
  dbErrorDetail,
  adminUsername,
  setIsAdmin,
  addLicenseKey,
  blockIP,
  deleteKey,
  bulkDeleteKeys,
  unblockIP
}) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserBalance, setEditUserBalance] = useState<number>(0);
  const [siteSettings, setSiteSettings] = useState<any>({
    site_name: 'STORE.TH',
    truewallet_phone: '',
    contact_line: '',
    discord_link: '',
    facebook_link: '',
    instagram_link: '',
    contact_email: '',
    popup_img_url: '',
    popup_enabled: true,
    popup_link: '',
    banners: [],
    stats_users_override: null,
    stats_users_offset: 0,
    stats_sales_override: null,
    stats_sales_offset: 0,
    stats_stock_override: null,
    stats_stock_offset: 0,
    stats_categories_offset: 0,
    spotify_url: '',
    spotify_autoplay: true,
    proxies: [],
    auto_proxy: true,
    bank_name: '',
    bank_account_number: '',
    bank_account_holder: '',
    bank_qr_image: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [categoriesInput, setCategoriesInput] = useState('');
  
  const handleEditUser = (user: any) => {
    setEditingUserId(user.uid);
    setEditUserBalance(user.balance);
  };

  const handleSaveUser = async (user: any) => {
     try {
       await axios.post('/api/admin/users/update', {
          uid: user.uid,
          balance: editUserBalance
       });
       setEditingUserId(null);
       onRefreshData && onRefreshData();
       Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'อัปเดตยอดเงินผู้ใช้เรียบร้อย',
          background: '#1f1c14',
          color: '#fff'
       });
     } catch (err) {
       Swal.fire({
          icon: 'error',
          title: 'ข้อผิดพลาด',
          text: 'ไม่สามารถอัปเดตข้อมูลได้',
          background: '#1f1c14',
          color: '#fff'
       });
     }
  };

  const getTabLabel = (id: string) => {
    const items: Record<string, string> = {
      overview: 'หน้าภาพรวม',
      analytics: 'ข้อมูลวิเคราะห์',
      store: 'สินค้าในร้าน',
      categories: 'หมวดหมู่สินค้า',
      stock: 'จัดการสต็อก',
      banners: 'ตั้งค่าแบนเนอร์',
      pages: 'ตั้งค่าหน้าเพจ',
      preorders: 'จัดการ Pre-Order',
      users: 'สมาชิกทั้งหมด',
      history: 'ประวัติรายการ',
      ips: 'ความปลอดภัย',
      tools: 'ตัวช่วยแจกของ',
      api_keys: 'ระบบ API',
      settings: 'ตั้งค่าเว็บไซต์',
      system: 'สถานะระบบ'
    };
    return items[id] || id;
  };

  const NavItem = ({ id, label, icon: Icon }: any) => {
    const isActive = adminTab === id;
    return (
      <button
        onClick={() => {
          setAdminTab(id);
          setIsNavOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 relative group rounded-xl border ${
          isActive 
            ? 'bg-blue-500/10 text-foreground border-blue-500/20 font-semibold shadow-md shadow-blue-500/5' 
            : 'text-muted-foreground border-transparent hover:bg-zinc-900/50 hover:text-foreground'
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
        )}
        <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-primary' : 'text-muted-foreground/80 group-hover:text-zinc-300'}`} />
        <span className="text-xs tracking-wide">{label}</span>
        {isActive && (
          <ChevronRight className="w-3 h-3 ml-auto text-primary/80 group-hover:translate-x-0.5 transition-transform" />
        )}
      </button>
    );
  };
  
  const handleSaveSettings = async () => {
    try {
      const res = await axios.post('/api/settings', siteSettings);
      Swal.fire({
        icon: 'success', title: 'สำเร็จ', text: 'บันทึกตั้งค่าเรียบร้อย',
        background: '#1f1c14', color: '#fff'
      })
    } catch(err) {}
  };
  
  const handleMusicUpload = async () => {};
  
  const musicFileRef = useRef<any>(null);
  const uploadingMusic = false;

  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [stockProduct, setStockProduct] = useState<Product | undefined>(undefined);

  const purchaseHistory: any[] = [];
  const topupHistory: any[] = [];
  
  const [isPurchasesLoading, setIsPurchasesLoading] = useState(false);
  const [purchases, setPurchases] = useState([]);
  
  const preorderFilter = 'all';
  const setPreorderFilter = (v: any) => {};
  const preorderSearch = '';
  const setPreorderSearch = (v: any) => {};
  const filteredPreorders: any[] = [];
  const handleFulfillPreorder = (a: any, b?: any) => {};
  
  const totalOrders = 0;
  const salesToday = 0;
  const salesWeek = 0;
  const salesMonth = 0;

  return (
    <div className="min-h-screen bg-card flex font-sans text-foreground">
      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isNavOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNavOpen(false)}
            className="fixed inset-0 bg-[#000000]/60 backdrop-blur-3xl saturate-150 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 bg-card border-r border-[#374151] border w-[280px] z-50 transform transition-transform duration-300 lg:translate-x-0 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col h-full overflow-hidden`}>
        {/* Brand/Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-[#374151] border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center flex-shrink-0 gap-1.5 py-1">
              <div className="w-2 h-2 rounded-full bg-[#364153] shadow-[0_0_8px_#364153]" />
              <span className="text-xl font-light tracking-tight text-foreground font-logo select-none">
                apex<span className="text-[#364153] font-light">store</span>
              </span>
            </div>
          </div>
          <button onClick={() => setIsNavOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground bg-card rounded-md">
             <X className="X w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto w-full p-4 space-y-6 progress-track scrollbar-none">
          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest mb-2 px-3">ระบบจัดการหลัก</p>
            <NavItem id="overview" label="หน้าภาพรวม" icon={LayoutDashboard} />
            <NavItem id="analytics" label="ข้อมูลวิเคราะห์" icon={LineChart} />
            <NavItem id="settings" label="ตั้งค่าเว็บไซต์" icon={Settings} />
            <NavItem id="system" label="สถานะระบบ" icon={Cpu} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest mb-2 px-3">ร้านค้า & สินค้า</p>
            <NavItem id="store" label="สินค้าในร้าน" icon={Package} />
            <NavItem id="categories" label="หมวดหมู่สินค้า" icon={LayoutDashboard} />
            <NavItem id="stock" label="จัดการสต็อก" icon={Database} />
            <NavItem id="banners" label="ตั้งค่าแบนเนอร์" icon={Image} />
            <NavItem id="pages" label="ตั้งค่าหน้าเพจ" icon={FileText} />
            <NavItem id="preorders" label="จัดการ Pre-Order" icon={Clock} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest mb-2 px-3">ผู้ใช้งาน & ประวัติ</p>
            <NavItem id="users" label="สมาชิกทั้งหมด" icon={Users} />
            <NavItem id="history" label="ประวัติรายการ" icon={History} />
            <NavItem id="ips" label="ความปลอดภัย" icon={ShieldAlert} />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-widest mb-2 px-3">เครื่องมือเสริม</p>
            <NavItem id="tools" label="ตัวช่วยแจกของ" icon={Gift} />
            <NavItem id="api_keys" label="ระบบ API" icon={Key} />
          </div>
        </div>

        {/* Admin User Profile Bottom */}
        <div className="p-4 border-t border-[#374151] border bg-card shrink-0">
          <div className="flex items-center gap-3 p-3 bg-card">
            <div className="w-10 h-10 bg-card flex flex-shrink-0 items-center justify-center text-foreground font-medium">
              {adminUsername.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{adminUsername}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium">Administrator</p>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="p-2 text-red-200 hover:text-foreground hover:bg-red-500/20 transition-colors flex-shrink-0"
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
        <header className="h-[72px] bg-card/40 backdrop-blur-2xl saturate-150 border-b border-[#374151] border flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsNavOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground bg-card"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-medium text-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-primary text-primary-foreground  hidden sm:block"></span>
              {getTabLabel(adminTab)}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-muted-foreground bg-card px-3 py-1.5 border border-[#374151] border">
               <Activity className="w-3 h-3 text-[#364153]" />
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
                { label: 'ผู้ใช้งานทั้งหมด', value: (siteStats?.users || 0).toLocaleString(), icon: Users, color: 'text-primary', bg: 'bg-blue-500/10', border: 'hover:border-blue-500/40' },
                { label: 'ยอดขายทั้งหมด (สินค้า)', value: totalOrders.toLocaleString(), icon: Package, color: 'text-emerald-400', bg: 'bg-cardmerald-500/10', border: 'hover:border-emerald-500/40' },
                { label: 'คำสั่งซื้อทั้งหมด', value: purchaseHistory.length.toLocaleString(), icon: ShoppingCart, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'hover:border-amber-500/40' },
                { label: 'สินค้าประเภทสต็อก', value: products.filter(p => !p.isPreOrder && p.stock > 0).length.toLocaleString(), icon: Database, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'hover:border-indigo-500/40' }
              ].map((stat, i) => (
                <div key={i} className={`bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${stat.border}`}>
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-muted-foreground/80 text-[10px] font-bold uppercase tracking-wider mb-2">{stat.label}</p>
                      <h3 className="text-3xl font-extrabold text-foreground tracking-tight font-mono">{stat.value}</h3>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${stat.bg} ${stat.color} shadow-lg shadow-black/20`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-card border border-[#374151] rounded-md overflow-hidden">
                    <div className="p-6 border-b border-[#374151]/80 flex justify-between items-center bg-card">
                      <h3 className="font-medium flex items-center gap-2 text-foreground">
                        <LineChart className="w-5 h-5 text-[#364153]" /> รายงานสรุปยอดขาย (Sales Summary)
                      </h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-background/40 border border-[#374151]/60 p-6 text-center group hover:bg-background/80 hover:border-[#374151]/60 transition-all duration-200 rounded-md">
                        <p className="text-muted-foreground/80 text-[10px] font-semibold uppercase mb-2 tracking-widest">วันนี้</p>
                        <p className="text-2xl font-semibold text-[#364153] font-mono">{salesToday.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground/80 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-background/40 border border-[#374151]/60 p-6 text-center group hover:bg-background/80 hover:border-[#374151]/60 transition-all duration-200 rounded-md">
                        <p className="text-muted-foreground/80 text-[10px] font-semibold uppercase mb-2 tracking-widest">สัปดาห์นี้</p>
                        <p className="text-2xl font-semibold text-[#364153] font-mono">{salesWeek.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground/80 uppercase ml-1">THB</span></p>
                      </div>
                      <div className="bg-background/40 border border-[#374151]/60 p-6 text-center group hover:bg-background/80 hover:border-[#374151]/60 transition-all duration-200 rounded-md">
                        <p className="text-muted-foreground/80 text-[10px] font-semibold uppercase mb-2 tracking-widest">เดือนนี้</p>
                        <p className="text-2xl font-semibold text-[#364153] font-mono">{salesMonth.toLocaleString()} <span className="text-[10px] font-medium text-muted-foreground/80 uppercase ml-1">THB</span></p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-[#374151] rounded-md p-6">
                    <h3 className="font-medium flex items-center gap-2 mb-6 text-foreground uppercase text-xs tracking-widest">
                      <Cpu className="w-4 h-4 text-[#364153]" /> ระบบจัดการด่วน (Quick Management)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { id: 'store', label: 'จัดการสินค้า', desc: 'เพิ่ม ลบ แก้ไข สินค้าในร้าน', icon: Package, color: 'text-[#364153]', bg: 'bg-[#364153]/5' },
                            { id: 'keys', label: 'จัดการ License', desc: 'เพิ่มคีย์และดูประวัติ', icon: Key, color: 'text-muted-foreground', bg: 'bg-zinc-500/5' },
                            { id: 'users', label: 'จัดการสมาชิก', desc: 'ดูรายชื่อและแก้ไขยอดเงิน', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                            { id: 'settings', label: 'ตั้งค่าเว็บไซต์', desc: 'แก้ไขชื่อเว็บ ช่องทางติดต่อ', icon: Settings, color: 'text-[#364153]', bg: 'bg-[#364153]/5' },
                        ].map((item, i) => (
                           <button 
                             key={i}
                             onClick={() => setAdminTab(item.id)}
                             className="flex items-center gap-4 p-4 border border-[#374151]/80 bg-background/30 hover:bg-zinc-950 hover:border-[#374151] transition-all text-left group rounded-md"
                           >
                             <div className={`w-12 h-12 rounded-md ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-all duration-200 shadow-sm`}>
                               <item.icon className="w-5 h-5" />
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium text-foreground group-hover:text-[#364153] transition-colors">{item.label}</p>
                               <p className="text-[10px] text-muted-foreground/80 font-semibold truncate mt-0.5">{item.desc}</p>
                             </div>
                             <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-foreground transition-colors" />
                           </button>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-card border border-[#374151] rounded-md p-6">
                    <h3 className="font-medium flex items-center gap-2 mb-6 text-foreground uppercase text-xs tracking-widest">
                      <Settings className="w-4 h-4 text-[#364153]" /> เครื่องมือเพิ่มเติม
                    </h3>
                    <div className="space-y-3">
                      <button onClick={() => setAdminTab('banners')} className="w-full bg-background/30 hover:bg-zinc-950 border border-[#374151]/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Image className="w-5 h-5 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground group-hover:text-[#364153] transition-colors uppercase">ป้ายโฆษณา</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-foreground transition-colors" />
                      </button>
                      <button onClick={() => setAdminTab('pages')} className="w-full bg-background/30 hover:bg-zinc-950 border border-[#374151]/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground group-hover:text-[#364153] transition-colors uppercase">หน้าเพจ</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-foreground transition-colors" />
                      </button>
                      <button onClick={() => setAdminTab('history')} className="w-full bg-background/30 hover:bg-zinc-950 border border-[#374151]/80 rounded-md p-4 flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <History className="w-5 h-5 text-muted-foreground/80 group-hover:text-foreground transition-colors" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-foreground group-hover:text-[#364153] transition-colors uppercase">LOGS ของระบบ</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-foreground transition-colors" />
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
              <div className="bg-card border border-[#374151] border p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#364153]/10  opacity-50 translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium mb-1 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-[#364153]" />
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
                        contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#e4e4e7', fontSize: '14px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#374151] border">
                  <div className="bg-card p-4 border border-[#374151] border">
                    <p className="text-muted-foreground text-xs font-medium uppercase mb-1">Total Revenue</p>
                    <p className="text-2xl font-semibold text-[#364153]">฿19,550</p>
                    <p className="text-[#364153] text-[10px] mt-1 font-medium">+12% from last month</p>
                  </div>
                  <div className="bg-card p-4 border border-[#374151] border">
                    <p className="text-muted-foreground text-xs font-medium uppercase mb-1">Active Users</p>
                    <p className="text-2xl font-semibold text-[#364153]">2,420</p>
                    <p className="text-[#364153] text-[10px] mt-1 font-medium">+5% from last month</p>
                  </div>
                  <div className="bg-card p-4 border border-[#374151] border">
                    <p className="text-muted-foreground text-xs font-medium uppercase mb-1">Conversion Rate</p>
                    <p className="text-2xl font-semibold text-amber-400">4.2%</p>
                    <p className="text-[#364153] text-[10px] mt-1 font-medium">-1% from last month</p>
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
              <div className="bg-card border border-[#374151] rounded-md p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-foreground flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#364153]" /> ตั้งค่าสถิติหน้าแรก
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
                                <div class="p-3 bg-[#364153]/10 border border-emerald-500/20 rounded-md text-xs text-[#364153] mb-4 leading-relaxed">
                                  💡 แนะนำสั่งใช้ <b>"โตอัตโนมัติ (Auto-Grow)"</b> เมื่อมีสมาชิกสมัครใหม่หรือซื้อสินค้าจริงเข้ามา ตัวเลขจะบวกเพิ่มขึ้นเรื่อยๆ เสมอ!
                                </div>
                                
                                <div class="mb-4">
                                  <label class="block text-xs font-medium text-muted-foreground uppercase mb-1.5">👥 จำนวนผู้ใช้งานสะสม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-users" type="number" class="col-span-2 bg-zinc-950 border border-[#374151] rounded px-3 py-2 text-foreground outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 1500" value="${currentUsers}">
                                    <select id="swal-users-type" class="bg-zinc-950 border border-[#374151] rounded px-2 py-2 text-foreground text-xs font-medium outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_users_override === null || siteSettings.stats_users_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_users_override !== null && siteSettings.stats_users_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-4">
                                  <label class="block text-xs font-medium text-muted-foreground uppercase mb-1.5">💰 ยอดขายสะสมรวม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-sales" type="number" class="col-span-2 bg-zinc-950 border border-[#374151] rounded px-3 py-2 text-foreground outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 45000" value="${currentSales}">
                                    <select id="swal-sales-type" class="bg-zinc-950 border border-[#374151] rounded px-2 py-2 text-foreground text-xs font-medium outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_sales_override === null || siteSettings.stats_sales_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_sales_override !== null && siteSettings.stats_sales_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-4">
                                  <label class="block text-xs font-medium text-muted-foreground uppercase mb-1.5">📦 คลังสินค้าสะสมรวม</label>
                                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input id="swal-stock" type="number" class="col-span-2 bg-zinc-950 border border-[#374151] rounded px-3 py-2 text-foreground outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 850" value="${currentStock}">
                                    <select id="swal-stock-type" class="bg-zinc-950 border border-[#374151] rounded px-2 py-2 text-foreground text-xs font-medium outline-none focus:border-emerald-500 cursor-pointer">
                                      <option value="offset" ${siteSettings.stats_stock_override === null || siteSettings.stats_stock_override === undefined ? 'selected' : ''}>📈 โตอัตโนมัติ</option>
                                      <option value="override" ${siteSettings.stats_stock_override !== null && siteSettings.stats_stock_override !== undefined ? 'selected' : ''}>🔒 ล็อกตายตัว</option>
                                    </select>
                                  </div>
                                </div>

                                <div class="mb-2">
                                  <label class="block text-xs font-medium text-muted-foreground uppercase mb-1.5">📂 จำนวนหมวดหมู่สินค้า</label>
                                  <input id="swal-categories" type="number" class="w-full bg-zinc-950 border border-[#374151] rounded px-3 py-2 text-foreground outline-none focus:border-emerald-500 text-sm font-semibold" placeholder="เช่น 5" value="${currentCategories}">
                                </div>
                              </div>
                            `,
                            background: '#1f1c14',
                            color: '#fff',
                            focusConfirm: false,
                            confirmButtonColor: '#364153',
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
                                  
                                  Swal.fire({ title: 'บันทึกสำเร็จ', text: 'สถิติระบบปรับปรุงเรียบร้อยแล้ว', icon: 'success', confirmButtonColor: '#364153', background: '#1f1c14', color: '#fff' });
                                } catch (error: any) {
                                  Swal.fire({ title: 'เกิดข้อผิดพลาด', text: 'ไม่สามารถบันทึกสถิติได้: ' + (error.response?.data?.error || error.message), icon: 'error', confirmButtonColor: '#EF4444', background: '#1f1c14', color: '#fff' });
                                }
                            }
                        });
                    }}
                    className="border border-[#374151] bg-background/60 hover:bg-background text-zinc-300 hover:text-foreground font-medium py-1.5 px-3 text-xs rounded-md transition-all duration-150"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-950 p-4 border border-[#374151]/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-foreground font-mono">{(siteStats?.users || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground/80 text-[10px] font-medium uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-zinc-950 p-4 border border-[#374151]/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-foreground font-mono">{(siteStats?.stock || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground/80 text-[10px] font-medium uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-zinc-950 p-4 border border-[#374151]/80 flex flex-col items-center justify-center rounded-md">
                    <span className="text-2xl font-semibold text-foreground font-mono">{(siteStats?.sales || 0).toLocaleString()}</span>
                    <span className="text-muted-foreground/80 text-[10px] font-medium uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>
                  {/* Products List */}
              <div className="bg-card border border-[#374151] rounded-md p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium text-foreground flex items-center gap-2"><Package className="w-5 h-5 text-[#364153]" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => setIsAddingProduct(true)}
                    className="bg-[#364153] hover:bg-[#364153] text-foreground font-medium py-2 px-4 text-xs transition-colors flex items-center gap-2 rounded-md shadow-sm"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground hidden md:table">
                    <thead className="text-xs uppercase bg-zinc-950 text-muted-foreground/80 font-medium tracking-wider rounded-md border-b border-[#374151]">
                      <tr>
                        <th className="px-5 py-4">สินค้า</th>
                        <th className="px-5 py-4">ราคา</th>
                        <th className="px-5 py-4">สต๊อก</th>
                        <th className="px-5 py-4 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-[#374151]/80 hover:bg-background/30 transition-all duration-200">
                          <td className="px-5 py-4 flex items-center gap-3">
                            <img 
                              loading="lazy" 
                              src={p.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%2318181b"/><text x="50%" y="54%" font-family="sans-serif" font-size="12" fill="%23a1a1aa" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>'} 
                              alt={p.name} 
                              className="w-12 h-12 object-cover bg-zinc-950 border border-[#374151] rounded-md shadow-sm" 
                              onError={(e) => { 
                                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%2318181b"/><text x="50%" y="54%" font-family="sans-serif" font-size="12" fill="%23a1a1aa" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>'; 
                              }} 
                            />
                            <div>
                                <div className="text-foreground font-medium flex items-center gap-2">
                                  {p.name}
                                  {p.tag && (
                                    <span className="bg-card text-foreground text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded-sm">
                                      {p.tag}
                                    </span>
                                  )}
                                  <button 
                                    onClick={() => {
                                      navigator.clipboard.writeText(p.name);
                                      Swal.fire({ title: 'Copied!', text: 'คัดลอกชื่อสินค้าแล้ว', icon: 'success', timer: 1000, showConfirmButton: false, background: '#1f1c14', color: '#fff' });
                                    }}
                                    className="text-muted-foreground/80 hover:text-foreground transition-colors"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="text-xs text-muted-foreground/80 truncate max-w-[240px] mt-0.5">{p.description}</div>
                            </div>
                          </td>
                          <td className="px-5 py-4 font-medium">
                            <div className="flex flex-col">
                              {p.originalPrice && p.price && p.originalPrice > p.price && (
                                <span className="text-[10px] text-muted-foreground/80 line-through">฿{p.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-[#364153] font-mono">฿{(p.price || 0).toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium font-mono tracking-wide ${
                              p.stock > 0 
                                ? 'bg-[#364153]/10 text-[#364153] border border-emerald-500/20' 
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
                                  className="p-2 border border-[#364153]/30 bg-[#364153]/5 text-[#364153] hover:bg-[#364153]/15 hover:border-[#364153]/60 rounded-md transition-all duration-150"
                                  title="โหลดสต๊อก TXT เพื่อดูรายบรรทัด"
                                >
                                     <FileText className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setStockProduct(p)}
                                  className="p-2 border border-emerald-500/30 bg-[#364153]/5 text-[#364153] hover:bg-[#364153]/15 hover:border-emerald-500/60 rounded-md transition-all duration-150"
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
                                        background: '#1f1c14',
                                        color: '#fff'
                                      }).then(async (result) => {
                                        if (result.isConfirmed) {
                                          try {
                                            await axios.delete(`/api/products/${p.id}`, {
                                              headers: { 'Idempotency-Key': `delete_product_${p.id}_${Date.now()}_${Math.random()}` }
                                            });
                                            setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                            if (onRefreshData) onRefreshData();
                                            Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#1f1c14', color: '#fff', showConfirmButton: false, timer: 1000 });
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
                      <div key={i} className="bg-card border border-[#374151] border p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <img 
                            loading="lazy" 
                            src={p.imageUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%2318181b"/><text x="50%" y="54%" font-family="sans-serif" font-size="12" fill="%23a1a1aa" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>'} 
                            alt={p.name} 
                            className="w-12 h-12 object-cover bg-card border border-[#374151] rounded-md" 
                            onError={(e) => { 
                              e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%2318181b"/><text x="50%" y="54%" font-family="sans-serif" font-size="12" fill="%23a1a1aa" dominant-baseline="middle" text-anchor="middle">No Image</text></svg>'; 
                            }} 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground font-medium flex items-center gap-2 truncate">
                              <span className="truncate">{p.name}</span>
                              {p.tag && (
                                <span className="shrink-0 bg-card text-foreground text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5">
                                  {p.tag}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#374151] border">
                          <div>
                            <div className="text-xs text-muted-foreground">ราคา</div>
                            <div className="font-medium flex items-center gap-1.5">
                              {p.originalPrice && p.price && p.originalPrice > p.price && (
                                <span className="text-[10px] text-muted-foreground line-through">฿{p.originalPrice.toLocaleString()}</span>
                              )}
                              <span className="text-[#364153]">฿{(p.price || 0).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">สต๊อก</div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium mt-1 inline-block ${p.stock > 0 ? 'bg-[#364153]/10 text-[#364153]' : 'bg-zinc-600/10 text-[#364153]'}`}>
                              {p.stock}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 mt-2 pt-3 border-t border-[#374151] border">
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
                              className="p-2 border border-emerald-200 bg-primary text-primary-foreground text-[#364153] hover:bg-cardmerald-100 flex justify-center items-center"
                            >
                                <FileText className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setStockProduct(p)}
                              className="p-2 border border-[#374151] border bg-card text-muted-foreground hover:bg-card hover:border-[#374151] flex justify-center items-center"
                            >
                                <Database className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingProduct(p)}
                              className="p-2 border border-[#374151] border bg-card text-muted-foreground hover:bg-card hover:border-[#374151] flex justify-center items-center"
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
                                    background: '#1f1c14',
                                    color: '#fff'
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      try {
                                        await axios.delete(`/api/products/${p.id}`);
                                        setProducts(prev => prev.filter(prod => prod.id !== p.id));
                                        if (onRefreshData) onRefreshData();
                                        Swal.fire({ title: 'ลบสำเร็จ', icon: 'success', background: '#1f1c14', color: '#fff', showConfirmButton: false, timer: 1000 });
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
              className="bg-card border border-[#374151] border overflow-hidden"
            >
              <div className="p-6 border-b border-[#374151] border flex justify-between items-center bg-card">
                <div>
                  <h3 className="font-medium text-foreground flex items-center gap-2"><Key className="w-5 h-5 text-[#364153]" /> Key Management</h3>
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
                  }} className="bg-card hover:bg-background text-foreground px-4 py-2.5 text-xs font-medium transition-all flex items-center gap-2 ">
                    <Download className="w-4 h-4" /> บันทึกเป็น TXT
                  </button>
                  <button onClick={bulkDeleteKeys} className="bg-red-500 hover:bg-red-600 text-foreground px-4 py-2.5 text-xs font-medium transition-all flex items-center gap-2 ">
                    <Trash2 className="w-4 h-4" /> ลบคีย์หลายรายการ
                  </button>
                  <button onClick={addLicenseKey} className="bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-foreground px-4 py-2.5 text-xs font-medium transition-all flex items-center gap-2 ">
                    <Plus className="w-4 h-4" /> สร้างคีย์เพิ่ม
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-card text-muted-foreground font-medium tracking-wider">
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
                      <tr key={i} className="border-b border-[#374151] border hover:bg-card/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 bg-[#364153]"></div>
                             <span className="text-foreground font-mono font-medium">{key.key}</span>
                             <button 
                               onClick={() => {
                                 navigator.clipboard.writeText(key.key);
                                 Swal.fire({ title: 'Copied!', text: 'คัดลอกคีย์สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' });
                               }}
                               className="text-muted-foreground hover:text-[#364153] transition-colors p-1"
                               title="Copy Key"
                             >
                               <Copy className="w-4 h-4" />
                             </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-card text-muted-foreground px-2 py-0.5 rounded text-[10px] uppercase font-medium">{key.plan}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-medium uppercase ${key.status === 'active' ? 'bg-[#364153]/10 text-[#364153]' : 'bg-card text-muted-foreground'}`}>
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
              className="bg-card border border-[#374151] border overflow-hidden"
            >
               <div className="p-6 border-b border-[#374151] border bg-card">
                  <h3 className="font-medium text-foreground flex items-center gap-2"><History className="w-5 h-5 text-[#364153]" /> Redeem Logs</h3>
                  <p className="text-muted-foreground text-xs mt-1">ประวัติการใช้งานคีย์</p>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                  <thead className="text-xs uppercase bg-card text-muted-foreground font-medium tracking-wider">
                    <tr>
                      <th className="p-4">Key Used</th>
                      <th className="p-4">User IP</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-mono">
                    {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                      <tr key={i} className="border-b border-[#374151] border hover:bg-card/50 transition-colors">
                        <td className="p-4">
                          <span className="text-foreground font-medium">{h.key}</span>
                        </td>
                        <td className="p-4 text-muted-foreground">{h.ip}</td>
                        <td className="p-4 text-muted-foreground">{new Date(h.used_at).toLocaleString()}</td>
                        <td className="p-4">
                           <span className="bg-primary text-primary-foreground text-[#364153] px-2 py-0.5 rounded text-[10px] uppercase font-medium">Success</span>
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
              <div className="bg-card border border-[#374151] border p-6 rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground text-lg flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#364153]" /> ระบบจัดการ Pre-Order
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
                        background: '#1f1c14',
                        color: '#fff'
                      });
                    } catch (e) {
                      console.error(e);
                    } finally {
                      setIsPurchasesLoading(false);
                    }
                  }}
                  className="bg-background hover:bg-zinc-850 text-foreground px-4 py-2 border border-zinc-805 text-xs font-medium transition-all flex items-center gap-2"
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
                      className={`flex-1 sm:flex-initial px-4 py-2.5 text-xs font-medium transition-all border ${
                        preorderFilter === filter
                          ? 'bg-[#364153]/10 text-[#364153] border-emerald-500/30 font-medium'
                          : 'bg-zinc-950/40 text-muted-foreground border-[#374151] hover:bg-background font-medium'
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
                    className="w-full px-4 py-2 bg-zinc-950 border border-[#374151] text-xs font-medium rounded-sm text-foreground placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Preorders List Table */}
              <div className="bg-card border border-[#374151] border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm text-muted-foreground">
                    <thead className="text-xs uppercase bg-card text-muted-foreground font-medium tracking-wider border-b border-[#374151] border">
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
                            <tr key={purchase.id} className="border-b border-[#374151] border hover:bg-background/10 transition-colors">
                              {/* Order ID & User */}
                              <td className="p-4">
                                <p className="text-foreground font-medium">{purchase.billNumber || `#${purchase.id?.slice(0, 8)}`}</p>
                                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">{purchase.username || purchase.userId}</p>
                                <p className="text-[9px] text-muted-foreground/80 mt-0.5">{new Date(purchase.date || purchase.timestamp).toLocaleString()}</p>
                              </td>
                              
                              {/* Product Info */}
                              <td className="p-4 font-sans max-w-[200px]">
                                <p className="text-zinc-200 font-medium truncate" title={purchase.productName}>
                                  {purchase.productName}
                                </p>
                                <p className="text-[9px] text-muted-foreground/80 font-mono mt-0.5">ID: {purchase.productId}</p>
                              </td>

                              {/* Selected option */}
                              <td className="p-4">
                                <span className="bg-background border border-[#374151] text-zinc-300 px-2.5 py-1 rounded-sm text-[10px] font-semibold">
                                  {purchase.preOrderOption || 'ไม่ได้เลือก'}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="p-4 font-sans font-medium text-[#364153]">
                                ฿{(purchase.price || purchase.money || 0).toLocaleString()}
                              </td>

                              {/* Stock status indicator */}
                              <td className="p-4 font-sans">
                                {isDelivered ? (
                                  <span className="bg-[#364153]/10 text-[#364153] border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-medium inline-flex items-center gap-1">
                                    ✅ ส่งข้อมูลแล้ว
                                  </span>
                                ) : (
                                  <span className="bg-[#364153]/10 text-[#364153] border border-emerald-500/20 px-2.5 py-1 rounded-md text-[10px] font-medium inline-flex items-center gap-1 ">
                                    ⏳ กำลังจัดหาไอดี
                                  </span>
                                )}
                              </td>

                              {/* Secret Input or Output */}
                              <td className="p-4 w-[280px]">
                                {isDelivered ? (
                                  <div className="space-y-1">
                                    <div className="bg-zinc-950 border border-[#374151] text-muted-foreground p-2 text-[10px] max-h-16 overflow-y-auto font-mono whitespace-pre-wrap break-all rounded">
                                      {purchase.secretData}
                                    </div>
                                  </div>
                                ) : (
                                  <textarea
                                    id={inlineInputKey}
                                    placeholder="ใส่ข้อมูลไอดีที่จะจัดส่ง เช่น Username:Password..."
                                    className="w-full h-12 px-2 py-1.5 bg-zinc-950 border border-[#374151] text-[11px] rounded focus:outline-none focus:border-emerald-500/40 text-foreground placeholder-zinc-600 font-mono resize-none"
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
                                          background: '#1f1c14',
                                          color: '#fff',
                                          confirmButtonColor: '#364153',
                                          cancelButtonColor: '#27272a'
                                        }).then((result) => {
                                          if (result.isConfirmed && result.value !== undefined) {
                                            handleFulfillPreorder(purchase.id, result.value);
                                          }
                                        });
                                      }}
                                      className="px-2 py-1.5 bg-background hover:bg-zinc-700 text-zinc-300 font-sans font-medium text-[10px] rounded hover:text-foreground transition-colors cursor-pointer"
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
                                            background: '#1f1c14',
                                            color: '#fff'
                                          });
                                          return;
                                        }
                                        handleFulfillPreorder(purchase.id, codeInput);
                                      }}
                                      className="px-3 py-1.5 bg-[#364153] hover:bg-[#364153] text-foreground font-sans font-medium text-[10px] rounded transition-colors cursor-pointer"
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
              className="bg-card border border-[#374151] border overflow-hidden"
            >
               <div className="p-6 border-b border-[#374151] border flex justify-between items-center bg-card">
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2"><Ban className="w-5 h-5 text-[#364153]" /> IP Access Control</h3>
                    <p className="text-muted-foreground text-xs mt-1">แบนผู้ใช้งานที่ไม่พึงประสงค์</p>
                  </div>
                  <button onClick={blockIP} className="bg-primary text-primary-foreground hover:bg-[#1D4ED8] text-foreground px-6 py-2.5 text-xs font-medium transition-all flex items-center gap-2 ">
                     <Ban className="w-4 h-4" /> แบน IP ใหม่
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm text-muted-foreground">
                    <thead className="text-xs uppercase bg-card text-muted-foreground font-medium tracking-wider">
                      <tr>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Date Blocked</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                        <tr key={i} className="border-b border-[#374151] border hover:bg-card/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[#364153] font-medium tracking-tight">{ip.ip}</span>
                              <button onClick={() => { navigator.clipboard.writeText(ip.ip); Swal.fire({ title: 'Copied!', text: 'คัดลอก IP สำเร็จ', icon: 'success', timer: 1000, showConfirmButton: false, confirmButtonColor: '#16a34a' }); }} className="text-muted-foreground hover:text-[#364153]"><Copy className="w-3 h-3" /></button>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground italic">"{ip.reason}"</td>
                          <td className="p-4 text-muted-foreground">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => unblockIP(ip.ip)} className="text-[#364153] hover:text-emerald-700 text-[10px] font-medium uppercase tracking-widest bg-primary text-primary-foreground hover:bg-cardmerald-100 px-3 py-1.5 border border-emerald-100 transition-all">
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
              <div className="bg-card border border-[#374151] border overflow-hidden">
                <div className="p-6 border-b border-[#374151] border bg-card">
                  <h3 className="font-medium text-foreground flex items-center gap-2"><Settings className="w-5 h-5 text-muted-foreground" /> Site Settings</h3>
                  <p className="text-muted-foreground text-xs mt-1">ตั้งค่าพารามิเตอร์ต่างๆ ของระบบ</p>
                </div>
                <div className="p-6 space-y-8">
                   <div className="p-6 bg-card border border-[#374151] border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#364153]" /> ชื่อเว็บไซต์ (Site Name)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.site_name}
                          onChange={(e) => setSiteSettings({ ...siteSettings, site_name: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="APEXSTORE"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Phone className="w-4 h-4 text-[#364153]" /> เบอร์รับเงินวอลเล็ต
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.truewallet_phone}
                          onChange={(e) => setSiteSettings({ ...siteSettings, truewallet_phone: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="095xxxxxxx"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#364153]" /> ชื่อธนาคาร (เช่น ธนาคารกสิกรไทย)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_name || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_name: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="ธนาคารกสิกรไทย"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#364153]" /> เลขบัญชีบัญชาการ (เช่น 196-3-87032-5)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_account_number || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_number: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="196-3-87032-5"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#364153]" /> ชื่อเจ้าของบัญชี (เช่น นาย กรวิชญ์)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_account_holder || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_account_holder: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="นาย กรวิชญ์"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Globe className="w-4 h-4 text-[#364153]" /> ลิงก์รูปภาพ QR Code พร้อมเพย์ / ธนาคาร (ปล่อยว่างเพื่อใช้แบบ Dynamic QR)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.bank_qr_image || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, bank_qr_image: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-[#364153]" /> ลิงก์ Discord
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.discord_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, discord_link: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="https://discord.gg/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-[#364153]" /> ลิงก์ Facebook Page
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.facebook_link || siteSettings.contact_line}
                          onChange={(e) => setSiteSettings({ ...siteSettings, facebook_link: e.target.value, contact_line: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="https://www.facebook.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-pink-500" /> ลิงก์ Instagram
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.instagram_link}
                          onChange={(e) => setSiteSettings({ ...siteSettings, instagram_link: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-pink-500"
                          placeholder="https://www.instagram.com/..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <MessageSquare className="w-4 h-4 text-[#364153]" /> ข้อความประกาศ (Announcement Bar)
                        </label>
                        <input 
                          type="text"
                          value={siteSettings.announcement_text || ''}
                          onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
                          placeholder="พิมพ์ข้อความที่ต้องการให้วิ่งบนแถบประกาศ..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                           <Users className="w-4 h-4 text-muted-foreground" /> อีเมลติดต่อ (Support)
                        </label>
                        <input 
                          type="email"
                          value={siteSettings.contact_email}
                          onChange={(e) => setSiteSettings({ ...siteSettings, contact_email: e.target.value })}
                          className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-[#374151]"
                          placeholder="support@example.com"
                        />
                      </div>

                      <div className="flex items-end">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full bg-card text-foreground px-8 py-5 text-sm font-semibold hover:bg-[#1e1e1e] transition-all active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                          <Settings className="w-5 h-5" /> บันทึกการตั้งค่า
                        </button>
                      </div>
                    </div>

                    <div className="mt-8 p-6 bg-card border border-[#374151] border">
                      <div className="mb-6">
                        <h4 className="text-foreground font-medium flex items-center gap-2"><Globe className="w-5 h-5 text-[#364153]" /> แผงควบคุมเพลงพื้นหลัง (Background Music)</h4>
                        <p className="text-muted-foreground text-sm mt-1">ใส่ลิ้งค์ YouTube, Spotify หรืออัพโหลดไฟล์เสียงโดยตรง (.mp3) เพื่อเปิดเพลงอัตโนมัติเมื่อผู้ใช้เข้าเว็บ</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-muted-foreground flex items-center gap-2">
                               ลิ้งค์เพลง (แนะนำ YouTube หรือไฟล์อัพโหลดเพื่อเพลงเต็ม)
                            </label>
                            <div className="relative group">
                              <button 
                                onClick={() => musicFileRef.current?.click()}
                                disabled={uploadingMusic}
                                className="flex items-center gap-2 text-xs font-medium text-[#364153] hover:text-[#364153]/80 transition-colors disabled:opacity-50"
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
                            className="w-full bg-card border border-[#374151] border px-5 py-4 text-foreground text-sm font-medium focus:outline-none focus:border-emerald-500"
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
                              <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${siteSettings.spotify_autoplay ? 'bg-[#364153] border-emerald-500' : 'bg-card border-[#374151] group-hover:border-[#374151]'}`}>
                                {siteSettings.spotify_autoplay && <Check className="w-3.5 h-3.5 text-foreground" />}
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">เปิดใช้งานเล่นอัตโนมัติ (Autoplay)</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5">* แนะนำใช้ YouTube หรือ ไฟล์อัพโหลดเพื่อให้ได้เพลงเต็ม (Spotify จะติดพรีวิว 30 วิ)</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      <div className="mt-6">
                        <button 
                          onClick={handleSaveSettings}
                          className="w-full md:w-auto px-8 py-4 bg-primary text-primary-foreground hover:bg-[#364153] text-foreground text-sm font-semibold transition-all flex items-center justify-center gap-2"
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
                        <p className="text-xs font-medium text-amber-800">หมายเหตุเกี่ยวกับข้อมูลสถิติ</p>
                        <p className="text-[10px] text-amber-700/80 mt-1 leading-relaxed">
                          ผู้ใช้งาน = ยอดปรับแต่ง (Offset) + ผู้ใช้งานจริงที่เคยสั่งซื้อ <br/>
                          ยอดขาย = ยอดปรับแต่ง (Offset) + ยอดเงินจริงจากออเดอร์
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 border border-[#374151] border mt-8">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4">API Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
                      <div className="flex items-center justify-between p-3 bg-card border border-[#374151] border">
                        <span className="text-muted-foreground font-medium uppercase">Angpao API</span>
                        <span className="text-[#364153] font-semibold">ACTIVE</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-card border border-[#374151] border">
                        <span className="text-muted-foreground font-medium uppercase">Bank Slip API</span>
                        <span className="text-[#364153] font-semibold">ACTIVE</span>
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
              <div className="bg-card border border-[#374151] border overflow-hidden">
                <div className="p-6 border-b border-[#374151] border bg-card">
                  <h3 className="font-medium text-foreground flex items-center gap-2"><Image className="w-5 h-5 text-muted-foreground" /> จัดการป้ายโฆษณา & ป็อปอัพ</h3>
                  <p className="text-muted-foreground text-xs mt-1">ตั้งค่ารูปภาพแบนเนอร์และป็อปอัพประกาศ</p>
                </div>
                <div className="p-6 space-y-8">
                  <div className="p-6 bg-card border border-[#374151] border">
                    <div className="mb-6">
                      <h4 className="text-foreground font-medium flex items-center gap-2"><Globe className="w-5 h-5 text-muted-foreground" /> Popup Banner Announcement</h4>
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
                            <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${siteSettings.popup_enabled ? 'bg-zinc-600 border-[#364153]' : 'bg-card border-[#374151] group-hover:border-[#374151]'}`}>
                              {siteSettings.popup_enabled && <Check className="w-3.5 h-3.5 text-foreground" />}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-foreground">เปิดใช้งานป็อปอัพประกาศ</span>
                        </label>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                        <label className="block text-sm font-medium text-muted-foreground">รูปภาพประกาศ (ขนาดที่แนะนำ 940 x 480 px)</label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input 
                            type="text"
                            value={siteSettings.popup_img_url}
                            onChange={(e) => setSiteSettings({ ...siteSettings, popup_img_url: e.target.value })}
                            className="flex-1 w-full bg-card border border-[#374151] border px-4 py-3 text-foreground text-sm focus:outline-none focus:border-[#364153] transition-all"
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
                            className="px-6 bg-primary text-primary-foreground text-[#364153] font-medium hover:bg-zinc-600/20 flex items-center justify-center whitespace-nowrap gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4"/> อัพโหลดภาพ
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-muted-foreground">ลิ้งค์ปลายทางเมื่อคลิกรูปภาพป็อปอัพ (ปล่อยว่างได้)</label>
                         <input 
                           type="text"
                           value={siteSettings.popup_link}
                           onChange={(e) => setSiteSettings({ ...siteSettings, popup_link: e.target.value })}
                           className="w-full bg-card border border-[#374151] border px-4 py-3 text-foreground text-sm focus:outline-none focus:border-[#364153] transition-all"
                           placeholder="https://facebook.com/..."
                         />
                      </div>
                    </div>


                  </div>

                  <div className="p-6 bg-card border border-[#374151] border">
                    <div className="mb-6">
                      <h4 className="text-foreground font-medium flex items-center gap-2"><Image className="w-5 h-5 text-muted-foreground" /> Banners Announcement</h4>
                      <p className="text-muted-foreground text-sm mt-1">ป้ายสไลด์โฆษณาในหน้าแรกของเว็บไซต์</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4 col-span-1 md:col-span-2">
                         <label className="block text-sm font-medium text-muted-foreground">รูปภาพป้ายโฆษณาหน้าแรก (URL 1 บรรทัดต่อ 1 รูปภาพ)</label>
                         <textarea 
                           value={(siteSettings.banners || []).join('\n')}
                           onChange={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n') })}
                           className="w-full bg-card border border-[#374151] border px-4 py-3 text-foreground text-sm focus:outline-none focus:border-[#364153] transition-all h-32 resize-none leading-relaxed"
                           placeholder="https://img.th/banner1.png&#10;https://img.th/banner2.png"
                           onBlur={(e) => setSiteSettings({ ...siteSettings, banners: e.target.value.split('\n').map(url => url.trim()).filter(Boolean) })}
                         />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end pt-4">
                    <button 
                      onClick={handleSaveSettings}
                      className="w-full bg-primary text-primary-foreground text-foreground px-8 py-4 text-sm font-semibold hover:bg-zinc-600/80 transition-all flex items-center justify-center gap-3 "
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
              <div className="bg-card border border-[#374151] border overflow-hidden">
                <div className="p-6 border-b border-[#374151] border flex justify-between items-center bg-card">
                  <div>
                    <h3 className="font-medium text-foreground flex items-center gap-2"><Cpu className="w-5 h-5 text-[#364153]" /> System Monitoring</h3>
                    <p className="text-muted-foreground text-xs mt-1">Realtime node state and resource allocation</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "CPU Usage", value: "14%", icon: Cpu, color: "text-amber-600", bg: "bg-amber-50" },
                      { label: "Memory (RAM)", value: "512MB / 1GB", icon: HardDrive, color: "text-[#364153]", bg: "bg-indigo-50" },
                      { label: "Network IO", value: "24 Mbps", icon: Activity, color: "text-[#364153]", bg: "bg-cardmerald-50" },
                      { label: "Uptime", value: "94 Days", icon: BarChart3, color: "text-[#364153]", bg: "bg-cyan-50" }
                    ].map((stat, i) => (
                      <div key={i} className="bg-card border border-[#374151] border p-4 flex items-center gap-4 transition-colors hover:bg-card/50">
                        <div className={`p-3 ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] font-medium uppercase">{stat.label}</p>
                          <p className="text-lg font-medium font-mono text-foreground">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-[#374151] border pt-8">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Gift className="w-4 h-4 text-[#364153]" /> Third-party Integrations
                    </h4>
                    <div className="bg-card border border-[#374151] border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-card border border-[#374151] border flex items-center justify-center">
                           <Globe className="w-6 h-6 text-muted-foreground" />
                         </div>
                         <div className="text-center sm:text-left">
                           <p className="text-sm font-semibold text-foreground">Manybaht TrueWallet API</p>
                           <p className="text-xs font-medium text-muted-foreground select-all">https://github.com/manybaht/Manybaht-Truewallet-API</p>
                         </div>
                       </div>
                       <a href="https://github.com/manybaht/Manybaht-Truewallet-API" target="_blank" rel="noopener noreferrer" className="bg-card border border-[#374151] border text-muted-foreground px-6 py-2.5 text-xs font-medium hover:bg-card transition-all flex items-center gap-2">
                         <Copy className="w-4 h-4" /> View Source
                       </a>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Database className="w-4 h-4" /> Environment Information
                    </h4>
                    <div className="bg-card border border-[#374151] border p-4 font-mono text-xs space-y-3">
                      <div className="flex justify-between border-b border-[#374151]/60 pb-2">
                         <span className="text-muted-foreground font-medium">Node JS</span>
                         <span className="text-muted-foreground">v22.x.x</span>
                      </div>
                      <div className="flex justify-between border-b border-[#374151]/60 pb-2">
                         <span className="text-muted-foreground font-medium">Database</span>
                         <span className="text-[#364153] font-medium">Connected (Supabase)</span>
                      </div>
                      <div className="flex justify-between border-b border-[#374151]/60 pb-2">
                         <span className="text-muted-foreground font-medium">Build Mode</span>
                         <span className="text-[#364153] font-medium">Production</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-muted-foreground font-medium">Vite Config</span>
                         <span className="text-amber-600 font-medium">Optimized</span>
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
                  Swal.fire({ title: 'เพิ่มสินค้าสำเร็จ', icon: 'success', background: '#1f1c14', color: '#fff' });
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
                  Swal.fire({ title: 'แก้ไขสินค้าสำเร็จ', icon: 'success', background: '#1f1c14', color: '#fff' });
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
                      background: '#1f1c14', color: '#fff'
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
                  Swal.fire({ title: 'เพิ่มสต๊อกสำเร็จ', text: `เพิ่มแล้ว ${addedCount} รายการ`, icon: 'success', background: '#1f1c14', color: '#fff' });
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
