import React from 'react';

interface VacLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'auto';
}

export const VacLogo: React.FC<VacLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  variant = 'auto',
}) => {
  // Exact vector paths for V, Lambda (A without crossbar), and C matching the reference branding
  const vPath = 'M 0 0 L 20 0 L 34 52 L 48 0 L 68 0 L 44 76 L 24 76 Z';
  const aPath = 'M 74 76 L 94 76 L 108 24 L 122 76 L 142 76 L 118 0 L 98 0 Z';
  const cPath =
    'M 218 20 C 212 6 200 0 183 0 C 162 0 148 16 148 38 C 148 60 162 76 183 76 C 200 76 212 70 218 56 L 199 56 C 195 62 189 65 183 65 C 171 65 166 52 166 38 C 166 24 171 11 183 11 C 189 11 195 14 199 20 Z';

  const heightClasses = {
    xs: 'h-3',
    sm: 'h-3.5',
    md: 'h-[16px]',
    lg: 'h-5',
  };

  const textClasses = {
    xs: 'text-[9px] tracking-[0.06em]',
    sm: 'text-[10px] tracking-[0.08em]',
    md: 'text-[11px] tracking-[0.08em]',
    lg: 'text-xs tracking-[0.1em]',
  };

  const colorClasses =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-[#161722]'
      : 'text-[#161722] dark:text-white';

  const subtitleColorClasses =
    variant === 'light'
      ? 'text-purple-200/90'
      : variant === 'dark'
      ? 'text-gray-600'
      : 'text-gray-700 dark:text-purple-200/90';

  return (
    <div className={`inline-flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* Exact Vector VAC Wordmark (V - Λ - C) */}
      <svg
        viewBox="0 0 218 76"
        className={`${heightClasses[size]} w-auto ${colorClasses} fill-current transition-colors shrink-0`}
        aria-label="VAC Logo"
        role="img"
      >
        <path d={vPath} />
        <path d={aPath} />
        <path d={cPath} />
      </svg>

      {/* UI-COMPONENTS Wordmark */}
      {showSubtitle && (
        <span
          className={`font-bold uppercase whitespace-nowrap font-sans transition-colors ${subtitleColorClasses} ${textClasses[size]}`}
        >
          UI-COMPONENTS
        </span>
      )}
    </div>
  );
};
