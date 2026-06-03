'use client'

interface GridItemHeadingProps {
  title: string
  description: string
}

const GridItemHeading = ({ title, description }: GridItemHeadingProps) => {
  return (
    <div className="relative z-10">
      <h3 className="text-lg font-medium text-[hsl(var(--foreground))]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
    </div>
  )
}

export { GridItemHeading }
