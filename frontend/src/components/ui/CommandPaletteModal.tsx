import React, { useState, useEffect } from 'react'
import { Search, Briefcase, User, Calendar, Shield, Sparkles, X, ChevronRight, ArrowRight } from 'lucide-react'
import { Role } from '../../types'
import { ROLE_META } from '../../data/mockData'

interface CommandPaletteModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRole: (r: Role) => void
  onOpenNewReq: () => void
  onOpenSubmitCandidate: () => void
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  onSelectRole,
  onOpenNewReq,
  onOpenSubmitCandidate,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else {
          // Trigger open via parent listener or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const ACTIONS = [
    {
      id: 'act-req',
      title: 'Create New Requirement',
      desc: 'Post a job opening for client',
      icon: Briefcase,
      action: () => {
        onOpenNewReq()
        onClose()
      },
    },
    {
      id: 'act-sub',
      title: 'Submit Candidate',
      desc: 'Add candidate profile to pipeline',
      icon: User,
      action: () => {
        onOpenSubmitCandidate()
        onClose()
      },
    },
    {
      id: 'act-role-sa',
      title: 'Switch View to Super Admin',
      desc: 'Platform financial metrics',
      icon: Shield,
      action: () => {
        onSelectRole('superadmin')
        onClose()
      },
    },
    {
      id: 'act-role-adm',
      title: 'Switch View to Admin',
      desc: 'Regional teams overview',
      icon: Shield,
      action: () => {
        onSelectRole('admin')
        onClose()
      },
    },
    {
      id: 'act-role-lead',
      title: 'Switch View to Team Lead',
      desc: 'Recruiter quota tracking',
      icon: Shield,
      action: () => {
        onSelectRole('lead')
        onClose()
      },
    },
    {
      id: 'act-role-rec',
      title: 'Switch View to Recruiter',
      desc: 'Submissions & interviews',
      icon: User,
      action: () => {
        onSelectRole('recruiter')
        onClose()
      },
    },
  ]

  const filtered = ACTIONS.filter(
    a => a.title.toLowerCase().includes(query.toLowerCase()) || a.desc.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search actions... (e.g. Switch, Create, Submit)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none font-sans"
          />
          <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">ESC</span>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          <p className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
            Suggested Quick Actions
          </p>
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs font-mono text-slate-400">No matching commands found.</p>
          ) : (
            filtered.map(item => {
              const IconComp = item.icon
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50/60 hover:text-blue-700 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 font-sans">{item.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </button>
              )
            })
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Tip: Use ↑ ↓ to navigate, Enter to select</span>
          <span className="text-blue-600 font-semibold">TalentFlow Pro Shortcuts</span>
        </div>
      </div>
    </div>
  )
}
