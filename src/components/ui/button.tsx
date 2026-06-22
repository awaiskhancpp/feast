import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  text: string
  icon?: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  outline:
    'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 dark:bg-slate-900 dark:text-gray-100 dark:border-slate-700 dark:hover:bg-slate-800',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm px-3 py-2',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-[8px] py-[14px]', // matches original Button's exact padding, for the one existing caller
}

export function Button({
  text,
  icon,
  variant = 'primary',
  size = 'lg',
  fullWidth = true, // preserves the original always-w-full behavior by default
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : 'w-fit'} ${className}`}
    >
      {icon}
      {text}
    </button>
  )
}
