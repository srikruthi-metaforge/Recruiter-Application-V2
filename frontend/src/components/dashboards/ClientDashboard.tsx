import React from 'react'
import { KpiGrid, ChartBlock, Panel, DataTable, AiInsightBanner } from '../wireframe/WireframeKit'
import { PageHeader } from '../layout/PageHeader'

export function ClientDashboard() {
  return (
    <div className="space-y-8 w-full pb-12 font-sans">
      <PageHeader
        title="Client Portal"
        subtitle="Review submissions, interview progress, offers, and hiring status"
      />

      <AiInsightBanner text="3 candidates are in final interview stage for Senior React Developer. 1 offer pending your approval." />

      <KpiGrid
        items={[
          { label: 'Active Requirements', value: 4, highlight: true },
          { label: 'Positions Filled', value: 3 },
          { label: 'Positions Open', value: 8 },
          { label: 'Interviews Scheduled', value: 6 },
          { label: 'Offers Released', value: 2 },
          { label: 'Joining This Month', value: 1 },
        ]}
        columns={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartBlock title="Hiring Progress" subtitle="Filled vs open positions" />
        <ChartBlock title="Pipeline Conversion" subtitle="Submission to offer rate" />
      </div>

      <Panel title="My Requirements">
        <DataTable
          columns={['Requirement', 'Openings', 'Submitted', 'Interviewing', 'Offers', 'Status']}
          rows={[
            ['Senior React Developer', '3', '14', '4', '1', 'Active'],
            ['Java Architect', '2', '9', '2', '0', 'Active'],
            ['DevOps Lead', '4', '7', '3', '1', 'Active'],
          ]}
        />
      </Panel>

      <Panel title="Recent Candidate Submissions">
        <DataTable
          columns={['Candidate', 'Role', 'Match', 'Stage', 'Submitted']}
          rows={[
            ['Alex Turner', 'Senior React Developer', '94%', 'Interview Scheduled', 'Aug 5, 2026'],
            ['Sarah Nguyen', 'Senior React Developer', '87%', 'Submitted', 'Aug 5, 2026'],
            ['Rania Khalil', 'Java Architect', '96%', 'Interview Scheduled', 'Aug 3, 2026'],
          ]}
        />
      </Panel>
    </div>
  )
}
