import React from 'react'
import { Role } from '../../types'

export interface MonthlyMetric {
  month: string
  requirementsReceived: number
  totalPositions: number
  firstSubmissions: number
  totalSubmissions: number
  avgTATDays: number | null
}

export interface DetailLogItem {
  id: string
  subject: string
  recruiter: string
  clientPOC: string
  receivedDate: string
  receivedTime: string
  submittedDate: string
  submittedTime: string
  positions: number
}

export const MONTHLY_TIMELINE_DATA: MonthlyMetric[] = [
  { month: 'Apr 2026', requirementsReceived: 40, totalPositions: 95, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
  { month: 'May 2026', requirementsReceived: 92, totalPositions: 215, firstSubmissions: 19, totalSubmissions: 23, avgTATDays: 4.84 },
  { month: 'Jun 2026', requirementsReceived: 86, totalPositions: 198, firstSubmissions: 41, totalSubmissions: 86, avgTATDays: 1.1 },
  { month: 'Jul 2026', requirementsReceived: 68, totalPositions: 154, firstSubmissions: 52, totalSubmissions: 187, avgTATDays: 0.73 },
]

export const FIRST_SUBMISSION_LOGS: DetailLogItem[] = [
  {
    id: 'REQ-2026-05-08-003',
    subject: 'TPC OSI PI Engineer / Lead Engineer - TPC Any LTTS',
    recruiter: 'Charlie Darwin',
    clientPOC: 'Trayeetanu Ganguly',
    receivedDate: '08 May 2026',
    receivedTime: '01:58 pm',
    submittedDate: '26 Jun 2026',
    submittedTime: '01:19 pm',
    positions: 6,
  },
  {
    id: 'REQ-2026-05-12-014',
    subject: 'TPC Data Analyst for Vadodara-TPC',
    recruiter: 'Charlie Darwin',
    clientPOC: 'Trayeetanu Ganguly',
    receivedDate: '12 May 2026',
    receivedTime: '04:05 pm',
    submittedDate: '01 Jun 2026',
    submittedTime: '03:22 pm',
    positions: 4,
  },
  {
    id: 'REQ-2026-05-19-010',
    subject: 'C# with Mobile Automation',
    recruiter: 'lakshmi.v Recruiter',
    clientPOC: 'Trayeetanu Ganguly',
    receivedDate: '19 May 2026',
    receivedTime: '05:30 am',
    submittedDate: '19 May 2026',
    submittedTime: '06:47 pm',
    positions: 8,
  },
  {
    id: 'REQ-2026-05-19-003',
    subject: 'TPC- MIG exhaust welding fixture / BIW welding fixture',
    recruiter: 'Suresh kulkarni',
    clientPOC: 'Trayeetanu Ganguly',
    receivedDate: '19 May 2026',
    receivedTime: '11:57 am',
    submittedDate: '29 May 2026',
    submittedTime: '08:27 pm',
    positions: 5,
  },
  {
    id: 'REQ-2026-05-21-004',
    subject: 'MIG welding Fixtures / Modular Fixtures',
    recruiter: 'Viswanath Reddy',
    clientPOC: 'Internal (data entry)',
    receivedDate: '21 May 2026',
    receivedTime: '05:30 am',
    submittedDate: '25 May 2026',
    submittedTime: '04:04 pm',
    positions: 3,
  },
  {
    id: 'REQ-2026-05-21-002',
    subject: 'DPS- TPC Golang, Kubernetes, NATS Bangalore',
    recruiter: 'Lingoji Pavani',
    clientPOC: 'Kiran N',
    receivedDate: '21 May 2026',
    receivedTime: '10:22 am',
    submittedDate: '21 May 2026',
    submittedTime: '06:34 pm',
    positions: 7,
  },
]

export const MONTHLY_TIMELINE_DATA_INDIVIDUAL: MonthlyMetric[] = [
  { month: 'Apr 2026', requirementsReceived: 6, totalPositions: 15, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
  { month: 'May 2026', requirementsReceived: 14, totalPositions: 32, firstSubmissions: 4, totalSubmissions: 6, avgTATDays: 4.2 },
  { month: 'Jun 2026', requirementsReceived: 12, totalPositions: 28, firstSubmissions: 10, totalSubmissions: 18, avgTATDays: 1.2 },
  { month: 'Jul 2026', requirementsReceived: 13, totalPositions: 20, firstSubmissions: 12, totalSubmissions: 24, avgTATDays: 0.8 },
]

export const MONTHLY_TIMELINE_DATA_TEAM: MonthlyMetric[] = [
  { month: 'Apr 2026', requirementsReceived: 40, totalPositions: 95, firstSubmissions: 0, totalSubmissions: 0, avgTATDays: null },
  { month: 'May 2026', requirementsReceived: 92, totalPositions: 215, firstSubmissions: 19, totalSubmissions: 23, avgTATDays: 4.84 },
  { month: 'Jun 2026', requirementsReceived: 86, totalPositions: 198, firstSubmissions: 41, totalSubmissions: 86, avgTATDays: 1.1 },
  { month: 'Jul 2026', requirementsReceived: 68, totalPositions: 154, firstSubmissions: 52, totalSubmissions: 187, avgTATDays: 0.73 },
]

export interface MonthlyTimelineProps {
  role?: Role
}

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataObj = payload[0].payload
    return (
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1.5 font-sans animate-in fade-in zoom-in-95 duration-150">
        <div className="font-extrabold text-blue-300 border-b border-slate-700 pb-1 flex items-center justify-between gap-4">
          <span>{label}</span>
          <span className="text-[10px] text-slate-400 font-normal">Monthly Timeline</span>
        </div>
        <div className="space-y-1 text-[11px] font-medium pt-0.5">
          <div className="flex justify-between gap-4">
            <span className="text-blue-400 font-bold">Requirements Received:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.requirementsReceived}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-indigo-400 font-bold">Total Positions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalPositions ?? 0}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-emerald-400 font-bold">Total Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.totalSubmissions}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-300 font-bold">First Submissions:</span>
            <span className="font-extrabold tabular-nums text-white">{dataObj.firstSubmissions}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 border-t border-slate-800 text-purple-300 font-bold">
            <span>Avg First-Sub TAT:</span>
            <span className="tabular-nums text-purple-300">
              {dataObj.avgTATDays !== null ? `${dataObj.avgTATDays} Days` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}
