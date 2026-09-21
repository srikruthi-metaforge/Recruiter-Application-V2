import { Users, User } from 'lucide-react'
import { TeamLeadGroup } from './types'

interface Props {
  filteredTeams: TeamLeadGroup[]
}

export function TeamsHierarchyList({ filteredTeams }: Props) {
  return (
      <div className="space-y-6">
        {filteredTeams.map(team => (
          <div
            key={team.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all hover:border-purple-200 font-sans"
          >
            {/* Team Header Bar */}
            <div className="bg-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-600/30 text-purple-300 font-extrabold flex items-center justify-center text-lg border border-purple-500/40">
                  {team.leadAvatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-white">{team.teamName}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Primary Client: {team.primaryClient}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">
                    Team Lead: <strong className="text-white">{team.leadName}</strong> ({team.leadEmail})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-extrabold text-purple-300 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Team Size: {team.membersCount} Recruiters</span>
                </div>
              </div>
            </div>

            {/* Team Lead Profile Summary & Team Members Breakdown */}
            <div className="p-6 space-y-6">
              {/* Team Lead Overview Box */}
              <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center text-sm border border-purple-700 shadow-2xs">
                    {team.leadAvatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-slate-900">{team.leadName}</h3>
                      <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-extrabold border border-purple-300">
                        Team Lead
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{team.leadRole} • {team.leadEmail}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Assigned Reqs</span>
                    <span className="text-sm font-extrabold text-blue-600 tabular-nums">{team.leadRequirementsCount} Reqs</span>
                  </div>
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Lead Submissions</span>
                    <span className="text-sm font-extrabold text-purple-700 tabular-nums">{team.leadSubmissionsCount} Submissions</span>
                  </div>
                </div>
              </div>

              {/* Team Members List Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#6B3BF6]" />
                    <span>Recruiters In {team.leadName}'s Team ({team.membersCount} Members)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    All members dedicated to {team.primaryClient}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {team.members.map(member => (
                    <div
                      key={member.id}
                      className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 space-y-3 hover:bg-purple-50/40 hover:border-purple-200 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-[#6B3BF6] font-extrabold flex items-center justify-center text-xs shrink-0 border border-purple-200">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{member.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{member.role}</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-200/60 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Primary Client:</span>
                          <span className="font-extrabold text-purple-900">{member.primaryClient}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Active Reqs:</span>
                          <span className="font-extrabold text-blue-600 tabular-nums">{member.requirementsCount} Reqs</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Total Submissions:</span>
                          <span className="font-extrabold text-purple-700 tabular-nums">{member.submissionsCount} Submissions</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
  )
}
