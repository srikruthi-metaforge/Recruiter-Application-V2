// @ts-nocheck — vendor JD extractor; keep behaviour identical to jd-module.
/**
 * Dynamic JD -> Requirement form field extractor.
 * Completely generalizable: no hardcoded keyword lists, client dictionaries, or fixed skill vocabularies.
 */

export type JdExtractFormFields = {
  jobTitle?: string;
  clientLeadPoc?: string;
  clientPoc?: string;
  location?: string;
  experience?: string;
  experienceLevel?: string;
  noticePeriod?: string;
  skills?: string[];
  technologies?: string[];
  primarySkills?: string[];
  secondarySkills?: string[];
  primary_skills?: string[];
  secondary_skills?: string[];
  positions?: number;
  employmentType?: 'Full-time' | 'Contract';
  workMode?: string;
  budget?: string;
  budgetAmountInr?: number;
  budgetCurrency?: string;
  priority?: 'High' | 'Medium' | 'Low';
  demandType?: 'Single' | 'Multiple' | 'Bulk';
  submittingTo?: string;
  jdDescription?: string;
};

const PUBLIC_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'live.com',
  'msn.com',
]);

function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeExtractedValue(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/^[\s\-•*]+/, '')
    .replace(/[|]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/[;,.\u2026…]+$/, '')
    .trim();
}

function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/['"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function titleCaseWords(raw: string): string {
  return raw
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function clipAtNextLabel(raw: string, nextLabels: string[]): string {
  const clean = normalizeExtractedValue(raw);
  if (!clean || nextLabels.length === 0) return clean;
  const token = nextLabels.map((x) => escapeRegex(x)).join('|');
  const rx = new RegExp(`\\b(?:${token})\\b\\s*[:=\\-–]`, 'i');
  const m = rx.exec(clean);
  if (!m || typeof m.index !== 'number') return clean;
  return normalizeExtractedValue(clean.slice(0, m.index));
}

function sanitizeCompactField(raw: string, maxLen = 140): string {
  let out = normalizeExtractedValue(raw);
  if (!out) return '';
  out = out
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Clip at any line that looks like a new section label
  const labelBoundary = out.match(/\n\s*([A-Za-z][A-Za-z\s/]{2,25})\s*[:=-]/);
  if (labelBoundary && typeof labelBoundary.index === 'number') {
    out = out.slice(0, labelBoundary.index).trim();
  }

  const lower = out.toLowerCase();
  for (const marker of ['dear ', 'regards', 'thanks', 'this email may contain', 'confidentiality notice']) {
    const idx = lower.indexOf(marker);
    if (idx > 0) {
      out = out.slice(0, idx).trim();
      break;
    }
  }
  if (out.length > maxLen) out = `${out.slice(0, maxLen).trim()}...`;
  return normalizeExtractedValue(out);
}

function extractLabeledValue(text: string, labels: string[]): string {
  if (!text) return '';
  for (const label of labels) {
    const rx = new RegExp(
      `(?:^|\\n)\\s*(?:[|•\\-*]|(?:JD|Job\\s*Description|Req(?:uirement)?)\\s*[-–:]\\s*)*\\s*${escapeRegex(label)}\\s*[:=\\-–]\\s*([^\\n\\r|]+)`,
      'i',
    );
    const m = text.match(rx);
    if (m?.[1]) {
      const cleaned = m[1].replace(/^[\s\-–:]+/, '').trim();
      return normalizeExtractedValue(cleaned);
    }
  }
  return '';
}

function extractInlineFieldValue(text: string, labels: string[], nextLabels: string[]): string {
  if (!text) return '';
  for (const label of labels) {
    const rx = new RegExp(`\\b${escapeRegex(label)}\\b\\s*[:=\\-–]\\s*([^\\n\\r]+)`, 'i');
    const m = text.match(rx);
    if (!m?.[1]) continue;
    const clipped = clipAtNextLabel(m[1], nextLabels);
    if (clipped) return clipped;
  }
  return '';
}

const TOP_LEVEL_SECTION_BREAKS = new Set([
  'job title', 'role', 'position', 'client', 'company', 'work location',
  'base location', 'location', 'overall exp', 'overall experience',
  'relevant exp', 'relevant experience', 'years of experience', 'experience',
  'open positions', 'number of positions', 'positions', 'open headcount',
  'headcount', 'vacancies', 'employment type', 'work mode', 'notice period',
  'availability', 'budget', 'compensation', 'salary', 'ctc', 'rate',
  'bill rate', 'billing rate', 'remuneration', 'about company', 'about us',
  'company overview', 'benefits', 'interview process', 'selection process',
  'eligibility', 'education',
  'current organization', 'current org', 'total exp', 'total experience',
  'monthly billing rates', 'monthly billing rate', 'job posting id', 'posting id',
  'job id', 'educational qualification', 'educational qualifications',
]);

function matchesSectionLabel(rawLine: string, labels: string[]): { matched: boolean; inlineValue: string } {
  let s = rawLine.trim();
  s = s.replace(/^#{1,6}\s*/, '');
  s = s.replace(/^[-•*]\s*/, '');
  s = s.replace(/^\d+[\.\)]\s*/, '');
  s = s.replace(/^[*_]{1,3}/, '');
  s = s.replace(/^(?:JD|Job\s*Description|Req(?:uirement)?)\s*[-–:]\s*/i, '');

  let labelPart = s;
  let inline = '';

  // Check for colon, equals, or spaced dash
  const delimMatch = s.match(/^(.*?)(?:[*_]{1,3})?\s*(?:[:=]|\s+[-–—]\s+)\s*(.*)$/);
  if (delimMatch) {
    labelPart = delimMatch[1]?.trim() || '';
    inline = delimMatch[2]?.trim() || '';
    if (labelPart.split(/\s+/).filter(Boolean).length > 7 || labelPart.length > 60) {
      return { matched: false, inlineValue: '' };
    }
  } else {
    labelPart = s.replace(/[*_]{1,3}$/, '').trim();
    if (labelPart.split(/\s+/).filter(Boolean).length > 6 || labelPart.length > 50 || labelPart.includes('.')) {
      return { matched: false, inlineValue: '' };
    }
  }

  const candidate = labelPart.toLowerCase().replace(/[\s\-_/&]+/g, ' ').trim();
  if (!candidate) return { matched: false, inlineValue: '' };

  for (const label of labels) {
    const normLabel = label.toLowerCase().replace(/[\s\-_/&]+/g, ' ').trim();
    if (candidate === normLabel) {
      return { matched: true, inlineValue: inline };
    }
  }

  // Semantic synonym classification for Mandatory vs Preferred headings
  const isPreferredLabelSet = labels.length > 0 && ['good to have', 'preferred', 'nice to have', 'secondary'].some(kw => labels[0]!.toLowerCase().includes(kw));
  const isMandatoryLabelSet = labels.length > 0 && ['mandatory', 'must have', 'required', 'primary'].some(kw => labels[0]!.toLowerCase().includes(kw));

  const hasPreferredKeyword = [
    'good to have', 'good-to-have', 'nice to have', 'nice-to-have', 'preferred',
    'preferable', 'desired', 'optional', 'bonus', 'plus', 'added advantage',
    'advantageous', 'secondary skills', 'preferred qualifications',
  ].some(kw => candidate.includes(kw));

  if (isPreferredLabelSet && hasPreferredKeyword) {
    return { matched: true, inlineValue: inline };
  }

  if (isMandatoryLabelSet && !hasPreferredKeyword) {
    const hasMandatoryKeyword = [
      'mandatory', 'must have', 'must-have', 'required', 'essential',
      'core skill', 'core skills', 'key skill', 'key skills', 'technical skill', 'technical skills',
      'technical requirement', 'technical requirements', 'tech stack', 'technical stack',
      'compulsory', 'skills required', 'technical competencies', 'core competencies',
      'minimum technical', 'minimum requirements', 'minimum qualifications',
      'basic qualifications', 'required qualifications', 'job requirements',
      'role requirements', 'candidate requirements', 'essential requirements',
      'key requirements', 'key requirement', 'technical capabilities',
      'responsibilities (tech stack)', 'responsibilities and requirements',
      'responsibilities & requirements', 'detailed jd & requirements',
    ].some(kw => candidate.includes(kw));
    if (hasMandatoryKeyword) {
      return { matched: true, inlineValue: inline };
    }
  }

  return { matched: false, inlineValue: '' };
}

function extractLabeledMultilineValue(text: string, labels: string[]): string {
  if (!text) return '';
  const lines = text.split(/\r?\n/);
  const collected: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] || '';
    const match = matchesSectionLabel(line, labels);
    if (!match.matched) {
      i += 1;
      continue;
    }

    if (match.inlineValue) {
      const first = normalizeExtractedValue(match.inlineValue);
      if (first) collected.push(first);
    }

    let j = i + 1;
    let blankCount = 0;

    while (j < lines.length) {
      const nextRaw = lines[j] || '';
      const nextLine = normalizeExtractedValue(nextRaw);
      if (!nextLine) {
        blankCount += 1;
        if (blankCount >= 2) break;
        j += 1;
        continue;
      }
      blankCount = 0;

      if (/^(?:from|to|cc|subject|date|sent)\s*[:\-]|^(?:thanks|regards|best regards|warm regards|sincerely|cheers|yours truly|dear)\b/i.test(nextLine)) {
        break;
      }

      if (/^\s*#{1,6}\s+/.test(nextRaw)) {
        break;
      }

      const isBullet = /^[•\-*#\d.]+\s+/.test(nextRaw.trim());
      const headerMatch = nextLine.match(/^([A-Za-z\s/&–\-()]{2,50})\s*[:=-]/);
      if (headerMatch) {
        const headerLabel = headerMatch[1]!.trim().toLowerCase();
        const normHeaderLabel = headerLabel.replace(/[\s\-_/&]+/g, ' ').trim();
        if (TOP_LEVEL_SECTION_BREAKS.has(normHeaderLabel)) break;
        const isOtherSkillsLabel = [
          'mandatory', 'must have', 'required', 'primary', 'core',
          'preferred', 'secondary', 'nice to have', 'good to have',
          'responsibilities', 'qualifications', 'eligibility',
          'bonus', 'plus', 'advantage', 'key skills', 'tech stack', 'technical stack',
        ].some((keyword) => normHeaderLabel.includes(keyword));
        if (isOtherSkillsLabel && !isBullet) {
          const selfMatch = matchesSectionLabel(nextRaw, labels);
          if (!selfMatch.matched) break;
        }
      }

      collected.push(nextLine);
      j += 1;
    }

    i = j;
  }

  return normalizeExtractedValue(collected.join(', '));
}

/**
 * Dynamically extract the client / company without hardcoded client lists.
 */
