import React from 'react'

export function InteractiveTrendChart({
  svgWidth,
  svgHeight,
  paddingX,
  paddingY,
  areaD,
  pathD,
  coords,
  hoveredIdx,
  setHoveredIdx,
}: {
  svgWidth: number
  svgHeight: number
  paddingX: number
  paddingY: number
  areaD: string
  pathD: string
  coords: { x: number; y: number; point: { label: string } }[]
  hoveredIdx: number | null
  setHoveredIdx: (idx: number) => void
}) {
  return (
    <div className="relative w-full h-[220px]">
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="neonTrendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#6366F1" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {[0.25, 0.5, 0.75].map(ratio => (
          <line
            key={ratio}
            x1={paddingX}
            y1={paddingY + ratio * (svgHeight - 2 * paddingY)}
            x2={svgWidth - paddingX}
            y2={paddingY + ratio * (svgHeight - 2 * paddingY)}
            stroke="#1E293B"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
        ))}

        <path d={areaD} fill="url(#neonTrendGrad)" />

        <path
          d={pathD}
          fill="none"
          stroke="#60A5FA"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />

        {coords.map((c, i) => {
          const isHovered = hoveredIdx === i
          return (
            <g key={i} className="cursor-pointer group" onMouseEnter={() => setHoveredIdx(i)}>
              <circle cx={c.x} cy={c.y} r="14" fill="transparent" />

              {isHovered && (
                <circle cx={c.x} cy={c.y} r="10" fill="none" stroke="#60A5FA" strokeWidth="2" className="animate-ping" />
              )}

              <circle
                cx={c.x}
                cy={c.y}
                r={isHovered ? '7' : '5'}
                fill={isHovered ? '#60A5FA' : '#1E1B4B'}
                stroke={isHovered ? '#FFFFFF' : '#3B82F6'}
                strokeWidth="2.5"
                className="transition-all duration-200"
              />

              <text
                x={c.x}
                y={svgHeight - 8}
                textAnchor="middle"
                fill={isHovered ? '#FFFFFF' : '#94A3B8'}
                fontSize="10"
                fontFamily="monospace"
                fontWeight={isHovered ? 'bold' : 'normal'}
              >
                {c.point.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
