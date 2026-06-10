import React, { useState } from 'react';
import { User, Wallet, Shield, Mail, Calendar, CreditCard, ChevronRight, LogOut, Package, History, Key, Copy, Link2, Check, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';
import { UserPlan } from '../types';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getAvatarUrl } from '../lib/avatar';
import { getUserRank } from '../lib/rank';
import { AnimatedScroll } from './AnimatedScroll';
import axios from 'axios';

interface ProfileViewProps {
  user: SupabaseUser | null;
  userPlan: UserPlan | null;
  setUserPlan: (plan: UserPlan) => void;
  clientIp: string | null;
  setActiveView: (view: any) => void;
  handleLogout: () => void;
  purchaseHistory?: any[];
  usedKeysHistory?: any[];
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user, userPlan, setUserPlan, clientIp, setActiveView, handleLogout,
  purchaseHistory = [], usedKeysHistory = []
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawRole = userPlan?.role;
  let role = '';
  if (rawRole && ['admin', 'owner'].includes(rawRole.toLowerCase())) {
     role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();
  } else {
     role = getUserRank(userPlan, user);
  }
  const isAdminOrOwner = ['admin', 'owner'].includes(rawRole?.toLowerCase() || '');
  const balance = userPlan?.balance || 0;
  const fullName = userPlan?.fullName || '-';
  const username = userPlan?.username || user?.email?.split('@')[0] || '';
  const email = user?.email || 'Log In (Anonymous)';
  const registeredAt = userPlan?.registeredAt ? new Date(userPlan.registeredAt).toLocaleDateString('th-TH') : new Date().toLocaleDateString('th-TH');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderHistoryItem = (item: any, type: 'purchase' | 'key') => {
    const timestamp = item.timestamp || item.usedAt;
    const dateStr = timestamp ? new Date(timestamp).toLocaleString('th-TH') : '-';
    const displayId = item.id.substring(0, 8).toUpperCase();
    
    return (<div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 hover:border-zinc-700 transition-all rounded-xl gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[400px]">
            {type === 'purchase' ? item.productName : `: ${item.key || ''}`}</span>
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400">
            <span className="font-mono bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-neon-green font-bold">#{displayId}</span>
            <span>{dateStr}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {type === 'purchase' ? (
            <span className="font-black text-rose-500 font-mono text-sm tracking-wide">
              -{(item.price || 0).toLocaleString()}</span>
          ) : (
            <span className="font-bold text-neon-green text-[10px] px-2.5 py-1 bg-neon-green/10 border border-neon-green/20 rounded">
              SUCCESS
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <AnimatedScroll direction="up" hideOnScroll={true}>
      <div className="font-sans px-4 pb-12">
        <div className="bg-[#070708] border border-zinc-800 w-full max-w-4xl mx-auto transition-all relative overflow-hidden flex flex-col md:flex-row mt-6 rounded-2xl shadow-xl">
          
          {/* Left Side: Balance & Quick Profile */}
          <div className="md:w-1/3 bg-[#09090a] p-6 sm:p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-zinc-800 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-neon-green/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="w-24 h-24 bg-zinc-900 p-1 mb-4 relative z-10 border border-zinc-800 rounded-full overflow-hidden shadow-lg group">
              <img loading="lazy" 
                src={getAvatarUrl(user?.id || username || 'guest')} 
                alt="avatar" 
                className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-1.5 text-center truncate w-full px-2 z-10">{username}</h3>
            
            <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 border rounded-lg mb-6 z-10 ${
              isAdminOrOwner 
                ? "text-neon-yellow bg-neon-yellow/10 border-neon-yellow/20" 
                : "text-neon-green bg-neon-green/10 border-neon-green/20"
            }`}>
              {role}
            </span>
            
            <div className="w-full bg-[#0d0d0f] border border-zinc-800 p-5 rounded-xl flex flex-col items-center relative overflow-hidden shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-neon-green" />
                <span className="text-zinc-400 text-[10px] font-black uppercase tracking-wider"></span>
              </div>
              <div className="text-4xl font-black text-white mb-2 tracking-tight font-mono select-none">
                <span className="text-sm font-bold text-neon-green mr-1 font-sans"></span>
                {Math.floor(balance).toLocaleString()}
              </div>
              <button 
                onClick={() => setActiveView('wallet')}
                className="mt-2 w-full bg-neon-green text-black hover:bg-neon-green/90 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-150 cursor-pointer shadow-md shadow-neon-green/10"
              >
                +</button>
            </div>
          </div>

          {/* Right Side: Details & Settings */}
          <div className="md:w-2/3 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-neon-green"/> </h2>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const newFullName = formData.get('fullName') as string;
              
              if (!user) {
                Swal.fire({ icon: 'error', title: '', text: 'Log In', background: '#09090b', color: '#fff' });
                return;
              }

              // Display loading state
              Swal.fire({
                title: '...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
              });

              try {
                // API call to database
                await axios.post(`/api/users/${user.id}`, { fullName: newFullName });
                const newPlan = { ...userPlan, fullName: newFullName, username: userPlan?.username || username, isPremium: userPlan?.isPremium || false, premiumExpireDate: userPlan?.premiumExpireDate || null };
                setUserPlan(newPlan);
                if (clientIp) localStorage.setItem(`checker_userplan_${clientIp}`, JSON.stringify(newPlan));
                Swal.fire({ icon: 'success', title: '', timer: 1500, showConfirmButton: false, background: '#09090b', color: '#fff' });
              } catch (err: any) {
                console.error('Error updating profile:', err);
                Swal.fire({
                  icon: 'error',
                  title: '',
                  text: err.response?.data?.error || err.message || '',
                  background: '#09090b',
                  color: '#fff'
                });
              }
            }} className="space-y-4 mb-8"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block ml-1">-</label>
                  <input 
                    name="fullName" 
                    type="text" 
                    defaultValue={fullName !== '-' ? fullName : ''}
                    placeholder="-"
                    className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/10 outline-none transition-all placeholder:text-zinc-500 font-medium" 
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block ml-1">Sign Up</label>
                  <div className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-400 cursor-not-allowed flex items-center gap-2.5 font-medium">
                    <Calendar className="w-4 h-4 text-zinc-500 shrink-0" /> {registeredAt}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2 block ml-1"></label>
                <div className="w-full bg-[#0a0a0b] border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-400 cursor-not-allowed flex items-center justify-between gap-2 overflow-hidden font-medium">
                  <div className="flex items-center gap-2.5 truncate">
                    <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => { navigator.clipboard.writeText(email); Swal.fire({ title: 'Copied!', text: '', icon: 'success', timer: 1000, showConfirmButton: false, background: '#09090b', color: '#fff' }); }}
                    className="p-1.5 hover:bg-zinc-800/60 rounded-lg transition-colors text-zinc-500 hover:text-white shrink-0 cursor-pointer"
                    title="Copy Email"
                  ><Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-neon-green text-black hover:bg-neon-green/90 font-extrabold py-2.5 px-6 transition-all text-sm rounded-lg cursor-pointer uppercase tracking-wider">
                  </button>
              </div>
            </form>

            {/* Quick Menu */}
            <div className="mb-8">
              <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3.5 ml-1"></h3>
              <div className="space-y-2.5">
                <button type="button" onClick={() => setActiveView('history')} className="w-full flex items-center justify-between p-3.5 bg-[#0a0a0b] border border-zinc-800 hover:border-neon-green/30 hover:bg-[#0c0c0e] transition-all group rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg">
                      <History className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">Order History (History)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                </button>

                <button type="button" onClick={() => setActiveView('checker_logs')} className="w-full flex items-center justify-between p-3.5 bg-[#0a0a0b] border border-zinc-800 hover:border-zinc-600 hover:bg-[#0c0c0e] transition-all group rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg">
                      <History className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">(Checker Logs)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                </button>

                <button type="button" onClick={() => setActiveView('redeem')} className="w-full flex items-center justify-between p-3.5 bg-[#0a0a0b] border border-zinc-800 hover:border-neon-green/30 hover:bg-[#0c0c0e] transition-all group rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg">
                      <Key className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">(Redeem Key)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-neon-green group-hover:translate-x-1 transition-all" />
                </button>
                
                {user && (
                  <button type="button" onClick={() => { 
                    Swal.fire({
                      title: 'Log Out?',
                      icon: 'warning',
                      showCancelButton: true,
                      confirmButtonColor: '#ef4444',
                      cancelButtonColor: '#18181b',
                      cancelButtonText: '<span style="color:#ffffff"></span>',
                      confirmButtonText: 'Log Out',
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleLogout();
                      }
                    });
                  }} className="w-full flex items-center justify-between p-3.5 bg-[#0a0a0b] border border-red-500/10 hover:border-red-500/40 hover:bg-red-500/5 transition-all group rounded-xl cursor-pointer animate-none"><div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg">
                        <LogOut className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-300 group-hover:text-red-450 transition-colors">Log Out</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>
            </div>

            {/* Linked Accounts */}
            <div className="mb-8">
              <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-4 ml-1">(Linked Accounts)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 hover:border-[#1877F2]/30 hover:bg-[#1877F2]/5 transition-all group rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#1877F2] rounded-xl">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-white">Facebook</span>
                      <span className="text-[10px] text-zinc-500"></span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors"></span>
                </button>
                
                <button className="flex items-center justify-between p-4 bg-[#0a0a0b] border border-zinc-800 hover:border-[#5865F2]/30 hover:bg-[#5865F2]/5 transition-all group rounded-xl cursor-pointer">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#5865F2] rounded-xl">
                       <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-bold text-white">Discord</span>
                      <span className="text-[10px] text-zinc-500"></span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors"></span>
                </button>
              </div>
            </div>

            {/* Purchased Items */}
            <div className="mt-8 border-t border-zinc-800 pt-8">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Bought (Purchased Items)</h3>
                <button onClick={() => setActiveView('history')} className="text-xs font-bold text-neon-green hover:text-neon-green/80 hover:underline transition-colors cursor-pointer">
                  View All</button>
              </div>
              
              {purchaseHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-[#0a0a0b] border border-zinc-800 border-dashed text-zinc-400 rounded-xl">
                  <Package className="w-6 h-6 opacity-40 mb-2 text-zinc-500" />
                  <span className="text-xs font-medium">Bought</span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {purchaseHistory.slice(0, 3).map(item => renderHistoryItem(item, 'purchase'))}
                </div>
              )}
            </div>

            {/* Redeemed Keys */}
            <div className="mt-8 border-t border-zinc-800 pt-8">
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">(Redeemed Keys)</h3>
                <button onClick={() => setActiveView('history')} className="text-xs font-bold text-neon-green hover:text-neon-green/80 hover:underline transition-colors cursor-pointer">
                  View All</button>
              </div>
              
              {usedKeysHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 bg-[#0a0a0b] border border-zinc-800 border-dashed text-zinc-400 rounded-xl">
                  <Key className="w-6 h-6 opacity-40 mb-2 text-zinc-500" />
                  <span className="text-xs font-medium"></span>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {usedKeysHistory.slice(0, 3).map(item => renderHistoryItem(item, 'key'))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </AnimatedScroll>
  );
};
