import React from 'react';

interface MarqueeProps {
  text: string;
  speed?: number; // duration in seconds for one loop
  className?: string;
}

export const Marquee: React.FC<MarqueeProps> = ({ text, speed = 20, className = '' }) => {
  return (
    <>
      <style>
        {`
          @keyframes marquee-scroll {
            0% { transform: translate3d(0%, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
          .animate-marquee-custom {
            animation: marquee-scroll var(--duration, 20s) linear infinite;
            will-change: transform;
          }
        `}
      </style>
      <div className={`flex overflow-hidden whitespace-nowrap w-full ${className}`}>
        <div
          className="flex shrink-0 min-w-max animate-marquee-custom"
          style={{ '--duration': `${speed}s` } as React.CSSProperties}
        >
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
          <span className="pr-12">{text}</span>
        </div>
      </div>
    </>
  );
};
