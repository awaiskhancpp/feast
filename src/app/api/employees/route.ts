import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
  const body = await req.json()

  // send to Payload CMS OR database here
  console.log('Received employee update:', body)

  return NextResponse.json({ success: true })
}
