import React, { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Role } from '../../types'
import { AuthLayout } from './AuthLayout'
import { SignupPageStep1, SignupPageStep2 } from './SignupPage.steps'

interface SignupPageProps {
  onBack: () => void
  onSuccess: () => void
}

export function SignupPage({ onBack, onSuccess }: SignupPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: 'recruiter' as Role,
    password: '',
    confirm: '',
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const validateStep1 = () => {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = 'First name required'
    if (!form.lastName.trim()) errs.lastName = 'Last name required'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid work email required'
    if (!form.company.trim()) errs.company = 'Company name required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs: Record<string, string> = {}
    if (!form.password || form.password.length < 8) errs.password = 'Minimum 8 characters'
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match'
    if (!form.agreeTerms) errs.agreeTerms = 'Must agree to terms'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    setSubmitted(true)
    setTimeout(onSuccess, 1800)
  }

  if (submitted) {
    return (
      <AuthLayout>
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5 text-center">
          <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans mb-2 tracking-tight">Access Request Submitted!</h2>
          <p className="text-sm text-slate-500 font-normal mb-6">
            An admin will review and activate your agency workspace within 24 hours.
          </p>
          <p className="text-xs text-slate-400 font-mono">Redirecting to sign in...</p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 lg:p-12 shadow-2xl shadow-slate-900/5">
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                  step === s ? 'bg-blue-600 text-white ring-4 ring-blue-600/15' : step > s ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              <span className={`text-xs font-mono font-semibold ${step === s ? 'text-slate-900' : 'text-slate-400'}`}>
                {s === 1 ? 'Profile Details' : 'Security Credentials'}
              </span>
              {s < 2 && <div className="w-10 h-px bg-slate-200 mx-1" />}
            </div>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mb-2">
          {step === 1 ? 'Request Enterprise Access' : 'Create Account Password'}
        </h1>
        <p className="text-sm text-slate-500 font-normal mb-8 leading-relaxed">
          {step === 1 ? 'Enter your professional details to join your agency workspace.' : 'Set up credentials to access your TalentFlow account.'}
        </p>

        {step === 1 && <SignupPageStep1 form={form} setForm={setForm} errors={errors} onNext={handleNext} />}
        {step === 2 && (
          <SignupPageStep2
            form={form}
            setForm={setForm}
            errors={errors}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
          />
        )}

        <p className="text-center text-xs sm:text-sm text-slate-500 font-normal mt-8">
          Already have an account?{' '}
          <button onClick={onBack} className="text-blue-600 font-semibold hover:underline">
            Sign In →
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}
