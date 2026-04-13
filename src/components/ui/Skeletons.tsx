import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-slate-200 dark:bg-zinc-800';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-lg">
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" height={20} width="80%" />
      <Skeleton variant="text" height={16} width="60%" />
      <div className="flex items-center justify-between">
        <Skeleton variant="text" height={24} width={100} />
        <Skeleton variant="text" height={16} width={60} />
      </div>
    </div>
  </div>
);

// Blog Card Skeleton
export const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800 shadow-lg">
    <Skeleton variant="rectangular" height={200} className="w-full" />
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton variant="text" height={12} width={60} />
        <Skeleton variant="circular" width={4} height={4} />
        <Skeleton variant="text" height={12} width={80} />
      </div>
      <Skeleton variant="text" height={24} width="90%" />
      <Skeleton variant="text" height={16} width="100%" />
      <Skeleton variant="text" height={16} width="80%" />
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="text" height={14} width={80} />
        </div>
        <Skeleton variant="text" height={14} width={60} />
      </div>
    </div>
  </div>
);

// Testimonial Card Skeleton
export const TestimonialCardSkeleton: React.FC = () => (
  <div className="bg-slate-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
    <Skeleton variant="rectangular" height={24} width={24} className="mb-3" />
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" width={14} height={14} />
      ))}
    </div>
    <Skeleton variant="text" height={14} width="100%" className="mb-2" />
    <Skeleton variant="text" height={14} width="90%" className="mb-4" />
    <div className="flex items-center gap-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" height={14} width={100} className="mb-1" />
        <Skeleton variant="text" height={12} width={80} />
      </div>
    </div>
  </div>
);

