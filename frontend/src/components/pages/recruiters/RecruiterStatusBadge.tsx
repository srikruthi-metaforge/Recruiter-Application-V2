import { Award, CheckCircle2, AlertCircle } from 'lucide-react'
import { RecruiterOverviewItem } from './types'

export function RecruiterStatusBadge({ status }: { status: RecruiterOverviewItem['performanceStatus'] }) {
    switch (status) {
      case 'Top Performer':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Top Performer</span>
          </span>
        )
      case 'Needs Attention':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Needs Attention</span>
          </span>
        )
      case 'On Track':
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-900 border border-blue-200 flex items-center gap-1.5 w-fit shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>On Track</span>
          </span>
        )
    }
}
