// @ts-nocheck — copied from JD Analyser MVP; strict-null checks deferred to avoid risky refactors.
import type { RequirementData } from "./types/requirement";

export const NOT_SPECIFIED = "Not specified";

const GENERIC_TITLES = new Set([
  "not specified",
  "single requirement",
  "multi requirement",
  "requirement",
  "n/a",
  "na",
  "tbd",
  "to be determined",
  "job title",
  "role",
  "position",
]);

export function isGenericJobTitle(title: string): boolean {
  const normalized = title.trim().toLowerCase();
  if (!normalized) return true;
  if (GENERIC_TITLES.has(normalized)) return true;
  if (/^requirement\s*#?\d*$/i.test(normalized)) return true;
  return false;
}

export function resolveJobTitle(
  extractedTitle: string,
  hintTitle?: string
): string {
  if (!isGenericJobTitle(extractedTitle)) return extractedTitle;
  if (hintTitle && !isGenericJobTitle(hintTitle)) return hintTitle;
  return NOT_SPECIFIED;
}

const INHERITABLE_STRING_FIELDS: (keyof RequirementData)[] = [
  "clientLeadPocFrom",
  "clientPocFromCc",
  "internalPocTo",
  "requirementFrom",
  "demandReceivedDate",
  "typeOfDemand",
  "priority",
  "relevantExperience",
  "overallExperience",
  "qualificationCriteria",
  "employmentType",
  "workMode",
  "workTimings",
  "location",
  "numberOfPositions",
  "budgetCurrency",
  "monthlyBudget",
  "annualBudget",
  "noticePeriod",
  "sla",
];

/** Fill missing role fields from shared JD/email metadata */
export function mergeInheritedFields(
  role: RequirementData,
  common: Partial<RequirementData>
): RequirementData {
  const merged = { ...role };

  for (const field of INHERITABLE_STRING_FIELDS) {
    if (isMissingField(merged[field]) && !isMissingField(common[field])) {
      (merged as Record<string, unknown>)[field] = common[field];
    }
  }

  if (!merged.mandatorySkills.length && common.mandatorySkills?.length) {
    merged.mandatorySkills = common.mandatorySkills;
  }
  if (!merged.skills.length && common.skills?.length) {
    merged.skills = common.skills;
  }
  if (
    merged.jobDescription === NOT_SPECIFIED &&
    common.jobDescription &&
    common.jobDescription !== NOT_SPECIFIED
  ) {
    merged.jobDescription = common.jobDescription;
  }

  if (merged.demandReceivedDate !== NOT_SPECIFIED) {
    merged.openSince = formatOpenSince(merged.demandReceivedDate);
  }

  return merged;
}

export function extractCommonMetadata(
  rawText: string
): Partial<RequirementData> {
  return regexAugment(rawText, {});
}

export function normalize(value: unknown): string {
  if (value === undefined || value === null) return NOT_SPECIFIED;

  let text: string;
  if (typeof value === "string") {
    text = value;
  } else if (typeof value === "number" || typeof value === "boolean") {
    text = String(value);
  } else if (Array.isArray(value)) {
    text = value.map((item) => String(item)).join(", ");
  } else if (typeof value === "object") {
    text = JSON.stringify(value);
  } else {
    return NOT_SPECIFIED;
  }

  const trimmed = text.trim();
  if (!trimmed || trimmed.toLowerCase() === "n/a" || trimmed === "-") {
    return NOT_SPECIFIED;
  }
  return trimmed;
}

export const SKILL_ALIASES: Record<string, string> = {
  postgres: "PostgreSQL",
  postgresql: "PostgreSQL",
  k8s: "Kubernetes",
  kube: "Kubernetes",
  kubernetes: "Kubernetes",
  react: "React",
  reactjs: "React",
  "react.js": "React",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  vue: "Vue.js",
  vuejs: "Vue.js",
  "vue.js": "Vue.js",
  angular: "Angular",
  angularjs: "AngularJS",
  golang: "Go",
  python: "Python",
  python3: "Python",
  typescript: "TypeScript",
  ts: "TypeScript",
  javascript: "JavaScript",
  js: "JavaScript",
  aws: "AWS",
  gcp: "Google Cloud",
  azure: "Azure",
  docker: "Docker",
  terraform: "Terraform",
  jenkins: "Jenkins",
  rest: "REST APIs",
  "rest api": "REST APIs",
  "rest apis": "REST APIs",
  restful: "REST APIs",
  "restful api": "REST APIs",
  "restful apis": "REST APIs",
  graphql: "GraphQL",
  cicd: "CI/CD",
  "ci/cd": "CI/CD",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  springboot: "Spring Boot",
  "spring boot": "Spring Boot",
  django: "Django",
  flask: "Flask",
  fastapi: "FastAPI",
  express: "Express",
  expressjs: "Express",
  "express.js": "Express",
  kafka: "Kafka",
  spark: "Spark",
  airflow: "Airflow",
  selenium: "Selenium",
  pytest: "PyTest",
  junit: "JUnit",
  playwright: "Playwright",
  langchain: "LangChain",
  langgraph: "LangGraph",
  llm: "LLMs",
  llms: "LLMs",
  rag: "RAG",
  nlp: "NLP",
  pytorch: "PyTorch",
  tensorflow: "TensorFlow",
};

export const GENERIC_SOFT_SKILLS = new Set([
  "communication",
  "communication skills",
  "excellent communication",
  "good communication",
  "strong communication",
  "written communication",
  "verbal communication",
  "teamwork",
  "team player",
  "leadership",
  "leadership skills",
  "problem solving",
  "problem solving skills",
  "problem-solving",
  "critical thinking",
  "analytical thinking",
  "time management",
  "collaboration",
  "collaborative",
  "agile mindset",
  "interpersonal skills",
  "presentation skills",
  "self motivated",
  "self-motivated",
  "adaptability",
  "attention to detail",
  "multitasking",
  "decision making",
  "conflict resolution",
]);

export function normalizeSkillAlias(skill: string): string {
  const lower = skill.toLowerCase().trim();
  if (SKILL_ALIASES[lower]) {
    return SKILL_ALIASES[lower];
  }
  return skill.trim();
}

export function isGenericSoftSkill(skill: string): boolean {
  const lower = skill.toLowerCase().trim();
  return GENERIC_SOFT_SKILLS.has(lower);
}

export function isInvalidSkillToken(skill: string): boolean {
  const lower = skill.toLowerCase().trim();
  if (isGenericSoftSkill(lower)) return true;
  if (/^(?:current\s*(?:organization|org)|total\s*exp(?:erience)?|relevant\s*exp(?:erience)?|notice\s*period|monthly\s*billing\s*rates?|bill(?:ing)?\s*rate|job\s*posting\s*id|posting\s*id|job\s*id|req(?:uisition)?\s*(?:id|#)?|demand\s*id|educational\s*qualifications?|qualifications?|education|job\s*title|designation|location|work\s*location|base\s*location|experience|positions?|openings?|vacancies|budget|salary|ctc|rate|shift|timing|work\s*mode)\b/i.test(lower)) {
    return true;
  }
  if (/^(?:bachelor'?s?|master'?s?|degree|b\.?e\.?|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mca|bca|bba|mba|b\.?com|m\.?com|commerce|cfa|cpa|ca|frm|ph\.?d|doctorate|diploma)\b/i.test(lower)) {
    return true;
  }
  if (/\b(?:recruiter|technical\s+recruiter|senior\s+recruiter|hr\s+executive|talent\s+acquisition)\b/i.test(lower)) {
    return true;
  }
  const nonSkillExact = new Set([
    'interpretation', 'using', 'of', 'on', 'support', 'readable', 'reusable', 'testable',
    'testable codes', 'testable code', 'readable code', 'reusable code', 'codes', 'code', 'standards', 'design'
  ]);
  if (nonSkillExact.has(lower)) {
    return true;
  }
  return false;
}

export function normalizeSkills(skills: unknown): string[] {
  let items: unknown[] = [];

  if (Array.isArray(skills)) {
    items = skills;
  } else if (typeof skills === "string" && skills.trim()) {
    items = skills.split(/[,;|]/);
  }

  if (!items.length) return [];

  const seen = new Set<string>();
  const result: string[] = [];
  for (const skill of items) {
    const cleaned = normalize(skill).replace(/^[-•*]\s*/, "");
    if (!cleaned || cleaned === NOT_SPECIFIED) continue;
    if (isInvalidSkillToken(cleaned)) continue;

    const normalized = normalizeSkillAlias(cleaned);
    const key = normalized.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }
  return result;
}

export function generateRequirementId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `REQ-${y}-${m}-${d}-${seq}`;
}

export function formatOpenSince(demandDate: string): string {
  if (demandDate === NOT_SPECIFIED) return NOT_SPECIFIED;
  const parsed = Date.parse(demandDate.replace(/,/g, ""));
  if (Number.isNaN(parsed)) return demandDate;
  const days = Math.max(
    0,
    Math.floor((Date.now() - parsed) / (1000 * 60 * 60 * 24))
  );
  const datePart = demandDate.split(",").slice(0, 2).join(",").trim();
  return `${datePart} (${days} day${days === 1 ? "" : "s"})`;
}

export function mapRelevantExperience(yearsText: string): string {
  const match = yearsText.match(/(\d+)/);
  if (!match) return NOT_SPECIFIED;
  const minYears = parseInt(match[1], 10);
  if (minYears < 2) return "Junior";
  if (minYears < 5) return "Mid";
  if (minYears < 8) return "Mid Senior";
  return "Senior";
}

export function companyFromEmail(email: string): string {
  const domain = email.split("@")[1]?.split(".")[0] ?? "";
  if (!domain) return NOT_SPECIFIED;
  return domain.replace(/-/g, " ").toUpperCase();
}

export function splitSkillList(raw: string): string[] {
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function extractJobDescriptionSection(rawText: string): string {
  const match = rawText.match(
    /(?:job\s*description|key\s*areas?\s*of\s*responsibility|role\s*overview|key\s*responsibilities?)\s*:?\s*([\s\S]+)/i
  );
  if (!match) return NOT_SPECIFIED;
  return match[1].trim().slice(0, 3000);
}

export function toRequirementData(
  extracted: Partial<RequirementData>,
  options?: { isInferredTitle?: boolean }
): RequirementData {
  const demandReceivedDate = normalize(extracted.demandReceivedDate);
  const mandatorySkills = normalizeSkills(
    extracted.mandatorySkills ?? extracted.primary_skills ?? (extracted as any).primarySkills
  );
  const explicitSecondaryRaw =
    extracted.secondarySkills !== undefined
      ? extracted.secondarySkills
      : extracted.secondary_skills !== undefined
        ? extracted.secondary_skills
        : undefined;

  // Combine mandatory and secondary skills without duplicates so skills represents all technical skills
  const allSkillsSet = new Set(mandatorySkills.map((s) => s.toLowerCase()));
  const allSkills = [...mandatorySkills];
  const distinctSecondary: string[] = [];

  if (explicitSecondaryRaw !== undefined) {
    const explicitSecondary = normalizeSkills(explicitSecondaryRaw);
    for (const s of explicitSecondary) {
      if (!allSkillsSet.has(s.toLowerCase())) {
        allSkillsSet.add(s.toLowerCase());
        allSkills.push(s);
        distinctSecondary.push(s);
      }
    }
  } else if (extracted.skills?.length) {
    const rawSkills = normalizeSkills(extracted.skills);
    for (const s of rawSkills) {
      if (!allSkillsSet.has(s.toLowerCase())) {
        allSkillsSet.add(s.toLowerCase());
        allSkills.push(s);
        distinctSecondary.push(s);
      }
    }
  }

  return {
    requirementId: generateRequirementId(),
    jobTitle: normalize(extracted.jobTitle),
    isInferredTitle: options?.isInferredTitle,
    clientLeadPocFrom: normalize(extracted.clientLeadPocFrom),
    clientPocFromCc: normalize(extracted.clientPocFromCc),
    internalPocTo: normalize(extracted.internalPocTo),
    requirementFrom: normalize(extracted.requirementFrom),
    demandReceivedDate,
    closedDate: NOT_SPECIFIED,
    openSince: formatOpenSince(demandReceivedDate),
    typeOfDemand: normalize(extracted.typeOfDemand),
    jobStatus: "Unassigned",
    priority: normalize(extracted.priority),
    relevantExperience: normalize(extracted.relevantExperience),
    overallExperience: normalize(extracted.overallExperience),
    qualificationCriteria: normalize(extracted.qualificationCriteria),
    employmentType: normalize(extracted.employmentType),
    workMode: normalize(extracted.workMode),
    workTimings: normalize(extracted.workTimings),
    location: normalize(extracted.location),
    numberOfPositions: normalize(extracted.numberOfPositions),
    budgetCurrency: normalize(extracted.budgetCurrency),
    monthlyBudget: normalize(extracted.monthlyBudget),
    annualBudget: normalize(extracted.annualBudget),
    noticePeriod: normalize(extracted.noticePeriod),
    sla: normalize(extracted.sla),
    mandatorySkills: mandatorySkills,
    secondarySkills: distinctSecondary,
    primarySkills: mandatorySkills,
    primary_skills: mandatorySkills,
    secondary_skills: distinctSecondary,
    skills: allSkills,
    jobDescription: normalize(extracted.jobDescription),
  };
}

export function isMissingField(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return !trimmed || trimmed === NOT_SPECIFIED;
  }
  return false;
}

export const isMissing = isMissingField;

export function regexAugment(
  rawText: string,
  data: Partial<RequirementData>
): Partial<RequirementData> {
  const augmented = { ...data };

  const fromLine = rawText.match(/From:\s*(.+)/i);
  if (fromLine) {
    const fromEmail = fromLine[1].match(/[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/);
    const fromName = fromLine[1]
      .replace(/<[^>]+>/, "")
      .replace(fromEmail?.[0] ?? "", "")
      .trim();
    if (fromEmail) {
      if (isMissingField(augmented.clientLeadPocFrom)) {
        augmented.clientLeadPocFrom = fromName
          ? `${fromName} <${fromEmail[0]}>`
          : fromEmail[0];
      }
      if (isMissingField(augmented.clientPocFromCc)) {
        augmented.clientPocFromCc = fromEmail[0];
      }
      if (isMissingField(augmented.requirementFrom)) {
        augmented.requirementFrom = companyFromEmail(fromEmail[0]);
      }
    }
  }

  const toMatch = rawText.match(/To:\s*(.+)/i);
  if (toMatch && isMissingField(augmented.internalPocTo)) {
    augmented.internalPocTo = toMatch[1].trim();
  }

  const subjectMatch = rawText.match(/Subject:\s*(.+)/i);
  if (subjectMatch) {
    const subject = subjectMatch[1].trim();
    const atParts = subject.split("@").map((p) => p.trim());
    if (isMissingField(augmented.jobTitle) && atParts[0]) {
      augmented.jobTitle = atParts[0];
    }
    if (isMissingField(augmented.location) && atParts[1]) {
      augmented.location = atParts[1];
    }
  }

  const sentMatch = rawText.match(
    /Sent:\s*(?:\w+day,?\s*)?(\w+\s+\d{1,2},?\s*\d{4})(?:\s+(\d{1,2}:\d{2}))?/i
  );
  if (sentMatch && isMissingField(data.demandReceivedDate)) {
    const time = sentMatch[2] ? `, ${sentMatch[2]}` : "";
    augmented.demandReceivedDate = `${sentMatch[1]}${time}`.trim();
  }

  const openingsInline = rawText.match(/\b(\d+)\s+openings?\b/i);
  if (openingsInline) {
    augmented.numberOfPositions = openingsInline[1];
    const count = parseInt(openingsInline[1], 10);
    augmented.typeOfDemand = count > 1 ? "Multiple" : "Single";
  }

  const positionMatch = rawText.match(
    /(?:No\.?\s*of\s*Position[s]?|Number\s*of\s*Position[s]?|Headcount|Resources\s*Required)\s*[\r\n\t :\-]*([0-9]+)/i
  );

  if (positionMatch && isMissingField(augmented.numberOfPositions)) {
    augmented.numberOfPositions = positionMatch[1];
    const count = parseInt(positionMatch[1], 10);
    augmented.typeOfDemand = count > 1 ? "Multiple" : "Single";
  }

  const expMatch = rawText.match(
    /overall\s*exp(?:erience)?\s*[-–:]\s*([\d\s\-–to]+years?)/i
  );
  if (expMatch && isMissingField(data.overallExperience)) {
    augmented.overallExperience = expMatch[1].replace(/\s+/g, " ").trim();
  }

  // --- Contextual Budget Augmentation ---
  // A. Negotiable / DOE / Not Disclosed status
  const negotiableMatch = rawText.match(
    /(?:compensation|salary|budget|bill\s*rate|pay\s*rate|rate)\s*(?:is|will\s*be)?\s*[:=-–]?\s*(negotiable|doe|depending\s*on\s*experience|discussed(?:\s*during(?:\s*the)?\s*interview)?|not\s*disclosed|tbd)/i
  );
  if (negotiableMatch && isMissingField(augmented.annualBudget) && isMissingField(augmented.monthlyBudget)) {
    augmented.annualBudget = negotiableMatch[1].trim();
  }

  // B. TPC Rates
  const tpcMatch = rawText.match(/(?:tpc\s*rates?|per\s*month\s*for\s*tpc(?:-rs)?)\s*[-–:]\s*([₹$€£]?\s*[\d,]+(?:\.\d+)?(?:\s*[lLkK]\b)?)/i);
  if (tpcMatch && isMissingField(augmented.monthlyBudget)) {
    augmented.monthlyBudget = `INR ${tpcMatch[1].replace(/[₹$€£\s]/g, '')}`;
    if (isMissingField(augmented.budgetCurrency)) {
      augmented.budgetCurrency = "INR";
    }
  }

  // C. Labeled Budget / CTC / Salary / Annual Compensation
  const annualCompMatch = rawText.match(
    /(?:annual\s*budget|yearly\s*budget|annual\s*rate|salary\s*range|salary|ctc|package|remuneration|compensation|fixed\s*budget|project\s*budget)\s*[:=-–]\s*([^\r\n,;]+)/i
  );
  if (annualCompMatch && isMissingField(augmented.annualBudget)) {
    const val = annualCompMatch[1].trim();
    if (!/^\d+\s*years?/i.test(val)) {
      augmented.annualBudget = val;
      if (isMissingField(augmented.budgetCurrency)) {
        if (/usd|\$/i.test(val)) augmented.budgetCurrency = "USD";
        else if (/eur|€/i.test(val)) augmented.budgetCurrency = "EUR";
        else if (/gbp|£/i.test(val)) augmented.budgetCurrency = "GBP";
        else if (/lpa|lakh|inr|₹|rs/i.test(val)) augmented.budgetCurrency = "INR";
      }
    }
  }

  // D. LPA / Lakhs pattern (supports both single numbers e.g. "12 LPA" and ranges e.g. "8-12 LPA")
  const lpaMatch = rawText.match(
    /(?:^|[^\w])([₹$€£]?\s*\d+(?:\.\d+)?(?:\s*(?:to|-|–)\s*\d+(?:\.\d+)?)?\s*(?:lpa|lakhs?|l\.?\s*p\.?\s*a\.?))\b/i
  );
  if (lpaMatch && isMissingField(augmented.annualBudget)) {
    augmented.annualBudget = lpaMatch[1].trim();
    if (isMissingField(augmented.budgetCurrency)) {
      augmented.budgetCurrency = "INR";
    }
  }

  // E. Bill Rate / Hourly Rate / Daily Rate / Max Rate / Pay Rate
  const rateMatch = rawText.match(
    /(?:client\s*(?:bill\s*)?rate|bill(?:ing)?\s*rate|pay\s*rate|hourly\s*rate|daily\s*rate|monthly\s*rate|max(?:imum)?\s*rate|target\s*rate|rate\s*card|contract\s*rate|vendor\s*rate|all-inclusive\s*rate|rate(?:\s*per\s*(?:hour|day|month|annum))?)\s*[:=-–]\s*([^\r\n,;]+)/i
  );
  if (rateMatch) {
    const rateVal = rateMatch[1].trim();
    if (!/^\d+\s*years?/i.test(rateVal)) {
      const isAnnual = /annum|annual|\/yr|lpa|lakh/i.test(rateVal);
      if (isAnnual && isMissingField(augmented.annualBudget)) {
        augmented.annualBudget = rateVal;
      } else if (isMissingField(augmented.monthlyBudget)) {
        augmented.monthlyBudget = rateVal;
      }
      if (isMissingField(augmented.budgetCurrency)) {
        if (/usd|\$/i.test(rateVal)) augmented.budgetCurrency = "USD";
        else if (/eur|€/i.test(rateVal)) augmented.budgetCurrency = "EUR";
        else if (/gbp|£/i.test(rateVal)) augmented.budgetCurrency = "GBP";
        else if (/inr|₹|rs|lpa|lakh/i.test(rateVal)) augmented.budgetCurrency = "INR";
      }
    }
  }

  // F. Explicit currency symbol with amount per hour / day / year in text
  const inlineRateMatch = rawText.match(
    /(?:(?:USD|\$|EUR|€|GBP|£|INR|₹|Rs\.?)\s*[\d,.]+|[\d,.]+\s*(?:USD|EUR|GBP|INR))\s*(?:\/|\s*per\s*)(?:hr|hour|day|month|annum|year)\b/i
  );
  if (inlineRateMatch && isMissingField(augmented.monthlyBudget) && isMissingField(augmented.annualBudget)) {
    const rVal = inlineRateMatch[0].trim();
    if (/annum|year/i.test(rVal)) {
      augmented.annualBudget = rVal;
    } else {
      augmented.monthlyBudget = rVal;
    }
    if (isMissingField(augmented.budgetCurrency)) {
      if (/usd|\$/i.test(rVal)) augmented.budgetCurrency = "USD";
      else if (/eur|€/i.test(rVal)) augmented.budgetCurrency = "EUR";
      else if (/gbp|£/i.test(rVal)) augmented.budgetCurrency = "GBP";
      else if (/inr|₹|rs/i.test(rVal)) augmented.budgetCurrency = "INR";
    }
  }

  const is2Match = rawText.match(/is2\s*[-–:]\s*(\d+(?:\s*to\s*\d+)?\s*lpa)/i);
  if (is2Match) {
    const is2Val = is2Match[1].trim();
    if (isMissingField(augmented.annualBudget)) {
      augmented.annualBudget = is2Val;
      if (isMissingField(augmented.budgetCurrency)) {
        augmented.budgetCurrency = "INR";
      }
    } else if (
      !String(augmented.annualBudget).toLowerCase().includes("is2")
    ) {
      augmented.annualBudget = `${augmented.annualBudget} (IS2: ${is2Val})`;
    }
  }

  if (/immediate\s*joiners?/i.test(rawText) && isMissingField(data.noticePeriod)) {
    augmented.noticePeriod = "Immediate joiners only";
  }

  const mentions = [...rawText.matchAll(/@([A-Za-z][\w\s.]+?)(?=\s*&|\s*on\b|[\n,]|$)/g)].map(
    (m) => m[1].trim()
  );
  if (mentions.length && isMissingField(data.internalPocTo)) {
    augmented.internalPocTo = mentions.join(", ");
  }

  if (/on\s+priority|priority/i.test(rawText) && isMissingField(data.priority)) {
    augmented.priority = "HIGH";
  }

  if (/hybrid\s*mode/i.test(rawText) && isMissingField(data.workMode)) {
    const hybridDetail = rawText.match(/hybrid\s*mode\s*\(([^)]+)\)/i);
    augmented.workMode = hybridDetail
      ? `Hybrid (${hybridDetail[1]})`
      : "Hybrid";
  } else if (/on-?site/i.test(rawText) && isMissingField(data.workMode)) {
    augmented.workMode = "On-site";
  } else if (/\bremote\b/i.test(rawText) && isMissingField(data.workMode)) {
    augmented.workMode = "Remote";
  }

  const timingsMatch = rawText.match(
    /work\s*timings?\s*[-–:]\s*(.+?)(?:\n|$)/i
  );
  if (timingsMatch && isMissingField(data.workTimings)) {
    augmented.workTimings = timingsMatch[1].trim();
  }

  const contractMatch = /\bcontract\b/i.test(rawText);
  if (contractMatch && isMissingField(data.employmentType)) {
    augmented.employmentType = "Contract";
  }

  const posCount = parseInt(
    String(augmented.numberOfPositions ?? data.numberOfPositions ?? ""),
    10
  );
  if (!Number.isNaN(posCount) && isMissingField(data.typeOfDemand)) {
    augmented.typeOfDemand = posCount === 1 ? "Single" : "Multiple";
  }

  if (
    augmented.overallExperience &&
    !isMissingField(augmented.overallExperience) &&
    isMissingField(data.relevantExperience)
  ) {
    augmented.relevantExperience = mapRelevantExperience(
      String(augmented.overallExperience)
    );
  }

  const locationMatch = rawText.match(
    /(?:Location|Work\s*Location|Job\s*Location|Base\s*Location)\s*[\r\n\t :\-]*([A-Za-z\/ ,]+)/i
  );

  if (locationMatch && isMissingField(augmented.location)) {
    augmented.location = locationMatch[1].trim();
  }

  const cityLineMatch = rawText.match(
    /\n([A-Z][a-zA-Z]+(?:\s*,\s*[A-Z][a-zA-Z]+)+)\s*\n(?=Hybrid|Remote|On-?site|\d+\s+Openings|Work\s*Timings)/i
  );
  if (cityLineMatch && isMissingField(augmented.location)) {
    augmented.location = cityLineMatch[1].trim();
  }
  
  // QUALIFICATION
  const qualificationMatch = rawText.match(
    /qualification\s*[-–:]\s*(.+?)(?:\n|$)/i
  );
  
  if (
    qualificationMatch &&
    isMissingField(data.qualificationCriteria)
  ) {
    augmented.qualificationCriteria =
      qualificationMatch[1].trim();
  }
  
  // EXPERIENCE
  const experienceMatch = rawText.match(
    /experience\s*[-–:]\s*(.+?)(?:\n|$)/i
  );
  
  if (
    experienceMatch &&
    isMissingField(data.overallExperience)
  ) {
    augmented.overallExperience =
      experienceMatch[1].trim();
  }
  
  // EMPLOYMENT TYPE
  const hireTypeMatch = rawText.match(
    /(?:Type\s*of\s*Hire|Employment\s*Type)\s*[\r\n\t :\-]*([A-Za-z0-9\- /]+)/i
  );

  if (hireTypeMatch && isMissingField(augmented.employmentType)) {
    augmented.employmentType = hireTypeMatch[1].trim();
  }
  
  const ccMatch = rawText.match(
    /Cc:\s*(.+)/i
  );

  if (
    ccMatch &&
    isMissingField(data.clientPocFromCc)
  ) {
    augmented.clientPocFromCc =
      ccMatch[1].trim();
  }

  return augmented;
}
