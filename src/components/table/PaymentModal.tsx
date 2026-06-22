'use client'
import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { CartLine, MenuItem, TableOrder } from './types'
import { cn } from './utils'
import { Button } from '../ui/button'

const PALETTE = {
  blue1: '#2D9CDB',
  yellow: '#F2C94C',
  red: '#EB5757',
  greenDark: '#27AE60',
  blue2: '#2F80ED',
  cyan: '#56CCF2',
  greenLight: '#6FCF97',
  purple: '#9B51E0',
  orange: '#F2994A',
}

type PaymentMethod = 'qris' | 'cash'

type PaymentModalProps = {
  open: boolean
  order: TableOrder
  cartLines: Array<CartLine & { item: MenuItem }>
  summary: { subtotal: number; tax: number; discount: number; total: number }
  onClose: () => void
  onSuccess: () => void
}

export default function PaymentModal({
  open,
  order,
  cartLines,
  summary,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>('qris')
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paid, setPaid] = useState(false)
  const [step, setStep] = useState<'method' | 'qris' | 'processing' | 'success' | 'failed'>(
    'method',
  )

  // Auto-create checkout when modal opens on QRIS method
  useEffect(() => {
    if (!open || method !== 'qris' || checkoutUrl || loading || paid) return

    let cancelled = false

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            tableId: order.tableId,
            customerName: order.customerName,
            amount: summary.total,
            items: cartLines.map((l) => ({
              name: l.item.name,
              quantity: l.quantity,
              unitAmount: l.item.price,
            })),
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.url) throw new Error(data.error || 'Could not create payment')
        if (!cancelled) setCheckoutUrl(data.url)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [cartLines, checkoutUrl, loading, method, open, order, paid, summary.total])

  if (!open) return null

  async function handleCreateCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          tableId: order.tableId,
          customerName: order.customerName,
          amount: summary.total,
          items: cartLines.map((l) => ({
            name: l.item.name,
            quantity: l.quantity,
            unitAmount: l.item.price,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.error || 'Could not create QRIS payment.')
      setCheckoutUrl(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep((prev) => {
      if (prev === 'qris') return 'method'
      if (prev === 'processing') return 'qris'
      if (prev === 'failed') return 'qris'
      return 'method'
    })
  }

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-3 py-6 backdrop-blur-[1px] sm:px-4">
      {/*
        flex + max-h + overflow-hidden on the outer shell gives rounded corners
        and a height cap. The INNER content div gets flex-1 + overflow-y-auto
        so it scrolls independently — this is what was missing before, causing
        every button below the visible fold to be silently clipped.
      */}
      <div className="flex max-h-[90vh] w-full max-w-[473px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(26,31,44,0.18)] dark:bg-slate-900">
        {/* Header — shrink-0 so it's always visible regardless of content height */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Go back"
          >
            <Image src="/leftArrow.svg" alt="" width={16} height={16} />
          </button>
          <h2 className="text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">
            Payment Method
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Close payment"
          >
            <Image src="/exit.svg" alt="" width={16} height={16} />
          </button>
        </div>

        {/* Scrollable body — all step content lives here */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <section className="flex flex-col gap-4 p-4 sm:p-6">
            {step === 'method' && (
              <>
                <PaymentMethodButton
                  active={method === 'qris'}
                  label="QRIS"
                  onClick={() => setMethod('qris')}
                />
                <PaymentMethodButton
                  active={method === 'cash'}
                  label="Cash"
                  onClick={() => setMethod('cash')}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  text={loading ? 'Loading…' : 'Next'}
                  onClick={async () => {
                    if (method === 'cash') {
                      setStep('success')
                    } else {
                      await handleCreateCheckout()
                      setStep('qris')
                    }
                  }}
                />
              </>
            )}

            {step === 'qris' && (
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <h3 className="font-bold dark:text-slate-100">Merchant Name</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    NMID : 00000000000000
                  </p>
                </div>
                {checkoutUrl ? (
                  <QRCodeSVG value={checkoutUrl} size={220} />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                    <p className="text-sm text-slate-400">
                      {loading ? 'Generating…' : 'QR unavailable'}
                    </p>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-bold dark:text-slate-100">Scan QR Code</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Complete your payment quickly and securely by scanning the QR code provided
                    above
                  </p>
                </div>
                <Button
                  text="Next"
                  onClick={() => {
                    setStep('processing')
                    setTimeout(() => {
                      setStep(Math.random() > 0.2 ? 'success' : 'failed')
                    }, 3000)
                  }}
                />
              </div>
            )}

            {step === 'processing' && (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[10px] border-[#F1F3F6] dark:border-slate-700" />
                  <div className="absolute inset-0 animate-spin rounded-full border-[10px] border-transparent border-r-[#00CD52] border-t-[#00CD52]" />
                </div>
                <h3 className="mb-2 text-base font-bold text-[#1C1C28] dark:text-slate-100">
                  Waiting For Payment
                </h3>
                <p className="max-w-[260px] text-xs leading-relaxed text-[#8F92A1] dark:text-slate-400">
                  Payment is in process, please wait several minutes to print a receipt of payment
                </p>
              </div>
            )}

            {step === 'success' && <SuccessStep onSuccess={onSuccess} />}

            {step === 'failed' && (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold dark:text-slate-100">Payment Failed</h3>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                  Customer payment was not completed.
                </p>
                <Button text="Try Again" onClick={() => setStep('qris')} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

// Extracted into its own component so the fixed confetti overlay unmounts
// cleanly when the parent modal closes.
function SuccessStep({ onSuccess }: { onSuccess: () => void }) {
  return (
    <>
      {/*
        Confetti + halo rings live in a fixed, full-viewport layer (z-[130])
        so they are NEVER clipped by the modal's overflow:hidden or
        border-radius. The pieces animate outward from the viewport center
        (where the modal is centered) and then hold their final position
        forever because the keyframes now end at opacity:1 with forwards fill.
      */}
      <div className="pointer-events-none fixed inset-0 z-[130] flex items-center justify-center -translate-y-16">
        {/* Halo rings — scale in from 0 and stay at their final size/opacity */}
        <div className="absolute h-32 w-32 rounded-full bg-[#27AE60] opacity-100 animate-ring-1" />
        <div className="absolute h-42 w-42 rounded-full bg-[#6FCF97] animate-ring-2" />

        {/* Confetti — fly outward and stay. All coordinates tuned to the image. */}
        {/* Top-left cluster */}
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm"
          style={
            {
              '--tx': '-110px',
              '--ty': '-90px',
              '--rot': '45deg',
              backgroundColor: PALETTE.blue1,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-2 w-2 rounded-sm"
          style={
            {
              '--tx': '-158px',
              '--ty': '-60px',
              '--rot': '12deg',
              backgroundColor: PALETTE.blue1,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-3 w-3 rounded"
          style={
            {
              '--tx': '-90px',
              '--ty': '-50px',
              '--rot': '-25deg',
              backgroundColor: PALETTE.red,
            } as React.CSSProperties
          }
        />
        {/* Bottom-left */}
        <div
          className="absolute animate-confetti h-2 w-2 rounded-full"
          style={
            {
              '--tx': '-148px',
              '--ty': '65px',
              '--rot': '0deg',
              backgroundColor: PALETTE.blue2,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-4 w-4 rounded-md"
          style={
            {
              '--tx': '-118px',
              '--ty': '100px',
              '--rot': '65deg',
              backgroundColor: PALETTE.cyan,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm"
          style={
            {
              '--tx': '-76px',
              '--ty': '82px',
              '--rot': '20deg',
              backgroundColor: PALETTE.orange,
            } as React.CSSProperties
          }
        />
        {/* Top-center / right */}
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm rotate-45"
          style={
            {
              '--tx': '10px',
              '--ty': '-112px',
              '--rot': '110deg',
              backgroundColor: PALETTE.yellow,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-3 w-3 rounded-full"
          style={
            {
              '--tx': '22px',
              '--ty': '-62px',
              '--rot': '0deg',
              backgroundColor: PALETTE.blue2,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-2 w-2 rounded-sm"
          style={
            {
              '--tx': '62px',
              '--ty': '-102px',
              '--rot': '-30deg',
              backgroundColor: PALETTE.greenDark,
            } as React.CSSProperties
          }
        />
        {/* Bottom-center triangles */}
        <div
          className="absolute animate-confetti w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px]"
          style={
            {
              '--tx': '-50px',
              '--ty': '78px',
              '--rot': '40deg',
              borderBottomColor: PALETTE.orange,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px]"
          style={
            {
              '--tx': '12px',
              '--ty': '112px',
              '--rot': '-15deg',
              borderBottomColor: PALETTE.yellow,
            } as React.CSSProperties
          }
        />
        {/* Right side */}
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm"
          style={
            {
              '--tx': '100px',
              '--ty': '-72px',
              '--rot': '35deg',
              backgroundColor: PALETTE.greenDark,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-4 w-4 rounded-full"
          style={
            {
              '--tx': '158px',
              '--ty': '-46px',
              '--rot': '0deg',
              backgroundColor: PALETTE.yellow,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm"
          style={
            {
              '--tx': '62px',
              '--ty': '62px',
              '--rot': '-45deg',
              backgroundColor: PALETTE.greenLight,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-2 w-3 rounded-sm"
          style={
            {
              '--tx': '118px',
              '--ty': '92px',
              '--rot': '15deg',
              backgroundColor: PALETTE.red,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-2 w-2 rounded-full"
          style={
            {
              '--tx': '168px',
              '--ty': '112px',
              '--rot': '0deg',
              backgroundColor: PALETTE.purple,
            } as React.CSSProperties
          }
        />
        <div
          className="absolute animate-confetti h-3 w-3 rounded-sm"
          style={
            {
              '--tx': '132px',
              '--ty': '32px',
              '--rot': '60deg',
              backgroundColor: PALETTE.cyan,
            } as React.CSSProperties
          }
        />
      </div>

      {/* Modal content — normal flex flow, no z-index fighting with confetti */}
      <div className="flex flex-col items-center py-8 text-center">
        {/* Green circle — above the halo rings via z-10 */}
        <div className="relative z-10 mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-[#00CD52] shadow-[0_16px_48px_rgba(0,205,82,0.45)] animate-success-pop">
          <CheckCircle2 className="h-14 w-14 text-white" strokeWidth={2.5} />
        </div>

        <h3 className="mb-2 text-lg font-bold text-[#1C1C28] dark:text-slate-100">
          Payment Successful!
        </h3>
        <p className="mb-8 max-w-[260px] text-sm leading-relaxed text-[#8F92A1] dark:text-slate-400">
          Your receipt is printing automatically. Thank you!
        </p>

        <a href="/" className="w-full">
          <Button text="Back to Home" onClick={onSuccess} className="w-full" />
        </a>
      </div>
    </>
  )
}

function PaymentMethodButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-11 w-full items-center rounded-xl border p-2 text-sm font-semibold transition',
        active
          ? 'border-[#6066ed] bg-[#f6f5ff] text-[#6066ed] dark:bg-indigo-950/40'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
      )}
    >
      <Image src={label === 'QRIS' ? '/qris.svg' : '/cash.svg'} alt="" width={30} height={28} />
      <span className="pl-3">{label}</span>
    </button>
  )
}
