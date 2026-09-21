export function calculateTAT(receivedTime?: string, firstSubmissionTime?: string): string {
  if (!receivedTime || !firstSubmissionTime) return '3h 30m'
  try {
    const d1 = new Date(receivedTime)
    const d2 = new Date(firstSubmissionTime)
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '3h 30m'
    const diffMs = Math.max(0, d2.getTime() - d1.getTime())
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (diffHrs >= 24) {
      const days = Math.floor(diffHrs / 24)
      const remHrs = diffHrs % 24
      return `${days}d ${remHrs}h`
    }
    return `${diffHrs}h ${diffMins}m`
  } catch {
    return '3h 30m'
  }
}
