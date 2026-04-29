import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Database, LogOut, BarChart3, Key, History, ShieldAlert, Activity, Ban, ChevronRight, Settings, Plus, Trash2, Crown } from 'lucide-react';
import Swal from 'sweetalert2';
import { AccountResult, Product, SiteStats } from '../types';
import { ShoppingCart, Package, Users } from 'lucide-react';

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
  adminUsername: string;
  setIsAdmin: (val: boolean) => void;
  addLicenseKey: () => void;
  blockIP: () => void;
  deleteKey: (id: string) => void;
  unblockIP: (ip: string) => void;
}

const DatabaseSetupGuide = () => (
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
    
    <div className="space-y-8">
      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">01</div>
        <div className="pt-1">
          <h3 className="text-white font-bold mb-1 tracking-tight">Open Supabase SQL Editor</h3>
          <p className="text-zinc-500 text-sm leading-relaxed">Go to your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-amber-500 hover:underline font-bold">Supabase Dashboard</a> and open the SQL Editor.</p>
        </div>
      </div>

      <div className="flex gap-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-400 text-sm font-black border border-white/5">02</div>
        <div className="pt-1 flex-grow">
          <h3 className="text-white font-bold mb-1 tracking-tight">Execute Bootstrap SQL</h3>
          <p className="text-zinc-500 text-sm mb-4 leading-relaxed">Copy the code below, paste it into a new query, and click <strong>"Run"</strong>.</p>
          <div className="relative group">
            <pre className="bg-black/80 rounded-2xl p-5 text-[11px] font-mono text-zinc-400 overflow-x-auto border border-white/5 max-h-64 scrollbar-thin scrollbar-thumb-zinc-800 leading-relaxed">
{`-- 1. Table for license keys
CREATE TABLE license_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text UNIQUE NOT NULL,
    plan text NOT NULL,
    status text NOT NULL DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

-- 2. Table for used keys
CREATE TABLE used_keys (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL,
    ip text NOT NULL,
    details text,
    used_at timestamptz DEFAULT now()
);

-- 3. Table for blocked IPs
CREATE TABLE blocked_ips (
    ip text PRIMARY KEY,
    reason text,
    blocked_at timestamptz DEFAULT now()
);

-- 4. Table for admins
CREATE TABLE admins (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    username text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'admin',
    granted_at timestamptz DEFAULT now()
);`}
            </pre>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`CREATE TABLE license_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text UNIQUE NOT NULL, plan text NOT NULL, status text NOT NULL DEFAULT 'active', created_at timestamptz DEFAULT now()); CREATE TABLE used_keys (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, key text NOT NULL, ip text NOT NULL, details text, used_at timestamptz DEFAULT now()); CREATE TABLE blocked_ips (ip text PRIMARY KEY, reason text, blocked_at timestamptz DEFAULT now()); CREATE TABLE admins (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, username text UNIQUE NOT NULL, role text NOT NULL DEFAULT 'admin', granted_at timestamptz DEFAULT now());`);
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

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  totalChecked, validAccounts, firebaseKeys, usedKeysHistory, blockedIPs,
  adminTab, setAdminTab, isDBReady, adminUsername, setIsAdmin,
  addLicenseKey, blockIP, deleteKey, unblockIP,
  products = [], setProducts, siteStats = { users: 0, stock: 0, sales: 0 }, setSiteStats
}) => {
  return (
    <div className="min-h-screen bg-[#050507] text-white p-4 md:p-8 animate-in fade-in duration-700 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
              <Crown className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent uppercase tracking-tighter">
                Apex Backend Management
              </h1>
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Control Center • {adminUsername}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-2 flex-1 md:flex-none">
              <div className={`w-2 h-2 rounded-full ${isDBReady ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">System: {isDBReady ? 'Stable' : 'DB ERROR'}</span>
            </div>
            <button 
              onClick={() => setIsAdmin(false)}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border border-white/5 px-6 py-2 rounded-2xl text-[10px] font-bold transition-all flex items-center gap-2 uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Exit Console
            </button>
          </div>
        </div>

        {!isDBReady ? (
          <DatabaseSetupGuide />
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
              {[
                { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                { id: 'store', label: 'จัดการร้านค้า', icon: Package },
                { id: 'keys', label: 'License Keys', icon: Key },
                { id: 'history', label: 'Redeem History', icon: History },
                { id: 'ips', label: 'Access Control', icon: ShieldAlert }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold transition-all border whitespace-nowrap ${
                    adminTab === tab.id 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                    : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
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
                  { label: 'Scanned (Session)', value: totalChecked, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                  { label: 'Active Keys', value: firebaseKeys.filter(k => k.status === 'active').length, icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                  { label: 'Redeemed Today', value: usedKeysHistory.filter(h => new Date(h.used_at).toDateString() === new Date().toDateString()).length, icon: History, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                  { label: 'Blocked Users', value: blockedIPs.length, icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10' }
                ].map((stat, i) => (
                  <div key={i} className="bg-zinc-950 border border-white/5 p-6 rounded-3xl relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} blur-3xl opacity-20 -mr-8 -mt-8 transition-all group-hover:scale-150`}></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-mono font-bold tracking-tighter">{stat.value}</h3>
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
                  <div className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden font-sans">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                      <h3 className="font-bold flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-500" /> Session Activity Log
                      </h3>
                      <Activity className="w-4 h-4 text-zinc-500 animate-pulse" />
                    </div>
                    <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10">
                            <th className="p-4 font-bold uppercase text-[10px]">Target</th>
                            <th className="p-4 font-bold uppercase text-[10px]">Result</th>
                            <th className="p-4 font-bold uppercase text-[10px]">UID</th>
                            <th className="p-4 font-bold uppercase text-[10px]">Time</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono text-[11px]">
                          {validAccounts.length > 0 ? validAccounts.map((acc, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 text-zinc-300">{acc.account}</td>
                              <td className="p-4">
                                <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded uppercase text-[9px]">Verified</span>
                              </td>
                              <td className="p-4 text-zinc-500">{acc.uid}</td>
                              <td className="p-4 text-zinc-600">{new Date().toLocaleTimeString()}</td>
                            </tr>
                          )) : (
                            <tr>
                              <td colSpan={4} className="p-12 text-center text-zinc-700 italic">No activity recorded in this session</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-zinc-950 border border-white/5 rounded-3xl p-6">
                    <h3 className="font-bold flex items-center gap-2 mb-6">
                      <Settings className="w-4 h-4 text-zinc-500" /> Utility Tools
                    </h3>
                    <div className="space-y-4">
                      <button onClick={addLicenseKey} className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Plus className="w-5 h-5 text-emerald-500" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-emerald-500">Create New Keys</p>
                            <p className="text-[10px] text-zinc-500">Bulk generation system</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                      </button>
                      <button onClick={blockIP} className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-4 rounded-2xl flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3">
                          <Ban className="w-5 h-5 text-red-500" />
                          <div className="text-left">
                            <p className="text-sm font-bold text-red-500">Block Address</p>
                            <p className="text-[10px] text-zinc-500">Instantly restrict IP</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-700" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6 text-center">
                     <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Storage Usage</p>
                     <div className="w-full bg-zinc-900 rounded-full h-1.5 mb-2 overflow-hidden">
                        <div className="bg-red-500 h-full w-[15%] rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                     </div>
                     <p className="text-zinc-600 text-[9px]">1.2MB / 512MB (Enterprise Plan)</p>
                  </div>
                </div>
              </div>
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
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" /> ตั้งค่าสถิติหน้าแรก</h3>
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
                            background: '#09090b',
                            color: '#fff',
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
                                Swal.fire({ title: 'บันทึกสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                            }
                        });
                    }}
                    className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                  >
                    แก้ไขสถิติ
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.users.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ผู้ใช้งาน</span>
                  </div>
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.stock.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">สต๊อกสินค้า</span>
                  </div>
                  <div className="bg-[#09090b] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-white">{siteStats.sales.toLocaleString()}</span>
                    <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">ยอดขาย</span>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white flex items-center gap-2"><Package className="w-5 h-5 text-emerald-400" /> จัดการสินค้า</h3>
                  <button 
                    onClick={() => {
                        Swal.fire({
                            title: 'เพิ่มสินค้าใหม่',
                            html: `
                              <input id="p-name" class="swal2-input" placeholder="ชื่อสินค้า">
                              <input id="p-desc" class="swal2-input" placeholder="รายละเอียด">
                              <input id="p-price" type="number" class="swal2-input" placeholder="ราคา">
                              <input id="p-img" class="swal2-input" placeholder="URL รูปภาพ">
                              <input id="p-stock" type="number" class="swal2-input" placeholder="จำนวนในสต๊อก">
                              <input id="p-cat" class="swal2-input" placeholder="หมวดหมู่ (เช่น เกมออนไลน์, บัตรเติมเงิน)">
                            `,
                            focusConfirm: false,
                            background: '#09090b',
                            color: '#fff',
                            preConfirm: () => {
                              return {
                                id: Math.random().toString(36).substr(2, 9),
                                name: (document.getElementById('p-name') as HTMLInputElement).value,
                                description: (document.getElementById('p-desc') as HTMLInputElement).value,
                                price: parseInt((document.getElementById('p-price') as HTMLInputElement).value),
                                imageUrl: (document.getElementById('p-img') as HTMLInputElement).value,
                                stock: parseInt((document.getElementById('p-stock') as HTMLInputElement).value),
                                category: (document.getElementById('p-cat') as HTMLInputElement).value
                              }
                            }
                        }).then((result) => {
                            if (result.isConfirmed && setProducts) {
                                setProducts([...products, result.value!]);
                                Swal.fire({ title: 'เพิ่มสินค้าสำเร็จ', icon: 'success', background: '#09090b', color: '#fff' });
                            }
                        });
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 px-4 rounded-xl text-xs transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4"/> เพิ่มสินค้า
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-400">
                    <thead className="text-xs uppercase bg-[#09090b] text-zinc-500 font-bold tracking-wider">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">สินค้า</th>
                        <th className="px-4 py-3">ราคา</th>
                        <th className="px-4 py-3">สต๊อก</th>
                        <th className="px-4 py-3 text-right rounded-r-xl">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 flex items-center gap-3">
                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                            <div>
                                <div className="text-white font-bold">{p.name}</div>
                                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{p.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold text-emerald-400">฿{p.price.toLocaleString()}</td>
                          <td className="px-4 py-4">{p.stock}</td>
                          <td className="px-4 py-4 text-right">
                            <button 
                                onClick={() => {
                                    if(setProducts) {
                                        setProducts(products.filter(prod => prod.id !== p.id));
                                    }
                                }}
                                className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                      <div className="text-center py-8 text-zinc-500">
                          ยังไม่มีสินค้า
                      </div>
                  )}
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
              className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                <div>
                  <h3 className="text-xl font-bold">Key Management</h3>
                  <p className="text-zinc-500 text-xs mt-1">Manage and track all generated licenses</p>
                </div>
                <button onClick={addLicenseKey} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <Plus className="w-4 h-4" /> GENERATE NEW KEYS
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                      <th className="p-4">License Key</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {firebaseKeys.length > 0 ? firebaseKeys.map((key, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                             <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>
                             <span className="text-zinc-200 select-all">{key.key}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px]">{key.plan}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${key.status === 'active' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                            {key.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-600">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => deleteKey(key.id)} className="p-2 hover:bg-red-500/10 text-zinc-700 hover:text-red-500 rounded-lg transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-20 text-center text-zinc-600">No keys found in database</td></tr>
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
              className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden"
            >
               <div className="p-8 border-b border-white/5 bg-zinc-900/20">
                  <h3 className="text-xl font-bold">Redeem Logs</h3>
                  <p className="text-zinc-500 text-xs mt-1">Audit trail of all license usage</p>
               </div>
               <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                      <th className="p-4">Key Used</th>
                      <th className="p-4">User IP</th>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {usedKeysHistory.length > 0 ? usedKeysHistory.map((h, i) => (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="p-4 text-amber-500/80">{h.key}</td>
                        <td className="p-4 text-zinc-400">{h.ip}</td>
                        <td className="p-4 text-zinc-600">{new Date(h.used_at).toLocaleString()}</td>
                        <td className="p-4"><span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">SUCCESS</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="p-20 text-center text-zinc-600">No history records found</td></tr>
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
              className="bg-zinc-950 border border-white/5 rounded-3xl overflow-hidden"
            >
               <div className="p-8 border-b border-white/5 flex justify-between items-center bg-zinc-900/20">
                  <div>
                    <h3 className="text-xl font-bold">IP Access Control</h3>
                    <p className="text-zinc-500 text-xs mt-1">Permanently block malicious users</p>
                  </div>
                  <button onClick={blockIP} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2">
                     <Ban className="w-4 h-4" /> BLOCK NEW IP
                  </button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-zinc-500 border-b border-white/5 bg-zinc-900/10 uppercase text-[10px] font-bold">
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Reason</th>
                        <th className="p-4">Date Blocked</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-xs">
                      {blockedIPs.length > 0 ? blockedIPs.map((ip, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 text-red-500 font-bold tracking-tight">{ip.ip}</td>
                          <td className="p-4 text-zinc-400 italic">"{ip.reason}"</td>
                          <td className="p-4 text-zinc-600">{new Date(ip.blocked_at).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button onClick={() => unblockIP(ip.ip)} className="text-emerald-500 hover:text-emerald-400 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/10 transition-all">
                                Unblock
                             </button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-20 text-center text-zinc-600">No IP blocks active</td></tr>
                      )}
                    </tbody>
                  </table>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};
