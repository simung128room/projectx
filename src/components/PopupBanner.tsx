import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

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
      // Add a slight delay so it doesn't instantly snap on load
      const showTimer = setTimeout(() => setIsOpen(true), 1500);
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

  const ImageContent = () => (
    <img loading="lazy" 
      src={imgUrl || "https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&q=80&w=1500&h=1500"} 
      alt="Announcement" 
      className="w-full max-h-[70vh] object-contain"
    />
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed top-24 right-4 sm:top-28 sm:right-6 z-[100] pointer-events-none flex"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95, x: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-[400px] max-h-[85vh] bg-[#09090b] overflow-hidden flex flex-col pointer-events-auto border border-[#1e1e1e]  "
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#09090b] hover:bg-black/70 flex items-center justify-center text-white transition-colors "
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full flex-1 overflow-auto bg-[#09090b] flex items-center justify-center ">
              {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
                  <ImageContent />
                </a>
              ) : (
                <ImageContent />
              )}
            </div>

            <div className="p-4 sm:px-6 bg-[#09090b] flex-shrink-0 flex flex-wrap items-center justify-between border-t border-[#1e1e1e]  gap-4 ">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={dontShow}
                    onChange={(e) => setDontShow(e.target.checked)}
                  />
                  <div className={`w-5 h-5 rounded  transition-all duration-300 flex items-center justify-center ${dontShow ? 'bg-zinc-600 border-[#00e676]' : 'bg-[#0B0D0F] border-[#1e1e1e] group-hover:border-[#1e1e1e]'}`}>
                    {dontShow && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </div>
                <span className="text-muted-foreground text-sm font-semibold select-none group-hover:text-white transition-colors">ไม่แสดงอีกใน 24 ชั่วโมง</span>
              </label>
              <button onClick={handleClose} className="px-5 py-2.5 bg-[#09090b] hover:bg-[#050505] hover:text-white text-white text-sm font-medium transition-colors ">
                ปิดหน้าต่าง
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
