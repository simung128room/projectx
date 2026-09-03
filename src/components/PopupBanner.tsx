import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Megaphone } from 'lucide-react';

interface PopupBannerProps {
  enabled: boolean;
  imgUrl: string;
  linkUrl: string;
}

export const PopupBanner: React.FC<PopupBannerProps> = ({ enabled, imgUrl, linkUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShow, setDontShow] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsOpen(false);
      return;
    }

    const hideUntil = localStorage.getItem('hidePopupUntil');
    if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
      // Small 1.2s delay for perfect transition on page enter
      const showTimer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(showTimer);
    }
  }, [enabled]);

  const handleClose = () => {
    if (dontShow) {
      const twentyFourHours = 24 * 60 * 60 * 1000;
      localStorage.setItem('hidePopupUntil', (Date.now() + twentyFourHours).toString());
    }
    setIsOpen(false);
  };

  const ImageContent = () => {
    if (!imgUrl) {
      return (
        <div className="w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-zinc-900">
          <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-4 animate-pulse">
            <Megaphone className="w-6 h-6 text-blue-450" />
          </div>
          <h3 className="text-base font-bold text-zinc-100 tracking-tight">ข่าวประกาศจากทางร้าน</h3>
          <p className="text-xs text-zinc-400 font-medium max-w-xs mt-2 leading-relaxed">
            ยินดีต้อนรับสู่ร้านค้าจำหน่ายไอดีเกมชั้นนำ ระบบเติมเงินและสั่งซื้ออัตโนมัติทำงานอย่างสมบูรณ์แบบ 24 ชั่วโมง
          </p>
        </div>
      );
    }

    return (
      <img 
        loading="lazy" 
        src={imgUrl} 
        alt="Announcement Banner" 
        className="w-full h-auto max-h-[60vh] object-cover border-b border-zinc-800/80 block"
      />
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md pointer-events-auto">
          {/* Overlay click to close */}
          <div className="absolute inset-0 cursor-default" onClick={handleClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[430px] bg-zinc-900 border border-zinc-800/80 shadow-2xl flex flex-col z-10 rounded-2xl overflow-hidden select-none text-white"
          >
            {/* Extremely Visible Close Button at the top right of dynamic pop-up */}
            <button
              onClick={handleClose}
              className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 flex items-center justify-center text-white transition-all cursor-pointer shadow-lg shadow-red-500/25"
              aria-label="Close"
              id="announcement-close-btn"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Elegant Header */}
            <div className="bg-zinc-950 text-white px-5 py-4 flex items-center gap-2 border-b border-zinc-800/60 shrink-0">
              <Megaphone className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-[11px] font-extrabold tracking-widest uppercase text-zinc-300">ANNOUNCEMENT / ประชาสัมพันธ์</span>
            </div>
            
            {/* Content box */}
            <div className="w-full flex-1 overflow-y-auto max-h-[65vh] bg-zinc-900">
              {linkUrl ? (
                <a 
                  href={linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full h-full block hover:opacity-95 transition-opacity"
                >
                  <ImageContent />
                </a>
              ) : (
                <ImageContent />
              )}
            </div>

            {/* Bottom Panel */}
            <div className="p-4 bg-zinc-950 flex items-center justify-between border-t border-zinc-800/60 shrink-0 gap-4 mt-auto">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={dontShow}
                    onChange={(e) => setDontShow(e.target.checked)}
                  />
                  <div className={`w-[18px] h-[18px] border transition-all duration-200 flex items-center justify-center rounded-md bg-zinc-900 ${dontShow ? 'bg-blue-600 border-blue-600' : 'border-zinc-700 group-hover:border-zinc-600'}`}>
                    {dontShow && <Check className="w-3 h-3 text-white stroke-[3.5]" />}
                  </div>
                </div>
                <span className="text-zinc-400 text-xs font-bold select-none group-hover:text-zinc-350 transition-colors">ไม่แสดงอีกภายใน 24 ชม.</span>
              </label>

              <button 
                onClick={handleClose} 
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer rounded-xl shrink-0 active:scale-95 shadow-md shadow-blue-500/15"
              >
                ตกลง / รับทราบ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
