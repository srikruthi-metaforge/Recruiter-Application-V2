import React from 'react'

/**
 * Pins a page action bar to the bottom of the main column.
 * The shell sets --app-sidebar-offset so the bar stays clear of the sidebar.
 */
export function FixedPageActionBar({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`fixed bottom-3 z-40 transition-[left] duration-300 ease-in-out ${className}`}
      style={{
        left: 'calc(var(--app-sidebar-offset, 260px) + 1rem)',
        right: '1rem',
      }}
    >
      {children}
    </div>
  )
}
