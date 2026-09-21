export interface StageMetric {
  stage: string
  stageName: string
  requirementsCount: number
  positionsCount: number
  submissionsCount: number
  placedCount: number
  closuresCount: number
  conversionPct: string
}

export interface RequirementStageDetail {
  id: string
  title: string
  client: string
  stage: string
  positions: number
  submissions: number
  placed: number
}

export const STAGE_PIPELINE_DATA: StageMetric[] = [
  {
    stage: 'L1',
    stageName: 'Technical Round 1 (L1)',
    requirementsCount: 18,
    positionsCount: 45,
    submissionsCount: 42,
    placedCount: 12,
    closuresCount: 8,
    conversionPct: '100%',
  },
  {
    stage: 'L2',
    stageName: 'Technical Round 2 (L2)',
    requirementsCount: 14,
    positionsCount: 36,
    submissionsCount: 28,
    placedCount: 9,
    closuresCount: 6,
    conversionPct: '66.7%',
  },
  {
    stage: 'L3',
    stageName: 'Managerial / Architecture (L3)',
    requirementsCount: 10,
    positionsCount: 24,
    submissionsCount: 18,
    placedCount: 6,
    closuresCount: 4,
    conversionPct: '42.8%',
  },
  {
    stage: 'Final',
    stageName: 'Client Final / HR Round',
    requirementsCount: 6,
    positionsCount: 15,
    submissionsCount: 12,
    placedCount: 4,
    closuresCount: 3,
    conversionPct: '28.5%',
  },
]

export const REQUIREMENT_STAGE_DETAILS: RequirementStageDetail[] = [
  { id: 'REQ-2026-08-12-001', title: 'TPC - Requirement - C# Automation - Embedded', client: 'LTTS / L&T', stage: 'L1 (Tech Round 1)', positions: 8, submissions: 14, placed: 3 },
  { id: 'REQ-2026-08-12-003', title: 'Senior React / Fullstack Architect', client: 'Accenture Enterprise', stage: 'L2 (Tech Round 2)', positions: 6, submissions: 18, placed: 2 },
  { id: 'REQ-701', title: 'Lead Java Full Stack Developer', client: 'Accenture', stage: 'L1 (Tech Round 1)', positions: 12, submissions: 42, placed: 5 },
  { id: 'REQ-702', title: 'Senior React Native Mobile Dev', stage: 'L3 (Managerial)', client: 'LTTS Automotive', positions: 8, submissions: 28, placed: 4 },
  { id: 'REQ-703', title: 'Cloud Solutions Architect', client: 'Infosys', stage: 'Final (Client HR)', positions: 5, submissions: 12, placed: 3 },
  { id: 'REQ-704', title: 'DevOps Cloud Infrastructure Specialist', client: 'Continental Automotive', stage: 'L2 (Tech Round 2)', positions: 7, submissions: 10, placed: 2 },
]

export const STAGE_PIPELINE_DATA_INDIVIDUAL: StageMetric[] = [
  { stage: 'L1', stageName: 'Technical Round 1 (L1)', requirementsCount: 6, positionsCount: 15, submissionsCount: 14, placedCount: 3, closuresCount: 2, conversionPct: '100%' },
  { stage: 'L2', stageName: 'Technical Round 2 (L2)', requirementsCount: 4, positionsCount: 10, submissionsCount: 8, placedCount: 2, closuresCount: 1, conversionPct: '66.7%' },
  { stage: 'L3', stageName: 'Managerial / Architecture (L3)', requirementsCount: 3, positionsCount: 6, submissionsCount: 5, placedCount: 1, closuresCount: 1, conversionPct: '42.8%' },
  { stage: 'Final', stageName: 'Client Final / HR Round', requirementsCount: 2, positionsCount: 4, submissionsCount: 3, placedCount: 1, closuresCount: 1, conversionPct: '28.5%' },
]