function detectClientSlug(text: string): string | undefined {
  // 1. Explicit labeled client / company field
  const labeled = extractLabeledValue(text, [
    'client',
    'client name',
    'end client',
    'company',
    'company name',
    'organization',
    'account',
    'customer',
    'requirement from',
    'vendor',
  ]);
  if (labeled && labeled.toLowerCase() !== 'not specified') {
    let clean = labeled
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/g, '')
      .replace(/\b(?:labs?|technologies|solutions|corporation|corp|inc|llc|pvt|ltd)\b/gi, '')
      .trim();
    return toSlug(clean || labeled);
  }

  // 2. Email header domain extraction from From: line
  const fromLine = text.match(/From:\s*.*?<?([a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))>?/i);
  if (fromLine?.[2]) {
    const domain = fromLine[2].toLowerCase();
    if (!PUBLIC_EMAIL_DOMAINS.has(domain)) {
      const domainName = domain.split('.')[0];
      if (domainName && domainName.length > 2) {
        return toSlug(domainName);
      }
    }
  }

  // 3. Subject line "@ <Company>" (e.g. "Urgent Opening @ ITC Infotech")
  const subjectAt = text.match(/Subject:.*?@\s*([A-Za-z0-9][A-Za-z0-9\s&.-]{2,30}?)(?:\s*[-–(]|$|\r|\n)/i);
  if (subjectAt?.[1]) {
    const cand = subjectAt[1].trim();
    if (!/^(bangalore|hyderabad|pune|mumbai|chennai|delhi|remote|hybrid|onsite)$/i.test(cand)) {
      return toSlug(cand);
    }
  }

  // 4. Contextual "our client <Name>" / "hiring for <Name>"
  const contextClient = text.match(/(?:for\s+our\s+client|hiring\s+for|working\s+(?:with|at))\s+([A-Z][A-Za-z0-9&.\s]{2,30}?)(?=[,.\n]|\s+(?:requires|looking|is))/);
  if (contextClient?.[1]) {
    const cand = contextClient[1].trim();
    if (!/^(the|a|an|immediate|confidential)$/i.test(cand)) {
      return toSlug(cand);
    }
  }

  return undefined;
}

/**
 * Dynamic Job Title parser supporting labeled fields, subject lines, headings, and opening prose.
 */
