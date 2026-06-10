import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Plus, Trash2, XCircle, Power, PowerOff, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminApiKeys: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLifetime, setIsLifetime] = useState(true);
  const [expireDays, setExpireDays] = useState('30');

  const fetchKeys = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/api_keys');
      setApiKeys(res.data);
    } catch (err: any) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.error || 'Failed to fetch API keys',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/api_keys', {
        name: newKeyName,
        is_lifetime: isLifetime,
        expire_days: expireDays
      });
      Swal.fire({
        title: 'สำเร็จ',
        text: 'สร้าง API Key ใหม่เรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#09090b',
        color: '#fff',
      });
      setIsAdding(false);
      setNewKeyName('');
      fetchKeys();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || 'Failed to create API key',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleToggleStatus = async (key: string, currentStatus: string) => {
    try {
      await axios.patch(`/api/api_keys/${key}`, {
        status: currentStatus === 'active' ? 'disabled' : 'active'
      });
      fetchKeys();
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || 'Failed to update API key',
        icon: 'error',
        background: '#09090b',
        color: '#fff',
        confirmButtonColor: '#EF4444'
      });
    }
  };

  const handleDelete = async (key: string) => {
    const confirm = await Swal.fire({
      title: 'ต้องการลบ API Key ใช่หรือไม่?',
      text: "การลบกุญแจเชื่อมต่อนี้ จะรบกวนบอทหรือเช็คเกอร์ภายนอกทั้งหมดทันที!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'ลบกุญแจเชื่อมต่อ',
      cancelButtonText: 'ยกเลิก',
      background: '#09090b',
      color: '#fff',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/api/api_keys/${key}`);
        Swal.fire({
          title: 'ลบเสร็จสิ้น',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false,
          background: '#09090b',
          color: '#fff',
        });
        fetchKeys();
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.error || 'Failed to delete API key',
          icon: 'error',
          background: '#09090b',
          color: '#fff',
          confirmButtonColor: '#EF4444'
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-[#3B82F6]" />
            จัดการกุญแจเชื่อมต่อ (API Keys Management)
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            สร้างและควบคุม Token ของ API /api/check เพื่อใช้งานเช็คเกอร์ หรือสคริปต์ภายนอกเว็บ
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`px-4 py-2 text-xs font-bold flex items-center gap-2 rounded-md transition-all duration-200 ${
            isAdding 
              ? 'border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white' 
              : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_2px_10px_rgba(59,130,246,0.2)]'
          }`}
        >
          {isAdding ? <XCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {isAdding ? 'ยกเลิก' : 'สร้าง API Key'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddKey} className="bg-[#0B0C0E] border border-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-lg p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-400 uppercase">ชื่ออ้างอิงกุญแจ / Description</label>
            <input
              required
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="เช่น Python Checker Script สำหรับโปรแกรมเมอร์"
              className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
            />
          </div>
          
          <div className="flex items-center gap-2.5 py-1">
            <input
              type="checkbox"
              id="isLifetime"
              checked={isLifetime}
              onChange={e => setIsLifetime(e.target.checked)}
              className="w-4 h-4 rounded bg-zinc-950 border-zinc-800 text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
            />
            <label htmlFor="isLifetime" className="text-sm font-bold text-zinc-200 cursor-pointer select-none">สิทธิ์ถาวร (Lifetime Period)</label>
          </div>

          {!isLifetime && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase">ระยะเวลากุญแจใช้งาน (วัน)</label>
              <input
                type="number"
                min="1"
                required
                value={expireDays}
                onChange={e => setExpireDays(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
              />
            </div>
          )}
          
          <div className="pt-2 border-t border-zinc-900 flex justify-end">
             <button type="submit" className="bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold py-2 px-5 rounded-md transition-colors">
               ยืนยันการผลิตรหัสเชื่อมต่อ (Generate Key)
             </button>
          </div>
        </form>
      )}

      <div className="bg-card border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-zinc-400">
            <thead>
              <tr className="bg-[#0B0C0E] border-b border-zinc-800 text-zinc-550 uppercase text-xs tracking-wider">
                <th className="px-5 py-3.5 font-bold">สถานะ</th>
                <th className="px-5 py-3.5 font-bold">ชื่อ API Key</th>
                <th className="px-5 py-3.5 font-bold">รหัสเชื่อมต่อ (Token)</th>
                <th className="px-5 py-3.5 font-bold">สร้างเมื่อ</th>
                <th className="px-5 py-3.5 font-bold">วันหมดอายุ</th>
                <th className="px-5 py-3.5 font-bold">ใช้งานล่าสุด</th>
                <th className="px-5 py-3.5 font-bold text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                     <Loader2 className="w-6 h-6 animate-spin text-[#3B82F6] mx-auto mb-1" />
                     <span className="text-xs text-zinc-550 font-semibold">กำลังเชื่อมโยงเซิร์ฟเวอร์หลัก...</span>
                  </td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-zinc-600 font-semibold text-xs">ยังไม่มีกุญแจเชื่อมต่อสถิติในหน้าเพจนี้</td>
                </tr>
              ) : (
                apiKeys.map(k => (
                  <tr key={k.key} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="px-5 py-3.5">
                      {k.status === 'active' ? (
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-emerald-500/20">Active</span>
                      ) : k.status === 'expired' ? (
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-amber-500/20">Expired</span>
                      ) : (
                        <span className="bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-rose-500/20">Disabled</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-white text-xs">{k.name}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-[#3B82F6] font-bold select-all cursor-pointer bg-zinc-950 border border-zinc-850 px-2 py-1 rounded">
                        {k.key}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">{new Date(k.created_at).toLocaleString('th-TH')}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                      {k.expires_at ? new Date(k.expires_at).toLocaleString('th-TH') : <span className="font-bold text-zinc-400"> Lifetime ถาวร</span>}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-500 whitespace-nowrap">
                      {k.last_used ? new Date(k.last_used).toLocaleString('th-TH') : <span className="italic text-zinc-650">ยังไม่มี</span>}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(k.key, k.status)}
                          className={`p-1.5 rounded-md border transition-all ${
                            k.status === 'active' 
                              ? 'border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/60' 
                              : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/60'
                          }`}
                          title={k.status === 'active' ? 'Disable Key' : 'Enable Key'}
                        >
                          {k.status === 'active' ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(k.key)}
                          className="p-1.5 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/60 rounded-md transition-all duration-150"
                          title="ลบกุญแจเชื่อมต่อนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
