interface TrendPoint {
  label: string
  value: number
  target: number
  topCandidate?: string
}

export const RECRUITER_TREND_DATA: Record<
  string,
  Record<'Day-Wise' | 'Month-Wise', TrendPoint[]>
> = {
  All: {
    'Day-Wise': [
      { label: 'Mon', value: 18, target: 20, topCandidate: 'Alex Turner (Accenture)' },
      { label: 'Tue', value: 24, target: 20, topCandidate: 'Sarah Nguyen (Accenture)' },
      { label: 'Wed', value: 32, target: 20, topCandidate: 'Rania Khalil (Goldman)' },
      { label: 'Thu', value: 27, target: 20, topCandidate: 'Ben Wallace (Tesla)' },
      { label: 'Fri', value: 35, target: 20, topCandidate: 'David Osei (Accenture)' },
      { label: 'Sat', value: 14, target: 10, topCandidate: 'Soo-Jin Lee (JP Morgan)' },
      { label: 'Sun', value: 12, target: 10, topCandidate: 'Fatima Al-Hassan (MSFT)' },
    ],
    'Month-Wise': [
      { label: 'Apr', value: 140, target: 160, topCandidate: 'Q1 Batch Placements' },
      { label: 'May', value: 165, target: 160, topCandidate: 'Full Stack Sprint' },
      { label: 'Jun', value: 190, target: 180, topCandidate: 'Java Architect Push' },
      { label: 'Jul', value: 210, target: 200, topCandidate: 'Tesla ML Hire Drive' },
      { label: 'Aug', value: 226, target: 210, topCandidate: 'Current Month Peak' },
    ],
  },
  'Marcus Chen': {
    'Day-Wise': [
      { label: 'Mon', value: 4, target: 5, topCandidate: 'Alex Turner' },
      { label: 'Tue', value: 6, target: 5, topCandidate: 'Sarah Nguyen' },
      { label: 'Wed', value: 8, target: 5, topCandidate: 'David Osei' },
      { label: 'Thu', value: 5, target: 5, topCandidate: 'Lily Zhao' },
      { label: 'Fri', value: 7, target: 5, topCandidate: 'Marcus Lead Sub' },
      { label: 'Sat', value: 2, target: 2, topCandidate: 'Weekend Dev' },
      { label: 'Sun', value: 2, target: 2, topCandidate: 'Weekend Sub' },
    ],
    'Month-Wise': [
      { label: 'Apr', value: 20, target: 30 },
      { label: 'May', value: 25, target: 30 },
      { label: 'Jun', value: 30, target: 35 },
      { label: 'Jul', value: 32, target: 35 },
      { label: 'Aug', value: 34, target: 35 },
    ],
  },
  'James O\'Brien': {
    'Day-Wise': [
      { label: 'Mon', value: 6, target: 6, topCandidate: 'Rania Khalil' },
      { label: 'Tue', value: 8, target: 6, topCandidate: 'Java Dev 1' },
      { label: 'Wed', value: 10, target: 6, topCandidate: 'Spring Boot Lead' },
      { label: 'Thu', value: 7, target: 6, topCandidate: 'Kafka Architect' },
      { label: 'Fri', value: 9, target: 6, topCandidate: 'Microservices Expert' },
      { label: 'Sat', value: 1, target: 2 },
      { label: 'Sun', value: 0, target: 2 },
    ],
    'Month-Wise': [
      { label: 'Apr', value: 28, target: 35 },
      { label: 'May', value: 32, target: 35 },
      { label: 'Jun', value: 36, target: 35 },
      { label: 'Jul', value: 39, target: 40 },
      { label: 'Aug', value: 41, target: 40 },
    ],
  },
}
