/** Shared chart palette for Super Admin Analytics (extendable to other roles later). */
export const ANALYTICS_COLORS = [
  '#6B3BF6',
  '#2563EB',
  '#0891B2',
  '#059669',
  '#D97706',
  '#DC2626',
  '#7C3AED',
  '#DB2777',
]

export function recordToChartData(record: Record<string, number> | null | undefined): { name: string; value: number }[] {
  if (!record) return []
  return Object.entries(record)
    .filter(([, value]) => typeof value === 'number' && value > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
