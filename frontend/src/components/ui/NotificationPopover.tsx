import React, { useState } from 'react'
import { Bell, CheckCircle2, Clock, Calendar, UserCheck, AlertCircle, X, Check } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'interview' | 'submission' | 'placement' | 'system'
  read: boolean
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Interview Confirmed',
    message: 'Alex Turner confirmed for Technical Round 2 with Accenture.',
    time: '10m ago',
    type: 'interview',
    read: false,
  },
  {
    id: 'n2',
    title: 'New Candidate Submitted',
    message: 'Marcus Chen submitted Sarah Nguyen for REQ-001.',
    time: '42m ago',
    type: 'submission',
    read: false,
  },
  {
    id: 'n3',
    title: 'Placement Recorded!',
    message: 'Ben Wallace was successfully placed at Tesla ($190k package).',
    time: '2h ago',
    type: 'placement',
    read: false,
  },
  {
    id: 'n4',
    title: 'Requirement Updated',
    message: 'Goldman Sachs added 1 new opening to REQ-002 (Java Architect).',
    time: '5h ago',
    type: 'system',
    read: true,
  },
]

interface NotificationPopoverProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)

  if (!isOpen) return null

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-400" />
          <span className="font-sans font-bold text-sm">Activity Feed</span>
          {unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 hover:underline"
            >
              <Check className="w-3 h-3" /> Read all
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {notifications.map(n => (
          <div
            key={n.id}
            className={`p-3.5 transition-colors flex items-start gap-3 ${
              n.read ? 'bg-white opacity-75' : 'bg-blue-50/40'
            }`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {n.type === 'interview' && (
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              )}
              {n.type === 'submission' && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserCheck className="w-3.5 h-3.5" />
                </div>
              )}
              {n.type === 'placement' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              )}
              {n.type === 'system' && (
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-xs font-bold text-slate-900 font-sans truncate">{n.title}</p>
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> {n.time}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-body leading-relaxed">{n.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[11px] font-mono text-slate-500 font-medium">Real-time enterprise webhooks active</span>
      </div>
    </div>
  )
}
