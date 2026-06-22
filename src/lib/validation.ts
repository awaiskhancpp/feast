export type ValidationResult = {
  valid: boolean
  message?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const usPhonePattern =
  /^(\+1[\s.-]?)?(\([2-9]\d{2}\)|[2-9]\d{2})[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/

export function isRequired(value: string) {
  return value.trim().length > 0
}

export function isValidEmail(value: string) {
  return emailPattern.test(value.trim())
}

export function isValidUSPhone(value: string) {
  return usPhonePattern.test(value.trim())
}

export function isValidName(value: string) {
  const trimmed = value.trim()
  return trimmed.length >= 2 && /^[a-zA-Z][a-zA-Z\s'.-]*$/.test(trimmed)
}

export function isValidPin(value: string) {
  return /^\d{6}$/.test(value)
}

export function isPositiveMoney(value: number) {
  return Number.isFinite(value) && value > 0
}

export function validateImageFile(file: File | null | undefined): ValidationResult {
  if (!file || file.size === 0) return { valid: true }

  if (!file.type.startsWith('image/')) {
    return { valid: false, message: 'Please upload an image file.' }
  }

  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return { valid: false, message: 'Profile photos must be smaller than 2MB.' }
  }

  return { valid: true }
}
