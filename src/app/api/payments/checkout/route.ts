import Stripe from 'stripe'
import { NextResponse } from 'next/server'

type CheckoutItem = {
  name: string
  quantity: number
  unitAmount: number
}

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!secretKey) {
    return NextResponse.json(
      { error: 'Stripe is not configured. Add STRIPE_SECRET_KEY to your environment.' },
      { status: 500 },
    )
  }

  try {
    const body = (await request.json()) as {
      orderNumber?: string
      tableId?: string
      customerName?: string
      amount?: number
      items?: CheckoutItem[]
    }

    const amount = Number(body.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment amount.' }, { status: 400 })
    }

    const stripe = new Stripe(secretKey)
    const lineItems =
      body.items && body.items.length > 0
        ? body.items.map((item) => ({
            price_data: {
              currency: 'usd',
              product_data: { name: item.name },
              unit_amount: Math.round(item.unitAmount * 100),
            },
            quantity: Math.max(1, item.quantity),
          }))
        : [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Order ${body.orderNumber || ''} · Table T-${body.tableId || ''}`.trim(),
                },
                unit_amount: Math.round(amount * 100),
              },
              quantity: 1,
            },
          ]

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      metadata: {
        orderNumber: body.orderNumber || '',
        tableId: body.tableId || '',
        customerName: body.customerName || '',
      },
      success_url: `${appUrl}/table?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/table?payment=cancelled`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL.' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Stripe checkout failed.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
