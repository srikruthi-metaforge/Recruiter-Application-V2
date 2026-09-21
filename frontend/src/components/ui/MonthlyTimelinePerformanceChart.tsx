import React, { useState } from 'react'
import { Calendar } from 'lucide-react'
import {
  FIRST_SUBMISSION_LOGS,
  MONTHLY_TIMELINE_DATA_INDIVIDUAL,
  MONTHLY_TIMELINE_DATA_TEAM,
  MonthlyTimelineProps,
} from './MonthlyTimelinePerformanceChart.data'
import { MonthlyTimelineTableAndChart } from './MonthlyTimelinePerformanceChart.chart'
import { MonthlyTimelineLogs } from './MonthlyTimelinePerformanceChart.logs'

export type { MonthlyMetric, DetailLogItem, MonthlyTimelineProps } from './MonthlyTimelinePerformanceChart.data'

export function MonthlyTimelinePerformanceChart({ role = 'lead' }: MonthlyTimelineProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')
  const [selectedTeammate, setSelectedTeammate] = useState<string>('All Team Members')

  const data = React.useMemo(() => {
    if (leadChartView === 'individual') return MONTHLY_TIMELINE_DATA_INDIVIDUAL
    if (selectedTeammate === 'Marcus Chen') {
      return [
        { month: 'Apr 2026', requirementsReceived: 12, totalPositions: 28, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
        { month: 'May 2026', requirementsReceived: 28, totalPositions: 65, firstSubmissions: 6, totalSubmissions: 8, avgTATDays: 4.1 },
        { month: 'Jun 2026', requirementsReceived: 26, totalPositions: 60, firstSubmissions: 14, totalSubmissions: 28, avgTATDays: 1.0 },
        { month: 'Jul 2026', requirementsReceived: 20, totalPositions: 45, firstSubmissions: 18, totalSubmissions: 62, avgTATDays: 0.65 },
      ]
    }
    if (selectedTeammate === 'Priya Sharma') {
      return [
        { month: 'Apr 2026', requirementsReceived: 10, totalPositions: 24, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
        { month: 'May 2026', requirementsReceived: 24, totalPositions: 55, firstSubmissions: 5, totalSubmissions: 6, avgTATDays: 4.9 },
        { month: 'Jun 2026', requirementsReceived: 22, totalPositions: 50, firstSubmissions: 10, totalSubmissions: 22, avgTATDays: 1.3 },
        { month: 'Jul 2026', requirementsReceived: 18, totalPositions: 40, firstSubmissions: 12, totalSubmissions: 48, avgTATDays: 0.8 },
      ]
    }
    if (selectedTeammate === 'Arvind GR') {
      return [
        { month: 'Apr 2026', requirementsReceived: 6, totalPositions: 14, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
        { month: 'May 2026', requirementsReceived: 12, totalPositions: 28, firstSubmissions: 2, totalSubmissions: 3, avgTATDays: 5.2 },
        { month: 'Jun 2026', requirementsReceived: 10, totalPositions: 24, firstSubmissions: 4, totalSubmissions: 10, avgTATDays: 1.4 },
        { month: 'Jul 2026', requirementsReceived: 8, totalPositions: 18, firstSubmissions: 6, totalSubmissions: 16, avgTATDays: 0.9 },
      ]
    }
    return MONTHLY_TIMELINE_DATA_TEAM
  }, [leadChartView, selectedTeammate])

  const logs = React.useMemo(() => {
    if (leadChartView === 'individual') {
      return FIRST_SUBMISSION_LOGS.filter(l => l.recruiter.toLowerCase().includes('harish') || l.recruiter.toLowerCase().includes('charlie'))
    }
    if (selectedTeammate !== 'All Team Members') {
      return FIRST_SUBMISSION_LOGS.filter(l => l.recruiter.toLowerCase().includes(selectedTeammate.toLowerCase()))
    }
    return FIRST_SUBMISSION_LOGS
  }, [leadChartView, selectedTeammate])

  const totalReqs = data.reduce((acc, curr) => acc + curr.requirementsReceived, 0)
  const totalPositionsSum = data.reduce((acc, curr) => acc + curr.totalPositions, 0)
  const totalFirstSubs = data.reduce((acc, curr) => acc + curr.firstSubmissions, 0)
  const totalSubsSum = data.reduce((acc, curr) => acc + curr.totalSubmissions, 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6B3BF6]">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Lead Individual Performance: Monthly Requirements, Total Positions & Submissions Trend'
                  : selectedTeammate !== 'All Team Members'
                  ? `${selectedTeammate}: Monthly Requirements vs Submissions Performance`
                  : 'Team Members Comparison: Monthly Requirements vs Submissions Trend'
                : 'Monthly: Requirements, Total Positions & Submissions with TAT Trend'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {role === 'lead'
              ? leadChartView === 'individual'
                ? 'Monthly timeline tracking requirements received, total position openings & submissions for Harish Gadipally (Team Lead)'
                : selectedTeammate !== 'All Team Members'
                ? `Monthly timeline tracking requirements received, positions & submissions for ${selectedTeammate}`
                : 'Monthly timeline comparison for all Team Members under Harish Gadipally (Engineering Pod)'
              : 'Monthly timeline tracking Requirements Received, Total Requirement Positions, Submissions, and Average TAT'}
          </p>
        </div>

        {role === 'lead' && (
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLeadChartView('individual')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  leadChartView === 'individual' ? 'bg-[#6B3BF6] text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Lead Individual Performance
              </button>
              <button
                type="button"
                onClick={() => setLeadChartView('team')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  leadChartView === 'team' ? 'bg-blue-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Team Members Comparison
              </button>
            </div>
            {leadChartView === 'team' && (
              <select
                value={selectedTeammate}
                onChange={e => setSelectedTeammate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#6B3BF6] cursor-pointer shadow-2xs"
              >
                <option value="All Team Members">All Team Members (Engineering Pod)</option>
                <option value="Harish Gadipally">Harish Gadipally (Team Lead)</option>
                <option value="Marcus Chen">Marcus Chen (Senior Recruiter)</option>
                <option value="Priya Sharma">Priya Sharma (IT Recruiter)</option>
                <option value="Arvind GR">Arvind GR (Sourcing Specialist)</option>
              </select>
            )}
          </div>
        )}
      </div>

      <MonthlyTimelineTableAndChart
        data={data}
        totalReqs={totalReqs}
        totalPositionsSum={totalPositionsSum}
        totalFirstSubs={totalFirstSubs}
        totalSubsSum={totalSubsSum}
      />
      <MonthlyTimelineLogs logs={logs} />
    </div>
  )
}
