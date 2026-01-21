import { cn } from '@/shared/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

  const variantStyles = {
    primary:
      'bg-blue-600 text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-200',
    secondary:
      'bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 disabled:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100 disabled:hover:bg-transparent',
    danger:
      'bg-red-500 text-white shadow-sm hover:bg-red-600 disabled:bg-red-200',
    success:
      'bg-green-600 text-white shadow-md hover:bg-green-700 disabled:bg-green-200',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
      )}
      {children}
    </button>
  );
}
