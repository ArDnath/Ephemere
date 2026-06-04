'use client'
import { motion, useAnimation } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

const EphemereLogo = () => {
  const controls = useAnimation()
  return (
    <Link
      href={'/'}
      className="z-[60] flex items-center"
      onMouseEnter={() => controls.start('animate')}
      onMouseLeave={() => controls.start('normal')}
      aria-label="Ephemere Home"
    >
      <motion.div
        variants={{
          normal: { rotate: 0, scale: 1 },
          animate: {
            rotate: [0, -3, 3, 0],
            scale: [1, 1.05, 1],
            transition: {
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
        }}
        animate={controls}
        className="flex-shrink-0"
      >
        {/* Light mode */}
        <Image
          src="/ephemere-e.png"
          alt=""
          aria-hidden="true"
          width={30}
          height={30}
          className="object-contain block dark:hidden"
        />
        {/* Dark mode */}
        <Image
          src="/ephemere-e-dark.png"
          alt=""
          aria-hidden="true"
          width={30}
          height={30}
          className="object-contain hidden dark:block"
        />
      </motion.div>
      <span className="font-serif text-2xl font-black leading-none tracking-normal text-[#291f14] dark:text-stone-200">
        ephemere
      </span>
    </Link>
  )
}

export default EphemereLogo
