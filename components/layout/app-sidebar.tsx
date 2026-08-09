'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { Profile } from '@/lib/types'
import {
  LayoutDashboard, FolderOpen, Shield, LogOut, TrendingUp, Menu, X, ChevronRight, BarChart2, FileSpreadsheet
} from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

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

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
        isActive
          ? 'text-white shadow-md shadow-primary/20 font-semibold'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 active:scale-[0.98]'
      )}
      style={isActive ? { background: 'var(--gradient-primary)' } : {}}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:scale-110', isActive && 'text-white')} />
      <span>{item.label}</span>
      {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto transition-transform duration-200 group-hover:translate-x-0.5" />}
    </Link>
  )
}

function SidebarContent({ profile, pathname }: { profile: Profile; pathname: string }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border/80">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary/20 transition-transform duration-300 hover:scale-105"
          style={{ background: 'var(--gradient-primary)' }}
        >
          <TrendingUp className="w-4.5 h-4.5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sidebar-foreground text-sm tracking-tight">ExpCal</p>
          <p className="text-xs text-muted-foreground/80 capitalize font-medium">{profile.role}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {profile.role === 'admin' ? (
          <>
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2">Admin</p>
            {adminNavItems.map(item => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
            ))}
            <div className="border-t border-sidebar-border/80 my-3" />
            <p className="text-xs font-semibold text-muted-foreground/80 uppercase tracking-wider px-3 mb-2">User</p>
            {userNavItems.map(item => (
              <NavLink key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
            ))}
          </>
        ) : (
          userNavItems.map(item => (
            <NavLink key={item.href} item={item} isActive={pathname === item.href || pathname.startsWith(item.href + '/')} />
          ))
        )}
      </nav>

      {/* User info + sign out */}
      <div className="p-3 border-t border-sidebar-border/80">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40 hover:bg-muted/60 transition-colors duration-200 mb-3">
          <Avatar className="w-8 h-8 ring-2 ring-primary/20">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs font-semibold" style={{ background: 'var(--gradient-primary)', color: 'white' }}>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{profile.full_name || 'User'}</p>
            <p className="text-xs text-muted-foreground/80 capitalize font-medium">{profile.role}</p>
          </div>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-all duration-200 rounded-xl font-medium active:scale-[0.98] cursor-pointer group"
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
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-sidebar-border h-screen sticky top-0"
        style={{ background: 'var(--sidebar)' }}
      >
        <SidebarContent profile={profile} pathname={pathname} />
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b border-border" style={{ background: 'var(--background)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <TrendingUp className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">ExpCal</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" style={{ background: 'var(--sidebar)', borderColor: 'var(--sidebar-border)' }}>
            <SidebarContent profile={profile} pathname={pathname} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
