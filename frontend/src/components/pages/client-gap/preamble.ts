import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Building2,
  Briefcase,
  FileText,
  CheckCircle2,
  Clock,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  Sparkles,
  Filter,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Search,
  RotateCcw,
  UserCheck,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Layers,
  PieChart,
  ShieldAlert,
  Check,
  ExternalLink,
  Eye,
  Award,
  FileSpreadsheet,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from 'recharts'
import { Role } from '../../../types'
import { PaginationFooter } from '../../ui/PaginationFooter'
import { buildClientGapDataset } from './preamble2'

export interface ClientGapAnalysisProps {
  clientName: string
  clientDomain?: string
  pocName?: string
  pocEmail?: string
  pocPhone?: string
  teamLead?: string
  role?: Role
  initialDateRange?: string
  onBack: () => void
  onSelectRequirement?: (reqId: string) => void
}

export interface ClientRequirementItem {
  id: string
  title: string
  domain: string
  positions: number | 'N/A'
  submissions: number
  spoc: string
  status: 'Open' | 'In Progress' | 'Closed'
  createdDate: string
  hasMissingDomain?: boolean
  hasNonNumericPositions?: boolean
  interviews: {
    candidateName: string
    stage: 'Final Select' | 'L1 Reject' | 'Awaiting / Pending' | 'L2 Interview' | 'Sourced'
    date: string
  }[]
}

export const STANDARDIZED_DOMAINS_LIST = [
  'Automotive / Mobility',
  'Aerospace & Defense',
  'Plant / Process / Industrial Engineering',
  'Product Engineering / CAD-CAE-PLM',
  'Embedded / Electronics / V&V',
  'Digital / IT / Data',
  'Medical Devices / Healthcare',
  'Energy / Oil & Gas / Renewables',
  'Manufacturing / Quality / Cost Engineering',
  'Warehouse / Supply Chain',
  'Enterprise Apps / Asset & Process Transformation',
  'Other / Needs Validation',
]

// Dynamic data generator helper per client name
export function getClientGapAnalysisDataset(clientName: string = 'Accenture', clientPoc?: string): ClientRequirementItem[] {
  const safeClientName = (clientName || 'Accenture').trim()
  const seed = safeClientName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const clientCode = (safeClientName.length >= 3 ? safeClientName.substring(0, 3) : 'CLI').toUpperCase()

  // Seeded random helper
  const pseudoRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000
    return x - Math.floor(x)
  }

  const reqTitlesByDomain: Record<string, string[]> = {
    'Automotive / Mobility': [
      'EV Battery Management System Architect',
      'AUTOSAR Software Integration Specialist',
      'ADAS Perception & Sensor Fusion Lead',
      'Chassis & Powertrain Design Engineer',
      'Vehicle Dynamics Simulation Engineer',
    ],
    'Aerospace & Defense': [
      'Avionics Embedded Software Engineer',
      'DO-178C Safety Critical Systems Specialist',
      'Aerostructures Stress Analysis Engineer',
      'Flight Control Systems Specialist',
    ],
    'Plant / Process / Industrial Engineering': [
      'Industrial Automation & PLC Programmer',
      'SCADA Systems Integration Specialist',
      'Plant Layout & Process Optimization Lead',
      'Robotics & Conveyor Cell Engineer',
    ],
    'Product Engineering / CAD-CAE-PLM': [
      'CATIA V5/V6 Mechanical Design Specialist',
      'Teamcenter PLM Solution Architect',
      'ANSYS FEA Thermal & Structural Analyst',
      'CREO Plastics & Sheet Metal Engineer',
    ],
    'Embedded / Electronics / V&V': [
      'Embedded C/C++ Firmware Developer',
      'Hardware-in-the-Loop (HIL) Test Specialist',
      'PCB Design & Hardware Board Bringup Lead',
      'Microcontroller Driver Developer',
    ],
    'Digital / IT / Data': [
      'Senior Full Stack Java & Cloud Architect',
      'AWS / Azure DevOps Systems Lead',
      'Data Engineering & Snowflake Architect',
      'Cybersecurity & Network Infrastructure Specialist',
    ],
    'Medical Devices / Healthcare': [
      'ISO 13485 Medical Device Verification Lead',
      'FDA Regulatory Compliance Specialist',
      'Biomedical Signal Processing Engineer',
    ],
    'Energy / Oil & Gas / Renewables': [
      'Subsea Structural Integrity Analyst',
      'Solar & Wind Farm Substation Specialist',
      'Turbine Control Systems Lead',
    ],
    'Manufacturing / Quality / Cost Engineering': [
      'Six Sigma Black Belt Quality Lead',
      'Should-Cost & Teardown Analysis Engineer',
      'APQP & PPAP Compliance Auditor',
    ],
    'Warehouse / Supply Chain': [
      'Supply Chain Network Optimization Manager',
      'Warehouse Automation & WMS Specialist',
    ],
    'Enterprise Apps / Asset & Process Transformation': [
      'SAP S/4HANA TM & Logistics Architect',
      'Oracle Cloud ERP Implementation Lead',
      'Salesforce Enterprise Solution Architect',
    ],
    'Other / Needs Validation': [
      'Unspecified Technical Consultant Requirement',
      'Pending Client Job Demand Brief',
    ],
  }

  // SPOC List strictly scoped to this client
  const primarySpoc = clientPoc || (safeClientName.includes('Goldman') ? 'Trayeetanu Ganguly' : safeClientName.includes('Infosys') ? 'Ramesh Babu' : safeClientName.includes('JPMorgan') ? 'Siddharth N' : 'Kallol Chakraborty')
  const spocList = [primarySpoc, `${primarySpoc} (Lead)`, 'Marcus Chen', 'Harish Gadipally']

  return buildClientGapDataset({ clientCode, pseudoRandom, reqTitlesByDomain, spocList })
}

