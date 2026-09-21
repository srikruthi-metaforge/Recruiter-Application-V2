import React, { useState } from 'react'
import { Pencil, ShieldCheck } from 'lucide-react'
import { Role } from '../../types'
import { DEMO_ACCOUNTS } from '../../data/mockData'
import { MyProfileDetailsCard } from './MyProfilePage.details'

interface MyProfilePageProps {
  role: Role
}

export function MyProfilePage({ role }: MyProfilePageProps) {
  const defaultAccount = DEMO_ACCOUNTS[role] || {
    name: 'Harish Gadipally',
    email: 'harish.g@metaforgeit.com',
    title: 'Senior Recruiting Lead',
  }

  // Local state for profile details dynamically initialized from DEMO_ACCOUNTS
  const [name, setName] = useState(defaultAccount.name)
  const [email, setEmail] = useState(defaultAccount.email)
  const [isEditing, setIsEditing] = useState(false)

  const [editName, setEditName] = useState(name)
  const [editEmail, setEditEmail] = useState(email)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editName.trim() || !editEmail.trim()) return

    setName(editName.trim())
    setEmail(editEmail.trim())
    setIsEditing(false)

    setToastMessage('Profile information updated successfully!')
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
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
