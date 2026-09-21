import React, { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import {
  getRecruiterScreenTime,
  formatDurationShort,
  ScreenTimeRecord,
  screenTimeManager,
} from '../../utils/screenTimeTracker'
import { ScreenTimeModal } from './ScreenTimeWidget.modal'

interface ScreenTimeWidgetProps {
  currentUserName: string
  currentUserRole: string
  compact?: boolean
}

export function ScreenTimeWidget({ currentUserName, currentUserRole, compact = false }: ScreenTimeWidgetProps) {
  const [record, setRecord] = useState<ScreenTimeRecord>(() => getRecruiterScreenTime(currentUserName))
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    screenTimeManager.startTracking(currentUserName, currentUserRole)

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ScreenTimeRecord>
      if (customEvent.detail && customEvent.detail.userName === currentUserName) {
        setRecord(customEvent.detail)
      }
    }

    window.addEventListener('metaforge_screentime_update', handleUpdate)

    return () => {
      window.removeEventListener('metaforge_screentime_update', handleUpdate)
    }
  }, [currentUserName, currentUserRole])

  const totalSecs = record.activeSeconds + record.idleSeconds
  const activeRatio = totalSecs > 0 ? Math.round((record.activeSeconds / totalSecs) * 100) : 100

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer shadow-2xs group ${
          record.status === 'Active'
            ? 'bg-purple-50/80 hover:bg-purple-100/80 border-purple-200 text-purple-950'
            : 'bg-amber-50/80 hover:bg-amber-100/80 border-amber-200 text-amber-950'
        }`}
        title="Click to view full screen time & performance metrics"
      >
        <div className="relative flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-[#6B3BF6]" />
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              record.status === 'Active' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
            }`}
          />
          <span
            className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${
              record.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />
        </div>

        <div className="flex items-center gap-1 text-xs font-bold">
          <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider hidden md:inline">
            Screen Time:
          </span>
          <span className="font-mono text-xs font-black text-[#6B3BF6]">
            {formatDurationShort(record.activeSeconds)}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
              record.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {record.status}
          </span>
        </div>
      </button>

      {isModalOpen && (
        <ScreenTimeModal
          currentUserName={currentUserName}
          currentUserRole={currentUserRole}
          record={record}
          activeRatio={activeRatio}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
