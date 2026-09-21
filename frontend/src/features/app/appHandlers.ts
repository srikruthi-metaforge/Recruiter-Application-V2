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
}) {
  return (newSub: Submission) => {
    args.setSubmissions([newSub, ...args.submissions])
    void workspaceService.createSubmission(newSub).catch(() => undefined)
    args.setRequirements(prev =>
      prev.map(r => (r.id === newSub.req ? { ...r, submissions: r.submissions + 1 } : r))
    )
    args.setRecruiters(prev =>
      prev.map(rec =>
        rec.name === newSub.recruiter
          ? { ...rec, submissions: rec.submissions + 1, today: rec.today + 1 }
          : rec
      )
    )
    args.handleAddActivityLog({
      id: `LOG-${Date.now()}`,
      timestamp: 'Just now',
      userName: newSub.recruiter || args.currentUser.name,
      userEmail: args.currentUser.email,
      userRole: args.role,
      userAvatar: (newSub.recruiter || args.currentUser.name).charAt(0).toUpperCase(),
      action: `Submitted candidate ${newSub.candidate} for ${newSub.req}`,
      category: 'Submissions',
      targetEntity: `Candidate ${newSub.candidate}`,
      targetId: newSub.id,
      clientName: newSub.client,
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: `Submitted candidate profile to client ${newSub.client}`,
    })
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
      ipAddress: '192.168.1.45',
      status: 'Success',
      details: notes || `Interview status updated to ${status}`,
    })
  }
}
