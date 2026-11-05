/** Enum / field mapping tables for V1 Postgres → V2 Mongo (additive legacy fields). */

const ROLE_MAP = {
  LEAD: 'lead',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
  CANDIDATE: null, // skip as app user
};

const SUBMISSION_STAGE_MAP = {
  SUBMITTED: { stage: 'Submitted', leadApprovalStatus: 'Pending' },
  SUBMITTED_TO_LEAD: { stage: 'Submitted to Lead', leadApprovalStatus: 'Pending' },
  SUBMITTED_TO_CLIENT: { stage: 'Submitted to Client', leadApprovalStatus: 'Forwarded' },
  INTERVIEW: { stage: 'Interview Scheduled', leadApprovalStatus: 'Approved' },
  SELECTED: { stage: 'Offered', leadApprovalStatus: 'Approved' },
  REJECTED: { stage: 'Rejected', leadApprovalStatus: 'Rejected' },
};

const REQUIREMENT_STATUS_MAP = {
  OPEN: 'Open',
  ASSIGNED: 'Open',
  SUBMITTED: 'Open',
  INTERVIEW: 'Open',
  SELECTED: 'Open',
  REJECTED: 'Closed',
  CLOSED: 'Closed',
};

const REQUIREMENT_ASSIGNMENT_STATUS_MAP = {
  UNASSIGNED: 'Unassigned',
  ASSIGNED: 'Assigned',
};

const PRIORITY_MAP = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

const INTERVIEW_ROUND_MAP = {
  L1: 'L1 Technical',
  L2: 'L2 Technical',
  FINAL: 'Final',
};

const INTERVIEW_MODE_MAP = {
  PHONE: 'Phone',
  VIDEO: 'Online',
  ONSITE: 'Onsite',
};

const OFFER_IN_HAND_MAP = {
  yes: 'Yes',
  no: 'No',
  'in pipeline': 'In Pipeline',
  pipeline: 'In Pipeline',
  multiple: 'Multiple',
};

function mapOfferInHand(raw) {
  if (raw == null || String(raw).trim() === '') return 'No';
  const key = String(raw).trim().toLowerCase();
  return OFFER_IN_HAND_MAP[key] || (key.includes('yes') ? 'Yes' : 'No');
}

function parseNumberLoose(raw, fallback = 0) {
  if (raw == null || raw === '') return fallback;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  const s = String(raw).replace(/,/g, '');
  const m = s.match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : fallback;
}

function parseNoticeDays(raw, fallback = 30) {
  if (raw == null || raw === '') return fallback;
  const s = String(raw).toLowerCase();
  if (s.includes('immediate')) return 0;
  const m = s.match(/(\d+)/);
  if (!m) return fallback;
  let n = Number(m[1]);
  if (s.includes('month')) n = n * 30;
  return n;
}

function normalizePhone(raw) {
  const digits = String(raw || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeEmail(raw) {
  return String(raw || '').trim().toLowerCase();
}

/** Entity load order for apply mode. */
const LOAD_ORDER = [
  'users',
  'clients',
  'candidates',
  'requirements',
  'requirement_assignments',
  'submissions',
  'submission_histories',
  'interviews',
  'requirement_histories',
  'email_ingestion_events',
];

module.exports = {
  ROLE_MAP,
  SUBMISSION_STAGE_MAP,
  REQUIREMENT_STATUS_MAP,
  REQUIREMENT_ASSIGNMENT_STATUS_MAP,
  PRIORITY_MAP,
  INTERVIEW_ROUND_MAP,
  INTERVIEW_MODE_MAP,
  mapOfferInHand,
  parseNumberLoose,
  parseNoticeDays,
  normalizePhone,
  normalizeEmail,
  LOAD_ORDER,
};
