import React from 'react'

interface MetricChartProps {
  data: number[]
  type?: 'line' | 'bar'
  height?: number
  color?: string
}

export function MetricChart({ data, type = 'line', height = 48, color = '#3B82F6' }: MetricChartProps) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  if (type === 'bar') {
    return (
      <div className="flex items-end gap-1.5" style={{ height: `${height}px` }}>
        {data.map((val, idx) => {
          const heightPercent = Math.max(15, (val / max) * 100)
          return (
            <div
              key={idx}
              className="flex-1 rounded-t transition-all duration-300 hover:opacity-80 group relative"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: color,
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-mono py-0.5 px-1.5 rounded pointer-events-none z-20 whitespace-nowrap shadow-md">
                {val}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // SVG Line sparkline path generation
  const width = 160
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width
    const y = height - ((val - min) / range) * (height - 8) - 4
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`

  return (
    <div className="relative overflow-hidden" style={{ height: `${height}px`, width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={`sparkline-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill={`url(#sparkline-grad-${color.replace('#', '')})`} />
        <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
