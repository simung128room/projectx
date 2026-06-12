import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const ProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 bg-card z-[9999] pointer-events-none ">
      <motion.div
        className="h-full from-[#10b981]/80 to-cyan-400"
        animate={{ width: `${scrollProgress}%` }}
        transition={{ type: "tween", duration: 0.1, ease: "linear" }}
      />
    </div>
  );
};
