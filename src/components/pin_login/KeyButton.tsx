type ButtonProps = {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function KeyButton({ children, onClick, disabled, className }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-[84px] h-[70px] rounded-xl hover:bg-gray-200 dark:text-gray-100 dark:hover:bg-slate-700 transition text-lg font-bold ${className}`}
    >
      {children}
    </button>
  )
}
