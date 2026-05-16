import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') ||
        target.closest('a') ||
        window.getComputedStyle(target).cursor === 'pointer'
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#1E90FF] pointer-events-none z-[9999]"
        style={{ originX: 0.5, originY: 0.5 }}
        animate={{
          x: mousePosition.x - 4, // center the 8px dot (w-2 h-2)
          y: mousePosition.y - 4,
          scale: isHovering ? 0 : 1,
          opacity: 1
        }}
        transition={{ type: "tween", duration: 0, ease: "linear" }}
      />
      
      {/* Ring Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border border-[#1E90FF]/50 pointer-events-none z-[9998]"
        animate={{
          width: isHovering ? 60 : 40,
          height: isHovering ? 60 : 40,
          x: isHovering ? mousePosition.x - 30 : mousePosition.x - 20,
          y: isHovering ? mousePosition.y - 30 : mousePosition.y - 20,
          backgroundColor: isHovering ? "rgba(30, 144, 255, 0.1)" : "transparent",
          scale: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 28,
          mass: 0.5
        }}
      />
    </>
  );
};
