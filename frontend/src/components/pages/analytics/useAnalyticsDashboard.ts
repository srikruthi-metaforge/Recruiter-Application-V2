import { useCallback, useEffect, useState } from 'react'
import { analyticsService, AnalyticsFilterQuery } from '../../../services/workspace.service'

export interface AnalyticsDashboardData {
  dashboard: any | null
  requirements: any | null
  submissions: any | null
  interviews: any | null
  recruiters: any[] | null
  trends: any | null
}

const EMPTY: AnalyticsDashboardData = {
  dashboard: null,
  requirements: null,
  submissions: null,
  interviews: null,
  recruiters: null,
  trends: null,
}

export function useAnalyticsDashboard(enabled: boolean, filters?: AnalyticsFilterQuery) {
  const [data, setData] = useState<AnalyticsDashboardData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const [dashboard, requirements, submissions, interviews, recruiters, trends] = await Promise.all([
        analyticsService.dashboard(filters),
        analyticsService.requirements(filters),
        analyticsService.submissions(filters),
        analyticsService.interviews(filters),
        analyticsService.recruiters(filters),
        analyticsService.trends(filters),
      ])
      setData({
        dashboard,
        requirements,
        submissions,
        interviews,
        recruiters: Array.isArray(recruiters) ? recruiters : [],
        trends,
      })
    } catch (err: any) {
      const status = err?.status || err?.response?.status
      if (status === 403) {
        setError('You do not have permission to view Analytics.')
      } else {
        setError(err?.message || 'Failed to load analytics')
      }
      setData(EMPTY)
    } finally {
      setLoading(false)
    }
  }, [enabled, filters?.startDate, filters?.endDate])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
