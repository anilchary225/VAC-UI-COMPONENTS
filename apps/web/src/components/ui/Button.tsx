import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
      'inline-flex items-center justify-center font-medium rounded-btn transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const variants = {
      primary:
        'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-600/20 dark:bg-indigo-600 dark:hover:bg-indigo-500',
      secondary:
        'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-[#171A23] dark:hover:bg-[#202430] dark:text-[#F4F5F8]',
      outline:
        'border border-[#E7E9F0] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-gray-800 dark:text-[#F4F5F8]',
      ghost:
        'hover:bg-gray-100 dark:hover:bg-white/[0.06] text-gray-600 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white',
      danger:
        'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-600/20',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-5 text-base gap-2.5',
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
