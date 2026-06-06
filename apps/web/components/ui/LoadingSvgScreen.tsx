import Image from 'next/image'

interface LoadingSvgScreenProps {
  className?: string
  fullScreen?: boolean
  message?: string
}

export function LoadingSvgScreen({
  className = '',
  fullScreen = true,
  message = 'Loading...',
}: LoadingSvgScreenProps) {
  return (
    <div
      className={`flex w-full items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))] ${fullScreen ? 'min-h-screen' : 'min-h-full'} ${className}`}
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <Image
          src="/loading.svg"
          width={96}
          height={96}
          alt=""
          aria-hidden="true"
          unoptimized
          className="size-24"
        />
        <p className="max-w-full text-sm font-medium leading-6 text-[hsl(var(--muted-foreground))]">
          {message}
        </p>
      </div>
    </div>
  )
}
