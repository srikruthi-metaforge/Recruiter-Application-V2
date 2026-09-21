import { PageMeta } from './navigation.types'

export const PAGE_META_B: Record<string, PageMeta> = {
  Recruiters: {
    title: 'Recruiters',
    description: 'Manage recruiter accounts and assignments.',
    actions: ['Assign Recruiter'],
    columns: ['Recruiter', 'Lead', 'Active Reqs', 'Submissions', 'Status'],
    sampleRows: [
      ['Marcus Chen', 'Sarah Kim', '5', '34', 'Active'],
      ['Priya Sharma', 'Sarah Kim', '4', '28', 'Active'],
    ],
  },
  Teams: {
    title: 'Teams',
    description: 'Team structure and lead assignments.',
    columns: ['Team', 'Lead', 'Recruiters', 'Open Positions'],
    sampleRows: [
      ['Tech Hiring', 'Sarah Kim', '4', '18'],
      ['Finance Hiring', 'Tom Walsh', '3', '12'],
    ],
  },
  'Email Center': {
    title: 'Email Center',
    description: 'Bulk and transactional email communication.',
    actions: ['Compose Email', 'Use Template'],
    columns: ['Subject', 'Recipients', 'Status', 'Sent At'],
    sampleRows: [['Interview Reminder — Alex Turner', '12', 'Delivered', 'Aug 6, 10:00 AM']],
  },
  'Activity Logs': {
    title: 'Activity Logs',
    description: 'Daily operational activity across your region.',
    columns: ['Time', 'User', 'Activity', 'Details'],
    sampleRows: [['14:30', 'Marcus Chen', 'Submitted candidate', 'REQ-001 · Alex Turner']],
  },
  Performance: {
    title: 'Recruiter Performance',
    description: 'Individual productivity metrics and rankings.',
    columns: ['Recruiter', 'Submissions', 'Interviews', 'Placements', 'Conversion'],
    sampleRows: [
      ['Marcus Chen', '34', '8', '2', '5.9%'],
      ['James O\'Brien', '41', '11', '4', '9.8%'],
    ],
  },
  Targets: {
    title: 'Target Tracking',
    description: 'Daily and weekly hiring targets vs actuals.',
    columns: ['Metric', 'Target', 'Actual', 'Variance'],
    sampleRows: [
      ['Daily Submissions', '40', '42', '+5%'],
      ['Weekly Interviews', '60', '52', '-13%'],
    ],
  },
  'Candidate Search': {
    title: 'Candidate Search',
    description: 'Search internal database and external sources.',
    actions: ['Advanced Search', 'Save Filter'],
    columns: ['Candidate', 'Skills', 'Location', 'Availability', 'Match'],
    sampleRows: [['Sarah Nguyen', 'React, Node', 'Remote', 'Immediate', '87%']],
  },
  'AI Match': {
    title: 'AI Candidate Match',
    description: 'AI-suggested candidates for active requirements.',
    actions: ['Refresh Suggestions'],
    columns: ['Requirement', 'Candidate', 'Match Score', 'Reason'],
    sampleRows: [['Senior React Developer', 'Alex Turner', '94%', 'Skills + experience fit']],
  },
  Pipeline: {
    title: 'Candidate Pipeline',
    description: 'Track candidates through sourcing to submission.',
    columns: ['Candidate', 'Stage', 'Requirement', 'Last Action', 'Owner'],
    sampleRows: [['David Osei', 'Screening', 'REQ-001', 'Call completed', 'Marcus Chen']],
  },
  'Follow-ups': {
    title: 'Follow-up Tracker',
    description: 'Pending calls, follow-ups, and call notes.',
    actions: ['Add Follow-up', 'Log Call'],
    columns: ['Candidate', 'Type', 'Due', 'Priority', 'Status'],
    sampleRows: [['Alex Turner', 'Client feedback', 'Today', 'High', 'Pending']],
  },
  Analytics: {
    title: 'Hiring Progress Analytics',
    description: 'Positions filled, open, and pipeline conversion for your account.',
    columns: ['Requirement', 'Open', 'Filled', 'In Interview', 'Offers'],
    sampleRows: [['Senior React Developer', '2', '1', '3', '1']],
  },
  Invoices: {
    title: 'Invoices',
    description: 'Billing and payment status.',
    columns: ['Invoice #', 'Period', 'Amount', 'Status', 'Due Date'],
    sampleRows: [['INV-2026-084', 'July 2026', '$24,600', 'Paid', 'Aug 5, 2026']],
  },
  Contacts: {
    title: 'Company Contacts',
    description: 'Your hiring managers and TalentFlow account team.',
    columns: ['Name', 'Role', 'Email', 'Phone'],
    sampleRows: [['Jane Cooper', 'Hiring Manager', 'j.cooper@accenture.com', '+1 555-0100']],
  },
  Notifications: {
    title: 'Notifications',
    description: 'Alerts, SLA breaches, and system updates.',
    columns: ['Type', 'Message', 'Time', 'Read'],
    sampleRows: [['SLA Alert', 'REQ-004 approaching deadline', '2 hrs ago', 'No']],
  },
  'AI Assistant': {
    title: 'AI Assistant',
    description: 'Ask questions about requirements, candidates, and pipeline.',
    actions: ['New Conversation'],
    columns: ['Query', 'Response Preview', 'Time'],
    sampleRows: [['Top candidates for REQ-001?', '3 matches above 90% score…', 'Just now']],
  },
  'My Profile': {
    title: 'My Profile',
    description: 'Manage your recruiter profile and login details',
  },
  Calendar: {
    title: 'Calendar',
    description: 'Interviews, follow-ups, and team events.',
    columns: ['Event', 'Date', 'Time', 'Type'],
    sampleRows: [['Technical Interview — Alex Turner', 'Aug 7', '10:00 AM', 'Interview']],
  },
  Documents: {
    title: 'Documents',
    description: 'Resumes, JDs, offer letters, and agreements.',
    columns: ['Document', 'Type', 'Uploaded', 'Owner'],
    sampleRows: [['Alex_Turner_Resume.pdf', 'Resume', 'Aug 5, 2026', 'Marcus Chen']],
  },
}
