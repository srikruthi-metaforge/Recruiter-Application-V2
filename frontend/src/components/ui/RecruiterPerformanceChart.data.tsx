export interface RecruiterChartMetric {
  name: string
  fullName: string
  totalSubmissions: number
  totalRequirements: number
  firstSubmissions: number
  avgTATDays: number
}

export const ALL_RECRUITERS_DATA: RecruiterChartMetric[] = [
  { name: 'lakshmi.v', fullName: 'lakshmi.v Recruiter', totalSubmissions: 143, totalRequirements: 69, firstSubmissions: 53, avgTATDays: 0.62 },
  { name: 'Suresh k.', fullName: 'Suresh kulkarni', totalSubmissions: 40, totalRequirements: 26, firstSubmissions: 13, avgTATDays: 3.31 },
  { name: 'Charlie D.', fullName: 'Charlie Darwin', totalSubmissions: 37, totalRequirements: 27, firstSubmissions: 22, avgTATDays: 3.32 },
  { name: 'Harini S.', fullName: 'Harini Sindey', totalSubmissions: 32, totalRequirements: 13, firstSubmissions: 6, avgTATDays: 0.67 },
  { name: 'rahimoon S.', fullName: 'rahimoon Shaik', totalSubmissions: 24, totalRequirements: 14, firstSubmissions: 11, avgTATDays: 1.18 },
  { name: 'Lingoji P.', fullName: 'Lingoji Pavani', totalSubmissions: 11, totalRequirements: 7, firstSubmissions: 4, avgTATDays: 0.25 },
  { name: 'Viswanath R.', fullName: 'Viswanath Reddy', totalSubmissions: 5, totalRequirements: 4, firstSubmissions: 2, avgTATDays: 2.0 },
  { name: 'Rachana G.', fullName: 'Rachana Golkonda', totalSubmissions: 3, totalRequirements: 3, firstSubmissions: 0, avgTATDays: 0.0 },
  { name: 'Nithya M.', fullName: 'Nithya Maripelly', totalSubmissions: 1, totalRequirements: 1, firstSubmissions: 1, avgTATDays: 4.0 },
]

export const RECRUITER_PERSONAL_TREND_DATA: RecruiterChartMetric[] = [
  { name: 'May 2026', fullName: 'May 2026 Performance', totalSubmissions: 28, totalRequirements: 10, firstSubmissions: 8, avgTATDays: 3.2 },
  { name: 'Jun 2026', fullName: 'June 2026 Performance', totalSubmissions: 36, totalRequirements: 12, firstSubmissions: 10, avgTATDays: 2.8 },
  { name: 'Jul 2026', fullName: 'July 2026 Performance', totalSubmissions: 42, totalRequirements: 14, firstSubmissions: 12, avgTATDays: 2.1 },
  { name: 'Aug 2026', fullName: 'August 2026 (MTD)', totalSubmissions: 36, totalRequirements: 9, firstSubmissions: 8, avgTATDays: 1.9 },
]

export const LEAD_PERSONAL_TREND_DATA: RecruiterChartMetric[] = [
  { name: 'May 2026', fullName: 'May 2026 Performance', totalSubmissions: 34, totalRequirements: 11, firstSubmissions: 12, avgTATDays: 2.4 },
  { name: 'Jun 2026', fullName: 'June 2026 Performance', totalSubmissions: 40, totalRequirements: 12, firstSubmissions: 14, avgTATDays: 1.8 },
  { name: 'Jul 2026', fullName: 'July 2026 Performance', totalSubmissions: 42, totalRequirements: 13, firstSubmissions: 15, avgTATDays: 1.4 },
  { name: 'Aug 2026', fullName: 'August 2026 (MTD)', totalSubmissions: 26, totalRequirements: 9, firstSubmissions: 7, avgTATDays: 1.2 },
]

export const LEAD_TEAM_CHART_DATA: RecruiterChartMetric[] = [
  { name: 'Harish G. (Lead)', fullName: 'Harish Gadipally (Team Lead)', totalSubmissions: 142, totalRequirements: 45, firstSubmissions: 48, avgTATDays: 1.2 },
  { name: 'Marcus C.', fullName: 'Marcus Chen (Senior Recruiter)', totalSubmissions: 48, totalRequirements: 14, firstSubmissions: 18, avgTATDays: 1.5 },
  { name: 'Priya S.', fullName: 'Priya Sharma (IT Recruiter)', totalSubmissions: 36, totalRequirements: 12, firstSubmissions: 14, avgTATDays: 1.8 },
  { name: 'Suresh K.', fullName: 'Suresh kulkarni (Recruiter)', totalSubmissions: 46, totalRequirements: 27, firstSubmissions: 16, avgTATDays: 2.1 },
]

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-2 font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-blue-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-6">
          <span>{dataObj.fullName || label}</span>
          <span className="text-[10px] text-slate-400 font-normal">Recharts Engine</span>
        </div>
        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-4">
            <span className="text-blue-400 font-bold">Total Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalSubmissions}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-red-400 font-bold">Total Requirements:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalRequirements}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400 font-bold">First Submissions (won):</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.firstSubmissions}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-purple-300 font-bold">
            <span>Avg First-Submission TAT:</span>
            <span className="tabular-nums text-purple-300">{dataObj.avgTATDays} Days</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
