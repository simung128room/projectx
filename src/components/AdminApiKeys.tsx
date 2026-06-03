import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Plus, Trash2, CheckCircle2, XCircle, Power, PowerOff } from 'lucide-react';
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
        background: '#121417',
        color: '#fff',
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
        title: 'Success',
        text: 'API Key Created',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        background: '#121417',
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
        background: '#121417',
        color: '#fff',
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
        background: '#121417',
        color: '#fff',
      });
    }
  };

  const handleDelete = async (key: string) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      background: '#121417',
      color: '#fff',
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`/api/api_keys/${key}`);
        Swal.fire({
          title: 'Deleted!',
          text: 'The API Key has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#121417',
          color: '#fff',
        });
        fetchKeys();
      } catch (err: any) {
        Swal.fire({
          title: 'Error',
          text: err.response?.data?.error || 'Failed to delete API key',
          icon: 'error',
          background: '#121417',
          color: '#fff',
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Key className="w-6 h-6 text-[#2563EB]" />
            API Keys Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            สร้าง API Keys สำหรับการเรียกใช้งาน /api/check แบบ bypass การตรวจสอบ Cloudflare
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#2563EB] text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#2563EB]/80 flex items-center gap-2"
        >
          {isAdding ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isAdding ? 'Cancel' : 'Create Key'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddKey} className="bg-[#0B0D0F] border border-gray-200 p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase">Key Name / Description</label>
            <input
              required
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="e.g. My Python Checker Script"
              className="bg-gray-100 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2563EB] outline-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isLifetime"
              checked={isLifetime}
              onChange={e => setIsLifetime(e.target.checked)}
              className="w-4 h-4 rounded bg-gray-100 border-gray-200 text-[#2563EB] focus:ring-[#2563EB]"
            />
            <label htmlFor="isLifetime" className="text-sm font-bold text-gray-900">Lifetime (ถาวร)</label>
          </div>
          {!isLifetime && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-600 uppercase">Expire In (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={expireDays}
                onChange={e => setExpireDays(e.target.value)}
                className="bg-gray-100 text-gray-900 px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2563EB] outline-none"
              />
            </div>
          )}
          <button type="submit" className="bg-[#2563EB] text-gray-900 font-bold py-3 rounded-xl mt-2">
            Generate Key
          </button>
        </form>
      )}

      <div className="bg-[#0B0D0F] border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-100/50 text-xs text-gray-600 uppercase font-black tracking-widest">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">API Key</th>
                <th className="px-6 py-4">Created At</th>
                <th className="px-6 py-4">Expires At</th>
                <th className="px-6 py-4">Last Used</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">Loading...</td>
                </tr>
              ) : apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">No API Keys found</td>
                </tr>
              ) : (
                apiKeys.map(k => (
                  <tr key={k.key} className="hover:bg-gray-100/30 transition-colors">
                    <td className="px-6 py-4">
                      {k.status === 'active' ? (
                        <span className="bg-blue-600/20 text-blue-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">Active</span>
                      ) : k.status === 'expired' ? (
                        <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/20">Expired</span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/20">Disabled</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">{k.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-[#2563EB] select-all cursor-pointer bg-[#2563EB]/10 px-2 py-1 rounded border border-[#2563EB]/20">
                      {k.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(k.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {k.expires_at ? new Date(k.expires_at).toLocaleString() : 'Lifetime'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {k.last_used ? new Date(k.last_used).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleStatus(k.key, k.status)}
                        className={`p-2 rounded-lg transition-all ${k.status === 'active' ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20' : 'bg-blue-600/10 text-blue-500 hover:bg-blue-600/20'}`}
                        title={k.status === 'active' ? 'Disable Key' : 'Enable Key'}
                      >
                        {k.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(k.key)}
                        className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                        title="Delete Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
