'use client'

import { DropdownMenuItem } from '@ephemere/ui/components/ui/dropdown-menu.tsx'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type Props = {
  icon: React.ReactNode
  title: string
  href?: string
  onClick?: () => void
}

const Downitem = ({ icon, title, href, onClick }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <DropdownMenuItem
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className="flex cursor-pointer items-center justify-start gap-2.5"
    >
      {React.cloneElement(icon as React.ReactElement<{ animate?: boolean; className?: string }>, {
        // Pass undefined (not false) so the animate attribute is never written to the DOM
        // for plain SVG / lucide icons that don't declare this prop.
        animate: isHovered || undefined,
        className: 'size-4 text-gray-600',
      })}
      <span className="font-normal text-gray-600">{title}</span>
    </DropdownMenuItem>
  )
}

export default Downitem
