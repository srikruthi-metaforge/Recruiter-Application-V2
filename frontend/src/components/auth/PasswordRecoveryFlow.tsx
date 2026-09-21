import React, { useState } from 'react'
import { generateVerificationCode } from '../../data/authService'
import { ForgotPasswordRequestPage } from './ForgotPasswordRequestPage'
import { VerifyCodePage } from './VerifyCodePage'
import { ResetPasswordPage } from './ResetPasswordPage'

interface PasswordRecoveryFlowProps {
  /** Pre-fills the email step when the user came from sign in */
  initialEmail?: string
  /** Leaves the recovery flow and returns to sign in */
  onExit: () => void
}

type RecoveryStep = 'request' | 'verify' | 'reset'

/**
 * Orchestrates the password recovery journey:
 * enter email → verification code → new password → success → sign in.
 */
export function PasswordRecoveryFlow({ initialEmail = '', onExit }: PasswordRecoveryFlowProps) {
  const [step, setStep] = useState<RecoveryStep>('request')
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')

  if (step === 'verify') {
    return (
      <VerifyCodePage
        email={email}
        expectedCode={code}
        onVerified={() => setStep('reset')}
        onResend={() => setCode(generateVerificationCode())}
        onBack={() => setStep('request')}
      />
    )
  }

  if (step === 'reset') {
    return <ResetPasswordPage email={email} onDone={onExit} onBack={() => setStep('verify')} />
  }

  return (
    <ForgotPasswordRequestPage
      initialEmail={email}
      onCodeSent={nextEmail => {
        setEmail(nextEmail)
        setCode(generateVerificationCode())
        setStep('verify')
      }}
      onBack={onExit}
    />
  )
}
