'use client'

interface GridItemContentProps {
  title: string
  description: string
  children?: React.ReactNode
}

const GridItemContent = ({
  title,
  description,
  children,
}: GridItemContentProps) => {
  return (
    <>
      {children && (
        <div className="flex-center relative w-full">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 size-full bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-[hsl(var(--card))]" />
          {children}
        </div>
      )}
      <div className="relative z-10 mt-5">
        <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">
          {title}
        </h3>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </div>
    </>
  )
}

export { GridItemContent }
