import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Shield } from 'lucide-react';

interface CloudflareTurnstileProps {
  onVerified: (isVerified: boolean) => void;
  isVerified: boolean;
}

export const CloudflareTurnstile: React.FC<CloudflareTurnstileProps> = ({ onVerified, isVerified }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = () => {
    if (isVerified || isLoading) return;
    setIsLoading(true);

    // Simulate Cloudflare turnstile handshake
    setTimeout(() => {
      setIsLoading(false);
      onVerified(true);
    }, 1200);
  };

  return (
    <div 
      onClick={handleVerify}
      className={`relative w-full max-w-[340px] mx-auto p-3.5 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
        isVerified 
          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 shadow-md'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Checkbox / Spinner / Checkmark */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700">
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full"
              />
            ) : isVerified ? (
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="w-5 h-5 rounded-md bg-emerald-500 flex items-center justify-center text-black font-bold shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              >
                <Check className="w-3.5 h-3.5 stroke-[3.5]" />
              </motion.div>
            ) : (
              <div className="w-4 h-4 rounded border border-zinc-600 hover:border-emerald-400 transition-colors" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-zinc-200">
              {isLoading ? 'กำลังตรวจสอบความปลอดภัย...' : isVerified ? 'ยืนยันความปลอดภัยสำเร็จ' : 'ฉันไม่ใช่โปรแกรมอัตโนมัติ'}
            </span>
            <span className="text-[10px] text-zinc-400">
              {isVerified ? 'Verification passed' : 'คลิกเพื่อตรวจสอบความปลอดภัย'}
            </span>
          </div>
        </div>

        {/* Cloudflare logo badge */}
        <div className="flex flex-col items-end opacity-80">
          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>CLOUDFLARE</span>
          </div>
          <span className="text-[8.5px] text-zinc-500 font-mono">Turnstile Privacy</span>
        </div>
      </div>
    </div>
  );
};
