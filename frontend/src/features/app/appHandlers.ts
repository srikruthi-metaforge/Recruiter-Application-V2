import type { Dispatch, SetStateAction } from 'react'
import { Interview, InterviewStatus, Recruiter, Role, Submission, Requirement, ActivityLogItem } from '../../types'
import { workspaceService } from '../../services/workspace.service'

export function createSubmitCandidateHandler(args: {
  submissions: Submission[]
  setSubmissions: Dispatch<SetStateAction<Submission[]>>
  setRequirements: Dispatch<SetStateAction<Requirement[]>>
  setRecruiters: Dispatch<SetStateAction<Recruiter[]>>
  handleAddActivityLog: (log: ActivityLogItem) => void
  currentUser: { name: string; email: string }
  role: Role
  requirements?: Requirement[]
  reloadWorkspace?: () => Promise<void>
}) {
  return async (newSub: Submission, opts?: { silent?: boolean }) => {
    const nowIso = new Date().toISOString()
    const list = args.requirements || []
    const hint = String((newSub as any).requirementId || (newSub as any).reqCode || newSub.req || '').trim()
    const matched = list.find(r => {
      const rid = String((r as any)._id || '')
      const code = String((r as any).reqCode || '')
      const display = String(r.id || '')
      return (
        (hint && (rid === hint || code === hint || display === hint)) ||
        display === newSub.req ||
        code === newSub.req ||
        rid === (newSub as any).requirementId
      )
    })
    const reqCode =
      String((newSub as any).reqCode || matched?.reqCode || '').trim() ||
      String(newSub.req || '').replace(/\s*\([^()]*\)\s*$/, '').trim()
    const requirementId =
      String((newSub as any).requirementId || (matched as any)?._id || '').trim() || undefined

    const enrichedSub: Submission = {
      ...newSub,
      date: newSub.date || 'Today',
      submittedAt: (newSub as any).submittedAt || nowIso,
      updatedAt: (newSub as any).updatedAt || nowIso,
      createdAt: (newSub as any).createdAt || nowIso,
      req: reqCode || newSub.req,
      ...(reqCode ? { reqCode } : {}),
      ...(requirementId ? { requirementId } : {}),
    } as Submission

    try {
      const created: any = await workspaceService.createSubmission(enrichedSub)
      const saved: Submission = {
        ...enrichedSub,
        ...(created || {}),
        id: created?.submissionId || created?.id || enrichedSub.id,
        _id: created?._id || (enrichedSub as any)._id,
        req: matched?.id || reqCode || enrichedSub.req,
        requirementId: created?.requirementId || requirementId,
        stage: created?.stage || enrichedSub.stage || 'Submitted',
      } as Submission

      args.setSubmissions(prev => [saved, ...prev.filter(s => s.id !== enrichedSub.id && s.id !== saved.id)])
      args.setRequirements(prev =>
        prev.map(r =>
          r.id === matched?.id || (r as any)._id === requirementId || (r as any).reqCode === reqCode
            ? { ...r, submissions: (r.submissions || 0) + (created?.alreadyExists ? 0 : 1) }
            : r,
        ),
      )
      args.setRecruiters(prev =>
        prev.map(rec =>
          rec.name === newSub.recruiter
            ? { ...rec, submissions: rec.submissions + 1, today: rec.today + 1 }
            : rec,
        ),
      )
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('submissions_updated'))
      }
      args.handleAddActivityLog({
        id: `LOG-${Date.now()}`,
        timestamp: 'Just now',
        userName: newSub.recruiter || args.currentUser.name,
        userEmail: args.currentUser.email,
        userRole: args.role,
        userAvatar: (newSub.recruiter || args.currentUser.name).charAt(0).toUpperCase(),
        action: `Submitted candidate ${newSub.candidate} for ${reqCode || newSub.req}`,
        category: 'Submissions',
        targetEntity: `Candidate ${newSub.candidate}`,
        targetId: saved.id,
        clientName: newSub.client,
        ipAddress: '127.0.0.1',
        status: 'Success',
        details: created?.alreadyExists
          ? `Candidate already linked to requirement ${reqCode || newSub.req}`
          : `Submitted candidate to requirement ${reqCode || newSub.req}`,
      })
      // Batch submits reload once from the modal after the loop.
      if (!opts?.silent) {
        await args.reloadWorkspace?.().catch(() => undefined)
      }
    } catch (err: any) {
      if (!opts?.silent && typeof window !== 'undefined') {
        window.alert(err?.message || 'Failed to submit candidate to requirement. Please try again.')
      }
      throw err
    }
  }
}

export function createSaveInterviewFeedbackHandler(args: {
  interviews: Interview[]
  setInterviews: Dispatch<SetStateAction<Interview[]>>
  handleAddActivityLog: (log: ActivityLogItem) => void
  currentUser: { name: string; email: string }
  role: Role
}) {
  return (interviewId: string, status: InterviewStatus, notes: string) => {
    args.setInterviews(prev => prev.map(iv => (iv.id === interviewId ? { ...iv, status, notes } : iv)))
    void workspaceService.saveInterviewFeedback(interviewId, status, notes).catch(() => undefined)
    const targetIv = args.interviews.find(i => i.id === interviewId)
    args.handleAddActivityLog({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: args.currentUser.name,
      userEmail: args.currentUser.email,
      userRole: args.role,
      userAvatar: args.currentUser.name.charAt(0).toUpperCase(),
      action: `Recorded interview feedback (${status}) for ${targetIv?.candidate || 'Candidate'}`,
      category: 'Interviews',
      targetEntity: `Interview ${interviewId}`,
      targetId: interviewId,
      clientName: targetIv?.client || 'Client',
      ipAddress: '127.0.0.1',
      status: 'Success',
      details: notes || `Interview status updated to ${status}`,
    })
  }
}
