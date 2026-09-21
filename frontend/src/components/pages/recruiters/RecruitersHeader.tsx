import { Users, UserPlus, User } from 'lucide-react'

interface Props { role: string; showToast: (m: string) => void; setIsAddModalOpen: (v: boolean) => void }
export function RecruitersHeader({ role, showToast, setIsAddModalOpen }: Props) {
  return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recruiters Performance & Assignments</h1>
            <span className="px-3 py-1 bg-purple-50 text-[#6B3BF6] text-xs font-extrabold rounded-full border border-purple-200 flex items-center gap-1.5 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#6B3BF6]" />
              <span>All Active Recruiters</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track recruiter performance metrics including assigned client accounts, total requirements, submissions, and SLA TAT speed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (role === 'admin') {
                showToast('Notice: User/Recruiter creation is permitted by Super Admin and Dev Team only.')
              } else {
                setIsAddModalOpen(true)
              }
            }}
            className="px-4 py-2.5 bg-[#6B3BF6] hover:bg-[#5833E0] text-white text-xs font-extrabold rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>+ Add New Recruiter</span>
          </button>
        </div>
      </div>
  )
}
