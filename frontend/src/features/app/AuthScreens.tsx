import React from 'react'
import { AuthScreen, Role } from '../../types'
import { RoleSelectPage } from '../../components/auth/RoleSelectPage'
import { RoleLoginPage } from '../../components/auth/RoleLoginPage'
import { ForgotPasswordPage } from '../../components/auth/ForgotPasswordPage'
import { LandingPage } from '../../components/landing/LandingPage'
import { SignInPage } from '../../components/auth/SignInPage'
import { SignUpPage } from '../../components/auth/SignUpRequestPage'
import { PasswordRecoveryFlow } from '../../components/auth/PasswordRecoveryFlow'

interface AuthScreensProps {
  screen: AuthScreen
  loginRole: Role
  recoveryEmail: string
  setScreen: (screen: AuthScreen) => void
  setLoginRole: (role: Role) => void
  setRecoveryEmail: (email: string) => void
  onAuthenticated: (role: Role) => void
}

export function AuthScreens({
  screen,
  loginRole,
  recoveryEmail,
  setScreen,
  setLoginRole,
  setRecoveryEmail,
  onAuthenticated,
}: AuthScreensProps) {
  if (screen === 'landing') {
    return (
      <LandingPage
        onSignIn={() => setScreen('signin')}
        onRequestAccess={() => setScreen('signup')}
      />
    )
  }

  if (screen === 'signin') {
    return (
      <SignInPage
        onLogin={onAuthenticated}
        onForgot={email => {
          setRecoveryEmail(email || '')
          setScreen('password-recovery')
        }}
        onSignup={() => setScreen('signup')}
        onBack={() => setScreen('landing')}
        onRolePortals={() => setScreen('role-select')}
      />
    )
  }

  if (screen === 'signup') {
    return <SignUpPage onBack={() => setScreen('signin')} onSubmitted={() => setScreen('signin')} />
  }

  if (screen === 'password-recovery') {
    return <PasswordRecoveryFlow initialEmail={recoveryEmail} onExit={() => setScreen('signin')} />
  }

  if (screen === 'role-select') {
    return (
      <RoleSelectPage
        onSelectRole={r => {
          setLoginRole(r)
          setScreen('role-login')
        }}
        onBack={() => setScreen('signin')}
      />
    )
  }

  if (screen === 'role-login') {
    return (
      <RoleLoginPage
        role={loginRole}
        onLogin={onAuthenticated}
        onBack={() => setScreen('role-select')}
        onForgot={() => setScreen('forgot')}
      />
    )
  }

  if (screen === 'forgot') {
    return (
      <ForgotPasswordPage
        onBack={() => setScreen('role-login')}
        onSent={() => setScreen('role-login')}
      />
    )
  }

  return null
}
