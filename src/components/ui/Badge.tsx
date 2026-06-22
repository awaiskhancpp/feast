type BadgeTone = 'green' | 'red' | 'yellow' | 'gray'

const toneStyles: Record<BadgeTone, string> = {
  green:
    'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
  yellow:
    'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900',
  gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
}

interface BadgeProps {
  tone: BadgeTone
  children: React.ReactNode
}

/**
 * Generic status pill. TransactionTable already hardcodes this exact
 * bg/text/border combination per-status inline - this pulls it out so any
 * new status-bearing list (customers, orders, ...) reuses one definition
 * instead of re-deriving the same three classes again.
 */
export function Badge({ tone, children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap ${toneStyles[tone]}`}
    >
      {children}
    </span>
  )
}
