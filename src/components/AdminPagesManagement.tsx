import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Save, X } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

interface AdminPagesManagementProps {
  customPages: any[];
  setCustomPages: React.Dispatch<React.SetStateAction<any[]>>;
}

export const AdminPagesManagement: React.FC<AdminPagesManagementProps> = ({ customPages, setCustomPages }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  });

  const handleCreateNew = () => {
    setFormData({ title: '', slug: '', content: '' });
    setEditingPage(null);
    setIsEditing(true);
  };

  const handleEdit = (page: any) => {
    setFormData({ title: page.title, slug: page.slug, content: page.content });
    setEditingPage(page);
    setIsEditing(true);
  };

  const handleDelete = (page: any) => {
    Swal.fire({
      title: '?',
      text: ` "${page.title}" ? `,
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
           await axios.delete(`/api/pages/${page.id}`);
           setCustomPages(prev => prev.filter(p => p.id !== page.id));
           Swal.fire({ title: '', icon: 'success', background: '#09090b', color: '#fff', timer: 1000, showConfirmButton: false });
         } catch (err) {
           Swal.fire({ title: '', text: '', icon: 'error', background: '#09090b', color: '#fff' });
         }
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.content) {
      Swal.fire({ title: '', text: ' ', icon: 'error', background: '#09090b', color: '#fff' });
      return;
    }

    try {
      if (editingPage) {
        const res = await axios.put(`/api/pages/${editingPage.id}`, formData);
        setCustomPages(prev => prev.map(p => p.id === editingPage.id ? res.data : p));
        Swal.fire({ title: '', icon: 'success', background: '#09090b', color: '#fff', timer: 1200, showConfirmButton: false });
      } else {
        const res = await axios.post('/api/pages', formData);
        setCustomPages(prev => [...prev, res.data]);
        Swal.fire({ title: '', icon: 'success', background: '#09090b', color: '#fff', timer: 1200, showConfirmButton: false });
      }
      setIsEditing(false);
    } catch (err) {
      Swal.fire({ title: '', text: '', icon: 'error', background: '#09090b', color: '#fff' });
    }
  };

  if (isEditing) {
    return (<div className="bg-[#0B0C0E] border border-zinc-805 border-zinc-800 rounded-lg overflow-hidden shrink-0 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-zinc-950 px-6 py-4 flex items-center justify-between border-b border-zinc-850">
          <div>
            <h3 className="font-bold text-white text-base">{editingPage ? '' : ' / '}</h3>
            <p className="text-xs text-zinc-500 mt-1">Settings</p>
          </div>
          <button 
            type="button" 
            onClick={() => setIsEditing(false)}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 rounded-md border border-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">(Title)</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-zinc-950 border border-zinc-805 border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                placeholder=" "
              /></div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 mb-2">endpoint (slug)</label>
              <input 
                type="text" 
                value={formData.slug}
                onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                className="w-full bg-zinc-950 border border-zinc-805 border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-2.5 text-white text-sm focus:outline-none transition-colors"
                placeholder=" warranty, terms"
              /></div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-2">(Markdown Supported)</label>
            <textarea 
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              className="w-full bg-zinc-950 border border-zinc-805 border-zinc-800 focus:border-[#3B82F6]/60 rounded-md px-4 py-3 text-sm text-zinc-300 focus:outline-none transition-colors h-72 font-mono"
              placeholder="# &#10; ..."
            /></div>

          <div className="flex gap-2 justify-end pt-5 border-t border-zinc-900">
            <button 
              type="button" 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-bold border border-zinc-850 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-md transition-colors"
            ></button>
            <button 
              type="submit"
              className="px-4 py-2 text-xs font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center gap-2 rounded-md transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-zinc-950/20 p-4 border border-zinc-900 rounded-lg">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#3B82F6]" />
            </h2>
          <p className="text-xs text-zinc-500 mt-1"></p>
        </div>
        <button 
          onClick={handleCreateNew}
          className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-2 px-4 text-xs transition-colors flex items-center gap-2 rounded-md shadow-[0_2px_10px_rgba(59,130,246,0.2)]"
        >
          <Plus className="w-4 h-4" /> </button>
      </div>

      <div className="bg-card border border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        {customPages.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 mb-2 opacity-30" />
            <p className="font-bold"></p>
            <p className="text-xs text-zinc-650 mt-1">"" </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-850/60 text-sm text-zinc-400">
            {customPages.map(page => (
              <div key={page.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/10 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-md text-[#3B82F6] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{page.title.replace(/^#+\s*/, '')}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">: <span className="text-[#3B82F6]">/{page.slug}</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(page)} 
                    className="p-2 border border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/60 rounded-md transition-all duration-150" 
                    title=""
                  ><Edit className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(page)} 
                    className="p-2 border border-rose-500/30 bg-rose-500/5 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/60 rounded-md transition-all duration-150" 
                    title=""
                  ><Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
