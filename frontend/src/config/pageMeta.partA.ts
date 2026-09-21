import { PageMeta } from './navigation.types'

export const PAGE_META_A: Record<string, PageMeta> = {
  Organization: {
    title: 'Organization',
    description: 'Company details, branches, departments, and teams.',
    actions: ['Edit Company', 'Add Branch', 'Add Department'],
    columns: ['Name', 'Type', 'Location', 'Headcount', 'Status'],
    sampleRows: [
      ['TalentFlow HQ', 'Head Office', 'New York', '120', 'Active'],
      ['India Delivery Center', 'Branch', 'Hyderabad', '85', 'Active'],
      ['Tech Recruiting Dept', 'Department', 'Remote', '42', 'Active'],
    ],
  },
  'My Team': {
    title: 'My Team',
    description: 'Overview of team members and working client account assignments.',
    actions: ['View Performance', 'Assign Requirements'],
    columns: ['Recruiter Name', 'Role', 'Working Client Accounts', 'Active Reqs', 'Submissions', 'Actions'],
    sampleRows: [
      ['Marcus Chen', 'Senior Recruiter', 'Accenture, Goldman Sachs', '7', '62', 'View Analytics'],
      ['Priya Sharma', 'IT Recruiter', 'Accenture, Infosys', '5', '46', 'View Analytics'],
    ],
  },
  Users: {
    title: 'User Management',
    description: 'Create, edit, disable users. Assign roles and teams.',
    actions: ['Create User', 'Reset Password', 'Assign Role'],
    columns: ['Name', 'Email', 'Role', 'Team', 'Status', 'Last Login'],
    sampleRows: [
      ['David Park', 'd.park@talentflow.io', 'Admin', 'North America', 'Active', 'Aug 6, 2026'],
      ['Sarah Kim', 's.kim@talentflow.io', 'Team Lead', 'Tech Hiring', 'Active', 'Aug 6, 2026'],
      ['Marcus Chen', 'm.chen@talentflow.io', 'Recruiter', 'Tech Hiring', 'Active', 'Aug 6, 2026'],
    ],
  },
  Roles: {
    title: 'Roles & Permissions',
    description: 'Module access, feature access, and approval workflows.',
    actions: ['Create Role', 'Edit Permissions'],
    columns: ['Role', 'Users', 'Modules', 'Last Updated'],
    sampleRows: [
      ['Super Admin', '2', 'All Modules', 'Aug 1, 2026'],
      ['Admin', '4', 'Operations', 'Aug 2, 2026'],
      ['Team Lead', '8', 'Team + Approvals', 'Aug 3, 2026'],
    ],
  },
  Clients: {
    title: 'Client Management',
    description: 'Clients, contacts, agreements, and active contracts.',
    actions: ['Add Client', 'View Agreements'],
    columns: ['Client', 'Contacts', 'Active Reqs', 'Contract Status', 'Revenue MTD'],
    sampleRows: [
      ['Accenture', '3', '12', 'Active', '$48K'],
      ['Goldman Sachs', '2', '8', 'Active', '$62K'],
      ['Microsoft', '4', '6', 'Renewal Due', '$35K'],
    ],
  },
  Candidates: {
    title: 'Candidate Database',
    description: 'Master repository with duplicate detection, resume parsing, and AI match scores.',
    actions: ['Upload Resume', 'Run Duplicate Check', 'AI Rank'],
    columns: ['Candidate', 'Skills', 'Experience', 'Match Score', 'Duplicates', 'Last Activity'],
    sampleRows: [
      ['Alex Turner', 'React, TS', '8 yrs', '94%', 'None', 'Aug 5, 2026'],
      ['Rania Khalil', 'Java, Spring', '11 yrs', '96%', '1 flagged', 'Aug 4, 2026'],
      ['Ben Wallace', 'Python, ML', '10 yrs', '98%', 'None', 'Aug 2, 2026'],
    ],
  },
  Offers: {
    title: 'Offers & Placements',
    description: 'Offer negotiation, joining status, placements, and billing.',
    actions: ['Create Offer', 'Track Joining'],
    columns: ['Candidate', 'Client', 'Offer Amount', 'Status', 'Joining Date'],
    sampleRows: [
      ['Ben Wallace', 'Tesla', '$185K', 'Accepted', 'Sep 1, 2026'],
      ['Alex Turner', 'Accenture', '$145K', 'Pending', '—'],
    ],
  },
  'AI Center': {
    title: 'AI Center',
    description: 'JD intelligence, resume intelligence, duplicate detection, candidate ranking, and recommendations.',
    actions: ['Analyze JD', 'Parse Resumes', 'View Recommendations'],
    columns: ['AI Module', 'Runs Today', 'Accuracy', 'Time Saved'],
    sampleRows: [
      ['JD Intelligence', '24', '92%', '18 hrs'],
      ['Resume Parsing', '156', '89%', '42 hrs'],
      ['Duplicate Detection', '89', '96%', '12 hrs'],
      ['Candidate Ranking', '67', '91%', '8 hrs'],
    ],
  },
  Integrations: {
    title: 'Integrations',
    description: 'Naukri, LinkedIn, Email, WhatsApp, SMS, Outlook, Google Calendar.',
    columns: ['Integration', 'Status', 'Last Sync'],
    sampleRows: [
      ['LinkedIn Recruiter', 'Connected', '2 min ago'],
      ['Naukri', 'Connected', '15 min ago'],
      ['Outlook Calendar', 'Connected', '1 hr ago'],
      ['WhatsApp Business', 'Pending Setup', '—'],
    ],
  },
  Settings: {
    title: 'System Settings',
    description: 'Email templates, SMS templates, and notification settings.',
    actions: ['Edit Templates', 'Notification Rules'],
    columns: ['Setting', 'Category', 'Last Modified'],
    sampleRows: [
      ['Interview Reminder Email', 'Email Template', 'Jul 28, 2026'],
      ['Offer Release SMS', 'SMS Template', 'Jul 30, 2026'],
      ['SLA Breach Alert', 'Notifications', 'Aug 1, 2026'],
    ],
  },
  'Audit Logs': {
    title: 'Audit Logs',
    description: 'System-wide activity and compliance audit trail.',
    columns: ['Timestamp', 'User', 'Action', 'Module', 'IP'],
    sampleRows: [
      ['Aug 6, 18:42', 'Robert Haines', 'Updated role permissions', 'Roles', '192.168.1.10'],
      ['Aug 6, 17:15', 'David Park', 'Created requirement REQ-007', 'Requirements', '192.168.1.22'],
    ],
  },
}
