type PinInputProps = {
  pin: string[]
}

export function PinInput({ pin }: PinInputProps) {
  return (
    <div className="flex gap-3 justify-center ">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="w-[68px] h-[68px] bg-gray-100 rounded-2xl flex items-center justify-center"
        >
          {pin[index] && <div className="w-4 h-4 rounded-full bg-black" />}
        </div>
      ))}
    </div>
  )
}
