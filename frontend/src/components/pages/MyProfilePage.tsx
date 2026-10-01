import React, { useState } from 'react'
import { Pencil, ShieldCheck } from 'lucide-react'
import { Role } from '../../types'
import { getSessionUser, setSessionUser } from '../../store/session'
import { SEED_ACCOUNTS } from '../../data/seedCredentials'
import { MyProfileDetailsCard } from './MyProfilePage.details'
import { usersService } from '../../services/workspace.service'

interface MyProfilePageProps {
  role: Role
}

export function MyProfilePage({ role }: MyProfilePageProps) {
  const session = getSessionUser()
  const defaultAccount = session
    ? { name: session.name, email: session.email, title: session.title || '' }
    : SEED_ACCOUNTS[role] || {
    name: 'Harish Gadipally',
    email: 'harish.g@metaforgeit.com',
    title: 'Senior Recruiting Lead',
  }

  // Local state for profile details dynamically initialized from DEMO_ACCOUNTS
  const [name, setName] = useState(defaultAccount.name)
  const [email, setEmail] = useState(defaultAccount.email)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [editName, setEditName] = useState(name)
  const [editEmail, setEditEmail] = useState(email)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editEmail.trim() || isSaving) return

    setIsSaving(true)
    try {
      await usersService.updateMe({ name: editName.trim() })
      setName(editName.trim())
      setEmail(editEmail.trim())
      const currentSession = getSessionUser()
      if (currentSession) {
        setSessionUser({ ...currentSession, name: editName.trim() })
      }
      setIsEditing(false)
      setToastMessage('Profile information updated successfully!')
    } catch (err: any) {
      setToastMessage(err?.message || 'Failed to update profile information')
    } finally {
      setIsSaving(false)
      setTimeout(() => {
        setToastMessage(null)
      }, 4000)
    }
  }

  const handleCancel = () => {
    setEditName(name)
    setEditEmail(email)
    setIsEditing(false)
  }

  const roleLabel =
    role === 'superadmin'
      ? 'Super Admin'
      : role === 'admin'
      ? 'Administrator'
      : role === 'lead'
      ? 'Team Lead'
      : 'Recruiter'

  return (
    <div className="w-full space-y-6 pb-12 font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          My Profile
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Manage your profile and login details
        </p>
      </div>

      <MyProfileDetailsCard
        name={name}
        email={email}
        roleLabel={roleLabel}
        isEditing={isEditing}
        editName={editName}
        editEmail={editEmail}
        setEditName={setEditName}
        setEditEmail={setEditEmail}
        onStartEdit={() => {
          setEditName(name)
          setEditEmail(email)
          setIsEditing(true)
        }}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
