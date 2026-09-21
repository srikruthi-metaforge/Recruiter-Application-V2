import React from 'react'
import { createOrUpdateForwardRequest, approveForwardRequest, rejectForwardRequest } from '../../../data/forwardRequestsStore'
import { checkDuplicateSubmission } from '../../../data/submissionsStore'
import type { SubmitToLeadVmState } from './useSubmitToLeadPageState'

export function useSubmitToLeadPageHandlers2(s: SubmitToLeadVmState & Record<string, any>) {
  const {
    selectedCandidates, requirement, setClientName, toRecipients,
    setToRecipients, ccRecipients, setCcRecipients, newToInput,
    setNewToInput, newCcInput, setNewCcInput, setToastMsg,
    columnList, setColumnList, hiddenColumns, setHiddenColumns,
    customColName, customColPosition, headerColor, setHeaderColor,
    CLIENT_TRACKER_PRESETS, setTrackerRows, setCustomColName
  } = s
  const handleClientChange = (newClient: string) => {
    setClientName(newClient)
    const preset = CLIENT_TRACKER_PRESETS[newClient]
    if (preset) {
      setHeaderColor(preset.headerColor)
      setColumnList(preset.columns)
      setHiddenColumns(new Set())

      setTrackerRows((prev: Record<string, string>[]) =>
        prev.map((r: Record<string, string>, idx: number) => {
          const updatedRow: Record<string, string> = {}
          preset.columns.forEach(col => {
            if (col === 'S.No' || col === 'Sl. NO' || col === 'Sl No' || col === 'Sl.No') updatedRow[col] = String(idx + 1)
            else if (col === 'Vendor Name') updatedRow[col] = 'MetaForge'
            else if (col === 'BU/IS') updatedRow[col] = 'Engineering'
            else if (col === 'Position/ Title') updatedRow[col] = newClient === 'LTTS / L&T' ? 'Teamcenter Admin' : (requirement?.title || 'Senior Software Engineer')
            else if (col === 'Skill') updatedRow[col] = newClient === 'ITC Infotech' ? 'Dot Net Angular/React' : newClient === 'LTTS / L&T' ? 'Teamcenter Administration 5.0 Years, Teamcenter RAC 5.0 Years, Active Workspace (AWC) 4.0 Years, BMIDE Customization 4.0 Years, Workflow Designer 4.0 Years, Access Manager 4.0 Years, Multisite Setup 3.5 Years, Deployment Center 3.2 Years, CI/CD (Jenkins / Azure DevOps) 3.0 Years, FMS / TcServer Setup 3.1 Years, Import/Export / BNU 2.0 Years' : (requirement?.skills?.join(', ') || 'Java, React, Automation')
            else if (col === 'Resumes sent Date (DDMMYY)') updatedRow[col] = newClient === 'LTTS / L&T' ? '16/3/2026' : '19/08/2026'
            else if (col === 'Full Name of the candidate') updatedRow[col] = newClient === 'LTTS / L&T' ? 'HARISH C. MITKARI' : (r['Full Name of the candidate'] || r['Candidate Name'] || selectedCandidates[idx]?.name || 'Priyanka Sharma')
            else if (col === 'Candidate Name') updatedRow[col] = newClient === 'ITC Infotech' ? 'Manjeet Kumar' : (r['Candidate Name'] || r['Full Name of the candidate'] || selectedCandidates[idx]?.name || 'Priyanka Sharma')
            else if (col === 'Total experience') updatedRow[col] = '8.0 Years'
            else if (col === 'Relevant experience') updatedRow[col] = 'Cloud Dotnet Core - 4.0 Years, Web API - 4.0 Years, Cloud Native - 2.0 Years, Angular - 1.0 Years, Rest API - 2.0 Years'
            else if (col === 'Candidate Mobile Number') updatedRow[col] = '9625302940'
            else if (col === 'Current Payroll Company') updatedRow[col] = 'USAFect Inc'
            else if (col === 'CTC') updatedRow[col] = '18.0 LPA'
            else if (col === 'ECTC') updatedRow[col] = '22.0 LPA'
            else if (col === 'Official Notice Period /Serving NP (LWD Date)') updatedRow[col] = 'Immediate (LWD: 15-Dec-2025)'
            else if (col === 'Work Location') updatedRow[col] = 'Bengaluru'
            else if (col === 'Interview date') updatedRow[col] = '—'
            else if (col === 'Interview time') updatedRow[col] = '—'
            else if (col === 'SO Number') updatedRow[col] = 'PCIIL_0000241067_1'
            else if (col === 'Status') updatedRow[col] = 'Submitted'
            else if (col === 'Last Full Time Qualification') updatedRow[col] = newClient === 'LTTS / L&T' ? 'B.Tech' : 'B.E. Computer Science'
            else if (col === 'MOBILE NO') updatedRow[col] = newClient === 'LTTS / L&T' ? '7798829401' : '+91 98210 44905'
            else if (col === 'Mail ID') updatedRow[col] = newClient === 'LTTS / L&T' ? 'harish.mitkari@gmail.com' : 'priyanka.sharma@gmail.com'
            else if (col === 'NP(Days)') updatedRow[col] = newClient === 'LTTS / L&T' ? 'Official NP is 30 Days, Negotiable up to 15 Days' : '30 Days'
            else if (col === 'Total Exp') updatedRow[col] = newClient === 'LTTS / L&T' ? '5.2 Years' : '11 Years 3 Months'
            else if (col === 'Relevant Exp') updatedRow[col] = newClient === 'LTTS / L&T' ? '5.2 Years' : '9 Years'
            else if (col === 'Current Location') updatedRow[col] = newClient === 'ITC Infotech' ? 'New Delhi' : newClient === 'LTTS / L&T' ? 'Pune' : 'Bangalore'
            else if (col === 'Job Location') updatedRow[col] = newClient === 'LTTS / L&T' ? 'Chennai' : 'Bangalore / Hybrid'
            else if (col === 'Current Organization') updatedRow[col] = newClient === 'LTTS / L&T' ? 'MetaForge Partner' : 'Cognizant Technology Solutions'
            else if (col === 'Rate per Month') updatedRow[col] = newClient === 'LTTS / L&T' ? '135000+Taxes PM' : '25 LPA'
            else if (col === 'RV ID') updatedRow[col] = `RV-${8821 + idx}`
            else if (col === 'Date of Submission' || col === 'Submission Date') updatedRow[col] = '19/08/2026'
            else if (col === 'Candidate DOB') updatedRow[col] = '14/05/1993'
            else if (col === 'Req ID') updatedRow[col] = requirement?.id || 'REQ-2026-08-12-001'
            else if (col === 'Beeline ID') updatedRow[col] = `BL-${994102 + idx}`
            else if (col === 'First Name') updatedRow[col] = (r['Candidate Name'] || selectedCandidates[idx]?.name || 'Priyanka Sharma').split(' ')[0]
            else if (col === 'Last Name') updatedRow[col] = (r['Candidate Name'] || selectedCandidates[idx]?.name || 'Priyanka Sharma').split(' ')[1] || 'Sharma'
            else if (col === 'Contact Number') updatedRow[col] = r['Contact Number'] || r['MOBILE NO'] || selectedCandidates[idx]?.phone || '+91 98210 44905'
            else if (col === 'Email ID' || col === 'Email id') updatedRow[col] = newClient === 'ITC Infotech' ? 'manjeet.techacc9597@gmail.com' : (r['Email ID'] || r['Email id'] || r['Mail ID'] || selectedCandidates[idx]?.email || 'priyanka.sharma@gmail.com')
            else if (col === 'Gender') updatedRow[col] = 'Female'
            else if (col === 'Primary Skill' || col === 'Skillset') updatedRow[col] = r['Primary Skill'] || r['Skillset'] || r['Skill'] || requirement?.skills?.join(', ') || 'Java, React, SQL, Selenium'
            else if (col === 'Total Experience' || col === 'Total Yrs of Exp') updatedRow[col] = '11 Years 3 Months'
            else if (col === 'Relevant Experience') updatedRow[col] = '9 Years'
            else if (col === 'Preferred Location') updatedRow[col] = 'Bangalore / Hybrid'
            else if (col === 'Notice Period in days' || col === 'Notice period') updatedRow[col] = '30 Days'
            else if (col === 'Acc Ex Emp/Cont') updatedRow[col] = 'No'
            else if (col === 'Ex Employee- EMP ID') updatedRow[col] = '—'
            else if (col === 'Current CTC (Monthly)' || col === 'Current CTC') updatedRow[col] = '₹1,54,166'
            else if (col === 'Exp CTC (Monthly)' || col === 'Expected CTC/Rate card') updatedRow[col] = '₹2,08,333'
            else if (col === 'Mark up %') updatedRow[col] = '15%'
            else if (col === 'Final Bill Rate Monthly (Exp CTC + mark up)') updatedRow[col] = '₹2,39,583'
            else if (col === 'Supplier name') updatedRow[col] = 'MetaForge IT'
            else if (col === 'Current Employer Name' || col === 'Current Company') updatedRow[col] = 'Cognizant Technology Solutions'
            else if (col === 'Available Documents') updatedRow[col] = 'PAN, Aadhar, Payslips, Relieving Letter'
            else if (col === 'Previous Employer Name') updatedRow[col] = 'TCS Limited'
            else if (col === 'Available Documents (Prev)') updatedRow[col] = 'Experience Letter, Form 16'
            else if (col === 'Highest Education') updatedRow[col] = newClient === 'ITC Infotech' ? 'MCA' : 'B.E. Computer Science'
            else if (col === 'Name of college for highest education') updatedRow[col] = 'University College of Engineering'
            else if (col === 'Name of University for highest education') updatedRow[col] = 'Osmania University'
            else if (col === 'Technical Evaluation') updatedRow[col] = 'Passed - L1/L2 Technical'
            else if (col === 'Technical Assessment proof attached in Resume') updatedRow[col] = 'Yes (Attached in Resume PDF)'
            else if (col === 'PAN Card Number') updatedRow[col] = 'ABCDE1234F'
            else if (col === 'OT Amount') updatedRow[col] = 'As per Accenture Policy'
            else if (col === 'Availability for Interview') updatedRow[col] = 'Available weekdays after 4 PM'
            else if (col === 'Reason') updatedRow[col] = 'Career Advancement & Leadership'
            else if (col === 'Offer in Hand') updatedRow[col] = 'Yes (28 LPA from Capgemini)'
            else if (col === 'Linkedin URL') updatedRow[col] = 'https://linkedin.com/in/priyanka-sharma'
            else updatedRow[col] = r[col] || ''
          })
          return updatedRow
        })
      )
      showToast(`Loaded tracker preset layout for ${newClient}!`)
    }
  }

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleAddToRecipient = () => {
    if (newToInput.trim() && newToInput.includes('@')) {
      setToRecipients([...toRecipients, newToInput.trim()])
      setNewToInput('')
    }
  }

  const handleAddCcRecipient = () => {
    if (newCcInput.trim() && newCcInput.includes('@')) {
      setCcRecipients([...ccRecipients, newCcInput.trim()])
      setNewCcInput('')
    }
  }

  const handleRemoveTo = (email: string) => {
    setToRecipients(toRecipients.filter(e => e !== email))
  }

  const handleRemoveCc = (email: string) => {
    setCcRecipients(ccRecipients.filter(e => e !== email))
  }

  const toggleColumnVisibility = (colName: string) => {
    const next = new Set(hiddenColumns)
    if (next.has(colName)) next.delete(colName)
    else next.add(colName)
    setHiddenColumns(next)
  }

  const handleInsertCustomColumn = () => {
    if (!customColName.trim()) return
    const col = customColName.trim()
    if (columnList.includes(col)) {
      showToast(`Column "${col}" already exists!`)
      return
    }

    if (customColPosition === 'At start') {
      setColumnList([col, ...columnList])
    } else {
      setColumnList([...columnList, col])
    }

    setTrackerRows((prev: Record<string, string>[]) =>
      prev.map((row: Record<string, string>) => ({
        ...row,
        [col]: '',
      }))
    )

    setCustomColName('')
    showToast(`Custom column "${col}" inserted into tracker!`)
  }

  return {
    handleClientChange, showToast, handleAddToRecipient, handleAddCcRecipient,
    handleRemoveTo, handleRemoveCc, toggleColumnVisibility, handleInsertCustomColumn
  }
}
