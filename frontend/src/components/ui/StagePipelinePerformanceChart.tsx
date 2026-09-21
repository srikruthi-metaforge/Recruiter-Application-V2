import React, { useState } from 'react'
import { Layers } from 'lucide-react'
import { Role } from '../../types'
import { resolveStagePipelineData } from './StagePipelinePerformanceChart.data'
import { StagePipelineSummaryTable, StagePipelineBarChart } from './StagePipelinePerformanceChart.views'
import { StagePipelineDetailsTable } from './StagePipelinePerformanceChart.details'

export type { StageMetric, RequirementStageDetail } from './StagePipelinePerformanceChart.data'

export interface StagePipelinePerformanceChartProps {
  role?: Role
}

export function StagePipelinePerformanceChart({ role = 'lead' }: StagePipelinePerformanceChartProps) {
  const [leadChartView, setLeadChartView] = useState<'individual' | 'team'>('individual')
  const [selectedTeammate, setSelectedTeammate] = useState<string>('All Team Members')

  const data = React.useMemo(
    () => resolveStagePipelineData(leadChartView, selectedTeammate),
    [leadChartView, selectedTeammate],
  )

  const totalReqs = data.reduce((acc, curr) => acc + (Number(curr.requirementsCount) || 0), 0)
  const totalPositions = data.reduce((acc, curr) => acc + (Number(curr.positionsCount) || 0), 0)
  const totalSubs = data.reduce((acc, curr) => acc + (Number(curr.submissionsCount) || 0), 0)
  const totalPlaced = data.reduce((acc, curr) => acc + (Number(curr.placedCount) || 0), 0)
  const totalClosures = data.reduce((acc, curr) => acc + (Number(curr.closuresCount) || 0), 0)

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6 font-sans">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-[#6B3BF6]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {role === 'lead'
                ? leadChartView === 'individual'
                  ? 'Lead Individual Pipeline: Requirements, Positions & Candidate Submissions by Stage'
                  : selectedTeammate !== 'All Team Members'
                  ? `${selectedTeammate}: Stage Pipeline Performance Breakdown`
                  : 'Team Members Comparison: Interview Stage Pipeline Breakdown'
                : 'Requirements, Positions & Candidate Submissions by Interview Stage'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {role === 'lead'
              ? leadChartView === 'individual'
                ? 'Individual recruitment pipeline progression with total position counts across L1, L2, L3, and Final rounds for Harish Gadipally'
                : selectedTeammate !== 'All Team Members'
                ? `Stage pipeline progression and candidate volume for ${selectedTeammate}`
                : 'Team members pipeline progression comparison across L1, L2, L3, and Final interview rounds'
              : 'Recruitment pipeline progression showing candidate volume & total requirement positions across L1, L2, L3, and Final rounds'}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <StagePipelineSummaryTable
          data={data}
          totalReqs={totalReqs}
          totalPositions={totalPositions}
          totalSubs={totalSubs}
          totalPlaced={totalPlaced}
          totalClosures={totalClosures}
        />
        <StagePipelineBarChart data={data} />
      </div>

      <StagePipelineDetailsTable />
    </div>
  )
}
