import { Role } from '../types'
import { NavSection } from './navigation.types'

export const ROLE_NAV: Record<Role, NavSection[]> = {
  superadmin: [
    {
      title: 'Overview',
      items: [
        { key: 'Requirements', label: 'Requirements' },
        { key: 'Candidates', label: 'Add Candidates' },
        { key: 'Submissions', label: 'Submissions' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { key: 'Users', label: 'User Management' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { key: 'Clients', label: 'Clients' },
        { key: 'Interviews', label: 'Interview Scheduler' },
      ],
    },
    {
      title: 'Intelligence & System',
      items: [
        { key: 'Reports', label: 'Reports' },
      ],
    },
  ],
  admin: [
    {
      title: 'Overview',
      items: [
        { key: 'Requirements', label: 'Requirements' },
        { key: 'Candidates', label: 'Add Candidates' },
        { key: 'Submissions', label: 'Submissions' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { key: 'Clients', label: 'Clients' },
        { key: 'Interviews', label: 'Interview Scheduler' },
      ],
    },
    {
      title: 'Tools & System',
      items: [
        { key: 'Reports', label: 'Reports' },
      ],
    },
  ],
  lead: [
    {
      title: 'Overview',
      items: [
        { key: 'Requirements', label: 'Requirements' },
        { key: 'Dashboard', label: 'My Workspace' },
        { key: 'Candidates', label: 'Add Candidates' },
        { key: 'Submissions', label: 'Total Submissions' },
        { key: 'Interviews', label: 'Interview Tracker' },
        { key: 'Reports', label: 'Daily Reports' },
      ],
    },
  ],
  recruiter: [
    {
      title: 'Main',
      items: [
        { key: 'Dashboard', label: 'My Workspace' },
        { key: 'Requirements', label: 'Requirements' },
        { key: 'Candidates', label: 'Add Candidates' },
        { key: 'Submissions', label: 'Total Submissions' },
        { key: 'Interviews', label: 'Interview Tracking' },
        { key: 'Reports', label: 'Reports' },
      ],
    },
  ],
  devteam: [
    {
      title: 'Overview',
      items: [
        { key: 'Requirements', label: 'Requirements' },
        { key: 'Candidates', label: 'Add Candidates' },
        { key: 'Submissions', label: 'Submissions' },
      ],
    },
    {
      title: 'Organization',
      items: [
        { key: 'Users', label: 'User Management' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { key: 'Clients', label: 'Clients' },
        { key: 'Interviews', label: 'Interview Scheduler' },
      ],
    },
    {
      title: 'Intelligence',
      items: [
        { key: 'Reports', label: 'Reports' },
        { key: 'History', label: 'History' },
      ],
    },
    {
      title: 'System',
      items: [
        { key: 'Audit Logs', label: 'Audit Logs' },
      ],
    },
  ],
  client: [
    {
      title: 'Overview',
      items: [
        { key: 'Requirements', label: 'My Requirements' },
        { key: 'Submissions', label: 'Candidate Submissions' },
        { key: 'Interviews', label: 'Interview Feedback' },
      ],
    },
  ],
}

