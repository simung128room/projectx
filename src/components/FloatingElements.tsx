import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export const FloatingElements = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(8)].map((_, i) => {
          const isTeal = i % 2 === 0;
          return (
            <motion.div
              key={i}
              className={`absolute rounded-full blur-[30px] opacity-[0.03] ${isTeal ? 'bg-teal-500' : 'bg-purple-500'}`}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight + window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: -200,
                x: Math.random() * window.innerWidth
              }}
              transition={{ 
                duration: Math.random() * 20 + 20, 
                repeat: Infinity, 
                ease: 'linear',
                delay: Math.random() * 10
              }}
              style={{
                width: Math.random() * 150 + 100 + 'px',
                height: Math.random() * 150 + 100 + 'px'
              }}
            />
          );
        })}
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-gradient-to-t from-blue-600 to-teal-500 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(0,212,170,0.4)] hover:shadow-[0_6px_20px_rgba(0,212,170,0.6)] hover:-translate-y-1 transition-all cursor-pointer border-none outline-none"
            >
              <ArrowUp className="w-5 h-5 font-bold" />
            </motion.button>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1, boxShadow: "0 0 25px rgba(6, 199, 85, 0.6)" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.open('https://line.me', '_blank')}
          className="w-12 h-12 rounded-full bg-[#06c755] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(6,199,85,0.4)] transition-all cursor-pointer border-none outline-none relative"
        >
          <span className="text-2xl leading-none">💬</span>
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-[#0a0e1a] rounded-full animate-pulse"></span>
        </motion.button>
      </div>
    </>
  );
};
