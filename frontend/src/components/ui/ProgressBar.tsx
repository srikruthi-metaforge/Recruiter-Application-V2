import React, { useEffect, useState } from 'react'

interface ProgressBarProps {
  value: number
  max: number
  color?: string
  height?: string
  animate?: boolean
}

export function ProgressBar({
  value,
  max,
  color = '#1B4FD8',
  height = 'h-1.5',
  animate = false,
}: ProgressBarProps) {
  const targetPct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))
  const [pct, setPct] = useState(animate ? 0 : targetPct)

  useEffect(() => {
    if (!animate) {
      setPct(targetPct)
      return
    }
    const timer = setTimeout(() => setPct(targetPct), 80)
    return () => clearTimeout(timer)
  }, [targetPct, animate])

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}
