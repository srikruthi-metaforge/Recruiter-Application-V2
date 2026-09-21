import { Building, Building2 } from 'lucide-react'

export function ClientWorkload() {
  return (
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#6B3BF6]" />
            <h3 className="text-base font-bold text-slate-900">
              Client Account Workload Distribution Across Team
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Recruiter allocations per client account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              client: 'Accenture',
              recruiterCount: 4,
              recruiters: ['Marcus Chen', 'Priya Sharma', 'Adirala Sathvika', 'Harish Gadipally'],
              activeReqs: 11,
              subs: 126,
            },
            {
              client: 'Goldman Sachs',
              recruiterCount: 3,
              recruiters: ['Marcus Chen', 'Adirala Sathvika', 'Harish Gadipally'],
              activeReqs: 6,
              subs: 56,
            },
            {
              client: 'LTTS Automotive',
              recruiterCount: 4,
              recruiters: ['Marcus Chen', 'Suresh Kulkarni', 'Arvind GR', 'Harish Gadipally'],
              activeReqs: 8,
              subs: 60,
            },
            {
              client: 'Infosys',
              recruiterCount: 3,
              recruiters: ['Priya Sharma', 'Suresh Kulkarni', 'Harish Gadipally'],
              activeReqs: 5,
              subs: 40,
            },
          ].map(c => (
            <div key={c.client} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">{c.client}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-[#6B3BF6]">
                  {c.recruiterCount} Recruiters
                </span>
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                <strong className="text-slate-800">Assigned:</strong> {c.recruiters.join(', ')}
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                <span>Active Reqs: <strong className="text-blue-700">{c.activeReqs}</strong></span>
                <span>Submissions: <strong className="text-[#6B3BF6]">{c.subs}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
