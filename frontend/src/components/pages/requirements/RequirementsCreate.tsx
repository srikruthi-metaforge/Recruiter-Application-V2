import React, { useState } from 'react'
import { CreateJobDemandForm } from '../CreateJobDemandForm'
import { RequirementsVm } from './useRequirementsPage'

export function RequirementsCreate({ vm }: { vm: RequirementsVm }) {
  const {
    onAddRequirement,
    onUpdateRequirements,
    localRequirements,
    setLocalRequirements,
    setIsCreatingDemand,
    roleLabel,
  } = vm
  const [saving, setSaving] = useState(false)
  return (
    <CreateJobDemandForm
      userRole={roleLabel}
      mode="create"
      onCancel={() => !saving && setIsCreatingDemand(false)}
      onSubmit={async newReq => {
        if (saving) return
        setSaving(true)
        try {
          if (onAddRequirement) {
            await onAddRequirement(newReq)
          } else {
            // Legacy fallback — prefer onAddRequirement so POST /requirements runs.
            const updated = [newReq, ...localRequirements]
            setLocalRequirements(updated)
            onUpdateRequirements?.(updated)
          }
          setIsCreatingDemand(false)
        } catch {
          // Keep the form open so the user can retry; toast/errors come from the API layer if any.
        } finally {
          setSaving(false)
        }
      }}
    />
  )
}
