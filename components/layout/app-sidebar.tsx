'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { Profile } from '@/lib/types'
import {
  LayoutDashboard,
  FolderOpen,
  Shield,
  LogOut,
  TrendingUp,
  ChevronRight,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const userNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/analysis', label: 'Analysis', icon: BarChart2 },
]

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Panel', icon: Shield },
  { href: '/admin/users', label: 'Users', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'All Projects', icon: FolderOpen },
  { href: '/admin/backup', label: 'Sheets Backup', icon: FileSpreadsheet },
]

function isItemActive(itemHref: string, currentPath: string): boolean {
  if (itemHref === '/dashboard' || itemHref === '/admin') {
    return currentPath === itemHref
  }
  if (itemHref === '/projects') {
    return currentPath === '/projects' || currentPath.startsWith('/project/')
  }
  return currentPath === itemHref || currentPath.startsWith(itemHref + '/')
}

function NavLink({
  item,
  isActive,
  onClick
}: {
  item: NavItem
  isActive: boolean
  onClick?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        try {
          (e.currentTarget as HTMLElement)?.blur()
        } catch {}
        onClick?.()
      }}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative select-none outline-none',
        isActive
          ? 'text-white font-semibold bg-primary/20 border border-primary/40 shadow-sm shadow-primary/20'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-white' : 'text-muted-foreground')} />
      <span className="flex-1 truncate">{item.label}</span>
      {isActive && (
        <ChevronRight className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
      )}
    </Link>
  )
}

function SidebarContent({
  profile,
  pathname,
  onItemClick,
}: {
  profile: Profile
  pathname: string
  onItemClick?: () => void
}) {
  const isAdmin = profile.role === 'admin'

  return (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-5 border-b border-sidebar-border/80 flex items-center justify-between flex-shrink-0">
        <Link
          href={isAdmin ? '/admin' : '/dashboard'}
          onClick={onItemClick}
          className="flex items-center gap-3 group select-none"
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-105"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base gradient-text tracking-tight leading-none">ExpCal</h1>
            <p className="text-[10px] text-muted-foreground/80 font-medium tracking-wide mt-0.5">Smart Expense Manager</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto overscroll-contain">
        {isAdmin ? (
          <>
            <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              Admin
            </div>
            {adminNavItems.map(item => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isItemActive(item.href, pathname)}
                onClick={onItemClick}
              />
            ))}
            <div className="px-3 pt-4 pb-1.5 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-wider">
              User View
            </div>
            {userNavItems.map(item => (
              <NavLink
                key={item.href}
                item={item}
                isActive={isItemActive(item.href, pathname)}
                onClick={onItemClick}
              />
            ))}
          </>
        ) : (
          userNavItems.map(item => (
            <NavLink
              key={item.href}
              item={item}
              isActive={isItemActive(item.href, pathname)}
              onClick={onItemClick}
            />
          ))
        )}
      </nav>

      {/* User info + sign out (Fixed at bottom) */}
      <div className="p-3 border-t border-sidebar-border/80 flex-shrink-0 bg-sidebar">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors duration-200 mb-3">
          <Avatar className="w-8 h-8 ring-2 ring-primary/20 flex-shrink-0">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-semibold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground/80 capitalize font-medium truncate">{profile.role}</p>
          </div>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all duration-200 rounded-xl font-medium active:scale-[0.98] cursor-pointer group text-sm h-10"
          >
            <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
            Sign Out
          </Button>
        </form>
      </div>
    </div>
  )
}

interface AppSidebarProps {
  profile: Profile
}

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-sidebar-border h-screen sticky top-0"
        style={{ background: 'var(--sidebar)' }}
      >
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Clean Minimalist Mobile Top Header (No duplicate hamburger menu) */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 border-b border-border/80 backdrop-blur-xl"
        style={{ background: 'rgba(13, 15, 26, 0.85)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md shadow-primary/20"
            style={{ background: 'var(--gradient-primary)' }}
          >
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">ExpCal</span>
        </Link>

        {/* User avatar indicator */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-semibold text-foreground leading-none">{profile.full_name?.split(' ')[0] || 'User'}</p>
            <span className="text-[10px] text-muted-foreground font-medium capitalize">{profile.role}</span>
          </div>
          <Avatar className="w-7 h-7 ring-2 ring-primary/25">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-[10px] font-bold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </>
  )
}
