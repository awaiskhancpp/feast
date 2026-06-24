import { KeyButton } from './KeyButton'
import Image from 'next/image'
type KeypadProps = {
  onPress: (value: string) => void
  onDelete: () => void
}

export function Keypad({ onPress, onDelete }: KeypadProps) {
  return (
    <div className="grid grid-cols-3 gap-y-6 justify-items-center">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <KeyButton key={num} onClick={() => onPress(String(num))}>
          {num}
        </KeyButton>
      ))}

      {/* Row 4 */}
      <button className="flex items-center justify-center w-[84px] h-[70px]">
        <Image
          src="/fingerprint.svg"
          alt="Fingerprint"
          width={32}
          height={32}
          className="dark:invert"
        />
      </button>

      <KeyButton onClick={() => onPress('0')} className="font-bold">
        0
      </KeyButton>

      <button onClick={onDelete} className="flex items-center justify-center w-[84px] h-[70px]">
        <Image
          src="/backspace.svg"
          alt="Backspace"
          width={32}
          height={32}
          className="dark:invert"
        />
      </button>
    </div>
  )
}
