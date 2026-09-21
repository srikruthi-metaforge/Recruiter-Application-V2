import { ClientRecord } from './preamble'
import { Role } from '../../../types'

export interface ClientRequirementItem {
  id: string
  title: string
  clientName: string
  assignedDate: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'In Progress' | 'Open' | 'Assigned' | 'Filled'
  assignedRecruiter: string
  submissionsCount: number
  interviewsCount: number
  experience: string
  location: string
}

export const CLIENT_REQUIREMENTS_MAP: Record<string, ClientRequirementItem[]> = {
  'Accenture': [
    { id: 'REQ-2026-08-12-001', title: 'Senior React / Fullstack Architect', clientName: 'Accenture', assignedDate: '12 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Harish Gadipally / Marcus Chen', submissionsCount: 14, interviewsCount: 4, experience: '8 - 12 Yrs', location: 'Bangalore / Hybrid' },
    { id: 'REQ-2026-08-12-003', title: 'Cloud Solutions Architect', clientName: 'Accenture', assignedDate: '12 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Priya Sharma', submissionsCount: 10, interviewsCount: 3, experience: '10 - 15 Yrs', location: 'Hyderabad / Remote' },
    { id: 'REQ-2026-08-12-004', title: 'PLM / PDM Lead Engineer', clientName: 'Accenture', assignedDate: '12 Aug 2026', priority: 'Medium', status: 'Open', assignedRecruiter: 'Suresh kulkarni', submissionsCount: 8, interviewsCount: 2, experience: '7 - 10 Yrs', location: 'Pune / Onsite' },
    { id: 'REQ-2026-08-01-002', title: 'Java Microservices Lead', clientName: 'Accenture', assignedDate: '01 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Marcus Chen', submissionsCount: 18, interviewsCount: 5, experience: '9 - 13 Yrs', location: 'Bangalore' },
    { id: 'REQ-2026-07-25-008', title: 'DevOps & SRE Specialist', clientName: 'Accenture', assignedDate: '25 Jul 2026', priority: 'Medium', status: 'In Progress', assignedRecruiter: 'Priya Sharma', submissionsCount: 12, interviewsCount: 3, experience: '6 - 9 Yrs', location: 'Remote' },
    { id: 'REQ-2026-07-15-012', title: 'Cybersecurity Threat Analyst', clientName: 'Accenture', assignedDate: '15 Jul 2026', priority: 'Low', status: 'Open', assignedRecruiter: 'Harish Gadipally', submissionsCount: 6, interviewsCount: 1, experience: '5 - 8 Yrs', location: 'Hyderabad' },
  ],
  'Goldman Sachs': [
    { id: 'REQ-2026-08-06-005', title: 'FinTech Java Cloud Architect', clientName: 'Goldman Sachs', assignedDate: '06 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'lakshmi.v Recruiter', submissionsCount: 16, interviewsCount: 5, experience: '10 - 14 Yrs', location: 'Bangalore' },
    { id: 'REQ-2026-08-06-006', title: 'Low Latency C++ Trading Developer', clientName: 'Goldman Sachs', assignedDate: '06 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Lingoji Pavani', submissionsCount: 12, interviewsCount: 4, experience: '8 - 12 Yrs', location: 'Mumbai / Onsite' },
    { id: 'REQ-2026-07-28-010', title: 'Big Data PySpark Engineer', clientName: 'Goldman Sachs', assignedDate: '28 Jul 2026', priority: 'Medium', status: 'Open', assignedRecruiter: 'Arvind GR', submissionsCount: 9, interviewsCount: 2, experience: '6 - 9 Yrs', location: 'Bangalore' },
    { id: 'REQ-2026-07-18-015', title: 'Risk Quantitative Modeler', clientName: 'Goldman Sachs', assignedDate: '18 Jul 2026', priority: 'Medium', status: 'In Progress', assignedRecruiter: 'Tom Walsh / Lingoji Pavani', submissionsCount: 11, interviewsCount: 3, experience: '7 - 11 Yrs', location: 'Mumbai' },
  ],
  'Tesla': [
    { id: 'REQ-2026-08-07-006', title: 'Automotive Embedded Systems Engineer', clientName: 'Tesla', assignedDate: '07 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'rahimoon Shaik', submissionsCount: 14, interviewsCount: 4, experience: '6 - 10 Yrs', location: 'Pune / Onsite' },
    { id: 'REQ-2026-08-07-007', title: 'Python ML Specialist (Autonomous Drive)', clientName: 'Tesla', assignedDate: '07 Aug 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Adirala sathvika', submissionsCount: 11, interviewsCount: 3, experience: '5 - 9 Yrs', location: 'Remote / Bangalore' },
    { id: 'REQ-2026-07-22-011', title: 'Battery Management Firmware Lead', clientName: 'Tesla', assignedDate: '22 Jul 2026', priority: 'Medium', status: 'Open', assignedRecruiter: 'Charlie Darwin', submissionsCount: 8, interviewsCount: 2, experience: '8 - 12 Yrs', location: 'Pune' },
  ],
  'ITC Infotech': [
    { id: 'REQ-2026-07-20-009', title: 'SAP MM + Ariba Functional Lead', clientName: 'ITC Infotech', assignedDate: '20 Jul 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Harini Sindey', submissionsCount: 15, interviewsCount: 4, experience: '8 - 12 Yrs', location: 'Kolkata / Hybrid' },
    { id: 'REQ-2026-07-10-014', title: 'SAP S/4HANA Finance Architect', clientName: 'ITC Infotech', assignedDate: '10 Jul 2026', priority: 'Medium', status: 'In Progress', assignedRecruiter: 'Viswanath Reddy', submissionsCount: 10, interviewsCount: 3, experience: '9 - 13 Yrs', location: 'Bangalore' },
    { id: 'REQ-2026-06-28-018', title: 'ABAP on HANA Senior Specialist', clientName: 'ITC Infotech', assignedDate: '28 Jun 2026', priority: 'Low', status: 'Open', assignedRecruiter: 'Rachana Golkonda', submissionsCount: 7, interviewsCount: 1, experience: '5 - 8 Yrs', location: 'Kolkata' },
  ],
  'LTTS Mobility': [
    { id: 'REQ-2026-06-08-001', title: '.NET Core Backend Architect', clientName: 'LTTS Mobility', assignedDate: '08 Jun 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'Marcus Chen', submissionsCount: 13, interviewsCount: 4, experience: '9 - 12 Yrs', location: 'Vadodara' },
    { id: 'REQ-2026-06-15-005', title: 'AUTOSAR Software Architect', clientName: 'LTTS Mobility', assignedDate: '15 Jun 2026', priority: 'Medium', status: 'In Progress', assignedRecruiter: 'Priya Sharma', submissionsCount: 9, interviewsCount: 2, experience: '7 - 11 Yrs', location: 'Chennai / Hybrid' },
  ],
  'Infosys Ltd': [
    { id: 'REQ-2026-07-01-002', title: 'Principal Cloud Security Architect', clientName: 'Infosys Ltd', assignedDate: '01 Jul 2026', priority: 'High', status: 'In Progress', assignedRecruiter: 'lakshmi.v Recruiter', submissionsCount: 12, interviewsCount: 3, experience: '10 - 15 Yrs', location: 'Bangalore' },
    { id: 'REQ-2026-07-12-009', title: 'Full Stack Angular & Java Lead', clientName: 'Infosys Ltd', assignedDate: '12 Jul 2026', priority: 'Medium', status: 'Open', assignedRecruiter: 'Lingoji Pavani', submissionsCount: 8, interviewsCount: 2, experience: '6 - 9 Yrs', location: 'Hyderabad' },
  ],
}

export const getRequirementsForClient = (client: ClientRecord): ClientRequirementItem[] => {
  if (CLIENT_REQUIREMENTS_MAP[client.name]) {
    return CLIENT_REQUIREMENTS_MAP[client.name]
  }

  return [
    {
      id: `REQ-${client.id}-001`,
      title: `Senior ${client.domain.split('&')[0] || 'Technical'} Architect`,
      clientName: client.name,
      assignedDate: '10 Aug 2026',
      priority: 'High',
      status: 'In Progress',
      assignedRecruiter: client.teamLead,
      submissionsCount: Math.max(5, Math.round(client.totalSubmissions * 0.4)),
      interviewsCount: Math.max(2, Math.round(client.totalSubmissions * 0.15)),
      experience: '8 - 12 Yrs',
      location: client.location,
    },
    {
      id: `REQ-${client.id}-002`,
      title: `Lead ${client.domain.split(' ')[0] || 'Software'} Engineer`,
      clientName: client.name,
      assignedDate: '02 Aug 2026',
      priority: 'Medium',
      status: 'Open',
      assignedRecruiter: client.teamMembers[0] || 'Marcus Chen',
      submissionsCount: Math.max(3, Math.round(client.totalSubmissions * 0.3)),
      interviewsCount: Math.max(1, Math.round(client.totalSubmissions * 0.1)),
      experience: '5 - 9 Yrs',
      location: client.location,
    },
    {
      id: `REQ-${client.id}-003`,
      title: `Senior DevOps & Cloud Specialist`,
      clientName: client.name,
      assignedDate: '20 Jul 2026',
      priority: 'Medium',
      status: 'In Progress',
      assignedRecruiter: client.teamMembers[1] || 'Priya Sharma',
      submissionsCount: Math.max(2, Math.round(client.totalSubmissions * 0.2)),
      interviewsCount: 1,
      experience: '6 - 10 Yrs',
      location: 'Remote',
    },
  ]
}

export interface ClientsPageProps {
  role?: Role
}

export const getClientStats = (client: ClientRecord, period: 'All Time' | 'This Week' | 'This Month' | 'This Year') => {
  if (period === 'This Week') {
    return {
      reqs: Math.max(1, Math.round(client.activeReqs * 0.25)),
      submissions: Math.max(2, Math.round(client.totalSubmissions * 0.22)),
      placements: Math.max(1, Math.round(client.totalPlacements * 0.20)),
    }
  }
  if (period === 'This Month') {
    return {
      reqs: Math.max(2, Math.round(client.activeReqs * 0.65)),
      submissions: Math.max(5, Math.round(client.totalSubmissions * 0.60)),
      placements: Math.max(2, Math.round(client.totalPlacements * 0.58)),
    }
  }
  if (period === 'This Year') {
    return {
      reqs: Math.max(3, Math.round(client.activeReqs * 0.90)),
      submissions: Math.max(8, Math.round(client.totalSubmissions * 0.88)),
      placements: Math.max(3, Math.round(client.totalPlacements * 0.85)),
    }
  }
  return {
    reqs: client.activeReqs,
    submissions: client.totalSubmissions,
    placements: client.totalPlacements,
  }
}
