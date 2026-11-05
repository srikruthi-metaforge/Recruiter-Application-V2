import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAbortError } from '../lib/api'
import { getSessionUser } from '../store/session'
import { notificationsService } from '../services/workspace.service'
import { ToastItem } from '../components/ui/NotificationToast'
import {
  NOTIFICATION_FAST_MS,
  NOTIFICATION_GC_MS,
  NOTIFICATION_IDLE_MS,
  queryKeys,
} from '../lib/queryKeys'
import {
  fetchNotificationList,
  markAllReadInList,
  markReadInList,
  removeFromList,
  type NotificationItem,
  type NotificationList,
} from '../lib/notificationCache'

export type { NotificationItem }

const LAST_VIEWED_KEY = 'metaforge_notif_last_viewed'

export function useNotificationSystem(excludeNotification?: (n: NotificationItem) => boolean) {
  const excludeRef = useRef(excludeNotification)
  excludeRef.current = excludeNotification
  const queryClient = useQueryClient()
  const userId = getSessionUser()?.id || ''
  const queryKey = useMemo(
    () => queryKeys.notifications(userId || 'signed-out'),
    [userId],
  )

  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [manualLoading, setManualLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [fastPollers, setFastPollers] = useState(0)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const isInitialLoadRef = useRef(true)
  const tabReturnRef = useRef(false)
  const fastPollersRef = useRef(0)
  const [lastViewedAt, setLastViewedAt] = useState(
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem(LAST_VIEWED_KEY) || '0', 10) || 0
      : 0,
  )

  const notificationQuery = useQuery({
    queryKey,
    enabled: Boolean(userId),
    staleTime: fastPollers > 0 ? NOTIFICATION_FAST_MS : NOTIFICATION_IDLE_MS,
    gcTime: NOTIFICATION_GC_MS,
    queryFn: ({ signal }) => fetchNotificationList(signal),
    refetchInterval: () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false
      return fastPollersRef.current > 0 ? NOTIFICATION_FAST_MS : NOTIFICATION_IDLE_MS
    },
  })

  const triggerToast = useCallback((item: NotificationItem) => {
    const toastId = item.id
    setToasts(prev => {
      if (prev.some(t => t.id === toastId)) return prev
      return [...prev, {
        id: toastId,
        title: item.title,
        message: item.message,
        type: item.type,
        entityType: item.entityType,
        entityId: item.entityId,
        createdAt: item.createdAt,
      }]
    })
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toastId))
    }, 5000)
  }, [])

  useEffect(() => {
    const items = notificationQuery.data?.items
    if (!items) return
    const tabReturn = tabReturnRef.current
    tabReturnRef.current = false
    const exclude = excludeRef.current
    items.forEach(item => {
      if (!item.read) {
        if (!seenIdsRef.current.has(item.id)) {
          seenIdsRef.current.add(item.id)
          const hidden = exclude?.(item)
          if (!hidden && (!isInitialLoadRef.current || tabReturn)) {
            triggerToast(item)
          }
        }
      } else {
        seenIdsRef.current.add(item.id)
      }
    })
    if (isInitialLoadRef.current) isInitialLoadRef.current = false
  }, [notificationQuery.data, triggerToast])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const markFeedAsViewed = useCallback(() => {
    const now = Date.now()
    setLastViewedAt(now)
    if (typeof window !== 'undefined') {
      localStorage.setItem(LAST_VIEWED_KEY, String(now))
    }
  }, [])

  const fetchNotifications = useCallback(async (isTabReturn: boolean | unknown = false, silent = false) => {
    if (!userId) return
    if (isTabReturn === true) tabReturnRef.current = true
    const background = silent === true
    if (background && queryClient.isFetching({ queryKey }) > 0) return
    const force = isTabReturn === true || !background
    if (!background) setManualLoading(true)
    try {
      await queryClient.fetchQuery({
        queryKey,
        staleTime: force ? 0 : NOTIFICATION_IDLE_MS,
        queryFn: ({ signal }) => fetchNotificationList(signal),
      })
      setErrorMsg(null)
    } catch (err: any) {
      if (isAbortError(err)) return
      setErrorMsg(err?.message || 'Failed to sync notifications')
    } finally {
      if (!background) setManualLoading(false)
    }
  }, [queryClient, queryKey, userId])

  const clearError = useCallback(() => setErrorMsg(null), [])

  const retainFastPoll = useCallback(() => {
    const wasIdle = fastPollersRef.current === 0
    fastPollersRef.current += 1
    setFastPollers(count => count + 1)
    if (wasIdle && userId && queryClient.isFetching({ queryKey }) === 0) {
      const updatedAt = queryClient.getQueryState(queryKey)?.dataUpdatedAt ?? 0
      if (Date.now() - updatedAt >= NOTIFICATION_FAST_MS) {
        void queryClient.refetchQueries({ queryKey, type: 'active' })
      }
    }
    return () => {
      fastPollersRef.current = Math.max(0, fastPollersRef.current - 1)
      setFastPollers(count => Math.max(0, count - 1))
    }
  }, [queryClient, queryKey, userId])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible' || !userId) return
      tabReturnRef.current = true
      void fetchNotifications(true, true)
    }
    const handleNotificationsUpdated = () => {
      tabReturnRef.current = true
      void fetchNotifications(true, false)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('notifications_updated', handleNotificationsUpdated)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('notifications_updated', handleNotificationsUpdated)
    }
  }, [fetchNotifications, userId])

  const allItems = notificationQuery.data?.items ?? []
  const notifications = excludeNotification ? allItems.filter(item => !excludeNotification(item)) : allItems
  const unreadCount = excludeNotification
    ? notifications.filter(item => !item.read).length
    : notificationQuery.data?.unreadCount ?? notifications.filter(item => !item.read).length
  const newNotificationCount = notifications.filter(item => {
    if (item.read) return false
    if (!item.createdAt) return lastViewedAt === 0
    const createdMs = new Date(item.createdAt).getTime()
    return isNaN(createdMs) || createdMs > lastViewedAt
  }).length

  const rollback = (previous: NotificationList | undefined) => {
    queryClient.setQueryData(queryKey, previous)
  }

  const markAllAsRead = async () => {
    const previous = queryClient.getQueryData<NotificationList>(queryKey)
    queryClient.setQueryData(queryKey, markAllReadInList(previous))
    try {
      await notificationsService.markAllAsRead()
      await queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
    } catch (err: any) {
      rollback(previous)
      setErrorMsg(err?.message || 'Failed to mark notifications read')
    }
  }

  const markRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return
    const previous = queryClient.getQueryData<NotificationList>(queryKey)
    queryClient.setQueryData(queryKey, markReadInList(previous, id))
    try {
      await notificationsService.markRead(id)
      await queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
    } catch (err: any) {
      rollback(previous)
      setErrorMsg(err?.message || 'Failed to mark notification read')
    }
  }

  const removeNotification = async (id: string, wasUnread: boolean) => {
    const previous = queryClient.getQueryData<NotificationList>(queryKey)
    queryClient.setQueryData(queryKey, removeFromList(previous, id, wasUnread))
    try {
      await notificationsService.remove(id)
      await queryClient.invalidateQueries({ queryKey, refetchType: 'none' })
    } catch (err: any) {
      rollback(previous)
      setErrorMsg(err?.message || 'Failed to delete notification')
    }
  }

  return {
    notifications,
    unreadCount,
    newNotificationCount,
    loading: notificationQuery.isPending || manualLoading,
    errorMsg,
    toasts,
    dismissToast,
    fetchNotifications,
    clearError,
    retainFastPoll,
    markFeedAsViewed,
    markAllAsRead,
    markRead,
    removeNotification,
  }
}
