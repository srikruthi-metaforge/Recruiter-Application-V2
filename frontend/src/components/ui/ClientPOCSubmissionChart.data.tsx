import { Role } from '../../types'

export interface ClientPOCMetric {
  pocName: string
  submissions: number
  totalRequirements: number
}

export const CLIENT_POC_DATA: ClientPOCMetric[] = [
  { pocName: 'Kallol Chakraborty', submissions: 253, totalRequirements: 85 },
  { pocName: 'Trayeetanu Ganguly', submissions: 20, totalRequirements: 9 },
  { pocName: 'Pranati Paul', submissions: 9, totalRequirements: 4 },
  { pocName: 'Kiran N', submissions: 4, totalRequirements: 2 },
  { pocName: 'LTTS (generic mailbox)', submissions: 3, totalRequirements: 1 },
  { pocName: 'Janani', submissions: 2, totalRequirements: 1 },
  { pocName: 'Vinaya Kumar Patil', submissions: 2, totalRequirements: 1 },
  { pocName: 'Internal (data entry)', submissions: 1, totalRequirements: 1 },
  { pocName: 'Nikitha', submissions: 1, totalRequirements: 1 },
  { pocName: 'Pampa Sengarai', submissions: 1, totalRequirements: 1 },
]

export const LEAD_CLIENT_POC_DATA: ClientPOCMetric[] = [
  { pocName: 'Accenture Tech Hiring Desk', submissions: 142, totalRequirements: 45 },
  { pocName: 'Accenture Cloud Delivery POC', submissions: 84, totalRequirements: 24 },
  { pocName: 'LTTS Automotive Desk', submissions: 46, totalRequirements: 14 },
]

export const RECRUITER_PERSONAL_CLIENT_POC_DATA: ClientPOCMetric[] = [
  { pocName: 'Accenture Enterprise (Marcus)', submissions: 24, totalRequirements: 6 },
  { pocName: 'Goldman Sachs Tech (Marcus)', submissions: 16, totalRequirements: 4 },
  { pocName: 'Tesla Mobility (Marcus)', submissions: 9, totalRequirements: 2 },
  { pocName: 'LTTS / L&T (Marcus)', submissions: 5, totalRequirements: 2 },
]

export interface ClientPOCSubmissionChartProps {
  role?: Role
  recruiterName?: string
}

export const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-blue-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
          <span>{dataObj.pocName}</span>
          <span className="text-[10px] text-slate-400 font-normal">Client POC</span>
        </div>
        <div className="space-y-1 text-[11px] font-medium pt-0.5">
          <div className="flex justify-between gap-6">
            <span className="text-blue-400 font-bold">No. of Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.submissions}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-red-400 font-bold">Total Requirements (unique):</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalRequirements}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
