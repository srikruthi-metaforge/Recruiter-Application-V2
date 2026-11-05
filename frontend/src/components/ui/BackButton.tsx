import React from 'react'
import { ChevronLeft } from 'lucide-react'

/** Shared pill-style back control (matches My Workspace “Back to …” pattern). */
const BACK_BUTTON_CLASS =
  'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs w-fit'

export function BackButton({
  label,
  onClick,
  title,
  className = '',
  type = 'button',
}: {
  label: string
  onClick?: () => void
  title?: string
  className?: string
  type?: 'button' | 'submit' | 'reset'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      title={title || label}
      className={`${BACK_BUTTON_CLASS}${className ? ` ${className}` : ''}`}
    >
      <ChevronLeft className="w-4 h-4 text-slate-500 shrink-0" />
      <span>{label}</span>
    </button>
  )
}

export { BACK_BUTTON_CLASS }
