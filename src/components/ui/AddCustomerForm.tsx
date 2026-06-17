'use client'

import { useActionState, useEffect } from 'react'
import Image from 'next/image'
// import { createCustomer, type CreateCustomerState } from '@/app/(frontend)/customer/actions'
import { Button } from '@/components/ui/button'

// const initialState: CreateCustomerState = {}

interface AddCustomerFormProps {
  onSuccess: () => void
}

export function AddCustomerForm({ onSuccess }: AddCustomerFormProps) {
  //   const [state, formAction, isPending] = useActionState(createCustomer, initialState)

  //   useEffect(() => {
  //     if (state.success) onSuccess()
  //   }, [state.success, onSuccess])

  return (
    <form className="space-y-4">
      <Field label="First Name" name="firstName" placeholder="Jerome" />
      <Field label="Last Name" name="lastName" placeholder="Bell" />
      <Field label="Phone Number" name="phoneNumber" placeholder="(319) 555-0115" type="tel" />
      <Field label="Address" name="address" placeholder="8558 Green Rd." />

      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
          Status
        </label>
        <div className="relative">
          <select
            id="status"
            name="status"
            defaultValue="member"
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="member">Member</option>
            <option value="guest">Guest</option>
          </select>
          <Image
            src="/icons/chevronDown.svg"
            alt=""
            width={16}
            height={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {/* {state.error && <p className="text-sm text-red-600">{state.error}</p>} */}

      {/*
        The source design's button reads "Create Order" on this modal - almost
        certainly left over from duplicating the floor-plan's order modal. Using
        "Add Customer" here instead since that's what this form actually does.
      */}
      <Button type="submit" text={'Add Customer'} disabled={false} />
    </form>
  )
}

function Field({
  label,
  name,
  placeholder,
  type = 'text',
}: {
  label: string
  name: string
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  )
}
