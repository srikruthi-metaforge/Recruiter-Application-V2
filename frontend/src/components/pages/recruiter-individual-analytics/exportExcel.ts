import type { PerformanceReport } from './types'

function downloadBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function addSheet(wb: any, ExcelJS: any, name: string, columns: { header: string; key: string; width?: number }[], rows: Array<Record<string, any>>) {
  const ws = wb.addWorksheet(name.slice(0, 31))
  ws.columns = columns
  ws.getRow(1).font = { bold: true }
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEDE9FE' },
  }
  for (const row of rows) ws.addRow(row)
  ws.views = [{ state: 'frozen', ySplit: 1 }]
}

export async function exportRecruiterPerformanceExcel(args: {
  report: PerformanceReport
  filters: {
    client: string
    requirement: string
    dateLabel: string
    customStart?: string
    customEnd?: string
  }
}): Promise<void> {
  const ExcelJS = (await import('exceljs')).default
  const { report, filters } = args
  const recruiterName = report.recruiter?.name || 'Recruiter'
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Metaforge Recruiter V2'
  wb.created = new Date()

  const k = report.kpis
  addSheet(
    wb,
    ExcelJS,
    'Summary',
    [
      { header: 'Field', key: 'field', width: 36 },
      { header: 'Value', key: 'value', width: 48 },
    ],
    [
      { field: 'Recruiter', value: recruiterName },
      { field: 'Email', value: report.recruiter?.email || '—' },
      { field: 'Client Filter', value: filters.client },
      { field: 'Requirement Filter', value: filters.requirement },
      { field: 'Period', value: filters.dateLabel },
      { field: 'Total Requirements (scope)', value: k.totalRequirementsInScope },
      { field: 'Assigned to Recruiter', value: k.assignedToRecruiter },
      { field: 'Unassigned (scope)', value: k.unassignedInScope },
      { field: 'Sourced Profiles', value: k.sourcedProfiles },
      { field: 'Submitted Profiles', value: k.submittedProfiles },
      { field: 'Non-Submitted Requirements', value: k.nonSubmittedRequirements },
      { field: 'Interviews Total', value: k.interviewTotal },
      { field: 'L1 / L2 / Final', value: `${k.interviewL1} / ${k.interviewL2} / ${k.interviewFinal}` },
      { field: 'Interview Selected / Rejected / Pending', value: `${k.interviewSelected} / ${k.interviewRejected} / ${k.interviewPending}` },
      { field: 'Offers / Onboarding rows', value: k.offeredCount },
      { field: 'Joined', value: k.joinedCount },
      { field: 'Not Joined', value: k.notJoinedCount },
      { field: 'Generated At', value: new Date().toLocaleString() },
    ],
  )

  addSheet(
    wb,
    ExcelJS,
    'Assigned Requirements',
    [
      { header: 'Requirement ID', key: 'id', width: 22 },
      { header: 'Role / Title', key: 'title', width: 36 },
      { header: 'Client', key: 'client', width: 28 },
      { header: 'Received Date', key: 'receivedDate', width: 16 },
      { header: 'Assignment', key: 'assignmentStatus', width: 14 },
      { header: 'Assigned to Recruiter', key: 'assignedToSelected', width: 22 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Submissions by Recruiter', key: 'submissionsByRecruiter', width: 22 },
    ],
    report.requirements.map(r => ({
      ...r,
      assignedToSelected: recruiterName,
    })),
  )

  addSheet(
    wb,
    ExcelJS,
    'Sourced Profiles',
    [
      { header: 'Candidate', key: 'name', width: 28 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Skills', key: 'skills', width: 36 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Added On', key: 'createdLabel', width: 16 },
    ],
    report.sourced,
  )

  addSheet(
    wb,
    ExcelJS,
    'Submitted Profiles',
    [
      { header: 'Candidate', key: 'candidate', width: 28 },
      { header: 'Requirement', key: 'requirement', width: 28 },
      { header: 'Client', key: 'client', width: 24 },
      { header: 'Stage', key: 'stage', width: 20 },
      { header: 'Submitted On', key: 'submittedOn', width: 16 },
      { header: 'Rejection Reason', key: 'rejectionReason', width: 36 },
    ],
    report.submitted,
  )

  addSheet(
    wb,
    ExcelJS,
    'Non-Submitted',
    [
      { header: 'Requirement ID', key: 'id', width: 22 },
      { header: 'Title', key: 'title', width: 36 },
      { header: 'Client', key: 'client', width: 24 },
      { header: 'Received Date', key: 'receivedDate', width: 16 },
      { header: 'Remark', key: 'remark', width: 40 },
    ],
    report.nonSubmitted,
  )

  addSheet(
    wb,
    ExcelJS,
    'Interviews',
    [
      { header: 'Candidate', key: 'candidate', width: 28 },
      { header: 'Requirement', key: 'requirement', width: 28 },
      { header: 'Client', key: 'client', width: 24 },
      { header: 'Round Bucket', key: 'bucket', width: 12 },
      { header: 'Round', key: 'roundLabel', width: 20 },
      { header: 'Status', key: 'status', width: 14 },
      { header: 'Outcome', key: 'outcome', width: 12 },
      { header: 'Rejection Reason', key: 'rejectionReason', width: 36 },
      { header: 'Date', key: 'date', width: 16 },
    ],
    report.interviews,
  )

  addSheet(
    wb,
    ExcelJS,
    'Offers_Onboarding',
    [
      { header: 'Candidate', key: 'candidate', width: 28 },
      { header: 'Requirement', key: 'requirement', width: 28 },
      { header: 'Client', key: 'client', width: 24 },
      { header: 'Offered CTC', key: 'offeredCtc', width: 16 },
      { header: 'Joining Date', key: 'joiningDate', width: 16 },
      { header: 'Status', key: 'status', width: 16 },
      { header: 'Not Onboarded Reason', key: 'notOnboardedReason', width: 40 },
    ],
    report.onboarding,
  )

  const buffer = await wb.xlsx.writeBuffer()
  const safeName = recruiterName.replace(/[^\w.-]+/g, '_')
  const safePeriod = filters.dateLabel.replace(/[^\w.-]+/g, '_')
  downloadBuffer(buffer as ArrayBuffer, `RecruiterPerf_${safeName}_${safePeriod}.xlsx`)
}
