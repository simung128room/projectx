import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-transparent text-neutral-500 dark:text-neutral-400 py-8 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        {/* Left Info */}
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
            <img 
              src="https://img2.pic.in.th/1000047587.png" 
              alt="MINICLOUD Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-bold text-neutral-900 dark:text-white font-prompt">MINICLOUD</span>
          <span>·</span>
          <span>ระบบคลาวด์รันบอท AFK & ร้านค้าไอเทมและเช่าไอดี 24/7</span>
        </div>

        {/* Center Live Badges */}
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All Nodes Operational (99.99%)</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Anti-Ban Sandbox</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-neutral-400 font-mono">
          © 2026 MINICLOUD. All rights reserved.
        </div>

      </div>
    </footer>
  );
};
