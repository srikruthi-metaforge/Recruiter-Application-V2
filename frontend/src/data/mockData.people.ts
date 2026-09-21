import { Admin, Lead, Interview, Submission, Role } from '../types'

export const INITIAL_LEADS: Lead[] = [
  { id: 'L01', name: 'Harish Gadipally', admin: 'David Park', recruiters: 2, submissions: 62, interviews: 14, placements: 5, email: 'harish.g@metaforgeit.com', clientAccount: 'Accenture', clientAccounts: ['Accenture'] },
  { id: 'L02', name: 'Tom Walsh', admin: 'David Park', recruiters: 2, submissions: 60, interviews: 15, placements: 5, email: 't.walsh@talentflow.io', clientAccount: 'Goldman Sachs', clientAccounts: ['Goldman Sachs'] },
  { id: 'L03', name: 'Nina Brooks', admin: 'Lisa Ho', recruiters: 3, submissions: 74, interviews: 16, placements: 4, email: 'n.brooks@talentflow.io', clientAccount: 'Tesla', clientAccounts: ['Tesla'] },
  { id: 'L04', name: 'Ray Diaz', admin: 'Lisa Ho', recruiters: 1, submissions: 30, interviews: 7, placements: 2, email: 'r.diaz@talentflow.io', clientAccount: 'ITC', clientAccounts: ['ITC'] },
]

export const INITIAL_ADMINS: Admin[] = [
  { id: 'A01', name: 'David Park', leads: 2, recruiters: 4, requirements: 12, submissions: 122, interviews: 29, placements: 10, revenue: '$220K', email: 'd.park@talentflow.io' },
  { id: 'A02', name: 'Lisa Ho', leads: 2, recruiters: 4, requirements: 10, submissions: 104, interviews: 23, placements: 6, revenue: '$175K', email: 'l.ho@talentflow.io' },
]

export const INITIAL_INTERVIEWS: Interview[] = [
  { id: 'INT-101', candidate: 'Alex Turner', position: 'Senior React Developer', client: 'Accenture', stage: 'Technical Round 2', date: 'Aug 6, 10:00 AM', recruiter: 'Marcus Chen', status: 'Scheduled', notes: 'Strong hands-on React architecture background.' },
  { id: 'INT-102', candidate: 'Rania Khalil', position: 'Java Architect', client: 'Goldman Sachs', stage: 'HR Round', date: 'Aug 6, 2:00 PM', recruiter: 'James O\'Brien', status: 'Passed', notes: 'Past banking sector experience confirmed.' },
  { id: 'INT-103', candidate: 'Ben Wallace', position: 'Python ML Engineer', client: 'Tesla', stage: 'Final Round', date: 'Aug 7, 11:00 AM', recruiter: 'Carlos Rivera', status: 'Passed', notes: 'Machine learning portfolio review completed.' },
  { id: 'INT-104', candidate: 'Soo-Jin Lee', position: 'DevOps Lead Engineer', client: 'JP Morgan', stage: 'Screening', date: 'Aug 7, 3:30 PM', recruiter: 'Priya Sharma', status: 'Scheduled', notes: 'Initial screening call.' },
  { id: 'INT-105', candidate: 'David Osei', position: 'Senior React Developer', client: 'Accenture', stage: 'Technical Round 1', date: 'Aug 8, 9:00 AM', recruiter: 'Marcus Chen', status: 'Passed', notes: 'Focus on TypeScript and state management.' },
  { id: 'INT-106', candidate: 'Fatima Al-Hassan', position: 'Senior Data Scientist', client: 'Microsoft', stage: 'Manager Round', date: 'Aug 8, 1:00 PM', recruiter: 'Elena Volkov', status: 'Pending', notes: 'Waiting for client manager confirmation.' },
]

