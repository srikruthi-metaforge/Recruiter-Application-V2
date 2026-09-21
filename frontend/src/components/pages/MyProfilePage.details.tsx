import React from 'react'
import { Check, Pencil, User, Mail, Briefcase } from 'lucide-react'

interface MyProfileDetailsCardProps {
  name: string
  email: string
  roleLabel: string
  isEditing: boolean
  editName: string
  editEmail: string
  setEditName: (value: string) => void
  setEditEmail: (value: string) => void
  onStartEdit: () => void
  onSave: (e: React.FormEvent) => void
  onCancel: () => void
}

export function MyProfileDetailsCard({
  name,
  email,
  roleLabel,
  isEditing,
  editName,
  editEmail,
  setEditName,
  setEditEmail,
  onStartEdit,
  onSave,
  onCancel,
}: MyProfileDetailsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100/90 text-slate-400 flex items-center justify-center border border-slate-200/60 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Personal Details
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Your personal details and account information
            </p>
          </div>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={onStartEdit}
            className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={onSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Full Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6B3BF6] focus:bg-white transition-all"
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={editEmail}
                onChange={e => setEditEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#6B3BF6] focus:bg-white transition-all"
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#6B3BF6] hover:bg-[#5833E0] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Name</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{name}</div>
            </div>
          </div>
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Email</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{email}</div>
            </div>
          </div>
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-400">Role</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{roleLabel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
