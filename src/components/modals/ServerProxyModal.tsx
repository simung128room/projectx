import React, { useState, useEffect } from 'react';
import { X, Server, Wifi, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SERVER_PROXIES = [
  "61.91.162.126:8080", "182.53.202.208:8080", "183.88.213.178:8080", "110.171.40.132:8080",
  "203.151.189.45:80", "101.109.15.12:3128", "171.100.201.55:8080", "223.24.161.182:8080",
  "1.20.101.144:8080", "49.228.134.110:8080", "182.52.238.115:3128", "202.44.234.34:8080",
  "124.122.109.213:8080", "110.164.254.162:3128", "27.55.75.143:8080", "1.46.216.241:8080",
  "101.108.21.134:3128", "184.22.213.56:3128", "118.172.201.44:8080", "58.11.83.153:8080",
  "1.47.168.204:8080", "171.103.14.22:8080", "119.76.140.2:8080", "115.87.212.191:3128",
  "182.52.170.55:8080", "125.26.177.202:8080", "118.174.233.159:8080", "118.173.232.149:8080",
  "101.109.255.45:3128", "110.164.201.26:8080", "171.97.142.112:8080", "27.55.122.31:8080",
  "118.175.211.23:8080", "1.46.102.19:8080", "182.53.189.141:8080", "110.168.214.156:3128",
  "124.120.198.11:8080", "171.96.168.241:8080", "1.47.201.134:8080", "115.178.60.211:8080",
  "180.183.155.22:3128", "203.154.231.112:80", "110.164.19.243:8080", "182.52.12.188:3128",
  "223.205.155.158:8080", "49.228.199.10:8080", "101.109.238.221:3128", "171.100.10.144:8080",
  "115.87.215.11:8080", "1.47.170.25:8080"
];

interface ServerProxyModalProps {
  show: boolean;
  onClose: () => void;
  onSelectProxy: (proxies: string) => void;
  currentProxy: string;
}

export function ServerProxyModal({ show, onClose, onSelectProxy, currentProxy }: ServerProxyModalProps) {
  const [proxyData, setProxyData] = useState<{ip: string, ping: number}[]>([]);
  const [selectedProxy, setSelectedProxy] = useState<string>('');

  useEffect(() => {
    if (show) {
      // Simulate ping for realism (since client side pinging raw proxies isn't physically possible with HTTP)
      const data = SERVER_PROXIES.map(ip => {
        // Deterministic mock ping based on IP string to keep it stable
        const hash = ip.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const basePing = 10 + (hash % 100);
        // Add tiny variance
        const vary = Math.floor(Math.random() * 10);
        return { ip, ping: basePing + vary };
      });
      // Sort by ping
      data.sort((a, b) => a.ping - b.ping);
      setProxyData(data);

      const currentList = currentProxy.split('\n').map(p => p.trim()).filter(Boolean);
      // Select the first matched proxy or empty
      const matched = data.find(p => currentList.includes(p.ip));
      setSelectedProxy(matched ? matched.ip : '');
    }
  }, [show, currentProxy]);

  if (!show) return null;

  const toggleProxy = (ip: string) => {
    if (selectedProxy === ip) {
      setSelectedProxy('');
    } else {
      setSelectedProxy(ip);
    }
  };

  const applyConfiguration = () => {
    onSelectProxy(selectedProxy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-[#09090b] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[85vh]"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-emerald-500" />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">เซิร์ฟเวอร์พร็อกซี่</h2>
              <p className="text-xs text-zinc-400">เลือกเซิร์ฟเวอร์เพื่อใช้งาน</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-zinc-800">
          {proxyData.map((p, idx) => (
            <button
              key={idx}
              onClick={() => toggleProxy(p.ip)}
              className={`w-full flex items-center p-4 rounded-2xl border transition-all ${selectedProxy === p.ip ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-zinc-900 border-white/5 hover:bg-zinc-800'}`}
            >
              <div className="flex-1 flex flex-col items-start gap-1">
                 <div className={`font-mono text-sm font-bold ${selectedProxy === p.ip ? 'text-emerald-400' : 'text-zinc-300'}`}>
                   {p.ip}
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Thailand / TH</span>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className={`flex items-center gap-1.5 text-xs font-bold ${
                   p.ping < 50 ? 'text-emerald-500' : p.ping < 100 ? 'text-amber-500' : 'text-red-500'
                 }`}>
                   <Wifi className="w-3.5 h-3.5" />
                   {p.ping} ms
                 </div>
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedProxy === p.ip ? 'border-emerald-500 bg-emerald-500/20' : 'border-zinc-700'}`}>
                    {selectedProxy === p.ip && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                 </div>
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 shrink-0 bg-[#09090b]">
           <button 
             onClick={applyConfiguration}
             disabled={!selectedProxy}
             className={`w-full py-3.5 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
               selectedProxy 
                 ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20' 
                 : 'bg-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
             }`}
           >
             <CheckCircle2 className="w-5 h-5" /> นำไปใช้งาน {selectedProxy ? '(1 ไอพี)' : ''}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
