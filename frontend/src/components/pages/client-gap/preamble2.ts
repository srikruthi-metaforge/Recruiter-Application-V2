import { ClientRequirementItem, STANDARDIZED_DOMAINS_LIST } from './preamble'

export function buildClientGapDataset(args: {
  clientCode: string
  pseudoRandom: (index: number) => number
  reqTitlesByDomain: Record<string, string[]>
  spocList: string[]
}): ClientRequirementItem[] {
  const { clientCode, pseudoRandom, reqTitlesByDomain, spocList } = args
  const dataset: ClientRequirementItem[] = []
  let reqCounter = 101

  STANDARDIZED_DOMAINS_LIST.forEach((domain, dIdx) => {
    const titles = reqTitlesByDomain[domain] || ['Senior Specialist Consultant']
    const reqCount = Math.floor(pseudoRandom(dIdx * 3) * 4) + 1 // 1 to 4 requirements per domain

    for (let i = 0; i < reqCount; i++) {
      const title = titles[i % titles.length]
      const rVal = pseudoRandom(dIdx * 10 + i)

      // Positions & Submissions dynamic calculation
      const isZeroSub = rVal < 0.35 // 35% chance of 0 submissions to reflect gap analysis
      const isMissingDomain = domain === 'Other / Needs Validation' || (rVal > 0.88 && i === 0)
      const isNonNumericPos = rVal > 0.92

      const positionsVal = isNonNumericPos ? ('N/A' as any) : Math.floor(pseudoRandom(dIdx * 7 + i) * 12) + 2
      const submissionsVal = isZeroSub ? 0 : Math.floor(pseudoRandom(dIdx * 5 + i) * (typeof positionsVal === 'number' ? positionsVal * 1.5 : 8)) + 1
      const spocName = spocList[Math.floor(pseudoRandom(dIdx * 9 + i) * spocList.length)]

      // Generate realistic candidate interview records
      const interviewCount = Math.max(0, Math.floor(submissionsVal * 0.4))
      const interviewsList: ClientRequirementItem['interviews'] = []

      const candNames = ['Priya Nair', 'Anand K', 'Suresh M', 'Sneha P', 'Rajesh V', 'Kavita R', 'David L', 'Arun G']
      for (let k = 0; k < interviewCount; k++) {
        const kVal = pseudoRandom(dIdx * 20 + k)
        let stage: 'Final Select' | 'L1 Reject' | 'Awaiting / Pending' | 'L2 Interview' | 'Sourced' = 'Awaiting / Pending'
        if (kVal > 0.65) stage = 'Final Select'
        else if (kVal < 0.25) stage = 'L1 Reject'
        else if (kVal < 0.45) stage = 'L2 Interview'

        interviewsList.push({
          candidateName: candNames[k % candNames.length],
          stage,
          date: `2026-08-0${(k % 9) + 1}`,
        })
      }

      // Create dates distributed across week, month, year, and past year
      const datePool = [
        '2026-08-25', // This Week
        '2026-08-23', // This Week
        '2026-08-14', // This Month
        '2026-08-05', // This Month
        '2026-06-18', // This Year
        '2026-04-10', // This Year
        '2026-02-14', // This Year
        '2025-11-20', // All Time (Prior year)
      ]
      const createdDate = datePool[(i + dIdx) % datePool.length]

      dataset.push({
        id: `REQ-2026-${clientCode}-${reqCounter++}`,
        title,
        domain: isMissingDomain ? 'Other / Needs Validation' : domain,
        positions: positionsVal,
        submissions: submissionsVal,
        spoc: spocName,
        status: isZeroSub ? 'Open' : submissionsVal > 10 ? 'Closed' : 'In Progress',
        createdDate,
        hasMissingDomain: isMissingDomain,
        hasNonNumericPositions: isNonNumericPos,
        interviews: interviewsList,
      })
    }
  })

  return dataset
}
