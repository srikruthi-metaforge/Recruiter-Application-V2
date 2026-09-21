import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cardThemeColors } from '../../theme'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  variant?: 'purple' | 'mint' | 'rose' | 'blue' | 'amber' | 'indigo'
  bg?: string
  iconBg?: string
  borderColor?: string
}

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = 'blue',
  bg,
  iconBg,
  borderColor,
}: StatCardProps) {
  const theme = cardThemeColors[variant] || cardThemeColors.blue
  const cardBg = bg || theme.bg
  const cardBorder = borderColor || theme.borderColor
  const iconCircleBg = iconBg || theme.iconBg

  return (
    <div
      className="rounded-2xl border p-4 sm:p-5 shadow-sm transition-all duration-200 hover:shadow-md"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-700">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5 tabular-nums">
            {value}
          </p>
          {sub && (
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {sub}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0"
            style={{ background: iconCircleBg }}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
