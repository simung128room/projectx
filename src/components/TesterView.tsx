import React, { useState } from 'react';
import { FlaskConical, Key, ArrowRight, ShieldAlert } from 'lucide-react';

interface TesterViewProps {
  onVerify: (key: string) => void;
  onAdminLoginTrigger: () => void;
  error?: string | null;
}

export const TesterView: React.FC<TesterViewProps> = ({ onVerify, onAdminLoginTrigger, error }) => {
  const [testerKey, setTesterKey] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const handleTestIconClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 5) {
      onAdminLoginTrigger();
      setClickCount(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (testerKey.trim()) {
      onVerify(testerKey.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 selection:bg-red-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-red-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10 text-white">
          <div 
            className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-black/50 cursor-pointer active:scale-95 transition-transform"
            onClick={handleTestIconClick}
          >
            <FlaskConical className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">TESTER MODE</h1>
          <p className="text-zinc-500 font-medium">เว็บไซต์นี้อยู่ระหว่างการทดสอบ กรุณากรอกคีย์เข้าใช้งาน</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4" /> Tester Key
              </label>
              <input
                type="text"
                value={testerKey}
                onChange={(e) => setTesterKey(e.target.value)}
                placeholder="กรอกคีย์สำหรับนักทดสอบ"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all font-mono"
              />
              {error && (
                <p className="text-red-500 text-xs font-bold mt-2 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl py-4 shadow-lg shadow-red-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              ยืนยันการเข้าใช้งาน <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