export const INITIAL_SUBMISSIONS: Submission[] = [
  { id: 'SUB-201', candidate: 'Alex Turner', req: 'REQ-001', client: 'Accenture', date: 'Aug 5, 2026', stage: 'Interview Scheduled', match: '94%', recruiter: 'Marcus Chen', email: 'alex.turner@dev.com', phone: '+1 555-0192', experience: '8 years' },
  { id: 'SUB-202', candidate: 'Sarah Nguyen', req: 'REQ-001', client: 'Accenture', date: 'Aug 5, 2026', stage: 'Submitted', match: '87%', recruiter: 'Marcus Chen', email: 'sarah.n@techmail.io', phone: '+1 555-0184', experience: '6 years' },
  { id: 'SUB-203', candidate: 'Harini Varma', req: 'REQ-001', client: 'Accenture', date: 'Aug 6, 2026', stage: 'Client Review', match: '95%', recruiter: 'Harish Gadipally', email: 'harini.varma@tech.org', phone: '+91 98765 11223', experience: '9 years' },
  { id: 'SUB-204', candidate: 'Vikramaditya Sen', req: 'REQ-001', client: 'Accenture', date: 'Aug 6, 2026', stage: 'Interview Scheduled', match: '92%', recruiter: 'Harish Gadipally', email: 'vikram.sen@metaforgeit.com', phone: '+91 98765 44332', experience: '10 years' },
  { id: 'SUB-205', candidate: 'Soo-Jin Lee', req: 'REQ-001', client: 'Accenture', date: 'Aug 4, 2026', stage: 'Submitted', match: '90%', recruiter: 'Priya Sharma', email: 'soojin.l@tech.kr', phone: '+1 555-0199', experience: '7 years' },
  { id: 'SUB-206', candidate: 'Omar Hassan', req: 'REQ-006', client: 'Tesla', date: 'Aug 4, 2026', stage: 'Client Review', match: '89%', recruiter: 'Marcus Chen', email: 'ohassan@mltech.ai', phone: '+1 555-0144', experience: '7 years' },
  { id: 'SUB-207', candidate: 'Rania Khalil', req: 'REQ-002', client: 'Goldman Sachs', date: 'Aug 3, 2026', stage: 'Interview Scheduled', match: '96%', recruiter: 'James O\'Brien', email: 'rkhalil@java.com', phone: '+1 555-0231', experience: '11 years' },
  { id: 'SUB-208', candidate: 'Ben Wallace', req: 'REQ-006', client: 'Tesla', date: 'Aug 2, 2026', stage: 'Placed', match: '98%', recruiter: 'Carlos Rivera', email: 'ben.w@ai.com', phone: '+1 555-0412', experience: '10 years' },
]

export const DEMO_ACCOUNTS: Record<Role, { email: string; name: string; password: string; title: string }> = {
  superadmin: { email: 'r.haines@talentflow.io', name: 'Robert Haines', password: 'Admin@2026', title: 'Platform Managing Director' },
  admin: { email: 'd.park@talentflow.io', name: 'David Park', password: 'Admin@2026', title: 'VP of Recruiting Operations' },
  lead: { email: 'harish.g@metaforgeit.com', name: 'Harish Gadipally', password: 'Lead@2026', title: 'Senior Recruiting Lead' },
  recruiter: { email: 'm.chen@talentflow.io', name: 'Marcus Chen', password: 'Rec@2026', title: 'Lead Technical Recruiter' },
  devteam: { email: 'dev.team@talentflow.io', name: 'Dev Team Engineer', password: 'Dev@2026', title: 'Senior Systems Engineer / Core Platform' },
  client: { email: 'client@accenture.com', name: 'Client Account Lead', password: 'Client@2026', title: 'Hiring Manager / Client Portal' },
}

export const ROLE_META: Record<Role, { label: string; desc: string; color: string; bg: string; border: string }> = {
  superadmin: { label: 'Super Admin', desc: 'Full platform metrics & enterprise settings', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  admin: { label: 'Admin', desc: 'Oversee regional leads & recruiter teams', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  lead: { label: 'Team Lead', desc: 'Track team performance & assigned reqs', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  recruiter: { label: 'Recruiter', desc: 'Candidate submissions & interview management', color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  devteam: { label: 'Dev Team', desc: 'Full Super Admin control, platform metrics, and administrative privileges', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  client: { label: 'Client', desc: 'Client portal for requirements and candidate review', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
}
