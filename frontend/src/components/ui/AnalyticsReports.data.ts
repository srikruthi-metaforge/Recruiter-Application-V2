export interface PieSegment {
  label: string
  value: number
  color: string
}

export interface DualBarItem {
  label: string
  value1: number
  value2: number
}

export interface ClientPOCItem {
  pocName: string
  client: string
  reqs: number
  submissions: number
  conversion: string
}

export const MOCK_CLIENT_POCS: ClientPOCItem[] = [
  { pocName: 'Rajesh Sharma', client: 'KPMG', reqs: 8, submissions: 42, conversion: '84%' },
  { pocName: 'Anita Desai', client: 'Accenture', reqs: 12, submissions: 68, conversion: '91%' },
  { pocName: 'Vikram Mehta', client: 'L&T', reqs: 7, submissions: 35, conversion: '78%' },
  { pocName: 'Sarah Jenkins', client: 'Goldman Sachs', reqs: 6, submissions: 38, conversion: '88%' },
  { pocName: 'Elena Rostova', client: 'Tesla', reqs: 5, submissions: 31, conversion: '82%' },
  { pocName: 'David Vance', client: 'Microsoft', reqs: 4, submissions: 22, conversion: '75%' },
]

export const MOCK_FIRST_SUB_TIMELINE = [
  { reqId: 'REQ-001', title: 'Senior React Developer', client: 'Accenture', reqTime: 'Aug 1, 09:00 AM', firstSubTime: 'Aug 1, 11:30 AM', turnaround: '2.5 hrs', speedClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { reqId: 'REQ-002', title: 'Java Architect', client: 'Goldman Sachs', reqTime: 'Aug 2, 10:15 AM', firstSubTime: 'Aug 2, 02:45 PM', turnaround: '4.5 hrs', speedClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { reqId: 'REQ-003', title: 'DevOps Lead Engineer', client: 'JP Morgan', reqTime: 'Aug 3, 08:30 AM', firstSubTime: 'Aug 3, 05:00 PM', turnaround: '8.5 hrs', speedClass: 'text-blue-600 bg-blue-50 border-blue-200' },
  { reqId: 'REQ-004', title: 'Senior Data Scientist', client: 'Microsoft', reqTime: 'Aug 4, 11:00 AM', firstSubTime: 'Aug 5, 09:15 AM', turnaround: '22.2 hrs', speedClass: 'text-amber-600 bg-amber-50 border-amber-200' },
  { reqId: 'REQ-006', title: 'Python ML Engineer', client: 'Tesla', reqTime: 'Aug 4, 02:00 PM', firstSubTime: 'Aug 4, 04:15 PM', turnaround: '2.2 hrs', speedClass: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
]

export const SUB_VS_NON_SUB_SEGMENTS: PieSegment[] = [
  { label: 'Requirements WITH Submissions', value: 15, color: '#2563EB' },
  { label: 'Requirements WITHOUT Submissions (Zero Subs)', value: 3, color: '#F43F5E' },
]

export const RECRUITER_DUAL_BAR_ITEMS: DualBarItem[] = [
  { label: 'Marcus Chen', value1: 5, value2: 34 },
  { label: 'Priya Sharma', value1: 4, value2: 28 },
  { label: 'James O\'Brien', value1: 6, value2: 41 },
  { label: 'Aisha Patel', value1: 3, value2: 19 },
  { label: 'Carlos Rivera', value1: 5, value2: 37 },
  { label: 'Elena Volkov', value1: 4, value2: 22 },
]
