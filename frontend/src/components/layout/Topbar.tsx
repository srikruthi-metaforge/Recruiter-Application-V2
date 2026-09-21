import React, { useState } from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { Role } from '../../types'
import { brand, appTheme, roleTheme } from '../../theme'
import { DEMO_ACCOUNTS } from '../../data/mockData'
import { NotificationPopover } from '../ui/NotificationPopover'
import { ScreenTimeWidget } from '../ui/ScreenTimeWidget'

interface TopbarProps {
  title: string
  subtitle?: string
  role: Role
  onNewReqClick?: () => void
  onSearchChange: (query: string) => void
  searchValue: string
  onSignOut?: () => void
  showNewReq?: boolean
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export function Topbar({
  title,
  subtitle,
  role,
  onSearchChange,
  searchValue,
}: TopbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const accent = appTheme.accent
  const roleLabel = roleTheme[role].label
  const user = DEMO_ACCOUNTS[role]
  const initials = user.name.split(' ').map(n => n[0]).join('')

  return (
    <header
      className="h-14 px-6 flex items-center justify-between flex-shrink-0 border-b"
      style={{ background: brand.surface, borderColor: brand.border }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-base font-semibold" style={{ color: brand.text }}>{title}</h1>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: brand.textMuted }}>{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: brand.textMuted }} />
          <input
            type="text"
            placeholder="Global search…"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="w-48 lg:w-56 pl-9 pr-3 py-1.5 rounded-lg border text-sm focus:outline-none"
            style={{ borderColor: brand.border, color: brand.text }}
          />
        </div>

        {/* Live Screen Time & Performance Tracker Badge */}
        <ScreenTimeWidget currentUserName={user.name} currentUserRole={role} />

        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg"
            style={{ color: brand.textSecondary }}
          >
            <Bell className="w-4 h-4" />
          </button>
          <NotificationPopover isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        <div className="relative">
          <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-1.5 p-1 rounded-lg">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ background: accent }}
            >
              {initials}
            </div>
            <ChevronDown className="w-3.5 h-3.5 hidden sm:block" style={{ color: brand.textMuted }} />
          </button>

          {isProfileOpen && (
            <div
              className="absolute right-0 top-10 w-44 rounded-lg border py-2 px-3 shadow-lg z-50"
              style={{ background: brand.surface, borderColor: brand.border }}
            >
              <p className="text-xs font-semibold" style={{ color: brand.text }}>{user.name}</p>
              <p className="text-[10px]" style={{ color: brand.textMuted }}>{roleLabel}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
