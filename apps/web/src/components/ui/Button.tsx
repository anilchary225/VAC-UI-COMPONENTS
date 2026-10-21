import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-[#181A25] hover:bg-black text-white shadow-sm dark:bg-[#5B4FF5] dark:hover:bg-[#4F46E5]',
      accent:
        'bg-[#5B4FF5] hover:bg-[#4F46E5] text-white shadow-md shadow-indigo-900/20',
      secondary:
        'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200/80 dark:bg-[#171A23] dark:hover:bg-[#202430] dark:text-[#F4F5F8] dark:border-white/10 shadow-xs',
      outline:
        'border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-800 dark:text-[#F4F5F8]',
      ghost:
        'hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white',
      danger:
        'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20',
    };

    const sizes = {
      sm: 'h-8 px-3.5 text-xs gap-1.5',
      md: 'h-9 px-4 text-xs gap-2',
      lg: 'h-11 px-6 text-sm gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
