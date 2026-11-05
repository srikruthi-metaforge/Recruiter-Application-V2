import { notificationsService } from '../services/workspace.service'

export interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  type: string
  entityType?: string
  entityId?: string
  read: boolean
  readAt?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface NotificationList {
  items: NotificationItem[]
  unreadCount: number
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

export function mapNotificationResponse(res: any): NotificationList {
  const rawItems = Array.isArray(res) ? res : res?.items || []
  const items: NotificationItem[] = rawItems.map((n: any) => ({
    id: n._id || n.id || String(Math.random()),
    title: n.title || 'Notification',
    message: n.message || n.body || '',
    time: formatTimeAgo(n.createdAt || n.updatedAt),
    type: n.type || 'system',
    entityType: n.entityType ? String(n.entityType) : undefined,
    entityId: n.entityId ? String(n.entityId) : undefined,
    read: Boolean(n.read || n.readAt),
    readAt: n.readAt || null,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  }))
  const unreadCount =
    typeof res?.unreadCount === 'number' ? res.unreadCount : items.filter(item => !item.read).length
  return { items, unreadCount }
}

export function fetchNotificationList(signal?: AbortSignal): Promise<NotificationList> {
  return notificationsService.list('', { signal }).then(mapNotificationResponse)
}

export function markAllReadInList(current: NotificationList | undefined): NotificationList | undefined {
  if (!current) return current
  return {
    unreadCount: 0,
    items: current.items.map(item => ({ ...item, read: true, readAt: item.readAt || new Date().toISOString() })),
  }
}

export function markReadInList(current: NotificationList | undefined, id: string): NotificationList | undefined {
  if (!current) return current
  let changed = false
  const items = current.items.map(item => {
    if (item.id !== id || item.read) return item
    changed = true
    return { ...item, read: true, readAt: new Date().toISOString() }
  })
  if (!changed) return current
  return {
    items,
    unreadCount: Math.max(0, current.unreadCount - 1),
  }
}

export function removeFromList(
  current: NotificationList | undefined,
  id: string,
  wasUnread: boolean,
): NotificationList | undefined {
  if (!current) return current
  return {
    items: current.items.filter(item => item.id !== id),
    unreadCount: wasUnread ? Math.max(0, current.unreadCount - 1) : current.unreadCount,
  }
}
