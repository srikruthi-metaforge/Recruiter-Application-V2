import { getSubmissionsStore } from '../../../data/submissionsStore'
import { CandidateRepoItem } from './types'

/**
 * Helper to retrieve candidate submission history (count and companies submitted to)
 */
export function getCandidateSubmissionsHistory(item: CandidateRepoItem) {
  const store = getSubmissionsStore()
  const normEmail = item.email ? item.email.trim().toLowerCase() : ''
  const normPhone = item.phone ? item.phone.replace(/[^\d]/g, '').slice(-10) : ''
  const normName = item.name ? item.name.trim().toLowerCase() : ''

  const matches = store.filter(sub => {
    if (normEmail && sub.email && sub.email.trim().toLowerCase() === normEmail) return true
    if (normPhone && sub.phone && sub.phone.replace(/[^\d]/g, '').slice(-10) === normPhone) return true
    if (normName && sub.candidate) {
      const subName = sub.candidate.trim().toLowerCase()
      if (subName === normName || subName.includes(normName) || normName.includes(subName)) return true
    }
    return false
  })

  let records = matches.map(m => ({
    id: m.id || `SUB-${Math.random().toString(36).substr(2, 6)}`,
    client: m.client || 'Client Account',
    requirementTitle: m.req || 'Requirement Title',
    reqId: m.req || 'REQ-001',
    submittedBy: m.recruiter || 'Recruiter',
    submittedDate: m.date || 'Aug 04, 2026',
    status: m.stage || 'Submitted to Client',
  }))

  // Fallback defaults for repository seed candidates so they show clear submission history
  if (records.length === 0) {
    if (item.candidateId === '18016') {
      records = [
        { id: 'SUB-901', client: 'Accenture', requirementTitle: 'Senior React Developer', reqId: 'REQ-001', submittedBy: 'Marcus Chen', submittedDate: 'Aug 02, 2026, 02:30 PM', status: 'Submitted to Client' },
        { id: 'SUB-902', client: 'Capgemini', requirementTitle: 'SAP Transportation Management', reqId: 'REQ-2026-08-06-001', submittedBy: 'Adirala sathvika', submittedDate: 'Aug 06, 2026, 11:15 AM', status: 'Interview Scheduled' }
      ]
    } else if (item.candidateId === '18015') {
      records = [
        { id: 'SUB-903', client: 'Infosys', requirementTitle: 'Java Architect', reqId: 'REQ-002', submittedBy: 'Priya Sharma', submittedDate: 'Aug 03, 2026, 04:10 PM', status: 'Submitted to Lead' },
        { id: 'SUB-904', client: 'Goldman Sachs', requirementTitle: 'SAP TM+ S4 Hana', reqId: 'REQ-2026-08-06-002', submittedBy: 'Arvind GR', submittedDate: 'Aug 06, 2026, 01:45 PM', status: 'Submitted to Client' }
      ]
    } else if (item.candidateId === '18014') {
      records = [
        { id: 'SUB-905', client: 'Wipro', requirementTitle: 'DevOps Lead Engineer', reqId: 'REQ-003', submittedBy: 'James O\'Brien', submittedDate: 'Aug 01, 2026, 10:20 AM', status: 'Submitted to Client' },
        { id: 'SUB-906', client: 'Metaforge Client', requirementTitle: 'System Administrator Lead', reqId: 'REQ-2026-08-06-004', submittedBy: 'Harish Gadipally', submittedDate: 'Aug 06, 2026, 03:00 PM', status: 'Interview Scheduled' }
      ]
    } else if (item.candidateId === '18013') {
      records = [
        { id: 'SUB-907', client: 'LTIMindtree', requirementTitle: 'Senior Data Scientist', reqId: 'REQ-004', submittedBy: 'Elena Rostova', submittedDate: 'Aug 04, 2026, 11:50 AM', status: 'Submitted to Client' }
      ]
    } else if (item.candidateId === '18012') {
      records = [
        { id: 'SUB-908', client: 'Tata Technologies', requirementTitle: 'Python ML Engineer', reqId: 'REQ-006', submittedBy: 'Puttapaka Saiteja', submittedDate: 'Aug 05, 2026, 09:30 AM', status: 'Submitted to Lead' },
        { id: 'SUB-909', client: 'Tesla', requirementTitle: 'Salesforce Admin', reqId: 'REQ-005', submittedBy: 'Alex Rivera', submittedDate: 'Jul 29, 2026, 03:15 PM', status: 'Offered' }
      ]
    } else if (item.candidateId === '18011') {
      records = [
        { id: 'SUB-910', client: 'Tech Mahindra', requirementTitle: 'Full Stack Java Engineer', reqId: 'REQ-007', submittedBy: 'Tejasree Chakravarthy', submittedDate: 'Aug 04, 2026, 02:00 PM', status: 'Submitted to Client' },
        { id: 'SUB-911', client: 'Accenture', requirementTitle: 'Senior React Developer', reqId: 'REQ-001', submittedBy: 'Marcus Chen', submittedDate: 'Aug 03, 2026, 05:40 PM', status: 'Submitted' }
      ]
    } else if (item.candidateId === '18010') {
      records = [
        { id: 'SUB-912', client: 'Bosch', requirementTitle: 'Embedded Systems Engineer', reqId: 'REQ-008', submittedBy: 'Rahul Verma', submittedDate: 'Aug 02, 2026, 01:10 PM', status: 'Submitted to Client' }
      ]
    }
  }

  const companies: string[] = Array.from(new Set(records.map(r => r.client)))
  const count = records.length

  return {
    count,
    companies,
    records,
    matches,
  }
}
