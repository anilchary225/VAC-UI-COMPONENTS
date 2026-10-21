import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 text-gray-400 dark:text-gray-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-9 rounded-btn border text-sm transition-colors',
              'bg-white text-gray-900 border-[#E7E9F0] placeholder:text-gray-400',
              'dark:bg-[#171A23] dark:text-[#F4F5F8] dark:border-white/10 dark:placeholder:text-gray-500',
              'focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-500',
              icon ? 'pl-9 pr-3' : 'px-3',
              error && 'border-red-500 dark:border-red-500',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
