import { Search, ChevronDown } from 'lucide-react'

interface Props {
  searchQuery: string
  setSearchQuery: (v: string) => void
  clientFilter: string
  setClientFilter: (v: string) => void
  teamLeadFilter: string
  setTeamLeadFilter: (v: string) => void
  sortBy: 'submissions' | 'tat' | 'reqs'
  setSortBy: (v: 'submissions' | 'tat' | 'reqs') => void
  uniqueClients: string[]
  uniqueLeads: string[]
  setCurrentPage: (n: number) => void
}
export function RecruitersFilters(p: Props) {
  const { searchQuery, setSearchQuery, clientFilter, setClientFilter, teamLeadFilter, setTeamLeadFilter, sortBy, setSortBy, uniqueClients, uniqueLeads, setCurrentPage } = p
  const uniqueTeamLeads = uniqueLeads
  return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recruiter name, team lead, or client..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#6B3BF6] text-slate-800 font-medium"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Client Filter */}
            <div className="relative">
              <select
                value={clientFilter}
                onChange={e => {
                  setClientFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
              >
                <option value="All Clients">All Assigned Clients</option>
                {uniqueClients.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Team Lead Filter */}
            <div className="relative">
              <select
                value={teamLeadFilter}
                onChange={e => {
                  setTeamLeadFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-[#6B3BF6] cursor-pointer"
              >
                <option value="All Team Leads">All Team Leads</option>
                {uniqueTeamLeads.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="appearance-none pl-3.5 pr-8 py-2 text-xs bg-purple-50 text-[#6B3BF6] border border-purple-200 rounded-xl font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="submissions">Sort: Highest Submissions</option>
                <option value="tat">Sort: Fastest TAT (Turnaround)</option>
                <option value="reqs">Sort: Total Requirements</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B3BF6] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
  )
}
