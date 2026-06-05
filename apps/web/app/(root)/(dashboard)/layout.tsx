import {
  SidebarInset,
  SidebarProvider,
} from '@ephemere/ui/components/ui/sidebar.tsx'

import { AppSidebar } from '@/components/shared/app-sidebar'
import { TopBar } from '@/components/shared/TopBar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="relative rounded-none rounded-tl-lg pt-px md:border md:border-b-0 md:border-r-0 md:border-[hsl(var(--border))] md:bg-[hsl(var(--background))]">
          <TopBar />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
