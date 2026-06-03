import { GitHubAuthButton } from './GitHubAuthButton'
import { GoogleAuthButton } from './GoogleAuthButton'

interface SocialAuthButtonsProps {
  showGoogle?: boolean
}

export function SocialAuthButtons({ showGoogle = true }: SocialAuthButtonsProps) {
  return (
    <div
      className={
        showGoogle ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-1 gap-3'
      }
    >
      {showGoogle ? <GoogleAuthButton /> : null}
      <GitHubAuthButton />
    </div>
  )
}