export const STAGE_PIPELINE_DATA_TEAM: StageMetric[] = [
  { stage: 'L1', stageName: 'Technical Round 1 (L1)', requirementsCount: 18, positionsCount: 45, submissionsCount: 42, placedCount: 12, closuresCount: 8, conversionPct: '100%' },
  { stage: 'L2', stageName: 'Technical Round 2 (L2)', requirementsCount: 14, positionsCount: 36, submissionsCount: 28, placedCount: 9, closuresCount: 6, conversionPct: '66.7%' },
  { stage: 'L3', stageName: 'Managerial / Architecture (L3)', requirementsCount: 10, positionsCount: 24, submissionsCount: 18, placedCount: 6, closuresCount: 4, conversionPct: '42.8%' },
  { stage: 'Final', stageName: 'Client Final / HR Round', requirementsCount: 6, positionsCount: 15, submissionsCount: 12, placedCount: 4, closuresCount: 3, conversionPct: '28.5%' },
]

export const STAGE_PIPELINE_DATA_MARCUS: StageMetric[] = [
  { stage: 'L1', stageName: 'Technical Round 1 (L1)', requirementsCount: 8, positionsCount: 20, submissionsCount: 18, placedCount: 5, closuresCount: 3, conversionPct: '100%' },
  { stage: 'L2', stageName: 'Technical Round 2 (L2)', requirementsCount: 6, positionsCount: 15, submissionsCount: 12, placedCount: 4, closuresCount: 2, conversionPct: '75%' },
  { stage: 'L3', stageName: 'Managerial / Architecture (L3)', requirementsCount: 4, positionsCount: 10, submissionsCount: 8, placedCount: 3, closuresCount: 2, conversionPct: '50%' },
  { stage: 'Final', stageName: 'Client Final / HR Round', requirementsCount: 3, positionsCount: 6, submissionsCount: 5, placedCount: 2, closuresCount: 1, conversionPct: '33%' },
]

export const STAGE_PIPELINE_DATA_PRIYA: StageMetric[] = [
  { stage: 'L1', stageName: 'Technical Round 1 (L1)', requirementsCount: 6, positionsCount: 15, submissionsCount: 14, placedCount: 4, closuresCount: 3, conversionPct: '100%' },
  { stage: 'L2', stageName: 'Technical Round 2 (L2)', requirementsCount: 5, positionsCount: 12, submissionsCount: 9, placedCount: 3, closuresCount: 2, conversionPct: '64%' },
  { stage: 'L3', stageName: 'Managerial / Architecture (L3)', requirementsCount: 3, positionsCount: 8, submissionsCount: 5, placedCount: 2, closuresCount: 1, conversionPct: '38%' },
  { stage: 'Final', stageName: 'Client Final / HR Round', requirementsCount: 2, positionsCount: 5, submissionsCount: 4, placedCount: 1, closuresCount: 1, conversionPct: '25%' },
]

export const STAGE_PIPELINE_DATA_ARVIND: StageMetric[] = [
  { stage: 'L1', stageName: 'Technical Round 1 (L1)', requirementsCount: 3, positionsCount: 8, submissionsCount: 6, placedCount: 2, closuresCount: 1, conversionPct: '100%' },
  { stage: 'L2', stageName: 'Technical Round 2 (L2)', requirementsCount: 2, positionsCount: 5, submissionsCount: 4, placedCount: 1, closuresCount: 1, conversionPct: '66%' },
  { stage: 'L3', stageName: 'Managerial / Architecture (L3)', requirementsCount: 1, positionsCount: 3, submissionsCount: 2, placedCount: 1, closuresCount: 0, conversionPct: '33%' },
  { stage: 'Final', stageName: 'Client Final / HR Round', requirementsCount: 1, positionsCount: 2, submissionsCount: 1, placedCount: 0, closuresCount: 0, conversionPct: '20%' },
]

export function resolveStagePipelineData(
  leadChartView: 'individual' | 'team',
  selectedTeammate: string,
): StageMetric[] {
  if (leadChartView === 'individual') return STAGE_PIPELINE_DATA_INDIVIDUAL
  if (selectedTeammate === 'Marcus Chen') return STAGE_PIPELINE_DATA_MARCUS
  if (selectedTeammate === 'Priya Sharma') return STAGE_PIPELINE_DATA_PRIYA
  if (selectedTeammate === 'Arvind GR') return STAGE_PIPELINE_DATA_ARVIND
  return STAGE_PIPELINE_DATA_TEAM
}
