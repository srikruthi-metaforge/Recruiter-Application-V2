'use client'

import React, { createContext, useCallback, useContext } from 'react'
import { Role } from '../types'
import { hidesAuditNotifications, isAuditLogNotification } from '../components/ui/NotificationPopover'
import { NotificationItem, useNotificationSystem } from './useNotificationSystem'

type NotificationApi = ReturnType<typeof useNotificationSystem>

const NotificationContext = createContext<NotificationApi | null>(null)

export function NotificationProvider({
  role,
  children,
}: {
  role: Role
  children: React.ReactNode
}) {
  const hideAudit = hidesAuditNotifications(role)
  const exclude = useCallback(
    (item: NotificationItem) => hideAudit && isAuditLogNotification(item),
    [hideAudit],
  )
  const api = useNotificationSystem(exclude)
  return <NotificationContext.Provider value={api}>{children}</NotificationContext.Provider>
}

export function useNotifications(): NotificationApi {
  const ctx = useContext(NotificationContext)
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return ctx
}
