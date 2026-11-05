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

/** Small pause between report/analytics calls so we do not stampede the API. */
function wait(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms)
  })
}

export function useAnalyticsDashboard(enabled: boolean, filters?: AnalyticsFilterQuery) {
  const [data, setData] = useState<AnalyticsDashboardData>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    setData(EMPTY)

    // Load one endpoint at a time (dashboard first) instead of Promise.all of 6.
    // Avoids 429s when Reports/Analytics opens and every chart hits the API together.
    const steps: Array<{
      key: keyof AnalyticsDashboardData
      run: () => Promise<any>
      map?: (value: any) => any
    }> = [
      { key: 'dashboard', run: () => analyticsService.dashboard(filters) },
      { key: 'requirements', run: () => analyticsService.requirements(filters) },
      { key: 'submissions', run: () => analyticsService.submissions(filters) },
      { key: 'interviews', run: () => analyticsService.interviews(filters) },
      {
        key: 'recruiters',
        run: () => analyticsService.recruiters(filters),
        map: value => (Array.isArray(value) ? value : []),
      },
      { key: 'trends', run: () => analyticsService.trends(filters) },
    ]

    let firstError: string | null = null
    try {
      for (let i = 0; i < steps.length; i += 1) {
        const step = steps[i]
        try {
          const raw = await step.run()
          const value = step.map ? step.map(raw) : raw
          setData(prev => ({ ...prev, [step.key]: value }))
        } catch (err: any) {
          const status = err?.status || err?.response?.status
          if (status === 403) {
            firstError = 'You do not have permission to view Analytics.'
            break
          }
          if (!firstError) {
            firstError = err?.message || 'Failed to load analytics'
          }
          // Continue other sections so one failing chart does not blank the page.
        }
        if (i < steps.length - 1) {
          await wait(120)
        }
      }
      if (firstError) setError(firstError)
    } finally {
      setLoading(false)
    }
  }, [enabled, filters?.startDate, filters?.endDate])

  useEffect(() => {
    load()
  }, [load])

  return { data, loading, error, reload: load }
}
