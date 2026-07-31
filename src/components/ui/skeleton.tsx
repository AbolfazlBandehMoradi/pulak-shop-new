import { cn } from '@/utils/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-first-100/80 dark:bg-gray-700/60', className)}
      {...props}
    />
  );
}

export { Skeleton };
