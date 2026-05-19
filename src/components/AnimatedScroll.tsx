import React, { useEffect, useRef, useState } from 'react';

interface AnimatedScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  hideOnScroll?: boolean;
}

export const AnimatedScroll: React.FC<AnimatedScrollProps> = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  hideOnScroll = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldHideFromScroll, setShouldHideFromScroll] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        threshold: 0,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // User request: Scroll Up -> Hide, Scroll Down -> Show
      if (currentScrollY > lastScrollY.current) {
        // Scrolling Down
        setShouldHideFromScroll(false);
      } else if (currentScrollY < lastScrollY.current && currentScrollY > 10) {
        // Scrolling Up
        setShouldHideFromScroll(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    if (hideOnScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      if (hideOnScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hideOnScroll]);

  const activeVisible = isVisible && !(hideOnScroll && shouldHideFromScroll);

  let transformClass = '';
  switch(direction) {
    case 'left': transformClass = activeVisible ? 'translate-x-0' : '-translate-x-24'; break;
    case 'right': transformClass = activeVisible ? 'translate-x-0' : 'translate-x-24'; break;
    case 'down': transformClass = activeVisible ? 'translate-y-0' : '-translate-y-12'; break;
    case 'up': 
    default:
      transformClass = activeVisible ? 'translate-y-0' : 'translate-y-12'; break;
  }

  return (
    <div
      ref={domRef}
      className={`transition-all duration-300 ${activeVisible ? 'opacity-100 ease-out' : 'opacity-0'} ${transformClass} ${className}`}
      style={{ transitionDelay: `${delay}ms`, willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
};

