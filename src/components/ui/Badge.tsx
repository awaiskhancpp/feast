type BadgeTone = 'green' | 'red' | 'yellow' | 'gray'

const toneStyles: Record<BadgeTone, string> = {
  green: 'bg-green-50 text-green-700 border-green-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  gray: 'bg-gray-50 text-gray-700 border-gray-200',
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
