import React, { useState, useEffect } from 'react'
import { Bell, CheckCircle2, Clock, Calendar, UserCheck, AlertCircle, X, Check, Trash2, RefreshCw } from 'lucide-react'
import { notificationsService } from '../../services/workspace.service'

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: 'interview' | 'submission' | 'placement' | 'system'
  read: boolean
  createdAt?: string
}

function formatTimeAgo(dateStr?: string): string {
  if (!dateStr) return 'Just now'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as any).response
    if (res?.data?.message) {
      return Array.isArray(res.data.message) ? res.data.message.join(', ') : res.data.message
    }
  }
  if (err instanceof Error) return err.message
  return 'An unexpected error occurred'
}

interface NotificationPopoverProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setErrorMsg(null)
    try {
      const res = await notificationsService.list()
      const rawItems = Array.isArray(res) ? res : res?.items || []
      const items: NotificationItem[] = rawItems.map((n: any) => ({
        id: n._id || n.id || String(Math.random()),
        title: n.title || 'Notification',
        message: n.message || n.body || '',
        time: formatTimeAgo(n.createdAt || n.updatedAt),
        type: (['interview', 'submission', 'placement', 'system'].includes(n.type)
          ? n.type
          : 'system') as any,
        read: Boolean(n.read || n.readAt),
        createdAt: n.createdAt,
      }))
      setNotifications(items)
      const count = typeof res?.unreadCount === 'number'
        ? res.unreadCount
        : items.filter(n => !n.read).length
      setUnreadCount(count)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  if (!isOpen) return null

  const markAllAsRead = async () => {
    setErrorMsg(null)
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  const handleMarkRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return
    setErrorMsg(null)
    try {
      await notificationsService.markRead(id)
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string, wasUnread: boolean) => {
    e.stopPropagation()
    setErrorMsg(null)
    try {
      await notificationsService.remove(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err))
    }
  }

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
          <button
            onClick={fetchNotifications}
            title="Refresh"
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
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

      {errorMsg && (
        <div className="px-4 py-2 bg-red-50 text-red-700 text-xs font-medium border-b border-red-100 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading && notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-mono">
            No notifications available
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id, n.read)}
              className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer group ${
                n.read ? 'bg-white opacity-75' : 'bg-blue-50/40 hover:bg-blue-50/70'
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
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {n.time}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, n.id, !n.read)}
                      title="Delete notification"
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-body leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <span className="text-[11px] font-mono text-slate-500 font-medium">Real-time enterprise webhooks active</span>
      </div>
    </div>
  )
}

