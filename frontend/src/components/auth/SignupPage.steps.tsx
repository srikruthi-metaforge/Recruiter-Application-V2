import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Role } from '../../types'

export function SignupPageStep1({
  form,
  setForm,
  errors,
  onNext,
}: {
  form: {
    firstName: string
    lastName: string
    email: string
    company: string
    role: Role
  }
  setForm: (form: any) => void
  errors: Record<string, string>
  onNext: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onNext} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">First Name</label>
          <input
            type="text"
            placeholder="Jane"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
          />
          {errors.firstName && <p className="text-xs font-mono text-rose-500">{errors.firstName}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Last Name</label>
          <input
            type="text"
            placeholder="Smith"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
          />
          {errors.lastName && <p className="text-xs font-mono text-rose-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Work Email Address</label>
        <input
          type="email"
          placeholder="jane@company.com"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
        />
        {errors.email && <p className="text-xs font-mono text-rose-500">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Agency / Organization</label>
        <input
          type="text"
          placeholder="Acme Staffing Inc."
          value={form.company}
          onChange={e => setForm({ ...form, company: e.target.value })}
          className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
        />
        {errors.company && <p className="text-xs font-mono text-rose-500">{errors.company}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Requested Platform Role</label>
        <select
          value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value as Role })}
          className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-mono font-medium"
        >
          <option value="recruiter">Recruiter (Candidate Submissions)</option>
          <option value="lead">Team Lead (Team Oversight)</option>
          <option value="admin">Admin (Regional Management)</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full h-12 sm:h-13 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 mt-6 cursor-pointer"
      >
        <span>Continue to Security</span> <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  )
}

export function SignupPageStep2({
  form,
  setForm,
  errors,
  onBack,
  onSubmit,
}: {
  form: { password: string; confirm: string; agreeTerms: boolean }
  setForm: (form: any) => void
  errors: Record<string, string>
  onBack: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Account Password</label>
        <input
          type="password"
          placeholder="Minimum 8 characters"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
        />
        {errors.password && <p className="text-xs font-mono text-rose-500">{errors.password}</p>}
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700">Confirm Password</label>
        <input
          type="password"
          placeholder="Re-enter password"
          value={form.confirm}
          onChange={e => setForm({ ...form, confirm: e.target.value })}
          className="w-full h-12 px-4 text-sm bg-slate-50/70 border border-slate-300 rounded-xl focus:outline-none focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 font-medium"
        />
        {errors.confirm && <p className="text-xs font-mono text-rose-500">{errors.confirm}</p>}
      </div>

      <label className="flex items-start gap-2.5 cursor-pointer pt-2">
        <input
          type="checkbox"
          checked={form.agreeTerms}
          onChange={e => setForm({ ...form, agreeTerms: e.target.checked })}
          className="mt-1 rounded border-slate-300 accent-blue-600 w-4 h-4"
        />
        <span className="text-xs text-slate-600 font-normal">
          I agree to the Terms of Service & Privacy Policy
        </span>
      </label>
      {errors.agreeTerms && <p className="text-xs font-mono text-rose-500">{errors.agreeTerms}</p>}

      <div className="flex gap-4 pt-3">
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-5 border border-slate-300 text-slate-700 rounded-xl text-xs font-mono font-semibold hover:bg-slate-50 cursor-pointer"
        >
          ← Back
        </button>
        <button
          type="submit"
          className="flex-1 h-12 sm:h-13 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
        >
          Submit Access Request
        </button>
      </div>
    </form>
  )
}
