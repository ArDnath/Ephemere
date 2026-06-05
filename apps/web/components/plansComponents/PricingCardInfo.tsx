interface PricingCardInfoProps {
  name: string
  description: string
  price: string
}

export function PricingCardInfo({
  name,
  description,
  price,
}: PricingCardInfoProps) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
        {name}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-4xl font-semibold tracking-tight text-[hsl(var(--foreground))]">
          ${price}
        </span>
        <span className="pb-1 text-sm text-[hsl(var(--muted-foreground))]">
          /month
        </span>
      </div>
    </div>
  )
}
