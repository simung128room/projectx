import React, { useEffect, useRef, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch device or reduced motion preference
    if (window.matchMedia("(pointer: coarse)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsTouchDevice(true);
      return;
    }

    let isHovering = false;
    let mouseX = -100;
    let mouseY = -100;
    
    // Smooth trailing effect for ring
    let ringX = -100;
    let ringY = -100;
    
    let animationFrameId: number;

    const updateMousePosition = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
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
        isHovering = true;
      } else {
        isHovering = false;
      }
    };

    const render = () => {
      // Move dot instantly
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0) scale(${isHovering ? 0 : 1})`;
      }
      
      // Move ring with lerp
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      
      if (ringRef.current) {
        const size = isHovering ? 60 : 40;
        const offset = size / 2;
        ringRef.current.style.transform = `translate3d(${ringX - offset}px, ${ringY - offset}px, 0)`;
        ringRef.current.style.width = `${size}px`;
        ringRef.current.style.height = `${size}px`;
        ringRef.current.style.backgroundColor = isHovering ? "rgba(30, 144, 255, 0.1)" : "transparent";
      }
      
      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-purple-600 pointer-events-none z-[9999]"
        style={{ transition: 'transform 0.1s ease-out', willChange: 'transform' }}
      />
      
      {/* Ring Ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full border border-[#3B82F6]/50 pointer-events-none z-[9998]"
        style={{ transition: 'width 0.2s, height 0.2s, background-color 0.2s', willChange: 'transform, width, height' }}
      />
    </>
  );
};
