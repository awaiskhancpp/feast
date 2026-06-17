type ButtonProps = {
  text: string
  onClick?: () => void
}
export function Button({ text, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-primary text-white w-full rounded-lg px-[8px] py-[14px] items-center"
    >
      {text}
    </button>
  )
}
