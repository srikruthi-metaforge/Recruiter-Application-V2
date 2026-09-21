import React from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Layers } from 'lucide-react'
import { ClientTeamPerformanceData } from './ClientWiseTeamPerformanceChart.data'

export function ClientWiseTeamBarChart({ filteredData }: { filteredData: ClientTeamPerformanceData[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-4.5 h-4.5 text-[#6B3BF6]" />
            <span>Team Pod Sourcing & Submissions by Client Account</span>
          </h3>
          <p className="text-xs text-slate-500">
            Contribution of Engineering Pod vs Enterprise Accounts Pod vs Cloud & ERP Pod per client
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-slate-600 font-medium">Engineering Pod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#6B3BF6]" />
            <span className="text-slate-600 font-medium">Enterprise Pod</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-600 font-medium">Cloud & ERP Pod</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="clientName" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
            <Tooltip
              content={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const dataObj = payload[0].payload as ClientTeamPerformanceData
                  return (
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 font-sans">
                      <div className="font-extrabold text-purple-300 border-b border-slate-700 pb-1 flex justify-between gap-4">
                        <span>{label} Account</span>
                        <span className="text-[10px] text-slate-400 font-mono">{dataObj.activeRecruiters} Recruiters</span>
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        <p className="text-blue-400 flex justify-between gap-4">
                          <span>Engineering Pod:</span>
                          <strong className="text-white">{dataObj.engineeringPodSubs}</strong>
                        </p>
                        <p className="text-purple-300 flex justify-between gap-4">
                          <span>Enterprise Pod:</span>
                          <strong className="text-white">{dataObj.enterprisePodSubs}</strong>
                        </p>
                        <p className="text-emerald-400 flex justify-between gap-4">
                          <span>Cloud & ERP Pod:</span>
                          <strong className="text-white">{dataObj.cloudErpPodSubs}</strong>
                        </p>
                        <div className="border-t border-slate-800 pt-1 text-slate-300 flex justify-between gap-4 font-bold">
                          <span>Total Submissions:</span>
                          <strong className="text-white">{dataObj.engineeringPodSubs + dataObj.enterprisePodSubs + dataObj.cloudErpPodSubs}</strong>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="engineeringPodSubs" name="Engineering Pod" stackId="a" fill="#3B82F6" />
            <Bar dataKey="enterprisePodSubs" name="Enterprise Pod" stackId="a" fill="#6B3BF6" />
            <Bar dataKey="cloudErpPodSubs" name="Cloud & ERP Pod" stackId="a" fill="#10B981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
