import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@ephemere/ui/components/ui/sidebar.tsx'
import { LogOut } from 'lucide-react'

import EphemereLogo from '../icons/animated/EphemereLogo'
import { History } from '../icons/animated/History'
import { HomeIcon } from '../icons/animated/Home'
import { NavUser } from '../Root-user'
import { ThemeToggle } from '../theme/ThemeToggle'

import { LogoutButton } from './LogoutButton'
import PremiumBox from './PremiumBox'
import SideBarItem from './SideBarItem'

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: <HomeIcon />,
  },
  {
    title: 'History',
    url: '/history',
    icon: <History />,
  },
]

export function AppSidebar() {
  return (
    <Sidebar
      variant="inset"
      className="border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]"
    >
      <SidebarContent className="flex flex-col bg-[hsl(var(--muted))]">
        <SidebarHeader className="flex flex-row items-center justify-between max-md:p-4">
          <EphemereLogo />
          <div className="max-md:hidden">
            <NavUser />
          </div>
        </SidebarHeader>
        <SidebarGroup className="mt-10 flex-1">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <SideBarItem
                      icon={item.icon}
                      title={item.title}
                      url={item.url}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="space-y-3">
          <PremiumBox />
          <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2">
            <div className="flex items-center justify-between gap-3 px-2 py-1.5">
              <span className="text-sm font-medium text-[hsl(var(--foreground))]">
                Theme
              </span>
              <ThemeToggle />
            </div>
            <LogoutButton
              className="mt-1 flex w-full items-center justify-start gap-2 rounded-md px-2 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]"
              icon={<LogOut className="size-4" />}
            />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}
