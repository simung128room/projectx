import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Terminal, Save, Download, HelpCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminBotManagement: React.FC = () => {
  const [config, setConfig] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/bot/config');
      setConfig(res.data.config);
    } catch(e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await axios.post('/api/bot/save', { config });
      Swal.fire({ title: '!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
    } catch(e: any) {
      Swal.fire('', e.response?.data?.error || String(e), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (<div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-[#2563EB]" />
            Telegram (UltraRace)</h2>
          <p className="text-muted-foreground mt-2 flex items-center gap-4">
             <span>Python</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            <a
                href="/bot-code"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-card text-[#2563EB] px-5 py-3 font-bold hover:bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center gap-2 transition-all brut-card"
            >
                <Download className="w-5 h-5" /> bot.py</a>
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-primary text-primary-foreground text-white hover:bg-[#1D4ED8] px-6 py-3 font-bold flex items-center gap-2 transition-all"
            >
                <Save className="w-5 h-5" /> {isSaving ? "Saving..." : ""}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Help Panel */}
        <div className="bg-card border border-border border-2 p-6 relative overflow-hidden flex flex-col space-y-4 brut-card">
            <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                (How to run)</h3>
            <div className="text-muted-foreground text-sm space-y-3 leading-relaxed">
                <p>Telegram  Python</p>
                <p>1. <strong>Python:</strong> Python 3</p>
                <p>2. <strong>:</strong> Terminal / Command Prompt :<code className="block bg-card p-2 mt-2 rounded border border-border border-2 text-blue-600 brut-card">pip install telethon httpx aiohttp cloudscraper pillow pyzbar opencv-python colorama</code>
                </p>
                <p>3. <strong>Settings:</strong> `# ========= CONFIG =========`  Environment Variables (<code className="text-blue-600">TG_API_ID</code>, <code className="text-blue-600">TG_API_HASH</code>, , Webhook Discord)</p>
                <p>4. <strong>:</strong> :<code className="block bg-card p-2 mt-2 rounded border border-border border-2 text-blue-600 brut-card">python bot.py</code>
                </p>
                <p className="text-amber-400 mt-4 text-xs font-medium">⚠️  (VPS)  OTP Log In Telegram  ( session 파일)</p>
            </div>
        </div>

        {/* Config Editor */}
        <div className="lg:col-span-2 bg-card border border-border border-2 p-6 relative overflow-hidden flex flex-col brut-card">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                bot.py</h3>
            <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                spellCheck={false}
                className="w-full flex-1 min-h-[500px] bg-card border border-border border-2 p-4 text-xs font-mono text-muted-foreground focus:outline-none focus:border-[#3B82F6]/50 scrollbar-thin scrollbar-thumb-zinc-600 brut-card"
            />
        </div>
      </div>
    </div>
  );
};
