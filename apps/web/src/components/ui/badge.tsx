'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'brand' | 'outline';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        // Sizes
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        // Variants
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'success' && 'bg-emerald-50 text-emerald-700 border border-emerald-200',
        variant === 'warning' && 'bg-amber-50 text-amber-700 border border-amber-200',
        variant === 'error' && 'bg-red-50 text-red-700 border border-red-200',
        variant === 'info' && 'bg-blue-50 text-blue-700 border border-blue-200',
        variant === 'brand' && 'bg-kooki-50 text-kooki-600 border border-kooki-200',
        variant === 'outline' && 'bg-transparent border border-gray-300 text-gray-600',
        className
      )}
    >
      {children}
    </span>
  );
}
