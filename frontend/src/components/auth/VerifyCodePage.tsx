import React, { useEffect, useRef, useState } from 'react'
import { MailCheck, ShieldCheck } from 'lucide-react'
import { VERIFICATION_CODE_LENGTH } from '../../data/authService'
import { AuthCard, AuthIconTile, AuthShell } from './AuthShell'
import { AuthAlert, SubmitButton } from './AuthFormControls'
import { VerifyCodeInputs } from './VerifyCodePage.inputs'

interface VerifyCodePageProps {
  email: string
  /** The code that was issued for this recovery attempt */
  expectedCode: string
  onVerified: () => void
  onResend: () => void
  /** Back to the email entry step */
  onBack: () => void
}

const RESEND_SECONDS = 30

export function VerifyCodePage({ email, expectedCode, onVerified, onResend, onBack }: VerifyCodePageProps) {
  const [digits, setDigits] = useState<string[]>(Array(VERIFICATION_CODE_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  const inputs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setInterval(() => setSecondsLeft(s => (s <= 1 ? 0 : s - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const code = digits.join('')

  const writeDigits = (next: string[]) => {
    setDigits(next)
    setError('')
  }

  const handleChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, '')
    if (!value) {
      const next = [...digits]
      next[index] = ''
      writeDigits(next)
      return
    }

    const next = [...digits]
    // Support pasting / fast typing of multiple digits at once
    value.split('').forEach((char, offset) => {
      if (index + offset < VERIFICATION_CODE_LENGTH) next[index + offset] = char
    })
    writeDigits(next)

    const focusAt = Math.min(index + value.length, VERIFICATION_CODE_LENGTH - 1)
    inputs.current[focusAt]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) inputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < VERIFICATION_CODE_LENGTH - 1) inputs.current[index + 1]?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (code.length < VERIFICATION_CODE_LENGTH) {
      setError(`Enter all ${VERIFICATION_CODE_LENGTH} digits of your verification code`)
      return
    }

    setError('')
    setLoading(true)

    window.setTimeout(() => {
      if (code === expectedCode) {
        onVerified()
        return
      }
      setLoading(false)
      setError('That verification code is incorrect or has expired. Request a new code and try again.')
    }, 600)
  }

  const handleResend = () => {
    setDigits(Array(VERIFICATION_CODE_LENGTH).fill(''))
    setError('')
    setSecondsLeft(RESEND_SECONDS)
    inputs.current[0]?.focus()
    onResend()
  }

  return (
    <AuthShell
      backLabel="Change email address"
      onBack={onBack}
      eyebrow="Two-Step Verification"
      headline={
        <>
          Verify it&apos;s really
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            you requesting this reset.
          </span>
        </>
      }
      description="A single-use verification code protects your workspace from unauthorised password resets."
      bullets={[
        'Codes are valid for 10 minutes and single-use only',
        'Failed attempts are recorded against your account',
        'Nothing changes until you set a new password',
      ]}
      aside={
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 shadow-xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5 mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Demo Verification Code
          </p>
          <p className="text-2xl font-mono font-bold text-white tracking-[0.35em]">{expectedCode}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-2 leading-relaxed">
            No mail server is wired up in this build, so the issued code is shown here.
          </p>
        </div>
      }
    >
      <AuthCard>
        <AuthIconTile icon={MailCheck} tone="blue" />

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans tracking-tight mb-2">
          Check your inbox
        </h2>
        <p className="text-sm text-slate-500 mb-8 font-normal leading-relaxed">
          We sent a {VERIFICATION_CODE_LENGTH}-digit verification code to{' '}
          <span className="text-slate-900 font-semibold">{email}</span>. Enter it below to continue.
        </p>

        {/* The showcase panel carries this hint on desktop; repeat it for small screens. */}
        <div className="lg:hidden mb-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
            Demo Verification Code
          </p>
          <p className="text-xl font-mono font-bold text-slate-900 tracking-[0.3em]">{expectedCode}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <VerifyCodeInputs
            digits={digits}
            error={error}
            loading={loading}
            inputs={inputs}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />

          {error && <AuthAlert tone="error">{error}</AuthAlert>}

          <SubmitButton loading={loading} loadingLabel="Verifying code…">
            Verify & Continue
          </SubmitButton>
        </form>

        <div className="mt-7 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">Didn&apos;t receive the code?</span>
          {secondsLeft > 0 ? (
            <span className="text-xs font-mono text-slate-400">Resend available in {secondsLeft}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-blue-600 font-semibold hover:underline text-left cursor-pointer"
            >
              Resend verification code →
            </button>
          )}
        </div>
      </AuthCard>
    </AuthShell>
  )
}