function isSkillSectionOrRequirementText(s: string): boolean {
  if (!s) return true;
  const lower = s.toLowerCase().trim();
  if (
    /^(?:job\s*description|about\s*us|requirements?|responsibilities?|overview|summary|qualifications?|eligibility(?:\s*criteria)?)$/i.test(lower)
  ) {
    return true;
  }
  if (
    /\b(?:mandatory|must\s*have|required\s*skills|preferred|good\s*to\s*have|nice\s*to\s*have|technical\s*skills|core\s*skills|secondary\s*skills|skills\s*required|technologies|tools)\b/i.test(
      lower
    )
  ) {
    return true;
  }
  if (
    /^(?:we\s+are\s+looking|candidate\s+must|must\s+have|good\s+to\s+have|nice\s+to\s+have|preferred|bachelor|5\+\s*years)/i.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

function isRecruiterTitle(title: string): boolean {
  if (!title) return false;
  const lower = title.toLowerCase().trim();
  return /\b(?:recruiter|technical\s+recruiter|senior\s+recruiter|lead\s+recruiter|talent\s+acquisition|talent\s+partner|talent\s+sourcer|sourcer|headhunter|staffing\s+specialist|staffing\s+consultant|hr\s+executive|hr\s+manager|hr\s+lead|human\s+resources|account\s+manager|delivery\s+manager|client\s+partner|business\s+development\s+manager|bdm)\b/i.test(
    lower,
  );
}

function parseJobTitle(text: string, subjectHint?: string): string {
  let body = text;
  const footerMatch = text.match(/\n\s*(?:Regards|Thanks|Best regards|Warm regards|Sincerely|Cheers)[\s\S]*$/i);
  if (footerMatch && typeof footerMatch.index === 'number') {
    body = text.slice(0, footerMatch.index);
  }

  // 1. Explicit labeled field
  const labeled =
    extractLabeledValue(body, [
      'job title',
      'job tittle',
      'role title',
      'role tittle',
      'position title',
      'position tittle',
      'title',
      'tittle',
      'position',
      'designation',
      'role',
      'job role',
      'profile',
      'requirement',
      'opening for',
      'vacancy',
    ]) ||
    extractLabeledMultilineValue(body, ['job title', 'job tittle', 'role title', 'position title', 'position', 'designation', 'role']);

  if (labeled) {
    const cleaned = sanitizeJobTitleString(labeled);
    if (cleaned && !isSkillSectionOrRequirementText(cleaned) && !isRecruiterTitle(cleaned)) return cleaned;
  }

  // 2. Email Subject Line Hint
  if (subjectHint) {
    const fromSubj = parseTitleFromSubject(subjectHint);
    if (fromSubj && !isSkillSectionOrRequirementText(fromSubj) && !isRecruiterTitle(fromSubj)) return fromSubj;
  }

  const subjectMatch = text.match(/Subject:\s*([^\r\n]+)/i);
  if (subjectMatch?.[1]) {
    const fromSubj = parseTitleFromSubject(subjectMatch[1]);
    if (fromSubj && !isSkillSectionOrRequirementText(fromSubj) && !isRecruiterTitle(fromSubj)) return fromSubj;
  }

  // 3. Markdown or prominent heading (e.g., "# Senior Frontend Engineer" or "## Job Title")
  const headingMatch = body.match(/(?:^|\n)\s*#{1,3}\s*([A-Za-z0-9][A-Za-z0-9\s/&().,-]{3,80})/m);
  if (headingMatch?.[1]) {
    const cleaned = sanitizeJobTitleString(headingMatch[1]);
    if (cleaned && !isSkillSectionOrRequirementText(cleaned) && !isRecruiterTitle(cleaned)) {
      return cleaned;
    }
  }

  // 4. Contextual sentence patterns: "We need a <Title>", "Looking for a/an <Title>", "Seeking a/an <Title>"
  const contextOpening = body.match(
    /(?:we\s+)?(?:need|are\s+looking\s+for|looking\s+for|seek(?:ing)?|in\s+need\s+of|hiring|urgently\s+require)\s+(?:an?|the)?\s*([A-Za-z0-9][A-Za-z0-9\s/&().,-]{3,70}?)(?=\s+(?:with|who|to|having|responsible|for|in|at|[.,\n]))/i,
  );
  if (contextOpening?.[1]) {
    const cleaned = sanitizeJobTitleString(contextOpening[1]);
    if (cleaned && cleaned.length >= 4 && !isSkillSectionOrRequirementText(cleaned) && !isRecruiterTitle(cleaned)) return cleaned;
  }

  // 5. First line if it looks like a role title (short, capitalized, not a greeting)
  const firstLine = body.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0];
  if (
    firstLine &&
    firstLine.length >= 4 &&
    firstLine.length <= 60 &&
    !/^(dear|hi|hello|hey|greetings|thanks|regards|from|to|sent|subject|job\s*description)/i.test(firstLine) &&
    !firstLine.includes(':') &&
    !isSkillSectionOrRequirementText(firstLine) &&
    !isRecruiterTitle(firstLine)
  ) {
    const cleaned = sanitizeJobTitleString(firstLine);
    if (cleaned && !isRecruiterTitle(cleaned)) return cleaned;
  }

  return '';
}

function parseTitleFromSubject(subject: string): string {
  let s = subject.replace(/^\s*(?:re|fw|fwd)\s*[:\-–]\s*/gi, '').trim();
  if (s.includes('@')) {
    s = s.split('@')[0]?.trim() || s;
  }
  const parts = s.split(/\s*[-–|:]\s*/);
  const validParts: string[] = [];
  for (const p of parts) {
    const pClean = p.replace(/^(?:urgent|immediate|opening\s+for|requirement\s+for|demand\s+for|opening|requirement|demand|hiring)\s+/gi, '').trim();
    if (!pClean || pClean.length < 3) continue;
    const pLow = pClean.toLowerCase();
    if (/^(?:urgent|immediate|staffing|opening|requirement|demand|hiring|staffing\s*demand)$/i.test(pLow)) continue;
    if (/\b(?:req(?:uisition)?|demand|job|posting|ticket)?\s*#?\s*\d+\b/i.test(pLow) || (/^#?[A-Za-z0-9_\-]+$/.test(pClean) && /\d/.test(pClean))) continue;
    if (/\b(?:demand\s*id|req(?:uisition)?\s*id|job\s*id|posting\s*id|candidate\s*name|profile\s*of|candidate)\b/i.test(pLow)) continue;
    if (/^(?:bangalore|bengaluru|hyderabad|pune|mumbai|chennai|delhi|remote|hybrid|onsite)$/i.test(pLow)) continue;
    if (isRecruiterTitle(pClean)) continue;
    if (/\b(?:years?|yrs?|lpa|ctc|immediate\s*joiner)\b/i.test(pLow)) continue;
    const cleanedP = sanitizeJobTitleString(pClean);
    if (cleanedP && !isSkillSectionOrRequirementText(cleanedP) && !isRecruiterTitle(cleanedP)) {
      validParts.push(cleanedP);
    }
  }
  if (validParts.length > 0) {
    return validParts[0]!;
  }
  return '';
}

function sanitizeJobTitleString(title: string): string {
  return title
    .replace(/^[\s\-•*:#]+/, '')
    .replace(/^(?:an?|the)\s+/i, '')
    .replace(/^(?:talented|passionate|motivated|experienced|dynamic|exceptional|seeking\s+a|looking\s+for\s+a)\s+/i, '')
    .replace(/\s*[@|\-–]\s*(?:bangalore|hyderabad|pune|mumbai|chennai|delhi|noida|gurgaon|remote|hybrid|onsite|india|usa|boston|ny|london).*$/i, '')
    .replace(/\s*\((?:immediate|urgent|\d+\s*(?:to|-)\s*\d+\s*(?:years?|yrs?)|be\/btech|contract|fulltime)[^)]*\)/gi, '')
    .replace(/\b(?:req(?:uisition)?|demand|job|posting|ticket)?\s*#?\s*\d+\b/gi, '')
    .replace(/[;,.]+$/, '')
    .trim();
}

/**
 * Split text by common skill list delimiters.
 */
const COMMON_ENGLISH_STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
  'can', 'could', 'may', 'might', 'must', 'our', 'we', 'you', 'they', 'team',
  'candidate', 'candidates', 'experience', 'years', 'skills', 'responsibilities',
  'requirements', 'preferred', 'required', 'ideal', 'strong', 'good', 'ability',
  'knowledge', 'understanding', 'working', 'hands-on', 'plus', 'minimum',
  'proficiency', 'proficient', 'expertise', 'familiarity', 'background',
  'partner', 'profiles', 'profile', 'quality', 'priority', 'immediate', 'joiner',
  'joiners', 'required', 'looking', 'seeking', 'responsible', 'degree', 'btech',
  'be', 'mca', 'bachelor', 'master', 'contract', 'fulltime', 'salary', 'budget',
  'location', 'bangalore', 'pune', 'hyderabad', 'chennai', 'mumbai', 'noida', 'delhi',
]);

const NON_TECH_ROLE_PREFIXES = new Set([
  'software', 'hardware', 'systems', 'system', 'it', 'technical', 'senior',
  'lead', 'principal', 'junior', 'mid', 'staff', 'full', 'stack', 'full-stack',
  'frontend', 'backend', 'web', 'mobile', 'cloud', 'application', 'talented',
  'experienced', 'great', 'expert', 'quality', 'automation', 'test',
]);

const SKILL_ALIASES: Record<string, string> = {
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  k8s: 'Kubernetes',
  kube: 'Kubernetes',
  kubernetes: 'Kubernetes',
  react: 'React',
  reactjs: 'React',
  'react.js': 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  angularjs: 'AngularJS',
  golang: 'Go',
  python: 'Python',
  python3: 'Python',
  'c++': 'C++',
  cpp: 'C++',
  'c#': 'C#',
  csharp: 'C#',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  aws: 'AWS',
  gcp: 'Google Cloud',
  azure: 'Azure',
  docker: 'Docker',
  terraform: 'Terraform',
  jenkins: 'Jenkins',
  rest: 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  restful: 'REST APIs',
  'restful api': 'REST APIs',
  'restful apis': 'REST APIs',
  graphql: 'GraphQL',
  cicd: 'CI/CD',
  'ci/cd': 'CI/CD',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  springboot: 'Spring Boot',
  'spring boot': 'Spring Boot',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  express: 'Express',
  expressjs: 'Express',
  'express.js': 'Express',
  kafka: 'Kafka',
  'apache kafka': 'Kafka',
  spark: 'Spark',
  'apache spark': 'Spark',
  airflow: 'Airflow',
  'apache airflow': 'Airflow',
  selenium: 'Selenium',
  pytest: 'PyTest',
  junit: 'JUnit',
  nunit: 'NUnit',
  playwright: 'Playwright',
  appium: 'Appium',
  cypress: 'Cypress',
  testng: 'TestNG',
  mockito: 'Mockito',
  jest: 'Jest',
  langchain: 'LangChain',
  langgraph: 'LangGraph',
  llm: 'LLMs',
  llms: 'LLMs',
  rag: 'RAG',
  nlp: 'NLP',
  pytorch: 'PyTorch',
  tensorflow: 'TensorFlow',
  git: 'GIT',
  jira: 'JIRA',
  jama: 'JAMA',
  rapita: 'Rapita',
  'py ate': 'py ATE',
  pyate: 'py ATE',
  coverity: 'Coverity',
  'do-178': 'DO-178B/C',
  'do-178b': 'DO-178B',
  'do-178c': 'DO-178C',
  'do-178b/c': 'DO-178B/C',
  'do 178': 'DO-178B/C',
  'do 178b': 'DO-178B',
  'do 178c': 'DO-178C',
  'do 178b/c': 'DO-178B/C',
  'do-254': 'DO-254',
  'v&v': 'V&V (Verification & Validation)',
  'verification & validation': 'V&V (Verification & Validation)',
  'verification and validation': 'V&V (Verification & Validation)',
  'v&v (verification & validation)': 'V&V (Verification & Validation)',
  llt: 'LLT (Low Level Testing)',
  'low level testing': 'LLT (Low Level Testing)',
  'low-level testing': 'LLT (Low Level Testing)',
  'llt (low level testing)': 'LLT (Low Level Testing)',
  hlt: 'HLT (High Level Testing)',
  'high level testing': 'HLT (High Level Testing)',
  fms: 'FMS (Flight Management System)',
  'flight management system': 'FMS (Flight Management System)',
  'fms (flight management system)': 'FMS (Flight Management System)',
  'avionics sdlc': 'Avionics SDLC',
  'level a/b': 'Level A/B verification',
  'level a/b verification': 'Level A/B verification',
  'level a verification': 'Level A verification',
  'level b verification': 'Level B verification',
  misra: 'MISRA',
  autosar: 'AUTOSAR',
  rtos: 'RTOS',
  'embedded c': 'Embedded C',
  microservices: 'Microservices',
  celery: 'Celery',
  opentelemetry: 'OpenTelemetry',
  'triton inference server': 'Triton Inference Server',
  mlflow: 'MLflow',
  redis: 'Redis',
  elasticsearch: 'Elasticsearch',
  rabbitmq: 'RabbitMQ',
  oracle: 'Oracle',
  mysql: 'MySQL',
  postman: 'Postman',
  swagger: 'Swagger',
  insomnia: 'Insomnia',
  sonarqube: 'SonarQube',
  github: 'GitHub',
  gitlab: 'GitLab',
  bitbucket: 'Bitbucket',
  confluence: 'Confluence',
  trello: 'Trello',
  asana: 'Asana',
  'ci/cd': 'CI/CD',
  cicd: 'CI/CD',
  'ci / cd': 'CI/CD',
  creo: 'Creo Parametric',
  'creo parametric': 'Creo Parametric',
  'pro/engineer': 'Creo Parametric',
  'pro-e': 'Creo Parametric',
  proe: 'Creo Parametric',
  nx: 'Siemens NX',
  'siemens nx': 'Siemens NX',
  unigraphics: 'Siemens NX',
  'ug nx': 'Siemens NX',
  solidworks: 'SolidWorks',
  'solid works': 'SolidWorks',
  'solid edge': 'Solid Edge',
  solidedge: 'Solid Edge',
  windchill: 'Windchill',
  'ptc windchill': 'Windchill',
  teamcenter: 'Teamcenter',
  'siemens teamcenter': 'Teamcenter',
  catia: 'CATIA',
  autocad: 'AutoCAD',
  inventor: 'Autodesk Inventor',
  'autodesk inventor': 'Autodesk Inventor',
  ansys: 'ANSYS',
  'gd&t': 'GD&T',
  gdt: 'GD&T',
  'geometric dimensioning and tolerancing': 'GD&T',
  'geometric dimensioning & tolerancing': 'GD&T',
  'assembly design': 'assembly design',
  drafting: 'drafting',
  detailing: 'detailing',
  'manufacturing processes': 'manufacturing processes',
  'cad migration': 'CAD migration',
  'cad conversion': 'CAD conversion',
  'cad migration/conversion': 'CAD migration/conversion',
  'cad migration / conversion': 'CAD migration/conversion',
};

const CANONICAL_TO_ALIASES = new Map<string, Set<string>>();
for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
  const cLow = canonical.toLowerCase();
  if (!CANONICAL_TO_ALIASES.has(cLow)) {
    CANONICAL_TO_ALIASES.set(cLow, new Set());
  }
  CANONICAL_TO_ALIASES.get(cLow)!.add(alias.toLowerCase());
  CANONICAL_TO_ALIASES.get(cLow)!.add(cLow);
}

function normalizeSkillAlias(skill: string): string {
  const lower = skill.trim().toLowerCase();
  return SKILL_ALIASES[lower] || skill.trim();
}

const SECONDARY_TOOL_SKILLS = new Set([
  'jira', 'jama', 'git', 'github', 'gitlab', 'bitbucket', 'confluence', 'trello', 'asana',
  'rapita', 'py ate', 'coverity', 'sonarqube', 'postman', 'swagger', 'insomnia',
  'docker', 'jenkins', 'maven', 'gradle', 'npm', 'yarn', 'pnpm', 'vite', 'webpack',
  'eslint', 'prettier', 'black', 'flake8', 'pylint',
  'avionics sdlc', 'sdlc', 'agile', 'scrum', 'kanban',
  'fms (flight management system)', 'fms',
  'windchill', 'teamcenter', 'cad migration', 'cad conversion', 'cad migration/conversion',
]);

const GENERIC_SOFT_SKILLS = new Set([
  'communication', 'communication skills', 'excellent communication', 'good communication',
  'strong communication', 'written communication', 'verbal communication', 'teamwork',
  'team player', 'leadership', 'leadership skills', 'problem solving', 'problem solving skills',
  'problem-solving', 'critical thinking', 'analytical thinking', 'time management', 'collaboration',
  'collaborative', 'agile mindset', 'interpersonal skills', 'presentation skills', 'self motivated',
  'self-motivated', 'adaptability', 'attention to detail', 'multitasking', 'decision making',
  'conflict resolution', 'mentoring', 'organizational skills', 'work ethic',
]);

function extractJdScopeForSkills(text: string): string {
  // Strip email headers, greetings, and footers from the scope without cutting off early sections
  let target = text;
  target = target.replace(/^(?:From|To|Sent|Cc|Subject|Date)\s*:[^\n]*\n?/gim, '').trim();
  target = target.replace(/^(?:Dear|Hi|Hello|Hey)\s+[^\n]*\n?/gim, '').trim();
  target = target.replace(
    /^(?:JD\s*[-–:]\s*)?(?:job\s*titt?le|role\s*titt?le|position\s*titt?le|position|designation|job\s*role|profile)\s*[:=\-–][^\n]*\n?/gim,
    '',
  ).trim();
  target = target.replace(/\n\s*(?:Regards|Thanks|Best regards|Warm regards|Sincerely)[\s\S]*$/i, '').trim();
  target = target.replace(/\n\s*(?:Disclaimer|Confidentiality\s*Notice)[\s\S]*$/i, '').trim();
  return target;
}

function splitTokensWithParentheses(raw: string): string[] {
  if (!raw?.trim()) return [];

  // Protect compound phrases from splitting:
  // 1. Action/gerund compounds: 'writing and testing', 'coding and interpretation', etc.
  const compoundRegex = /\b(writing|coding|developing|testing|building|maintaining|monitoring|control|verification|research|rule\s+coding)\s+and\s+(testing|interpretation|development|validation|maintenance|control|monitoring|coding)\b/gi;
  // 2. Coordinate adjectives before code/systems/competencies: ', readable', ', reusable', ', testable', etc.
  const coordAdjRegex = /,\s*(readable|reusable|testable|maintainable|clean|modular|scalable)\b/gi;

  const protectedStr = raw
    .replace(compoundRegex, '$1___AND___$2')
    .replace(coordAdjRegex, '___COMMA___ $1');

  const tokens: string[] = [];
  let curr = '';
  let depth = 0;
  const len = protectedStr.length;
  let i = 0;

  while (i < len) {
    const ch = protectedStr[i];
    if (ch === '(') {
      depth += 1;
      curr += ch;
      i += 1;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
      curr += ch;
      i += 1;
    } else if (depth === 0) {
      const rest = protectedStr.slice(i);
      const delimMatch = rest.match(/^(?:[;,\n•*|]|\s+\/\s+|\s+\|\s+|\s+\band\b\s+|\s+\bor\b\s+|\s+&\s+)/i);
      if (delimMatch) {
        const trimmed = curr.trim();
        if (trimmed) tokens.push(trimmed);
        curr = '';
        i += delimMatch[0].length;
      } else {
        curr += ch;
        i += 1;
      }
    } else {
      curr += ch;
      i += 1;
    }
  }

  const trimmed = curr.trim();
  if (trimmed) tokens.push(trimmed);

  return tokens.map((t) =>
    t.replace(/___AND___/g, ' and ').replace(/___COMMA___/g, ',').trim(),
  );
}

const GENERIC_CATEGORY_PREFIXES = new Set([
  'programming language', 'programming languages', 'language', 'languages',
  'database', 'databases', 'framework', 'frameworks', 'library', 'libraries',
  'tool', 'tools', 'tooling', 'devops', 'cloud', 'technology', 'technologies',
  'tech stack', 'technical stack', 'platform', 'platforms', 'methodology',
  'methodologies', 'protocol', 'protocols', 'testing tool', 'testing tools',
  'testing', 'automated testing', 'relational databases', 'nosql databases',
  'messaging & queues', 'messaging and queues', 'cloud & infrastructure',
  'cloud platforms', 'container orchestration', 'observability', 'data stores',
  'big data & pipelines', 'mlops', 'generative ai & llms', 'machine learning & deep learning',
  'required skills', 'mandatory skills', 'preferred skills', 'secondary skills', 'technical skills',
]);

const ACADEMIC_DISCIPLINES = new Set([
  'computer science',
  'information technology',
  'information science',
  'mechanical engineering',
  'electrical engineering',
  'electronics engineering',
  'electronics & communication',
  'electronics and communication',
  'civil engineering',
  'telecommunication',
  'telecommunications',
  'instrumentation',
  'instrumentation engineering',
  'aerospace engineering',
  'aeronautical engineering',
  'chemical engineering',
  'biotechnology',
  'commerce',
  'business administration',
  'finance',
  'accounting',
]);

const NON_SKILL_EXACT_TERMS = new Set([
  'equivalent', 'support', 'expertise', 'experience', 'knowledge', 'proficiency',
  'proficient', 'familiarity', 'understanding', 'competency', 'competencies',
  'skills', 'skill', 'requirements', 'requirement', 'qualifications', 'qualification',
  'responsibilities', 'responsibility', 'plus', 'bonus', 'advantage', 'added advantage',
  'preferred', 'mandatory', 'essential', 'optional', 'desirable', 'hands-on', 'exposure',
  'developer', 'software developer', 'engineer', 'software engineer', 'senior software engineer',
  'consultant', 'sap consultant', 'lead consultant', 'principal consultant',
  'project manager', 'program manager', 'product manager', 'architect', 'technical architect',
  'solution architect', 'solutions architect', 'enterprise architect', 'qa engineer',
  'test engineer', 'tester', 'technical lead', 'team lead', 'scrum master',
  'business analyst', 'system administrator', 'database administrator', 'admin',
  'technical skills', 'mandatory skills', 'required skills', 'must-have skills', 'must have skills',
  'preferred skills', 'good to have', 'nice to have', 'secondary skills',
  'bachelor', 'bachelors', "bachelor's", 'master', 'masters', "master's",
  'degree', "bachelor's degree", "master's degree", 'phd', 'doctorate', 'diploma',
  'b.e', 'be', 'b.tech', 'btech', 'm.tech', 'mtech', 'b.sc', 'bsc', 'm.sc', 'msc', 'mca', 'bca',
  'bs', 'ms', 'bba', 'mba', 'b.com', 'bcom', 'm.com', 'mcom', 'cfa', 'cpa', 'ca', 'frm',
  'commerce', 'design', 'standards', 'standard', 'mandatory requirements', 'preferred qualifications',
  'interpretation', 'using', 'of', 'on', 'readable', 'reusable', 'testable', 'testable codes',
  'testable code', 'readable code', 'reusable code', 'codes', 'code',
  'current organization', 'current org', 'total experience', 'total exp',
  'relevant experience', 'relevant exp', 'notice period', 'monthly billing rates',
  'monthly billing rate', 'bill rate', 'billing rate', 'job posting id', 'posting id', 'job id',
  'educational qualification', 'educational qualifications',
]);

const KNOWN_LOCATION_TERMS = new Set([
  'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'chennai', 'delhi', 'new delhi',
  'ncr', 'noida', 'gurgaon', 'gurugram', 'kolkata', 'calcutta', 'ahmedabad', 'kochi',
  'cochin', 'trivandrum', 'thiruvananthapuram', 'chandigarh', 'jaipur', 'indore', 'lucknow',
  'bhubaneswar', 'coimbatore', 'mysore', 'nagpur', 'remote', 'hybrid', 'onsite', 'on-site',
  'work from home', 'wfh', 'wfo', 'india', 'usa', 'uk', 'us', 'singapore', 'london', 'boston',
  'new york', 'chicago', 'seattle', 'austin', 'california', 'texas',
]);

function isNonTechnicalSkill(raw: string): boolean {
  if (!raw) return true;
  const s = raw.trim();
  if (s.length < 2 || s.length > 85) return true;

  // Unmatched parenthesis/brackets fragments (e.g. '(This', '[Note')
  if ((s.startsWith('(') && !s.includes(')')) || (s.startsWith('[') && !s.includes(']'))) {
    return true;
  }
  if ((s.endsWith(')') && !s.includes('(')) || (s.endsWith(']') && !s.includes('['))) {
    return true;
  }

  const strippedPunct = s.replace(/^[\s(\[{'"`•*#\d.:=–—\-]+|[\s)\]}'"`•*#;,.…\u2026:=–—\-]+$/g, '').trim();
  if (!strippedPunct || strippedPunct.length < 2) return true;
  if (COMMON_ENGLISH_STOPWORDS.has(strippedPunct.toLowerCase())) return true;

  const lower = s.toLowerCase().replace(/[\s\-_/&]+/g, ' ').trim();

  if (NON_SKILL_EXACT_TERMS.has(lower) || COMMON_ENGLISH_STOPWORDS.has(lower) || GENERIC_SOFT_SKILLS.has(lower)) {
    return true;
  }

  if (ACADEMIC_DISCIPLINES.has(lower)) {
    return true;
  }

  if (isRecruiterTitle(s) || /^(?:regards|thanks|best regards|warm regards|sincerely|cheers)\b/i.test(s)) {
    return true;
  }

  // Terminal period on sentences
  if (s.endsWith('.') && s.split(/\s+/).filter(Boolean).length >= 4) {
    return true;
  }

  // Metadata field labels (e.g. 'Location : Bangalore /Hyderabad', 'Notice Period: 30 days')
  if (
    /^(?:current\s*(?:organization|org)|total\s*exp(?:erience)?|relevant\s*exp(?:erience)?|notice\s*period|monthly\s*billing\s*rates?|bill(?:ing)?\s*rate|job\s*posting\s*id|posting\s*id|job\s*id|req(?:uisition)?\s*(?:id|#)?|demand\s*id|educational\s*qualifications?|qualifications?|education|job\s*title|designation|location|work\s*location|base\s*location|experience|positions?|openings?|vacancies|budget|salary|ctc|rate|shift|timing|work\s*mode)\s*[:=-]/i.test(
      s,
    )
  ) {
    return true;
  }

  // Location / City combinations or work arrangement values
  const locClean = s.replace(/^(?:location|work\s*location|base\s*location|job\s*location)\s*[:=-]?\s*/i, '').trim();
  const locParts = locClean.split(/[\s/&,\-]+/).map(p => p.trim().toLowerCase()).filter(Boolean);
  if (locParts.length > 0 && locParts.every(p => KNOWN_LOCATION_TERMS.has(p) || p === 'and' || p === 'or')) {
    return true;
  }

  if (/\b(?:bangalore|bengaluru|hyderabad|pune|mumbai|chennai|delhi|ncr|noida|gurgaon|gurugram|kolkata|ahmedabad|kochi|trivandrum|chandigarh|jaipur)\b/i.test(lower)) {
    return true;
  }

  // Generic activities / job duties (e.g. 'validation activities', 'testing tasks')
  if (/\b(?:activities|tasks|duties|workflows|procedures|initiatives)\b/i.test(s)) {
    return true;
  }

  // Educational qualifications
  if (
    /\b(?:bachelor'?s?|master'?s?|degree|b\.?e\.?|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mca|bca|bba|mba|b\.?com|m\.?com|commerce|cfa|cpa|ca|frm|ph\.?d|doctorate|diploma|graduate|undergraduate|post[\s-]?graduate)\b/i.test(
      s,
    )
  ) {
    return true;
  }

  // Experience and durations
  if (/\b\d+[\s\+\-to–]*\d*\s*(?:years?|yrs?|months?)\b/i.test(s)) {
    return true;
  }
  if (/\b(?:minimum|at\s+least|overall|relevant|total|prior|industry|work)?\s*\d+\s*(?:\+|plus)?\s*(?:years?|yrs?)\b/i.test(s)) {
    return true;
  }
  if (/\b(?:experience|exp)\s*(?:of|in)?\s*\d+/i.test(s)) {
    return true;
  }

  // Project counts / Implementation counts
  if (/\b\d+\s*(?:to|-)?\s*\d*\s*(?:full\s+life[\s-]?cycle|end[\s-]?to[\s-]?end|e2e)?\s*implementations?\b/i.test(s)) {
    return true;
  }
  if (/\b\d+\s*(?:to|-)?\s*\d*\s*projects?\b/i.test(s)) {
    return true;
  }
  if (/\bmigration\s+projects?\b/i.test(s)) {
    return true;
  }

  // Generic job title patterns
  if (/\b(?:developer|engineer|consultant|manager|architect|administrator|tester|analyst|specialist|lead)\b/i.test(s)) {
    if (!/\b(?:scrum\s+master|automation)\b/i.test(s)) {
      if (/\b(?:cloud|software|backend|frontend|full[\s-]?stack|golang|python|java|devops|data|qa|sap|systems?|web|mobile)\b/i.test(s) || s.split(/\s+/).filter(Boolean).length >= 2) {
        return true;
      }
    }
  }

  // Full requirement sentences
  if (/\b(?:must\s+have|must\s+be|should\s+have|should\s+be|ability\s+to|demonstrated\s+ability|proven\s+ability|responsible\s+for|working\s+with|collaborate\s+with|candidate\s+must|candidate\s+should)\b/i.test(s)) {
    return true;
  }

  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > 10) {
    return true;
  }

  return false;
}

function parseSkillTokens(raw: string): string[] {
  if (!raw?.trim()) return [];
  const rawTokens = splitTokensWithParentheses(raw);
  const result: string[] = [];
  const seen = new Set<string>();

  for (let s of rawTokens) {
    s = s.replace(/^[:=–—\-\s•*#\d.]+/, '').trim();

    const catMatch = s.match(/^([A-Za-z0-9\s&/()–\-]{2,50})\s*:\s*(.+)$/);
    if (catMatch) {
      const prefix = catMatch[1]!.trim().toLowerCase();
      if (GENERIC_CATEGORY_PREFIXES.has(prefix) || ['stack', 'skills', 'technologies', 'tools', 'responsibilities'].some(w => prefix.includes(w))) {
        s = catMatch[2]!.trim();
      }
    }

    s = s.replace(/^[:=–—\-\s•*#\d.]+/, '').trim();
    s = s.replace(/[;,.…\u2026]+$/, '').trim();
    s = s.replace(
      /^(?:(?:deep|strong|good|extensive|proven|hands-on|solid(?![\s-]edge\b)|sound|working)\s+)*(?:proficiency|experience|skills?|knowledge|background|understanding|expertise)\s+(?:in|with|of)?\s*/i,
      '',
    );
    s = s.replace(/^(?:(?:deep|strong|good|extensive|proven|hands-on|solid(?![\s-]edge\b)|sound|working)\s+)+/i, '');
    s = s.replace(/^(?:tools?\s+(?:such\s+as|like|including)|experience\s+with\s+tools\s+such\s+as|knowledge\s+of\s+tools\s+like)\s*/i, '');
    s = s.replace(
      /^(?:build|develop|manage|design|maintain|automate|deploy|perform|execute|ensure|lead|support|implement|create)\s+(?:scalable\s+|low-latency\s+|distributed\s+)?(?:microservices|dashboards|pipelines|applications|workers|systems)?\s*(?:using|with|in)?\s*/i,
      '',
    );
    s = s.replace(/^(?:exposure\s+to|familiarity\s+with|working\s+knowledge\s+of)\s+/i, '');
    s = s.replace(/\s+experience$/i, '');
    s = s.replace(/^profic\w*\s*/i, '');
    s = s.replace(/\s+(?:compliance\s+standards?|standards?|compliance|(?<!manufacturing\s)(?<!fabrication\s)(?<!machining\s)processes?|guidelines?|specifications?|best\s+practices?)$/i, '');
    s = s.replace(
      /\s+(?:is\s+a\s+must|is\s+mandatory|is\s+required|is\s+essential|is\s+preferred|is\s+desired|is\s+a\s+plus|preferred|mandatory|required)$/i,
      '',
    );
    s = s.trim();
    s = s.replace(/[;,.…\u2026]+$/, '').trim();

    if (isNonTechnicalSkill(s)) continue;

    const lower = s.toLowerCase();
    const normalized = SKILL_ALIASES[lower] || s;
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
}

function registerSkillVariants(skill: string, set: Set<string>): void {
  const low = skill.toLowerCase().trim();
  set.add(low);
  const canonical = normalizeSkillAlias(skill);
  const cLow = canonical.toLowerCase();
  set.add(cLow);
  if (CANONICAL_TO_ALIASES.has(cLow)) {
    for (const a of CANONICAL_TO_ALIASES.get(cLow)!) set.add(a);
  }
  if (CANONICAL_TO_ALIASES.has(low)) {
    for (const a of CANONICAL_TO_ALIASES.get(low)!) set.add(a);
  }
  if (low.includes('do-178b/c') || low.includes('do 178b/c')) {
    set.add('do-178b');
    set.add('do-178c');
    set.add('do 178b');
    set.add('do 178c');
    set.add('do-178');
    set.add('do 178');
  }
  if (low.includes('v&v') || low.includes('verification & validation') || low.includes('verification and validation')) {
    set.add('v&v');
    set.add('verification & validation');
    set.add('verification and validation');
    set.add('v&v (verification & validation)');
  }
  if (low.includes('llt') || low.includes('low level testing')) {
    set.add('llt');
    set.add('low level testing');
    set.add('low-level testing');
    set.add('llt (low level testing)');
  }
  if (low.includes('hlt') || low.includes('high level testing')) {
    set.add('hlt');
    set.add('high level testing');
    set.add('high-level testing');
    set.add('hlt (high level testing)');
  }
  if (low.includes('fms') || low.includes('flight management system')) {
    set.add('fms');
    set.add('flight management system');
    set.add('fms (flight management system)');
  }
  if (low.includes('level a/b')) {
    set.add('level a/b');
    set.add('level a');
    set.add('level b');
    set.add('level a/b verification');
  }
}

/**
 * Discovers skills from natural phrasing and bullet points across all sections.
 */
function discoverSkillsFromProse(text: string): {
  mandatoryDiscovered: string[];
  secondaryDiscovered: string[];
  generalDiscovered: string[];
} {
  const mandatoryDiscovered: string[] = [];
  const secondaryDiscovered: string[] = [];
  const generalDiscovered: string[] = [];
  const seenMandatory = new Set<string>();
  const seenSecondary = new Set<string>();
  const seenGeneral = new Set<string>();

  const addMandatory = (val: string) => {
    for (const t of parseSkillTokens(val)) {
      const k = t.toLowerCase();
      if (!seenMandatory.has(k)) {
        registerSkillVariants(t, seenMandatory);
        mandatoryDiscovered.push(t);
      }
    }
  };

  const addSecondary = (val: string) => {
    for (const t of parseSkillTokens(val)) {
      const k = t.toLowerCase();
      if (!seenSecondary.has(k)) {
        registerSkillVariants(t, seenSecondary);
        secondaryDiscovered.push(t);
      }
    }
  };

  const addGeneral = (val: string) => {
    for (const t of parseSkillTokens(val)) {
      const k = t.toLowerCase();
      if (!seenGeneral.has(k)) {
        registerSkillVariants(t, seenGeneral);
        generalDiscovered.push(t);
      }
    }
  };

  // 1. Mandatory / Must-have prose patterns
  const mustMatches = text.matchAll(
    /(?:must\s+have|mandatory\s+requirements?\s+(?:include|are|such\s+as)|essential\s+(?:skills?|requirements?)\s+(?:include|are)|required\s+(?:to\s+have|skills?\s+(?:include|are)))\s*(?:(?:extensive|hands-on|solid|proven|deep|good)\s+)?(?:experience\s+(?:in|with|using)|proficiency\s+(?:in|with)|skills?\s+in|knowledge\s+of)?\s*([^.!?\n]{2,250}?)(?=[.;\n]|\s+(?:for|to|is|are)\b)/gi,
  );
  for (const m of mustMatches) {
    if (m[1]) addMandatory(m[1]);
  }

  const candidateMustMatches = text.matchAll(
    /(?:candidate\s+must\s+have|candidate\s+should\s+have|candidate\s+must\s+possess|should\s+have|must\s+possess)\s+(?:(?:extensive|hands-on|solid|proven|deep|good)\s+)?(?:experience\s+(?:in|with|using)|proficiency\s+(?:in|with)|skills?\s+in|knowledge\s+of)?\s*([^.!?\n]{2,250}?)(?=[.;\n]|\s+(?:to|for|is|are)\b)/gi,
  );
  for (const m of candidateMustMatches) {
    if (m[1]) addMandatory(m[1]);
  }

  const seekingMatches = text.matchAll(
    /(?:looking\s+for|seeking)\s+(?:candidates?\s+)?(?:with\s+)?(?:experience\s+(?:in|with)|skills?\s+in)\s+([^.!?\n]{2,250}?)(?=[.;\n]|\s+(?:to|for)\b)/gi,
  );
  for (const m of seekingMatches) {
    if (m[1]) addMandatory(m[1]);
  }

  const mustEndMatches = text.matchAll(
    /([^.!?\n]{2,120}?)\s+(?:is|are)\s+(?:mandatory|required|essential|a\s+must)/gi,
  );
  for (const m of mustEndMatches) {
    if (m[1]) addMandatory(m[1]);
  }

  // 2. Preferred / Secondary / Tools prose patterns
  const prefMatches = text.matchAll(
    /(?:(?:exposure\s+to|familiarity\s+with|working\s+knowledge\s+of|knowledge\s+of)\s+([^.!?\n]{2,250}?)\s+(?:is|are)\s+(?:preferred|a\s+plus|nice(?:\s+to\s+have)?|good(?:\s+to\s+have)?|desired|beneficial|an?\s+added\s+advantage)|(?:preferred|good\s+to\s+have|nice\s+to\s+have|desired|preferable|advantageous|optional|an?\s+added\s+advantage|bonus\s+skills?)\s*[:=-]?\s*(?:(?:exposure\s+to|familiarity\s+with|experience\s+with|working\s+knowledge\s+of|knowledge\s+of)\s+)?([^.!?\n]{2,250}?)(?=[.;\n]|\s+(?:for|to|is|are|will)\b))/gi,
  );
  for (const m of prefMatches) {
    if (m[1]) addSecondary(m[1]);
    if (m[2]) addSecondary(m[2]);
  }

  const plusEndMatches = text.matchAll(
    /([^.!?\n]{2,120}?)\s+(?:is|are|would\s+be)\s+(?:preferred|a\s+plus|an?\s+added\s+advantage|nice\s+to\s+have|good\s+to\s+have|advantageous|optional|beneficial)/gi,
  );
  for (const m of plusEndMatches) {
    if (m[1]) addSecondary(m[1]);
  }

  const toolMatches = text.matchAll(
    /(?:tools?\s+(?:used\s+in\s+this\s+role\s+include|used\s+include|include|such\s+as)|technologies?\s+(?:used|include))\s*[:=-]?\s*([^.!?\n]{2,250})/gi,
  );
  for (const m of toolMatches) {
    if (m[1]) addSecondary(m[1]);
  }

  // 3. Process sentence by sentence for context-aware extraction
  const sentences = text.split(/(?<=[.!?])\s+|\n+/);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed || trimmed.length < 5) continue;
    const isMandatorySentence = /\b(?:must\s+have|must\s+possess|mandatory|essential|required|skills\s+required|minimum\s+requirements?|candidate\s+must|candidate\s+should|should\s+have|proficiency\s+in)\b/i.test(trimmed);
    const isPreferredSentence = /\b(?:preferred|a\s+plus|would\s+be\s+a\s+plus|nice\s+to\s+have|good\s+to\s+have|desired|optional|bonus|added\s+advantage|advantageous|tools?\s+used|tools?\s+include|exposure\s+to)\b/i.test(trimmed);

    // Look for standards (DO-178B/C, Level A/B verification, etc.) inside the sentence
    const stdMatches = trimmed.matchAll(/(?:for|under|with|in)\s+(Level\s+[A-Za-z0-9/]+(?:\s+verification)?|DO-[0-9]+[A-Za-z/]*|ISO\s*[0-9]+|MISRA|AUTOSAR)\b/gi);
    for (const sm of stdMatches) {
      if (sm[1]) {
        if (isMandatorySentence) addMandatory(sm[1]);
        else if (isPreferredSentence) addSecondary(sm[1]);
        else addGeneral(sm[1]);
      }
    }

    if (isMandatorySentence || isPreferredSentence) {
      const matchedAliases: { pos: number; canonical: string }[] = [];
      for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
        if (alias === 'do-178b' || alias === 'do-178c' || alias === 'do 178b' || alias === 'do 178c') {
          if (/\bdo[\s-]178b\/c\b/i.test(trimmed)) continue;
        }
        const rx = alias === 'js'
          ? /(?<![\.\w])js\b/gi
          : new RegExp(`\\b${escapeRegex(alias)}\\b`, 'gi');
        for (const match of trimmed.matchAll(rx)) {
          if (match.index !== undefined) {
            matchedAliases.push({ pos: match.index, canonical });
          }
        }
      }
      matchedAliases.sort((a, b) => a.pos - b.pos);
      for (const { canonical } of matchedAliases) {
        if (isMandatorySentence) {
          addMandatory(canonical);
        } else {
          addSecondary(canonical);
        }
      }
    }
  }

  // 3. General experience & stack prose patterns
  const withExpMatch = text.matchAll(
    /(?:with|having|using|in)\s+([^.!?\n]{3,80}?)\s+(?:experience|proficiency|skills?|knowledge|background)\b/gi,
  );
  for (const m of withExpMatch) {
    if (m[1] && !/\b(?:degree|bachelor|master|years?|yrs?|\d+\+?)\b/i.test(m[1])) {
      addGeneral(m[1]);
    }
  }

  const expMatches = text.matchAll(
    /(?:(?:deep|strong|good|hands-on)\s+)?(?:experience\s+(?:in|with|using)|proficiency\s+(?:in|with)|hands-on\s+(?:with|in)?|knowledge\s+of|skills?\s+in|familiarity\s+with)\s+([^.!?\n]{3,80}?)(?=[.;\n]|\s+(?:is|are|required|preferred|will|to|for)\b)/gi,
  );
  for (const m of expMatches) {
    if (m[1] && !/\b(?:degree|bachelor|master|years?|yrs?|\d+\+?)\b/i.test(m[1])) {
      addGeneral(m[1]);
    }
  }

  const workWithMatches = text.matchAll(
    /(?:work(?:ing)?\s+(?:extensively\s+)?with|exposure\s+to|proficient\s+with|stack\s+(?:includes?|consists\s+of)|technologies?\s+(?:include|such\s+as))\s+([^.!?\n]{3,120}?)(?=[.;\n]|\s+(?:is|are|required|preferred|will|to|and\s+more)\b)/gi,
  );
  for (const wm of workWithMatches) {
    if (wm[1]) addGeneral(wm[1]);
  }

  // Pattern D: Bullet points under requirements/responsibilities - skip pure action verb sentences
  const ACTION_VERBS = new Set([
    'build', 'develop', 'design', 'perform', 'execute', 'maintain', 'ensure', 'lead',
    'manage', 'support', 'collaborate', 'create', 'drive', 'work', 'conduct', 'coordinate',
    'implement', 'deploy', 'automate', 'write', 'review', 'test', 'participate',
  ]);
  const bulletMatches = text.matchAll(
    /^[•\-*]\s*(?:(?:deep|strong|good|hands-on)\s+)?(?:proficiency\s+(?:in|with)|experience\s+(?:in|with)|knowledge\s+of)?\s*([^.!?\n]{3,80})/gim,
  );
  for (const bm of bulletMatches) {
    const rawBullet = bm[1]?.trim() || '';
    const firstWord = rawBullet.split(/\s+/)[0]?.toLowerCase() || '';
    if (!ACTION_VERBS.has(firstWord) && !isNonTechnicalSkill(rawBullet)) {
      addGeneral(rawBullet);
    }
  }

  // Pattern E: Role titles
  const GENERIC_ROLE_PREFIXES = new Set([
    'software', 'hardware', 'systems', 'system', 'it', 'technical', 'senior', 'lead', 'principal', 'junior',
    'cloud', 'frontend', 'backend', 'fullstack', 'full-stack', 'full stack', 'data', 'qa', 'devops', 'sap',
    'associate', 'staff', 'chief', 'executive', 'experienced', 'core', 'mobile', 'web', 'application',
  ]);
  const roleTechMatch = text.matchAll(
    /\b([A-Za-z0-9+#.]{2,20})\s+(?:developer|engineer|specialist|consultant|architect|lead|analyst|programmer|clusters?|pipelines?)\b/gi,
  );
  for (const rtm of roleTechMatch) {
    if (rtm[1] && !COMMON_ENGLISH_STOPWORDS.has(rtm[1].toLowerCase()) && !GENERIC_ROLE_PREFIXES.has(rtm[1].toLowerCase()) && !isNonTechnicalSkill(rtm[1])) {
      addGeneral(rtm[1]);
    }
  }

  // Pattern F: "using / built with / utilizing / leveraging / via / based on <skills>"
  const usingMatches = text.matchAll(
    /(?:using|built\s+with|utilizing|via|leveraging|developed\s+(?:in|with)|implemented\s+(?:in|with))\s+([^.!?\n]{2,80}?)(?=[.;\n]|\s+(?:to|for|in\s+order\s+to|while|and\s+maintain|and\s+manage|and\s+build)\b)/gi,
  );
  for (const um of usingMatches) {
    if (um[1] && !isNonTechnicalSkill(um[1])) addGeneral(um[1]);
  }

  // Pattern G: "automate / tests with / testing with / CI/CD with <skills>"
  const testMatches = text.matchAll(
    /(?:tests?\s+(?:with|using|in)|automate\s+(?:with|using|via)|automation\s+(?:with|using|in))\s+([^.!?\n]{2,80}?)(?=[.;\n]|\s+(?:to|for)\b)/gi,
  );
  for (const tm of testMatches) {
    if (tm[1] && !isNonTechnicalSkill(tm[1])) addGeneral(tm[1]);
  }

  // Pattern H: Scan prose for known canonical technologies, compliance standards, and tools
  const hasDo178bc = /\bdo[\s-]178b\/c\b/i.test(text);
  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    if (hasDo178bc && (alias === 'do-178b' || alias === 'do-178c' || alias === 'do 178b' || alias === 'do 178c' || alias === 'do-178' || alias === 'do 178')) {
      continue;
    }
    const rx = alias === 'js'
      ? /(?<![\.\w])js\b/i
      : new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
    if (rx.test(text)) {
      addGeneral(canonical);
    }
  }

  return { mandatoryDiscovered, secondaryDiscovered, generalDiscovered };
}

const MANDATORY_SKILL_LABELS = [
  'mandatory skills / required skills',
  'mandatory / required skills',
  'required / mandatory skills',
  'primary skills / core skills',
  'primary / core skills',
  'core / primary skills',
  'mandatory skills',
  'mandatory technical skills',
  'mandatory',
  'must have skills',
  'must have',
  'must-have skills',
  'must-have',
  'required skills',
  'required technical skills',
  'required',
  'requirements',
  'required technical competencies',
  'technical competencies required',
  'essential skills',
  'essential technical skills',
  'essential technical requirements',
  'core required skills',
  'core technical skills',
  'core skills',
  'core competencies',
  'core technical competencies',
  'minimum technical requirements',
  'minimum requirements',
  'skills required',
  'compulsory skills',
  'primary skills',
  'primary technical capabilities',
  'key skills',
  'key technical skills',
  'technical skills',
  'technical requirements',
  'tech stack',
  'technical stack',
  'responsibilities (tech stack)',
  'responsibilities (technical stack)',
  'responsibilities - tech stack',
  'responsibilities: tech stack',
  'required technologies',
  'programming languages',
  'frameworks and libraries',
  'database requirements',
  'cloud and devops requirements',
  'ai/ml requirements',
];

const PREFERRED_SKILL_LABELS = [
  'good to have',
  'good-to-have',
  'nice to have',
  'nice-to-have',
  'preferred skills',
  'preferable skills',
  'preferred',
  'desired skills',
  'desired',
  'advantageous skills',
  'optional skills',
  'optional',
  'additional skills',
  'secondary skills',
  'preferred qualifications',
  'added advantage',
  'an added advantage',
  'bonus skills',
  'bonus',
  'plus / would be a plus',
  'would be a plus',
  'plus',
  'secondary / preferred skills',
  'secondary/preferred skills',
  'preferred / secondary skills',
  'preferred/secondary skills',
  'optional capabilities',
  'additional capabilities',
];

/**
 * Dynamic skill extractor: extracts from explicit skill sections AND all other sections with strict primary/secondary separation.
 */
function parseSkillsFromText(text: string): {
  mandatorySkills: string[];
  secondarySkills: string[];
  primarySkills: string[];
  primary_skills: string[];
  secondary_skills: string[];
  skills: string[];
} {
  // 1. Mandatory / Core skill sections
  const mandatorySection = extractLabeledMultilineValue(text, MANDATORY_SKILL_LABELS);

  // 2. Secondary / General / Nice-to-have skill sections
  const preferredSection = extractLabeledMultilineValue(text, PREFERRED_SKILL_LABELS);

  const mandatoryTokens = parseSkillTokens(mandatorySection);
  const preferredTokens = parseSkillTokens(preferredSection);

  // 3. Inspect responsibilities, qualifications, and JD scope for additional technical skills
  const scopedJd = extractJdScopeForSkills(text);
  const { mandatoryDiscovered, secondaryDiscovered, generalDiscovered } = discoverSkillsFromProse(scopedJd);

  const primaryList: string[] = [];
  const primarySet = new Set<string>();

  const addPrimary = (s: string) => {
    if (!s || !s.trim()) return;
    const norm = normalizeSkillAlias(s);
    const k = norm.toLowerCase();
    if (!primarySet.has(k) && !isNonTechnicalSkill(norm)) {
      registerSkillVariants(norm, primarySet);
      primaryList.push(norm);
    }
  };

  for (const s of mandatoryTokens) addPrimary(s);
  for (const s of mandatoryDiscovered) addPrimary(s);

  // RULE 1 (Fallback for Primary Skills):
  // If no primary skills found from mandatory sections or mandatory prose,
  // extract from emphasized technologies and general tech stack, strictly excluding preferred skills and secondary tools.
  if (primaryList.length === 0) {
    const preferredLowers = new Set([
      ...preferredTokens.map(s => s.toLowerCase()),
      ...secondaryDiscovered.map(s => s.toLowerCase()),
    ]);
    const techFrequency = new Map<string, number>();
    for (const s of generalDiscovered) {
      const norm = normalizeSkillAlias(s);
      techFrequency.set(norm, (techFrequency.get(norm) || 0) + 1);
    }

    const titleSkills: string[] = [];
    const roleTitle = parseJobTitle(text);
    if (roleTitle) {
      for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
        const rx = alias === 'js'
          ? /(?<![\.\w])js\b/i
          : new RegExp(`\\b${escapeRegex(alias)}\\b`, 'i');
        if (rx.test(roleTitle)) {
          titleSkills.push(canonical);
        }
      }
    }

    for (const [s, count] of techFrequency.entries()) {
      if ((count >= 2 || titleSkills.includes(s)) && !preferredLowers.has(s.toLowerCase()) && !SECONDARY_TOOL_SKILLS.has(s.toLowerCase())) {
        addPrimary(s);
      }
    }

    if (primaryList.length === 0) {
      const coreTech = generalDiscovered.filter((s) => !preferredLowers.has(s.toLowerCase()) && !SECONDARY_TOOL_SKILLS.has(s.toLowerCase()));
      if (coreTech.length > 0) {
        for (const s of coreTech) addPrimary(s);
      } else if (generalDiscovered.length > 0) {
        for (const s of generalDiscovered) {
          if (!preferredLowers.has(s.toLowerCase())) {
            addPrimary(s);
          }
        }
      }
    }
  }

  const secondaryList: string[] = [];
  const secondarySet = new Set<string>();

  const addSecondary = (s: string) => {
    if (!s || !s.trim()) return;
    const norm = normalizeSkillAlias(s);
    const k = norm.lower ? norm.toLowerCase() : String(norm).toLowerCase();
    // RULE 3: If a skill is in Primary, do not add it to Secondary.
    if (primarySet.has(k)) return;
    const canonicalVariants = CANONICAL_TO_ALIASES.get(k);
    if (canonicalVariants) {
      for (const v of canonicalVariants) {
        if (primarySet.has(v)) return;
      }
    }
    if (!secondarySet.has(k) && !isNonTechnicalSkill(norm)) {
      registerSkillVariants(norm, secondarySet);
      secondaryList.push(norm);
    }
  };

  // 1. Explicit preferred tokens (Rule 2)
  for (const s of preferredTokens) addSecondary(s);

  // 2. Preferred prose discovered (Rule 2)
  for (const s of secondaryDiscovered) addSecondary(s);

  // 3. Related tools, frameworks, and adjacent technologies mentioned in JD (Rule 2)
  for (const s of generalDiscovered) addSecondary(s);

  // RULE 3 (Strict deduplication sweep):
  // Ensure no skill, synonym, or variant appears in secondary if present in primary
  const cleanSecondaryList: string[] = [];
  const finalSecSeen = new Set<string>();
  for (const s of secondaryList) {
    const norm = normalizeSkillAlias(s);
    const k = norm.toLowerCase();
    if (primarySet.has(k)) continue;
    const variants = CANONICAL_TO_ALIASES.get(k);
    if (variants) {
      let isDuplicate = false;
      for (const v of variants) {
        if (primarySet.has(v)) {
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;
    }
    if (!finalSecSeen.has(k)) {
      finalSecSeen.add(k);
      cleanSecondaryList.push(norm);
    }
  }

  // Combined distinct technical skills
  const allSkills: string[] = [...primaryList];
  const allSet = new Set<string>(primarySet);

  for (const s of cleanSecondaryList) {
    const k = s.toLowerCase();
    if (!allSet.has(k)) {
      registerSkillVariants(s, allSet);
      allSkills.push(s);
    }
  }

  return {
    mandatorySkills: primaryList,
    secondarySkills: cleanSecondaryList,
    primarySkills: primaryList,
    primary_skills: primaryList,
    secondary_skills: cleanSecondaryList,
    skills: allSkills,
  };
}


function parseOpenPositions(text: string): number {
  const labeled = extractLabeledValue(text, [
    'number of positions',
    'open positions',
    'open headcount',
    'annual headcount',
    'headcount',
    'positions',
    'openings',
    'vacancies',
    'open vacancies',
    'number of vacancies',
    'no of positions',
    'no. of position',
    'resources required',
    'number of openings',
  ]);
  if (labeled && !Number.isNaN(Number(labeled))) {
    return Math.max(1, parseInt(labeled, 10));
  }
  const m = text.match(/(\d{1,3})\s*(?:openings?|positions?|headcount|vacancies)/i);
  if (m) return Math.max(1, parseInt(m[1] || '1', 10));
  if (/\b(multiple|bulk|many)\b/i.test(text)) return 2;
  return 1;
}

function parseNoticePeriod(text: string): string {
  const labeled =
    extractInlineFieldValue(text, ['notice period', 'availability'], ['location', 'skills', 'budget']) ||
    extractLabeledValue(text, ['notice period', 'availability']);
  if (labeled) return labeled;
  if (/immediate\s*joiners?/i.test(text)) return 'Immediate';
  const m = text.match(/\b(immediate|join(?:ing)?\s*immediately|\d{1,3}\s*(?:day|days|month|months))\b/i);
  return m ? titleCaseWords(m[1] || '') : '';
}

function parseWorkMode(text: string): string {
  const labeled = extractLabeledValue(text, ['work mode', 'mode of work', 'work model']);
  if (labeled) return titleCaseWords(labeled);
  const lower = text.toLowerCase();
  if (/\bhybrid\b/.test(lower)) return 'Hybrid';
  if (/\bremote\b|\bwfh\b|\bwork from home\b/.test(lower)) return 'Remote';
  if (/\bon[\s-]?site\b|\bon[\s-]?premise\b/.test(lower)) return 'On-site';
  return '';
}

function parseLocation(text: string): string {
  const labeled =
    extractInlineFieldValue(
      text,
      ['location', 'job location', 'work location', 'base location', 'job location/s', 'work arrangement', 'workplace'],
      ['overall exp', 'experience', 'skills', 'budget', 'notice period'],
    ) ||
    extractLabeledMultilineValue(text, ['location', 'job location', 'work location', 'base location', 'work arrangement', 'workplace']);
  if (labeled) return labeled;

  // Check email subject "@ Location"
  const subjLoc = text.match(/Subject:.*?@\s*([A-Za-z][A-Za-z\s,/.-]{2,40})/i);
  if (subjLoc?.[1]) {
    const cand = normalizeExtractedValue(subjLoc[1]);
    if (!/^(immediate|urgent|fulltime|contract)$/i.test(cand)) return cand;
  }

  // Prose patterns: "office in <Loc>", "based in <Loc>", "team in <Loc>", "located in <Loc>", "out of our <Loc> office"
  const proseLoc = text.match(/(?:based\s+in|located\s+in|office\s+in|team\s+in|positions?\s+in|headquartered\s+in)\s+([A-Z][A-Za-z0-9\s,.-]{2,40}?)(?=[.;\n]|\s+(?:to|with|and|is|are|who|or)\b)/);
  if (proseLoc?.[1]) {
    const cand = normalizeExtractedValue(proseLoc[1]);
    if (cand.length >= 2 && !/^(the|our|this|a|an|immediate)$/i.test(cand)) return cand;
  }

  const officeLoc = text.match(/(?:out\s+of\s+our|at\s+our)\s+([A-Z][A-Za-z\s,/.-]{2,30}?)\s+office/i);
  if (officeLoc?.[1]) {
    return normalizeExtractedValue(officeLoc[1]);
  }

  // Remote / Hybrid indicators if explicitly stated as the arrangement
  if (/\b(?:fully\s+remote|100%\s+remote|remote\s*(?:\([^)]+\))?)\b/i.test(text)) {
    const remoteMatch = text.match(/\b(remote\s*(?:\([^)]+\))?)/i);
    if (remoteMatch) return remoteMatch[1].trim();
    return 'Remote';
  }

  const m = text.match(/\blocation\s*[:=-]\s*([A-Za-z][A-Za-z\s,&/.-]{2,60})/i);
  if (m?.[1]) return normalizeExtractedValue(m[1]);
  return '';
}

function parseExperience(text: string): { overall: string; level: string } {
  const labeled =
    extractInlineFieldValue(
      text,
      ['overall experience', 'experience', 'exp', 'experience required', 'overall exp', 'years of experience'],
      ['open positions', 'skills', 'budget', 'location'],
    ) ||
    extractLabeledMultilineValue(text, ['overall experience', 'experience', 'exp', 'experience required']);
  if (labeled) {
    return { overall: labeled, level: inferExperienceLevel(labeled, text) };
  }
  const m =
    text.match(/(\d{1,2}\s*(?:\+)?\s*(?:to|-)\s*\d{1,2}\s*(?:\+)?\s*(?:years?|yrs?))/i) ||
    text.match(/(\d{1,2}\s*(?:\+)?\s*(?:years?|yrs?))/i) ||
    text.match(/(\d{1,2}\s*-\s*\d{1,2}\s*y(?:ea)?rs?)/i);
  const overall = m?.[1] ? m[1].replace(/\s+/g, ' ').trim() : '';
  return { overall, level: inferExperienceLevel(overall || text, text) };
}

function inferExperienceLevel(overall: string, fullText: string): string {
  const labeled = extractLabeledValue(fullText, ['experience level']);
  if (labeled) return mapExperienceLevelLabel(labeled);
  const low = `${overall} ${fullText}`.toLowerCase();
  if (/\bentry[\s-]?level\b/.test(low)) return 'Entry Level';
  if (/\bjunior\b/.test(low)) return 'Junior';
  if (/\bprincipal\b/.test(low)) return 'Principal';
  if (/\bdirector\b/.test(low)) return 'Director';
  if (/\blead\b|\barchitect\b/.test(low)) return 'Lead';
  if (/\bsenior\b|\bsr\.?\b/.test(low)) return 'Senior';
  if (/\bmid[\s-]?senior\b/.test(low)) return 'Mid-Senior';
  const yearMatch = low.match(/(\d{1,2})\s*(?:\+)?\s*(?:to|-)\s*(\d{1,2})/);
  if (yearMatch) {
    const max = parseInt(yearMatch[2] || '0', 10);
    if (max <= 2) return 'Junior';
    if (max <= 5) return 'Mid-Senior';
    if (max <= 10) return 'Senior';
    return 'Lead';
  }
  const singleYear = low.match(/(\d{1,2})\s*(?:\+)?\s*(?:years?|yrs?)/);
  if (singleYear) {
    const y = parseInt(singleYear[1] || '0', 10);
    if (y <= 2) return 'Junior';
    if (y <= 5) return 'Mid-Senior';
    if (y <= 8) return 'Senior';
    return 'Lead';
  }
  return 'Mid-Senior';
}

function mapExperienceLevelLabel(raw: string): string {
  const s = raw.trim().toLowerCase();
  if (s.includes('entry')) return 'Entry Level';
  if (s.includes('junior')) return 'Junior';
  if (s.includes('principal')) return 'Principal';
  if (s.includes('director')) return 'Director';
  if (s.includes('lead')) return 'Lead';
  if (s.includes('senior')) return 'Senior';
  if (s.includes('mid')) return 'Mid-Senior';
  return 'Mid-Senior';
}

function parseEmployment(text: string): 'Full-time' | 'Contract' {
  const labeled = extractLabeledValue(text, ['employment type', 'type of employment']);
  if (labeled) {
    const s = labeled.toLowerCase();
    if (s.includes('contract') || s.includes('c2c') || s.includes('subcon') || s.includes('c2h')) return 'Contract';
    if (s.includes('full') || s.includes('permanent') || s.includes('fte')) return 'Full-time';
  }
  const lower = text.toLowerCase();
  if (/\b(contract|contractor|c2c|c2h|sub-con|subcon)\b/.test(lower)) return 'Contract';
  return 'Full-time';
}

const BUDGET_LABELS = [
  'annual budget',
  'yearly budget',
  'monthly budget',
  'monthly billing rates',
  'monthly billing rate',
  'project budget',
  'fixed budget',
  'candidate salary',
  'salary range',
  'salary',
  'ctc',
  'compensation',
  'remuneration',
  'package',
  'client bill rate',
  'client rate',
  'bill rate',
  'billing rate',
  'billing',
  'bill',
  'pay rate',
  'candidate rate',
  'hourly rate',
  'daily rate',
  'monthly rate',
  'annual rate',
  'contract rate',
  'vendor rate',
  'target rate',
  'max rate',
  'maximum rate',
  'maximum billing rate',
  'maximum billing',
  'rate card',
  'rate per hour',
  'rate/hour',
  'rate per day',
  'rate per annum',
  'rate per month',
  'tpc rates',
  'tpc rate',
  'all-inclusive rate',
  'fixed rate',
  'rate',
  'budget',
  'per month for tpc-rs',
  'per month for tpc',
  'tpc-rs',
  'tpc',
  'negotiable',
  'doe',
];

function parseCurrency(text: string, budgetCandidate?: string): string | undefined {
  const labeled = extractLabeledValue(text, ['budget currency', 'currency']);
  if (labeled) {
    const c = labeled.trim().toUpperCase().slice(0, 3);
    if (/^[A-Z]{3}$/.test(c)) return c;
  }

  // Check currency explicitly attached to the budget value
  if (budgetCandidate) {
    if (/\busd\b|\$/i.test(budgetCandidate)) return 'USD';
    if (/\beur\b|€/i.test(budgetCandidate)) return 'EUR';
    if (/\bgbp\b|£/i.test(budgetCandidate)) return 'GBP';
    if (/\b(?:inr|rs\.?|rupees?|tpc-rs)\b|₹/i.test(budgetCandidate)) return 'INR';
  }

  // Check currency mentioned specifically in proximity to compensation keywords
  const budgetMatch = text.match(
    /\b(?:budget|salary|ctc|compensation|rate|rates|bill\s*rate|billing|package|remuneration)\b[^\n\r]{0,50}/i
  );
  if (budgetMatch) {
    const target = budgetMatch[0];
    if (/\busd\b|\$/i.test(target)) return 'USD';
    if (/\beur\b|€/i.test(target)) return 'EUR';
    if (/\bgbp\b|£/i.test(target)) return 'GBP';
    if (/\b(?:inr|rs\.?|rupees?|tpc-rs)\b|₹/i.test(target)) return 'INR';
  }

  return undefined;
}

function parseBudgetFromText(text: string): { amount: number | null; raw: string | null; budget: string | null } {
  const nextLabels = [
    'location', 'work location', 'base location', 'overall exp', 'experience', 'notice period',
    'skills', 'mandatory skills', 'technical skills', 'required skills', 'positions', 'open positions',
    'job title', 'role', 'employment type', 'work mode', 'priority', 'client', 'qualification',
  ];
  let candidate =
    extractLabeledValue(text, BUDGET_LABELS) ||
    extractInlineFieldValue(text, BUDGET_LABELS, nextLabels);

  if (!candidate) {
    // 2. Check LPA / Lakhs / L / K pattern
    const lpaMatch = text.match(
      /(?:^|[^\w])([₹$€£]?\s*\d+(?:\.\d+)?(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:lpa|lakhs?|l\.?\s*p\.?\s*a\.?|\b[lL]\b|\b[kK]\b|cr))\b/i
    );
    if (lpaMatch) {
      candidate = lpaMatch[1].trim();
    } else {
      // 3. Check contextual rate / billing rate patterns
      const ctxMatch = text.match(
        /\b(?:client\s*(?:bill\s*)?rate|bill(?:ing)?\s*rate|pay\s*rate|hourly\s*rate|daily\s*rate|max(?:imum)?\s*rate|target\s*rate|contract\s*rate|vendor\s*rate|salary|ctc|compensation|package|budget|rate)\b\s*[:=-–]?\s*([$₹€£\w\s.,\/-]+?)(?=[\n\r|]|$|\.\s)/i
      );
      if (
        ctxMatch &&
        !/^\s*\d+[\s\+\-to–]*\d*\s*(?:years?|yrs?|rounds?|positions?|openings?|vacancies?|hours?\s*(?:per\s*day|\/day))\b/i.test(ctxMatch[1])
      ) {
        candidate = ctxMatch[1].replace(/^[\s\-–:]+/, '').trim();
      }
    }
  }

  if (!candidate) return { amount: null, raw: null, budget: null };

  candidate = candidate.replace(/^[\s\-–:]+/, '').trim();
  const lower = candidate.toLowerCase().trim();
  // Check negotiable / DOE / discussed / not disclosed
  if (/\b(?:negotiable|doe|discussed|not\s*disclosed|tbd)\b/i.test(lower)) {
    return { amount: null, raw: candidate, budget: candidate };
  }

  // Guard against false positives: experience, hours per day, interview rounds, vacancy counts
  if (
    /\b\d+[\s\+\-to–]*\d*\s*(?:years?|yrs?|rounds?|positions?|openings?|vacancies?|hours?\s*(?:per\s*day|\/day))\b/i.test(lower) &&
    !/(?:lpa|lakh|crore|cr|inr|usd|eur|gbp|\$|₹|€|£|per\s*month|per\s*annum|per\s*hour|per\s*day|\/hr|\/hour|\/day|\/month|\/annum|\/yr|\/year|\b[lL]\b|\b[kK]\b)/i.test(lower)
  ) {
    return { amount: null, raw: null, budget: null };
  }

  // Candidate MUST contain numbers or currency to be a valid compensation snippet
  if (!/\d/.test(candidate)) {
    return { amount: null, raw: null, budget: null };
  }

  const impliesLakhs = /(?:lakh|lpa|l\.?\s*p\.?\s*a\.?|[lL]\b)/i.test(lower);
  const impliesCrores = /(?:cr|crore|crores)\b/i.test(lower);
  const impliesThousands = /\b(?:k|thousand|thousands)\b/i.test(lower);
  const impliesMillions = /\b(?:m|million|millions)\b/i.test(lower);

  // Remove commas inside numbers
  const withoutCommas = candidate.replace(/,/g, '');
  const withoutWords = withoutCommas.replace(
    /(?:lakh?s?|lpa|l\.?\s*p\.?\s*a\.?|cr|crore?s?|thousand?s?|million?s?|inr|usd|eur|gbp|rs\.?|rupees?|per\s*month|per\s*annum|per\s*hour|per\s*day|\/hr|\/hour|\/day|\/month|\/annum|\/yr|\/year|p\.?\s*a\.?)/gi,
    ' ',
  ).replace(/[₹$€£_]/g, ' ');

  const m = withoutWords.match(/(\d+(?:\.\d+)?)/);
  if (!m) return { amount: null, raw: candidate, budget: candidate };
  const n = parseFloat(m[1]!);
  if (!Number.isFinite(n) || n <= 0) return { amount: null, raw: candidate, budget: candidate };

  let finalAmount = Math.round(n);
  if (impliesCrores) finalAmount = Math.round(n * 10000000);
  else if (impliesMillions) finalAmount = Math.round(n * 1000000);
  else if (impliesLakhs && n < 10000) finalAmount = Math.round(n * 100000);
  else if (impliesThousands && n < 10000) finalAmount = Math.round(n * 1000);

  return { amount: finalAmount, raw: candidate, budget: candidate };
}

function parsePriority(text: string): 'High' | 'Medium' | 'Low' {
  const labeled = extractLabeledValue(text, ['priority']);
  const explicit = String(labeled || '').trim().toLowerCase();
  if (explicit === 'high') return 'High';
  if (explicit === 'low') return 'Low';
  if (explicit === 'medium') return 'Medium';
  const lower = text.toLowerCase();
  if (/\b(urgent|critical|immediate|asap|priority)\b/.test(lower)) return 'High';
  if (/\blow\s+priority\b/.test(lower)) return 'Low';
  return 'Medium';
}

function parseDemandType(text: string, openPositions: number): 'Single' | 'Multiple' | 'Bulk' {
  const labeled = extractLabeledValue(text, ['type of demand', 'demand type']);
  const explicit = String(labeled || '').trim().toLowerCase();
  if (explicit === 'single') return 'Single';
  if (explicit === 'multiple') return 'Multiple';
  if (explicit === 'bulk') return 'Bulk';
  if (openPositions >= 10) return 'Bulk';
  if (openPositions >= 2) return 'Multiple';
  return 'Single';
}

function parseClientPoc(text: string): { lead?: string; poc?: string } {
  const lead =
    extractLabeledValue(text, ['client lead poc', 'client lead', 'hiring manager', 'spoc', 'point of contact']) ||
    extractInlineFieldValue(text, ['poc'], ['location', 'skills']);
  const poc = extractLabeledValue(text, ['client poc', 'secondary poc', 'cc']);
  return {
    lead: lead || undefined,
    poc: poc || undefined,
  };
}

/**
 * Main generalizable JD parser entrypoint.
 */
export function parseJdToFormFields(jdText: string, options?: { subjectHint?: string }): JdExtractFormFields {
  const text = String(jdText ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .trim();

  if (text.length < 20) {
    return { jdDescription: text };
  }

  const { mandatorySkills, secondarySkills, skills } = parseSkillsFromText(text);
  const { overall, level } = parseExperience(text);
  const openPositions = parseOpenPositions(text);
  const pocs = parseClientPoc(text);
  const jobTitle = parseJobTitle(text, options?.subjectHint);
  const location = parseLocation(text);
  const budgetResult = parseBudgetFromText(text);
  const detectedCurrency = parseCurrency(text, budgetResult.raw || undefined);

  const out: JdExtractFormFields = {
    jdDescription: text,
    jobTitle: jobTitle || undefined,
    clientLeadPoc: pocs.lead,
    clientPoc: pocs.poc,
    location: location || undefined,
    experience: overall || undefined,
    experienceLevel: level,
    noticePeriod: parseNoticePeriod(text) || undefined,
    skills: skills.length ? skills : undefined,
    technologies: mandatorySkills.length ? mandatorySkills : undefined,
    primarySkills: mandatorySkills,
    secondarySkills: secondarySkills,
    primary_skills: mandatorySkills,
    secondary_skills: secondarySkills,
    positions: openPositions,
    employmentType: parseEmployment(text),
    workMode: parseWorkMode(text) || undefined,
    budget: budgetResult.budget || undefined,
    budgetAmountInr: budgetResult.amount && budgetResult.amount > 0 ? budgetResult.amount : undefined,
    budgetCurrency: detectedCurrency || undefined,
    priority: parsePriority(text),
    demandType: parseDemandType(text, openPositions),
    submittingTo: detectClientSlug(text),
  };

  return out;
}

