'use client'
import React from 'react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import type { CartLine, MenuItem, TableOrder } from './types'
import { cn } from './utils'
import { Button } from '../ui/button'
import '../../app/(frontend)/styles.css'

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

  useEffect(() => {
    if (!open || method !== 'qris' || checkoutUrl || loading || paid) return

    let cancelled = false

    const createCheckout = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: order.orderNumber,
            tableId: order.tableId,
            customerName: order.customerName,
            amount: summary.total,
            items: cartLines.map((line) => ({
              name: line.item.name,
              quantity: line.quantity,
              unitAmount: line.item.price,
            })),
          }),
        })
        console.log(response)
        const data = await response.json()

        if (!response.ok || !data.url) {
          throw new Error(data.error || 'Could not create payment')
        }

        setCheckoutUrl(data.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    void createCheckout()

    return () => {
      cancelled = true
    }
  }, [cartLines, checkoutUrl, loading, method, open, order, paid, summary.total])

  if (!open) return null
  async function createCheckout() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          tableId: order.tableId,
          customerName: order.customerName,
          amount: summary.total,
          items: cartLines.map((line) => ({
            name: line.item.name,
            quantity: line.quantity,
            unitAmount: line.item.price,
          })),
        }),
      })

      const data = await response.json()

      console.log('checkout response:', data)

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Could not create QRIS payment.')
      }

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
      if (prev === 'success') return 'method'
      return 'method'
    })
  }
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/35 px-3 py-6 backdrop-blur-[1px] sm:px-4">
      <div className="flex max-h-[80vh] w-full max-w-[473px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_18px_60px_rgba(26,31,44,0.18)] dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
          <button
            type="button"
            onClick={handleBack}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Close payment"
          >
            <Image src="/leftArrow.svg" alt="" width={16} height={16} />
          </button>
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-slate-100 sm:text-lg">
              Payment Method
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Close payment"
          >
            <Image src="/exit.svg" alt="" width={16} height={16} />
          </button>
        </div>

        <div className="">
          <section className="flex flex-col p-4 sm:p-6 gap-4">
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

                <Button
                  text="Next"
                  onClick={async () => {
                    if (method === 'cash') {
                      setStep('success')
                    } else {
                      await createCheckout()
                      setStep('qris')
                    }
                  }}
                />
              </>
            )}
            {step === 'qris' && (
              <>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center mb-3">
                    <h3>Merchant Name</h3>
                    <h4>NMID : 00000000000000</h4>
                  </div>
                  {checkoutUrl && <QRCodeSVG value={checkoutUrl} size={256} />}

                  <div className="flex flex-col justify-center items-center mt-6">
                    <h3 className="font-bold">Scan QR Code</h3>
                    <p className="text-sm text-slate-500 text-center mt-2">
                      Complete your payment quickly and securely by scanning the QR code provided
                      above
                    </p>
                  </div>
                </div>

                <Button
                  text="Next"
                  onClick={() => {
                    setStep('processing')

                    setTimeout(() => {
                      const success = Math.random() > 0.2

                      setStep(success ? 'success' : 'failed')
                    }, 3000)
                  }}
                />
              </>
            )}
            {step === 'processing' && (
              <div className="flex flex-col justify-end text-center max-w-sm mx-auto">
                <div className="flex flex-col items-center py-10 px-6">
                  {/* Custom Circular Progress Loader */}
                  <div className="relative flex items-center justify-center h-24 w-24 mb-6">
                    {/* Background Track */}
                    <div className="absolute inset-0 rounded-full border-[10px] border-[#F1F3F6]" />
                    {/* Animated Green Progress Ring */}
                    <div className="absolute inset-0 animate-spin rounded-full border-[10px] border-transparent border-t-[#00CD52] border-r-[#00CD52]" />
                  </div>

                  {/* Content */}
                  <h3 className="text-base font-bold text-[#1C1C28] mb-2">Waiting For Payment</h3>

                  <p className="text-xs text-[#8F92A1] leading-relaxed max-w-[260px]">
                    Payment is in process, please wait several minutes to print a receipt of payment
                  </p>
                </div>
                <button className="text-center w-full py-2 justify-end" disabled>
                  Next
                </button>
              </div>
            )}
            {step === 'success' && (
              <div className="relative grid flex-1 place-items-center text-center overflow-hidden">
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible z-0 h-48 w-48">
                  {/* Background Expanding Halo Rings */}
                  <div className="absolute h-36 w-36 rounded-full bg-[#27AE60] opacity-0 animate-ring-1" />
                  <div className="absolute h-36 w-36 rounded-full bg-[#6FCF97] opacity-0 animate-ring-2" />

                  {/* Individual Confetti Particles matching layout of image_aa43e3.png */}
                  {/* Top Left Squares & Dots */}
                  <div
                    className="absolute h-3 w-3 rounded-sm animate-confetti"
                    style={
                      {
                        '--tx': '-110px',
                        '--ty': '-70px',
                        '--rot': '45deg',
                        backgroundColor: PALETTE.blue1,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-2 w-2 rounded-sm animate-confetti"
                    style={
                      {
                        '--tx': '-150px',
                        '--ty': '-50px',
                        '--rot': '12deg',
                        backgroundColor: PALETTE.blue1,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-3 w-3 rounded bg-[#EB5757] animate-confetti"
                    style={
                      { '--tx': '-90px', '--ty': '-40px', '--rot': '-25deg' } as React.CSSProperties
                    }
                  />

                  {/* Bottom Left Shapes */}
                  <div
                    className="absolute h-2 w-2 rounded-full animate-confetti"
                    style={
                      {
                        '--tx': '-140px',
                        '--ty': '50px',
                        '--rot': '0deg',
                        backgroundColor: PALETTE.blue2,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-4 w-4 rounded-md rotate-12 animate-confetti"
                    style={
                      {
                        '--tx': '-110px',
                        '--ty': '80px',
                        '--rot': '65deg',
                        backgroundColor: PALETTE.cyan,
                      } as React.CSSProperties
                    }
                  />

                  {/* Top Center / Right Confetti */}
                  <div
                    className="absolute h-3 w-3 rounded-sm rotate-45 animate-confetti"
                    style={
                      {
                        '--tx': '10px',
                        '--ty': '-90px',
                        '--rot': '110deg',
                        backgroundColor: PALETTE.yellow,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-3 w-3 rounded-full animate-confetti"
                    style={
                      {
                        '--tx': '20px',
                        '--ty': '-50px',
                        '--rot': '0deg',
                        backgroundColor: PALETTE.blue2,
                      } as React.CSSProperties
                    }
                  />

                  {/* Bottom/Center Triangle & Trailing pieces */}
                  <div
                    className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] animate-confetti"
                    style={
                      {
                        '--tx': '-50px',
                        '--ty': '60px',
                        '--rot': '40deg',
                        borderBottomColor: PALETTE.orange,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] animate-confetti"
                    style={
                      {
                        '--tx': '10px',
                        '--ty': '95px',
                        '--rot': '-15deg',
                        borderBottomColor: PALETTE.yellow,
                      } as React.CSSProperties
                    }
                  />

                  {/* Right Side Shapes */}
                  <div
                    className="absolute h-3 w-3 rounded-sm animate-confetti"
                    style={
                      {
                        '--tx': '95px',
                        '--ty': '-55px',
                        '--rot': '35deg',
                        backgroundColor: PALETTE.greenDark,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-4 w-4 rounded-full animate-confetti"
                    style={
                      {
                        '--tx': '150px',
                        '--ty': '-35px',
                        '--rot': '0deg',
                        backgroundColor: PALETTE.yellow,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-3 w-3 rounded-sm animate-confetti"
                    style={
                      {
                        '--tx': '55px',
                        '--ty': '50px',
                        '--rot': '-45deg',
                        backgroundColor: PALETTE.greenLight,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-2 w-3 rounded-sm animate-confetti"
                    style={
                      {
                        '--tx': '110px',
                        '--ty': '75px',
                        '--rot': '15deg',
                        backgroundColor: PALETTE.red,
                      } as React.CSSProperties
                    }
                  />
                  <div
                    className="absolute h-2 w-2 rounded-full animate-confetti"
                    style={
                      {
                        '--tx': '160px',
                        '--ty': '90px',
                        '--rot': '0deg',
                        backgroundColor: PALETTE.purple,
                      } as React.CSSProperties
                    }
                  />
                </div>

                <CheckCircle2 className="relative z-20 h-20 w-20 text-white animate-success-pop" />

                <Button text="Done" onClick={onSuccess} />
              </div>
            )}
            {step === 'failed' && (
              <div className="grid flex-1 place-items-center text-center">
                <X className="h-16 w-16 text-red-500" />

                <h3 className="mt-4 text-xl font-bold">Payment Failed</h3>

                <p className="text-sm text-slate-500">Customer payment was not completed.</p>

                <Button text="Try Again" onClick={() => setStep('qris')} />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
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
        'h-11 rounded-xl w-full border flex items-center p-2 text-sm font-semibold transition',
        active
          ? 'border-[#6066ed] bg-[#f6f5ff] text-[#6066ed] dark:bg-indigo-950/40'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
      )}
    >
      <Image src={label === 'QRIS' ? '/qris.svg' : '/cash.svg'} alt="" width={30} height={28} />{' '}
      <span className="pl-3"> {label}</span>
    </button>
  )
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div
      className={cn(
        'mb-2 flex items-center justify-between',
        strong && 'text-base font-bold text-slate-950 dark:text-slate-100',
      )}
    >
      <span className={cn('text-slate-400', strong && 'text-slate-500')}>{label}</span>
      <span>{value}</span>
    </div>
  )
}

function money(value: number) {
  return `$${value.toFixed(2).replace('.', ',')}`
}
