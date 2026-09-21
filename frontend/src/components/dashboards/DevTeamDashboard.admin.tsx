import React from 'react'
import { Panel, DataTable } from '../wireframe/WireframeKit'

export function DevTeamDashboardAdminPanel() {
  return (
    <Panel title="Platform Administrative Overview">
      <DataTable
        columns={['Admin / Lead', 'Role', 'Leads / Team', 'Recruiters', 'Active Reqs', 'Submissions', 'Status']}
        rows={[
          ['Robert Haines', 'Super Admin', '5 Leads', '24 Recruiters', '42 Reqs', '480', 'Active'],
          ['David Park', 'Admin', '3 Leads', '12 Recruiters', '24 Reqs', '210', 'Active'],
          ['Sarah Kim', 'Team Lead', 'Tech Hiring', '6 Recruiters', '12 Reqs', '134', 'Active'],
          ['Tom Walsh', 'Team Lead', 'Finance Hiring', '4 Recruiters', '8 Reqs', '86', 'Active'],
        ]}
      />
    </Panel>
  )
}
