import Image from 'next/image'

import AnonymousIcon from '@/components/icons/AnonymousIcon'
import { UserIcon } from '@/components/icons/UserIcon'

const AnonymousDemo = () => {
  const items = [
    { type: 'user', image: '/images/eren.jpg' },
    { type: 'empty' },
    { type: 'user' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'user', image: '/images/RohitSinghRawat.jpg' },
    { type: 'user' },
    { type: 'empty' },
    { type: 'user' },
  ]

  return (
    <div className="group relative">
      <div className="relative flex min-h-40 flex-1 select-none items-center justify-center">
        <div className="grid grid-cols-3 gap-2 p-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="rounded-lg p-1 shadow-sm ring-1 ring-[hsl(var(--border))] transition-all duration-300 hover:shadow-md"
            >
              <div className="relative overflow-hidden rounded bg-gradient-to-br from-[hsl(var(--secondary)/0.7)] to-[hsl(var(--card)/0.5)]">
                {item.type === 'user' ? (
                  <div className="flex h-20 w-16 items-center justify-center">
                    {item.image ? (
                      <div className="size-full">
                        <Image
                          src={item.image}
                          alt="User"
                          width={120}
                          height={120}
                          className="grayscale-100 size-full rounded-lg object-cover group-hover:grayscale-0"
                        />
                      </div>
                    ) : (
                      <div className="flex size-10 items-center justify-center">
                        <UserIcon className="size-7 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-20 w-16 animate-pulse bg-[hsl(var(--muted))]" />
                )}
                <div className="absolute inset-0 rounded ring-1 ring-inset ring-[hsl(var(--border))]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-center pointer-events-none absolute inset-x-0 bottom-0 z-40 size-full bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-[hsl(var(--card))]">
        {' '}
        <div className="h-32 w-24 scale-[0.85] rounded-lg bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-md)] ring-1 ring-[hsl(var(--border))] transition-all duration-300 hover:shadow-2xl group-hover:scale-90 lg:w-[100px]">
          <div className="relative h-full overflow-hidden rounded bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--muted))] shadow-inner">
            <div className="flex size-full items-center justify-center">
              <AnonymousIcon className="size-10 text-[hsl(var(--foreground)/0.8)] sm:size-12 lg:size-14" />
            </div>

            <div className="absolute inset-0 rounded bg-[hsl(var(--foreground)/0.04)] ring-1 ring-inset ring-[hsl(var(--border))]" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnonymousDemo
