import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Unlock, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ isLocked, onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const correctPin = localStorage.getItem('apex_screen_pin') || '0000';
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) {
        onUnlock();
        setPin('');
      } else {
        setError(true);
        setTimeout(() => setPin(''), 500);
      }
    }
  }, [pin]);

  if (!isLocked) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <Lock className="w-8 h-8 text-cyan-400 mx-auto mb-4" />
        <div className="text-5xl font-black text-white mb-2 tracking-tighter">
          {time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-zinc-400 font-medium">
          {time.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xs relative z-10"
      >
        <div className="mb-8 text-center text-sm font-bold text-zinc-500 uppercase tracking-widest">
          กรุณาใส่รหัส PIN 4 หลัก
        </div>

        <div className="flex justify-center gap-4 mb-10">
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                pin.length > i 
                  ? 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                  : error 
                    ? 'bg-red-500/50' 
                    : 'bg-zinc-800'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-white/5 text-2xl font-black text-white hover:bg-zinc-800 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center active:scale-95"
            >
              {num}
            </button>
          ))}
          <div />
          <button
            onClick={() => handleKeyPress('0')}
            className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-white/5 text-2xl font-black text-white hover:bg-zinc-800 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-16 h-16 mx-auto rounded-full bg-red-500/10 text-red-400 border border-white/5 hover:bg-red-500/20 transition-all flex items-center justify-center active:scale-95"
          >
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
