import React from 'react'
import { AlertCircle, CheckCircle2, Building2 } from 'lucide-react'
import { Recruiter } from '../../types'
import { ProgressBar } from './ProgressBar'

export function RecruiterAnalyticsTableRow({ r }: { r: Recruiter }) {
  const totalInt = r.interviews || (r.l1Interviews + r.l2Interviews + r.customInterviews + r.finalInterviews)
  const isPositive = r.taskStatus === 'POSITIVE'

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold font-mono shadow-xs ${
              isPositive ? 'bg-indigo-600' : 'bg-rose-500'
            }`}
          >
            {r.name
              .split(' ')
              .map(n => n[0])
              .join('')}
          </div>
          <div>
            <p className="font-bold text-slate-900 font-sans text-sm">{r.name}</p>
            <p className="text-[10px] font-mono text-slate-400">
              Lead: {r.lead} · Admin: {r.admin}
            </p>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4 text-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
          {r.requirementsCount || 4} Reqs
        </span>
      </td>

      <td className="py-3.5 px-4 text-center">
        <p className="text-sm font-bold font-mono text-blue-600">{r.submissions}</p>
        <p className="text-[9px] font-mono text-slate-400">+{r.today} today</p>
      </td>

      <td className="py-3.5 px-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-slate-900">{totalInt} Total Interviews</span>
          </div>
          <div className="flex flex-wrap items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold" title="Level 1 Technical">
              L1: {r.l1Interviews}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold" title="Level 2 Technical">
              L2: {r.l2Interviews}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 font-semibold" title="Custom Client Round">
              Custom: {r.customInterviews}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold" title="Final HR / Manager Round">
              Final: {r.finalInterviews}
            </span>
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-slate-500">Weekly Quota</span>
            <span className="font-bold text-slate-900">{r.weeklyProgress}%</span>
          </div>
          <ProgressBar
            value={r.weeklyProgress}
            max={100}
            color={isPositive ? '#10B981' : '#F43F5E'}
            height="h-2"
          />
        </div>
      </td>

      <td className="py-3.5 px-4 text-center">
        {isPositive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> POSITIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs">
            <AlertCircle className="w-3 h-3 text-rose-600" /> CRITICAL
          </span>
        )}
      </td>

      <td className="py-3.5 px-4 font-mono text-xs">
        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
          {r.submissionType}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <div>
            <p className="font-bold text-slate-900 font-sans text-xs">{r.primaryClient}</p>
            <p className="text-[10px] font-mono text-emerald-600 font-semibold">
              {r.placements} Placements
            </p>
          </div>
        </div>
      </td>
    </tr>
  )
}
