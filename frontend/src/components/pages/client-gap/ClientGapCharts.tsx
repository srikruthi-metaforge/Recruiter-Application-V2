import React from 'react'
import { TrendingUp, BarChart3, AlertTriangle, ChevronDown, ChevronUp, PieChart } from 'lucide-react'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'
import { ClientGapVm } from './useClientDeliveryGap'

export function ClientGapCharts({ vm }: { vm: ClientGapVm }) {
  const {
    clientName,
    openSections,
    activeTabSection,
    toggleSection,
    zeroSubReqs,
    coverage,
    domainChartData,
  } = vm
  return (
    <>
      {/* 6. DOMAIN PERFORMANCE CHARTS (RECHARTS) */}
      {(activeTabSection === 'all' || activeTabSection === 'domainCharts') && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4 transition-all">
          <div
            onClick={() => toggleSection('domainCharts')}
            className="flex items-center justify-between border-b border-slate-100 pb-3 cursor-pointer group"
          >
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 group-hover:text-[#6B3BF6] transition-colors">
                <BarChart3 className="w-5 h-5 text-amber-600" />
                <span>Domain Performance Analytics Charts (4 Visual Reports)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Requirements count, Positions vs Submissions, Coverage ratio, and Zero-submission requirements per domain.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                {openSections.domainCharts ? 'Hide Charts' : 'Show Charts'}
              </span>
              {openSections.domainCharts ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </div>
          </div>

          {openSections.domainCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
              {/* Chart 1: Requirements by Domain */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#6B3BF6]" />
                    <span>Requirements Count by Domain</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">{clientName}</span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="domainShort" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip
                        formatter={(value: any) => [`${value} Reqs`, 'Requirements']}
                        labelFormatter={(lbl: any) => `Domain: ${lbl}`}
                      />
                      <Bar dataKey="requirements" fill="#6B3BF6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Positions vs Submissions by Domain */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#2563EB]" />
                    <span>Positions vs Submissions by Domain</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Grouped Comparison</span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="domainShort" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Bar dataKey="positions" name="Open Positions" fill="#C7D2FE" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="submissions" name="Submissions Sent" fill="#2563EB" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Coverage % by Domain */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600" />
                    <span>Submission Coverage % by Domain</span>
                  </h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Delivery Ratio</span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="domainShort" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit="%" />
                      <Tooltip formatter={(val: any) => [`${val}%`, 'Coverage Ratio']} />
                      <Bar dataKey="coverage" fill="#10B981" radius={[6, 6, 0, 0]}>
                        {domainChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.coverage >= 50 ? '#10B981' : entry.coverage >= 25 ? '#F59E0B' : '#EF4444'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Zero-Submission Requirements by Domain */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Zero-Submission Requirements by Domain</span>
                  </h4>
                  <span className="text-[10px] text-rose-700 font-bold">Attention Needed</span>
                </div>

                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={domainChartData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="domainShort" angle={-25} textAnchor="end" interval={0} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                      <Tooltip formatter={(val: any) => [`${val} Reqs`, 'Zero Submissions']} />
                      <Bar dataKey="zeroSubReqs" fill="#EF4444" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </>
  )
}
