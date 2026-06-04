import MarketingLayout from './(root)/(marketing)/layout'
import Page, { metadata } from './(root)/(marketing)/page'

export { metadata }

export default function AppRootPage() {
  return (
    <MarketingLayout>
      <Page />
    </MarketingLayout>
  )
}
