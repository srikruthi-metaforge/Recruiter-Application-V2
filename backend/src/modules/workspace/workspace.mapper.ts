const ROUND_MAP: Record<string, string> = {
  Screening: 'Screening',
  'L1 Technical': 'Technical Round 1',
  'L2 Technical': 'Technical Round 2',
  'HR Round': 'HR Round',
  'Manager Round': 'Manager Round',
  'Client Round': 'Final Round',
};

const INTERVIEW_STATUS_MAP: Record<string, string> = {
  Scheduled: 'Scheduled',
  Confirmed: 'Confirmed',
  'In Progress': 'Pending',
  Completed: 'Passed',
  Passed: 'Passed',
  Rejected: 'Rejected',
  Rescheduled: 'Scheduled',
  Cancelled: 'Rejected',
};

function idOf(doc: any): string {
  return doc?._id ? String(doc._id) : String(doc || '');
}

function formatDate(value?: Date | string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value?: Date | string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function relativeTime(value?: Date | string | null): string {
  if (!value) return 'Just now';
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function mapRequirement(r: any) {
  const status = r.status === 'In Progress' || r.status === 'Assigned' ? 'Active' : r.status;
  return {
    id: r.reqCode || idOf(r),
    _id: idOf(r),
    title: r.title,
    client: r.clientName || '',
    priority: r.priority === 'Urgent' ? 'High' : r.priority || 'Medium',
    status,
    submissions: r.submissionsCount || 0,
    interviews: r.interviewsCount || 0,
    placed: r.placedCount || 0,
    dueDate: formatDate(r.dueDate),
    openings: r.openings || 1,
    budget: r.budgetRange
      ? `${r.budgetRange.currency || 'INR'} ${r.budgetRange.min}-${r.budgetRange.max}`
      : undefined,
    skills: r.skillsRequired || [],
    location: r.location,
    assignmentStatus: r.assignmentStatus,
    assignedLead: r.assignedLeadName,
    revokeRequested: r.revokeRequested,
    revokeReason: r.revokeReason,
    emailArrivedTime: r.emailArrivedTime ? formatDateTime(r.emailArrivedTime) : undefined,
    owner: r.assignedLeadName,
  };
}

export function mapSubmission(s: any) {
  const cand = s.candidateId && typeof s.candidateId === 'object' ? s.candidateId : null;
  const req = s.requirementId && typeof s.requirementId === 'object' ? s.requirementId : null;
  const client = s.clientId && typeof s.clientId === 'object' ? s.clientId : null;
  const rec = s.recruiterId && typeof s.recruiterId === 'object' ? s.recruiterId : null;
  const score = typeof s.matchScore === 'number'
    ? Math.round(s.matchScore <= 1 ? s.matchScore * 100 : s.matchScore)
    : 85;
  return {
    id: s.submissionId || idOf(s),
    _id: idOf(s),
    candidate: cand?.name || s.candidateName || 'Candidate',
    req: req?.reqCode || s.req || '',
    client: client?.clientName || req?.clientName || s.clientName || '',
    date: formatDate(s.submittedAt || s.createdAt),
    stage: s.stage || 'Submitted',
    match: `${score}%`,
    recruiter: rec?.name || s.recruiterName || '',
    email: cand?.email,
    phone: cand?.phone,
    experience: cand?.totalExperienceYears != null ? `${cand.totalExperienceYears} years` : undefined,
  };
}

export function mapInterview(iv: any, extras?: { candidateName?: string; title?: string; clientName?: string; recruiterName?: string }) {
  const cand = iv.candidateId && typeof iv.candidateId === 'object' ? iv.candidateId : null;
  const req = iv.requirementId && typeof iv.requirementId === 'object' ? iv.requirementId : null;
  return {
    id: iv.interviewId || idOf(iv),
    _id: idOf(iv),
    candidate: extras?.candidateName || cand?.name || 'Candidate',
    position: extras?.title || req?.title || '',
    client: extras?.clientName || req?.clientName || '',
    stage: ROUND_MAP[iv.round] || iv.round || 'Screening',
    date: formatDateTime(iv.dateTime),
    recruiter: extras?.recruiterName || '',
    status: INTERVIEW_STATUS_MAP[iv.status] || iv.status || 'Scheduled',
    notes: iv.notes || '',
  };
}

export function mapActivityLog(log: any) {
  const details = log.details;
  const detailsText = typeof details === 'string'
    ? details
    : details && typeof details === 'object'
      ? details.message || details.summary || JSON.stringify(details)
      : undefined;
  return {
    id: log.targetId || idOf(log),
    timestamp: relativeTime(log.createdAt),
    userName: log.userName,
    userEmail: log.userEmail,
    userRole: log.userRole,
    userAvatar: String(log.userName || 'U').charAt(0).toUpperCase(),
    action: log.action,
    category: log.category,
    targetEntity: log.targetEntity,
    targetId: log.targetId,
    clientName: log.clientName,
    ipAddress: log.ipAddress || '127.0.0.1',
    status: log.status || 'Success',
    details: detailsText,
  };
}

export function mapCandidate(c: any) {
  return {
    id: c.candidateId || idOf(c),
    _id: idOf(c),
    submissionDate: formatDate(c.createdAt),
    name: c.name,
    company: c.currentCompany || '',
    phone: c.phone,
    email: c.email,
    linkedIn: c.linkedInUrl || '',
    qualification: c.qualification || '',
    skills: Array.isArray(c.skills) ? c.skills.join(', ') : c.skills || '',
    technologies: Array.isArray(c.skills) ? c.skills.join(', ') : '',
    totalExperience: c.totalExperienceYears != null ? `${c.totalExperienceYears} Years` : '',
    relevantExperience: c.relevantExperienceYears != null ? `${c.relevantExperienceYears} Years` : '',
    currentCtc: c.currentCtc ? `${c.currentCtc}` : '',
    expectedCtc: c.expectedCtc ? `${c.expectedCtc}` : '',
    noticePeriod: c.noticePeriodDays != null ? `${c.noticePeriodDays} days` : '',
    currentLocation: c.currentLocation || '',
    preferredLocation: c.preferredLocation || '',
    offerInHand: c.offerInHand === 'Yes' || c.offerInHand === 'In Pipeline' ? c.offerInHand : 'No',
    notes: '',
    status: c.status === 'Interviewing' ? 'In Review' : c.status || 'New',
  };
}

export function mapClient(c: any, stats?: { activeReqs?: number; submissions?: number; placements?: number }) {
  const poc = Array.isArray(c.pocContacts) && c.pocContacts[0] ? c.pocContacts[0] : {};
  return {
    id: c.clientId || idOf(c),
    _id: idOf(c),
    name: c.clientName,
    domain: c.domain || '',
    pocName: poc.name || '',
    pocEmail: poc.email || '',
    pocPhone: poc.phone || '',
    location: poc.location || poc.designation || '',
    teamLead: c.accountLeadName || '',
    teamMemberCount: 0,
    teamMembers: [],
    activeReqs: stats?.activeReqs || 0,
    totalSubmissions: stats?.submissions || 0,
    totalPlacements: stats?.placements || 0,
    commercialFee: '8.33% Annual CTC',
    paymentTerms: '30 Days Net',
    slaTAT: `${c.slaDays || 5} Days`,
    agreementStatus: c.status === 'Active' ? 'Active - Executed' : 'Pending Signature',
    agreementStartDate: formatDate(c.createdAt),
    agreementEndDate: '',
    agreementDocName: c.agreementsUrl || '',
    signedBy: '',
    signedDate: '',
  };
}

export { formatDate, formatDateTime, idOf };
