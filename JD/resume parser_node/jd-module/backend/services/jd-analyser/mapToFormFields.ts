import type { JdExtractFormFields } from '../../lib/jdFieldExtractor';
import type { RequirementData } from './types/requirement';
import { NOT_SPECIFIED, isMissingField, isMissing } from './jd-utils.ts';

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'protonmail.com', 'mail.com', 'aol.com',
]);

function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function extractDynamicClient(text: string): string | undefined {
  if (!text?.trim()) return undefined;

  // 1. Direct label extraction: Client:, Company:, Organization:, Account:, End Client:, Vendor:
  const labelMatch = text.match(
    /(?:^|\n)\s*(?:Client(?:\s*Name)?|End[\s-]*Client|Company(?:\s*Name)?|Account|Organization|Requirement\s*From|Customer)\s*[:=-]\s*([^\r\n,;]+)/i,
  );
  if (labelMatch?.[1]) {
    const candidate = labelMatch[1].trim();
    if (candidate && candidate.toLowerCase() !== NOT_SPECIFIED.toLowerCase()) {
      return toSlug(candidate);
    }
  }

  // 2. Email domain extraction from From: line or email address (excluding public webmail)
  const emailMatch = text.match(/(?:From:.*?|[a-zA-Z0-9._%+-]+@)([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (emailMatch?.[1]) {
    const domain = emailMatch[1].toLowerCase();
    if (!PUBLIC_EMAIL_DOMAINS.has(domain)) {
      const companyPart = domain.split('.')[0];
      if (companyPart && companyPart.length > 2) {
        return toSlug(companyPart);
      }
    }
  }

  // 3. Contextual phrasing: "our client XYZ", "working at XYZ", "demand @ XYZ"
  const contextMatch = text.match(
    /(?:(?:our\s+)?client|working\s+(?:at|for)|demand\s*@)\s+([A-Za-z0-9][A-Za-z0-9\s&.-]{2,30}?)(?=\s+(?:is|in|at|looking|requires|\n|$|[.,]))/i,
  );
  if (contextMatch?.[1]) {
    const candidate = contextMatch[1].trim();
    if (!/^(the|a|an|immediate|urgent)$/i.test(candidate)) {
      return toSlug(candidate);
    }
  }

  return undefined;
}

function normalizeEmploymentType(raw: string): 'Full-time' | 'Contract' | undefined {
  const v = raw.trim().toLowerCase();
  if (!v || v === NOT_SPECIFIED.toLowerCase()) return undefined;
  if (/contract|contractor|sub-con|subcon/.test(v)) return 'Contract';
  if (/full[-\s]?time|fte|fts|permanent/.test(v)) return 'Full-time';
  return undefined;
}

function normalizeWorkMode(raw: string): string | undefined {
  const v = raw.trim();
  if (!v || v === NOT_SPECIFIED) return undefined;
  const lower = v.toLowerCase();
  if (lower.includes('remote')) return 'Remote';
  if (lower.includes('hybrid')) return 'Hybrid';
  if (lower.includes('on-site') || lower.includes('onsite') || lower.includes('on site')) {
    return 'On-site';
  }
  return v;
}

function normalizePriority(raw: string): 'High' | 'Medium' | 'Low' | undefined {
  const v = raw.trim().toLowerCase();
  if (!v || v === NOT_SPECIFIED.toLowerCase()) return undefined;
  if (v.includes('high') || v === 'urgent' || v === 'critical') return 'High';
  if (v.includes('low')) return 'Low';
  if (v.includes('medium') || v.includes('med')) return 'Medium';
  return undefined;
}

function normalizeDemandType(raw: string, positions?: number): 'Single' | 'Multiple' | 'Bulk' | undefined {
  const v = raw.trim().toLowerCase();
  if (v.includes('bulk')) return 'Bulk';
  if (v.includes('multiple')) return 'Multiple';
  if (v.includes('single')) return 'Single';
  if (typeof positions === 'number' && positions > 1) return 'Multiple';
  if (typeof positions === 'number' && positions === 1) return 'Single';
  return undefined;
}

function normalizeExperienceLevel(raw: string): string | undefined {
  const v = raw.trim();
  if (!v || v === NOT_SPECIFIED) return undefined;
  const lower = v.toLowerCase();
  if (lower.includes('entry')) return 'Entry Level';
  if (lower.includes('principal')) return 'Principal';
  if (lower.includes('director')) return 'Director';
  if (lower.includes('lead')) return 'Lead';
  if (lower.includes('mid-senior') || lower.includes('mid senior')) return 'Mid-Senior';
  if (lower === 'mid' || lower.startsWith('mid ')) return 'Mid-Senior';
  if (lower.includes('senior')) return 'Senior';
  if (lower.includes('junior')) return 'Junior';
  return v;
}

export function parseBudgetAmount(raw: string): number | undefined {
  const s = String(raw ?? '').trim();
  if (!s || s === NOT_SPECIFIED) return undefined;

  const lower = s.toLowerCase();
  // Check for negotiable, DOE, discussed, not disclosed
  if (/\b(?:negotiable|doe|discussed|not\s*disclosed|tbd)\b/i.test(lower)) {
    return undefined;
  }

  const impliesLakhs = /(?:lakh|lpa|l\.?\s*p\.?\s*a\.?|[lL]\b)/i.test(lower);
  const impliesCrores = /(?:cr|crore|crores)\b/i.test(lower);
  const impliesThousands = /\b(?:k|thousand|thousands)\b/i.test(lower);
  const impliesMillions = /\b(?:m|million|millions)\b/i.test(lower);

  // Crucial: remove commas inside numbers (e.g. 6,00,000 -> 600000; 120,000 -> 120000)
  const withoutCommas = s.replace(/,/g, '');
  const withoutCurrency = withoutCommas.replace(/[₹$€£_]/g, ' ');
  const withoutWords = withoutCurrency.replace(
    /(?:lakh?s?|lpa|l\.?\s*p\.?\s*a\.?|cr|crore?s?|thousand?s?|million?s?|inr|usd|eur|gbp|rs\.?|rupees?|per\s*month|per\s*annum|per\s*hour|per\s*day|\/hr|\/hour|\/day|\/month|\/annum|\/yr|\/year|p\.?\s*a\.?)/gi,
    ' ',
  );

  const m = withoutWords.match(/(\d+(?:\.\d+)?)/);
  if (!m) return undefined;
  const n = parseFloat(m[1]!);
  if (!Number.isFinite(n) || n <= 0) return undefined;

  if (impliesCrores) return Math.round(n * 10000000);
  if (impliesMillions) return Math.round(n * 1000000);
  if (impliesLakhs && n < 10000) return Math.round(n * 100000);
  if (impliesThousands && n < 10000) return Math.round(n * 1000);
  return Math.round(n);
}

function pickBudget(data: RequirementData, employmentType?: 'Full-time' | 'Contract'): number | undefined {
  const annual = isMissing(data.annualBudget) ? undefined : data.annualBudget;
  const monthly = isMissing(data.monthlyBudget) ? undefined : data.monthlyBudget;
  const raw =
    employmentType === 'Contract'
      ? monthly ?? annual
      : annual ?? monthly;
  return raw ? parseBudgetAmount(raw) : undefined;
}

export function normalizeCurrency(raw: string): 'INR' | 'USD' | 'EUR' | 'GBP' | string | undefined {
  const v = raw.trim().toUpperCase();
  if (!v || v === NOT_SPECIFIED.toUpperCase()) return undefined;
  if (v.includes('USD') || v.includes('$')) return 'USD';
  if (v.includes('EUR') || v.includes('€')) return 'EUR';
  if (v.includes('GBP') || v.includes('£')) return 'GBP';
  if (v.includes('INR') || v.includes('₹') || v.includes('RS') || v.includes('LPA') || v.includes('LAKH')) return 'INR';
  if (['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(v)) return v;
  return v;
}

function resolveSubmittingTo(data: RequirementData): string | undefined {
  if (!isMissing(data.requirementFrom)) {
    return toSlug(data.requirementFrom);
  }
  const fromText = [data.clientLeadPocFrom, data.jobDescription].filter(Boolean).join(' ');
  return extractDynamicClient(fromText);
}

export function mapRequirementToFormFields(
  data: RequirementData,
  options?: { jdText?: string },
): JdExtractFormFields {
  const employmentType = normalizeEmploymentType(data.employmentType);
  const positions = (() => {
    if (isMissing(data.numberOfPositions)) return undefined;
    const n = parseInt(data.numberOfPositions, 10);
    return Number.isFinite(n) && n >= 1 ? n : undefined;
  })();

  const out: JdExtractFormFields = {};

  if (!isMissing(data.jobTitle)) out.jobTitle = data.jobTitle.trim();
  if (!isMissing(data.clientLeadPocFrom)) out.clientLeadPoc = data.clientLeadPocFrom.trim();
  if (!isMissing(data.clientPocFromCc)) out.clientPoc = data.clientPocFromCc.trim();

  const submittingTo = resolveSubmittingTo(data);
  if (submittingTo) out.submittingTo = submittingTo;

  if (!isMissing(data.location)) out.location = data.location.trim();
  if (!isMissing(data.overallExperience)) out.experience = data.overallExperience.trim();

  const experienceLevel = normalizeExperienceLevel(data.relevantExperience);
  if (experienceLevel) out.experienceLevel = experienceLevel;

  if (positions) out.positions = positions;
  if (employmentType) out.employmentType = employmentType;

  const workMode = normalizeWorkMode(data.workMode);
  if (workMode) out.workMode = workMode;

  const rawBudget =
    employmentType === 'Contract'
      ? (!isMissing(data.monthlyBudget) && data.monthlyBudget !== NOT_SPECIFIED
          ? data.monthlyBudget.trim()
          : !isMissing(data.annualBudget) && data.annualBudget !== NOT_SPECIFIED
          ? data.annualBudget.trim()
          : undefined)
      : (!isMissing(data.annualBudget) && data.annualBudget !== NOT_SPECIFIED
          ? data.annualBudget.trim()
          : !isMissing(data.monthlyBudget) && data.monthlyBudget !== NOT_SPECIFIED
          ? data.monthlyBudget.trim()
          : undefined);

  if (rawBudget) {
    out.budget = rawBudget;
    const budgetAmount = parseBudgetAmount(rawBudget);
    if (budgetAmount && budgetAmount > 0) out.budgetAmountInr = budgetAmount;
  }

  const currency = normalizeCurrency(data.budgetCurrency);
  if (currency && rawBudget && (rawBudget.toUpperCase().includes(currency) || /[$€£₹]/.test(rawBudget))) {
    out.budgetCurrency = currency;
  }


  const priority = normalizePriority(data.priority);
  if (priority) out.priority = priority;

  const demandType = normalizeDemandType(data.typeOfDemand, positions);
  if (demandType) out.demandType = demandType;

  if (!isMissing(data.noticePeriod)) out.noticePeriod = data.noticePeriod.trim();

  const primary = data.mandatorySkills?.length ? [...data.mandatorySkills] : [];
  const rawSecondary = data.secondarySkills?.length
    ? [...data.secondarySkills]
    : [];

  const cleanSecondary = rawSecondary.filter(
    (s) => !primary.some((p) => p.toLowerCase() === s.toLowerCase())
  );

  if (primary.length) {
    out.technologies = primary;
    out.primarySkills = primary;
  }
  if (cleanSecondary.length) {
    out.secondarySkills = cleanSecondary;
  }
  if (data.skills?.length) {
    out.skills = [...data.skills];
  } else if (primary.length || cleanSecondary.length) {
    out.skills = [...primary, ...cleanSecondary];
  }

  if (out.technologies?.length && !out.skills?.length) {
    out.skills = [...out.technologies];
  }

  const jdBody = !isMissing(data.jobDescription)
    ? data.jobDescription.trim()
    : options?.jdText?.trim();
  if (jdBody) out.jdDescription = jdBody;

  return out;
}
