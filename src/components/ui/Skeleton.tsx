import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div 
      className={` bg-[#121212] rounded ${className} `}
      aria-hidden="true"
    />
  );
};
