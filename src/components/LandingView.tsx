import React from 'react';
import { motion } from 'motion/react';
import { Store, UserPlus, Menu } from 'lucide-react';

interface LandingViewProps {
  onEnterStore: () => void;
  onRegister: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onEnterStore, onRegister }) => {
  return (
    <div className="min-h-screen w-full bg-[#050816] text-white font-sans overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#2563ff]/20 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[4000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#2563ff]/10 blur-[150px] rounded-full mix-blend-screen delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#2563ff]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-yellow-400/10 blur-[100px] rounded-full mix-blend-screen animate-pulse delay-500"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-center bg-[#050816]/60 backdrop-blur-md border-b border-white/5">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-lg tracking-widest text-white/90 drop-shadow-md uppercase"
        >
          APEX STUDIO
        </motion.div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center max-w-2xl text-center"
        >
          {/* Main Logo Large */}
          <motion.img 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            src="https://i.postimg.cc/6qnW8nqX/IMG-6366.png" 
            alt="APEX STUDIO Big Logo" 
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain mb-8 filter drop-shadow-[0_0_30px_rgba(37,99,255,0.4)]"
          />

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-[#2563ff]">
            Welcome to Apex
          </h1>
          
          <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-lg leading-relaxed relative">
            ยินดีต้อนรับสู่ Apex — ร้านค้าที่มีสินค้าคุณภาพและบริการที่ไว้วางใจได้
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#2563ff] to-transparent opacity-50 blur-[2px]"></span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md mx-auto sm:max-w-none">
            {/* Button 1 */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEnterStore}
              className="w-full sm:w-auto relative group overflow-hidden rounded-2xl p-[2px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#2563ff] to-purple-600 opacity-70 group-hover:opacity-100 blur transition-opacity duration-300"></div>
              <div className="relative px-8 py-4 bg-[#050816] rounded-2xl flex items-center justify-center gap-3 border border-[#2563ff] group-hover:border-transparent transition-colors">
                <Store className="w-5 h-5 text-[#2563ff] group-hover:text-white transition-colors" />
                <span className="font-bold text-white group-hover:text-white transition-colors">เข้าสู่ร้านค้า</span>
              </div>
            </motion.button>

            {/* Button 2 */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegister}
              className="w-full sm:w-auto relative group overflow-hidden rounded-2xl px-8 py-4 bg-white/5 border border-white/10 flex items-center justify-center gap-3 hover:bg-white/10 transition-all hover:border-[#2563ff]/50 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(37,99,255,0.2)]"
            >
              <UserPlus className="w-5 h-5 text-zinc-400 group-hover:text-[#2563ff]" />
              <span className="font-bold text-zinc-300 group-hover:text-white">สมัครสมาชิก</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
