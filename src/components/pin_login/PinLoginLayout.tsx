'use client'
import { Button } from '../ui/button'
import { Keypad } from './Keypad'
import { PinInput } from './PinInput'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { loginEmployee, loginWithPin, type Employee } from '@/lib/appSession'

export default function PinLoginLayout() {
  const router = useRouter()
  const [pin, setPin] = useState<string[]>([])
  const [error, setError] = useState('')
  const [matchingEmployees, setMatchingEmployees] = useState<Employee[]>([])
  const [chooserOpen, setChooserOpen] = useState(false)
  const onPress = (value: string) => {
    if (pin.length >= 6) return

    setPin((prev) => [...prev, value])
    setError('')
  }

  const onDelete = () => {
    setPin((prev) => prev.slice(0, -1))
    setError('')
    setMatchingEmployees([])
    setChooserOpen(false)
  }

  useEffect(() => {
    if (pin.length < 6) {
      setChooserOpen(false)
      setMatchingEmployees([])
    }
  }, [pin.length])

  function redirectAfterLogin() {
    const params = new URLSearchParams(window.location.search)
    router.replace(params.get('next') || '/')
  }

  function signIn() {
    const enteredPin = pin.join('')

    if (enteredPin.length !== 6) {
      setError('Enter your 6-digit PIN.')
      return
    }

    const result = loginWithPin(enteredPin)

    if (result.status === 'success') {
      redirectAfterLogin()
      return
    }

    if (result.status === 'multiple') {
      setMatchingEmployees(result.employees)
      setChooserOpen(true)
      setError('Choose your staff profile to finish signing in.')
      return
    }

    setError('That PIN does not match an active employee.')
    setPin([])
  }

  function signInMatchedEmployee(employeeId: string) {
    const result = loginEmployee(employeeId, pin.join(''))

    if (result.status === 'success') {
      redirectAfterLogin()
      return
    }

    setError('Could not sign in with this profile.')
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
      {error ? <p className="text-center text-sm font-medium text-red-600">{error}</p> : null}

      <Button onClick={signIn} text="Sign in" />

      <Modal
        open={chooserOpen}
        onClose={() => setChooserOpen(false)}
        title="Choose Staff Profile"
        widthClassName="max-w-sm"
      >
        <div className="grid gap-2">
          {matchingEmployees.map((employee) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => signInMatchedEmployee(employee.id)}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-gray-50"
            >
              <Image
                src={employee.avatarUrl || '/person.jpg'}
                alt={employee.name}
                width={34}
                height={34}
                className="h-9 w-9 rounded-full object-cover"
                unoptimized={employee.avatarUrl.startsWith('data:')}
              />
              <span>
                <span className="block text-sm font-semibold text-gray-900">{employee.name}</span>
                <span className="block text-xs capitalize text-gray-500">{employee.role}</span>
              </span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  )
}
