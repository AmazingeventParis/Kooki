'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
        // Variants
        variant === 'primary' &&
          'gradient-cta text-white shadow-lg shadow-kooki-500/25 hover:shadow-xl hover:shadow-kooki-500/30 hover:scale-[1.02] active:scale-[0.98] focus:ring-kooki-500',
        variant === 'secondary' &&
          'bg-white border-2 border-kooki-500 text-kooki-500 hover:bg-kooki-50 hover:scale-[1.02] active:scale-[0.98] focus:ring-kooki-500',
        variant === 'ghost' &&
          'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
        variant === 'outline' &&
          'bg-transparent border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 focus:ring-white',
        variant === 'danger' &&
          'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/25 focus:ring-red-500',
        // Sizes
        size === 'sm' && 'px-4 py-2 text-sm gap-1.5',
        size === 'md' && 'px-6 py-2.5 text-sm gap-2',
        size === 'lg' && 'px-8 py-3.5 text-base gap-2',
        size === 'xl' && 'px-10 py-4 text-lg gap-2.5',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
