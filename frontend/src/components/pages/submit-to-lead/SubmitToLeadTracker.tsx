import React, { useEffect, useRef, useState } from 'react'
import { SubmitToLeadTrackerCustomize } from './SubmitToLeadTrackerCustomize'
import { GripVertical, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { SubmitToLeadVm } from './useSubmitToLeadPage'
import { columnLabel } from './trackerPresets.data'

function fitColumnWidth(label: string, values: string[]): number {
  const longest = values.reduce((max, value) => Math.max(max, String(value || '').length), label.length)
  return Math.min(420, Math.max(128, Math.ceil(longest * 7.6 + 36)))
}

export function SubmitToLeadTracker({ vm }: { vm: SubmitToLeadVm }) {
  const {
    clientName,
    columnList,
    hiddenColumns,
    customColName,
    setCustomColName,
    customColPosition,
    setCustomColPosition,
    headerColor,
    setHeaderColor,
    draggedColIndex,
    dragOverColIndex,
    selectedColIndex,
    CLIENT_TRACKER_PRESETS,
    trackerRows,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleChipClick,
    moveColumnLeft,
    moveColumnRight,
    handleClientChange,
    showToast,
    toggleColumnVisibility,
    handleInsertCustomColumn,
    handleUpdateCell,
    visibleColumns,
  } = vm

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const manualWidths = useRef<Set<string>>(new Set())
  const resizeRef = useRef<{ col: string; startX: number; startW: number } | null>(null)
  const layoutKey = `${clientName}|${visibleColumns.join('\u0001')}`

  useEffect(() => {
    manualWidths.current = new Set()
    const next: Record<string, number> = {}
    for (const col of visibleColumns) {
      const values = trackerRows.map(row => row[col] || '')
      next[col] = fitColumnWidth(columnLabel(col), values)
    }
    setColumnWidths(next)
  }, [layoutKey])

  useEffect(() => {
    setColumnWidths(prev => {
      let changed = false
      const next = { ...prev }
      for (const col of visibleColumns) {
        if (manualWidths.current.has(col)) continue
        const fit = fitColumnWidth(columnLabel(col), trackerRows.map(row => row[col] || ''))
        if ((next[col] || 0) < fit) {
          next[col] = fit
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [trackerRows, visibleColumns])

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const drag = resizeRef.current
      if (!drag) return
      const width = Math.min(640, Math.max(72, drag.startW + (event.clientX - drag.startX)))
      setColumnWidths(prev => ({ ...prev, [drag.col]: width }))
    }
    const onUp = () => {
      if (!resizeRef.current) return
      manualWidths.current.add(resizeRef.current.col)
      resizeRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startResize = (col: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    resizeRef.current = {
      col,
      startX: event.clientX,
      startW: columnWidths[col] || 160,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const fitColumn = (col: string) => {
    manualWidths.current.delete(col)
    const fit = fitColumnWidth(columnLabel(col), trackerRows.map(row => row[col] || ''))
    setColumnWidths(prev => ({ ...prev, [col]: fit }))
  }

  const tableWidth = visibleColumns.reduce((sum: number, col: string) => sum + (columnWidths[col] || 160), 0)

  return (
    <>
      {/* 6. CARD 5: CLIENT SUBMISSION TRACKER TABLE & CUSTOMIZATION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Client submission tracker</h3>
            <p className="text-xs text-slate-500">
              {CLIENT_TRACKER_PRESETS[clientName]?.subtitle || 'Client layout: review and edit before sending — the same grid is embedded in the client email.'}
            </p>
          </div>
          {/* Client Filter Relocated (With METAFORGE (INTERNAL) & Client Layout Presets) */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <label className="text-xs font-extrabold text-slate-700 whitespace-nowrap">Client Filter:</label>
            <select
              value={clientName}
              onChange={e => handleClientChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer shadow-2xs"
            >
              {Object.keys(CLIENT_TRACKER_PRESETS).map(preset => (
                <option key={preset} value={preset}>{preset}</option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          Drag a column edge to resize it. Double-click the edge to fit the full value. Click inside a cell and move the cursor to read or edit the whole entry.
        </p>

        {/* FORMAL YELLOW HEADER GRID TABLE (Manual Editable, resizable columns) */}
        <div className="border-2 border-slate-800 rounded-xl overflow-x-auto shadow-xs">
          <table
            className="text-left border-collapse font-mono text-xs"
            style={{ tableLayout: 'fixed', width: tableWidth, minWidth: '100%' }}
          >
            <colgroup>
              {visibleColumns.map((col: string, index: number) => (
                <col key={`${col}-${index}`} style={{ width: columnWidths[col] || 160 }} />
              ))}
            </colgroup>
            <thead>
              <tr style={{ backgroundColor: headerColor }} className="text-slate-950 font-black border-b-2 border-slate-800 text-[10px] uppercase">
                {visibleColumns.map((col: string, index: number) => (
                  <th
                    key={`${col}-${index}`}
                    title={columnLabel(col)}
                    className="relative p-2.5 border-r-2 border-slate-800 overflow-hidden whitespace-nowrap"
                    style={{ width: columnWidths[col] || 160 }}
                  >
                    <span className="block overflow-hidden text-ellipsis pr-2">{columnLabel(col)}</span>
                    <span
                      role="separator"
                      aria-orientation="vertical"
                      title="Drag to resize. Double-click to fit the column."
                      onMouseDown={event => startResize(col, event)}
                      onDoubleClick={event => {
                        event.preventDefault()
                        event.stopPropagation()
                        fitColumn(col)
                      }}
                      className="absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize hover:bg-slate-900/25"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-800 font-semibold text-slate-900">
              {trackerRows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {visibleColumns.map((col: string, index: number) => (
                    <td key={`${col}-${index}`} className="border-r-2 border-slate-800 p-0 overflow-hidden">
                      <input
                        type="text"
                        value={row[col] || ''}
                        title={row[col] || ''}
                        onChange={e => handleUpdateCell(rIdx, col, e.target.value)}
                        className="box-border block h-8 w-full min-w-0 cursor-text bg-transparent px-2 font-mono text-xs focus:bg-white focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

          <SubmitToLeadTrackerCustomize vm={vm} />
        </div>
    </>
  )
}
