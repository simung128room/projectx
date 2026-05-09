import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, Play, Square, Save, RefreshCw } from 'lucide-react';
import Swal from 'sweetalert2';

export const AdminBotManagement: React.FC = () => {
  const [config, setConfig] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConfig();
    fetchStatus();
    const timer = setInterval(fetchStatus, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/bot/config');
      setConfig(res.data.config);
    } catch(e) {
      console.error(e);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await axios.get('/api/bot/status');
      setIsRunning(res.data.running);
      setLogs(res.data.logs || []);
    } catch(e) {}
  };

  const handleStart = async () => {
    try {
      setIsSaving(true);
      await axios.post('/api/bot/start', { config });
      Swal.fire({ title: 'เริ่มบอทสำเร็จ!', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      fetchStatus();
    } catch(e: any) {
      Swal.fire('ข้อผิดพลาด', e.response?.data?.error || String(e), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStop = async () => {
    try {
      await axios.post('/api/bot/stop');
      Swal.fire({ title: 'หยุดบอทสำเร็จ', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 1500 });
      fetchStatus();
    } catch (e: any) {
      Swal.fire('ข้อผิดพลาด', e.response?.data?.error || String(e), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <Terminal className="w-8 h-8 text-[#1a7fe6]" />
            ระบบดักซองใหม่ (Discord + Telegram) 
          </h2>
          <p className="text-zinc-400 mt-2">จัดการบอทดักซองรหัสใหม่ ตั้งค่าโค้ดต่างๆ และล็อกสถานะของบอท</p>
        </div>
        
        <div className="flex items-center gap-3">
            {isRunning ? (
                <button
                    onClick={handleStop}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md"
                >
                    <Square className="w-5 h-5" /> หยุดบอท
                </button>
            ) : (
                <button
                    onClick={handleStart}
                    disabled={isSaving}
                    className="bg-[#1E90FF] text-white hover:bg-[#166bcc] px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-[#1E90FF]/20"
                >
                    <Play className="w-5 h-5" /> {isSaving ? "Saving..." : "บันทึกและเริ่มบอท"}
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config Editor */}
        <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-3xl relative overflow-hidden">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Save className="w-5 h-5 text-indigo-400" />
                bot_config.js
            </h3>
            <textarea
                value={config}
                onChange={(e) => setConfig(e.target.value)}
                spellCheck={false}
                className="w-full h-[500px] bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#1E90FF]/50 scrollbar-thin scrollbar-thumb-zinc-600"
            />
        </div>

        {/* Logs */}
        <div className="bg-[#0a0d12] border border-white/5 p-6 rounded-3xl relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-green-400" />
                    สถานะการทำงาน (Live Logs)
                </h3>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isRunning ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                    {isRunning ? '🟢 ONLINE' : '🔴 OFFLINE'}
                </div>
            </div>
            <div 
                ref={logRef}
                className="flex-1 h-[500px] bg-black border border-white/10 rounded-2xl p-4 text-xs font-mono overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-600 space-y-1"
            >
                {logs.length === 0 ? (
                    <div className="text-zinc-600 text-center mt-10">ไม่พบประวัติการทำงาน (หรือยังไม่ได้เริ่มบอท)</div>
                ) : (
                    logs.map((log, i) => (
                        <div key={i} className={`whitespace-pre-wrap ${log.includes('[ERROR]') || log.includes('error') ? 'text-red-400' : log.includes('SUCCESS') || log.includes('สำเร็จ') ? 'text-green-400' : 'text-zinc-400'}`}>
                            {log}
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
