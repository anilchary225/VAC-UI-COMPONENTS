import React from 'react';

interface VacLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const VacLogo: React.FC<VacLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  // Exact vector paths for V, Lambda (A without crossbar), and C matching the reference branding
  const vPath = 'M 0 0 L 20 0 L 34 52 L 48 0 L 68 0 L 44 76 L 24 76 Z';
  const aPath = 'M 74 76 L 94 76 L 108 24 L 122 76 L 142 76 L 118 0 L 98 0 Z';
  const cPath =
    'M 218 20 C 212 6 200 0 183 0 C 162 0 148 16 148 38 C 148 60 162 76 183 76 C 200 76 212 70 218 56 L 199 56 C 195 62 189 65 183 65 C 171 65 166 52 166 38 C 166 24 171 11 183 11 C 189 11 195 14 199 20 Z';

  const heightClasses = {
    sm: 'h-3.5',
    md: 'h-4.5',
    lg: 'h-6',
  };

  const textClasses = {
    sm: 'text-[10px]',
    md: 'text-[11px] sm:text-xs',
    lg: 'text-xs sm:text-sm',
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Exact Vector VAC Wordmark (V - Λ - C) */}
      <svg
        viewBox="0 0 218 76"
        className={`${heightClasses[size]} w-auto text-slate-900 dark:text-white fill-current transition-colors shrink-0`}
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
          className={`font-extrabold uppercase tracking-[0.08em] text-slate-900 dark:text-white font-sans ${textClasses[size]}`}
        >
          UI-COMPONENTS
        </span>
      )}
    </div>
  );
};
