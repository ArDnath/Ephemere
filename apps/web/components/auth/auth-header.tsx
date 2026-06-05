interface AuthHeaderProps {
  title: string
  description: string
}

export function AuthHeader({ title, description }: AuthHeaderProps) {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <div className="mb-2 h-px w-12 bg-[hsl(var(--foreground))]" />
      <h1 className="text-2xl font-medium text-[hsl(var(--foreground))]">
        {title}
      </h1>
      <p className="text-sm font-normal text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
    </div>
  )
}
