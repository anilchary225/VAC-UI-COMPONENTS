import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'accent' | 'pink' | 'success' | 'warning' | 'emergency';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default:
      'bg-gray-100 text-gray-700 dark:bg-[#171A23] dark:text-gray-300 border border-gray-200/50 dark:border-white/5',
    outline:
      'border border-gray-200 text-gray-600 dark:border-white/10 dark:text-gray-400',
    accent:
      'bg-[#5B4FF5]/10 text-[#5B4FF5] border border-[#5B4FF5]/20',
    pink:
      'bg-[#FF4081]/15 text-[#FF4081] border border-[#FF4081]/25',
    success:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20',
    warning:
      'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20',
    emergency:
      'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 border border-red-200/60 dark:border-red-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium leading-normal',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
