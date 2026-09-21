import React, { useState } from 'react'
import { Building2, ChevronDown, X } from 'lucide-react'
import { SubmittedClientsPillCellProps } from './types'

export function SubmittedClientsPillCell({ clients, onSelectClient, activeClient }: SubmittedClientsPillCellProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!clients || clients.length === 0) {
    return <span className="text-slate-400 font-medium">—</span>
  }

  const primaryClient =
    activeClient && activeClient !== 'All Clients' && clients.some(c => c.toLowerCase().includes(activeClient.toLowerCase()))
      ? clients.find(c => c.toLowerCase().includes(activeClient.toLowerCase())) || clients[0]
      : clients[0]

  const hasMultiple = clients.length > 1

  return (
    <div className="relative inline-flex items-center" onClick={e => e.stopPropagation()}>
      {hasMultiple ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B51D8] border border-[#C7D2FE] transition-all cursor-pointer shadow-2xs active:scale-95"
          title={`Click to view all ${clients.length} submitted clients`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#5B51D8] shrink-0" />
          <span>{primaryClient}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#5B51D8] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onSelectClient?.(clients[0])}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#EEF2FF] hover:bg-[#E0E7FF] text-[#5B51D8] border border-[#C7D2FE] shadow-2xs cursor-pointer transition-all active:scale-95"
          title={`Click to filter table and REQS count for ${clients[0]}`}
        >
          <Building2 className="w-3.5 h-3.5 text-[#5B51D8] shrink-0" />
          <span>{clients[0]}</span>
        </button>
      )}

      {/* Popover Dropdown Card */}
      {isOpen && hasMultiple && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-100 pb-1.5 flex items-center justify-between">
            <span>Submitted Clients ({clients.length})</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {clients.map((client, idx) => {
              const isSelected = activeClient && client.toLowerCase().includes(activeClient.toLowerCase())
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    if (onSelectClient) {
                      onSelectClient(client)
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-between gap-2 border cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF2FF] text-[#5B51D8] border-[#C7D2FE]'
                      : 'bg-slate-50 hover:bg-purple-50 hover:text-[#6B3BF6] text-slate-800 border-slate-100'
                  }`}
                  title={`Click to filter table and REQS count for ${client}`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="w-3.5 h-3.5 text-[#6B3BF6] shrink-0" />
                    <span className="truncate">{client}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#5B51D8] text-white">Active</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
