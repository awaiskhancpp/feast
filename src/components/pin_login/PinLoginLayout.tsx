'use client'
import { Button } from '../ui/button'
import { Keypad } from './Keypad'
import { PinInput } from './PinInput'
import Image from 'next/image'
import { useState } from 'react'

export default function PinLoginLayout() {
  const [pin, setPin] = useState<string[]>([])
  const onPress = (value: string) => {
    if (pin.length >= 6) return

    setPin((prev) => [...prev, value])
  }

  const onDelete = () => {
    setPin((prev) => prev.slice(0, -1))
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col  justify-center items-center pt-10 mb-6">
        <Image src="/icons/loginIcon.svg" alt="" width={40} height={40} className="mb-6" />
        <h2 className="font-bold text-2xl">Enter Pin</h2>
        <p className="text-secondary">Enter your PIN to validate yourself.</p>
      </div>
      <PinInput pin={pin} />
      <Keypad onDelete={onDelete} onPress={onPress} />
      <Button onClick={() => {}} text="Sign in" />
    </div>
  )
}
