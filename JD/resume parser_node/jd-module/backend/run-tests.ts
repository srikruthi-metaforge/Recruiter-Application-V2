/**
 * Automated Verification Suite for JD Parser (Backend Engine)
 * Tests all Budget, Skills, and Unrelated Fields cases specified in Section 6.
 *
 * Execute with: node --experimental-strip-types backend/run-tests.ts
 */

import { parseJdToFormFields } from './lib/jdFieldExtractor.ts';
import { normalizeSkills, toRequirementData, regexAugment } from './services/jd-analyser/jd-utils.ts';
import { parseBudgetAmount, normalizeCurrency, mapRequirementToFormFields } from './services/jd-analyser/mapToFormFields.ts';

interface TestCase {
  name: string;
  category: 'Budget' | 'Skills' | 'Unrelated Fields' | 'Integration';
  fn: () => void | Promise<void>;
}

const tests: TestCase[] = [];

function test(category: TestCase['category'], name: string, fn: () => void | Promise<void>) {
  tests.push({ category, name, fn });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ---------------------------------------------------------------------------
// 1. BUDGET EXTRACTION TESTS (Priority 1 & 3 Exact String Requirements)
// ---------------------------------------------------------------------------

test('Budget', 'Regression 1: "Rate: 2.9L" returns exactly "2.9L" without INR inference or rounding', () => {
  const jd = `Job Title: Backend Developer\nRate: 2.9L\nMandatory Skills: Python`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '2.9L', `Expected "2.9L", got "${res.budget}"`);
  assert(res.budgetCurrency === undefined, `Expected undefined currency, got "${res.budgetCurrency}"`);
});

test('Budget', 'Regression 2: "Rate: 2.75L" returns exactly "2.75L"', () => {
  const jd = `Job Title: Backend Developer\nRate: 2.75L\nMandatory Skills: Python`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '2.75L', `Expected "2.75L", got "${res.budget}"`);
});

test('Budget', 'Regression 3: "Budget: 8.50 LPA" preserves trailing zero', () => {
  const jd = `Job Title: Fullstack Dev\nBudget: 8.50 LPA\nMandatory Skills: Java`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '8.50 LPA', `Expected "8.50 LPA", got "${res.budget}"`);
});

test('Budget', 'Regression 4: "Bill Rate: $85/hr" preserves original expression', () => {
  const jd = `Job Title: Cloud Architect\nBill Rate: $85/hr\nSkills: AWS, Terraform`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '$85/hr', `Expected "$85/hr", got "${res.budget}"`);
  assert(res.budgetCurrency === 'USD', `Expected USD, got ${res.budgetCurrency}`);
});

test('Budget', 'Regression 5: "Rate: ₹1,200 per day" does not undergo numeric conversion', () => {
  const jd = `Job Title: QA Analyst\nRate: ₹1,200 per day\nSkills: Selenium, Java`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '₹1,200 per day', `Expected "₹1,200 per day", got "${res.budget}"`);
  assert(res.budgetCurrency === 'INR', `Expected INR, got ${res.budgetCurrency}`);
});

test('Budget', 'Regression 6: "CTC: 8–10 LPA" preserves the range', () => {
  const jd = `Job Title: Frontend Engineer\nCTC: 8–10 LPA\nSkills: React, TypeScript`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '8–10 LPA', `Expected "8–10 LPA", got "${res.budget}"`);
});

test('Budget', 'Regression 7: "Rate: Negotiable" does not become a numeric amount', () => {
  const jd = `Job Title: Engineering Manager\nRate: Negotiable\nSkills: Python, Go`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === 'Negotiable', `Expected "Negotiable", got "${res.budget}"`);
  assert(res.budgetAmountInr === undefined || res.budgetAmountInr === null, `Expected null/undefined amount, got ${res.budgetAmountInr}`);
});

test('Budget', 'Regression 8: A JD without compensation returns appropriate empty value', () => {
  const jd = `Job Title: Data Scientist\nLocation: Bangalore\nSkills: Python, PyTorch\nExperience: 5 years`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === undefined, `Expected undefined budget, got ${res.budget}`);
  assert(res.budgetCurrency === undefined, `Expected undefined currency, got ${res.budgetCurrency}`);
});

test('Budget', 'Regression 9: Experience and working-hour numbers are not mistaken for Budget', () => {
  const jd = `Job Title: Systems Engineer\n5+ years of experience, 8 hours per day, 3 interview rounds, 4 vacancies.\nSkills: Linux, Bash`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === undefined, `Expected undefined budget, got ${res.budget}`);
  assert(res.budgetAmountInr === undefined, `Expected undefined amount, got ${res.budgetAmountInr}`);
});

test('Budget', 'Regression 10: Multiple compensation expressions handled according to documented schema rules', () => {
  const jd = `Job Title: Contract Consultant\nClient Bill Rate: ₹2,500 per hour\nCandidate Salary: 18–22 LPA\nSkills: Salesforce`;
  const res = parseJdToFormFields(jd);
  assert(res.budget !== undefined && res.budget !== null, 'Should extract compensation');
  assert(res.budget === '₹2,500 per hour' || res.budget === '18–22 LPA', `Expected one of the exact expressions, got "${res.budget}"`);
});

test('Budget', 'Regression 11: Unfamiliar label "Remuneration: INR 8,50,000 per annum"', () => {
  const jd = `Job Title: Security Architect\nRemuneration: INR 8,50,000 per annum\nSkills: SIEM, SOC`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === 'INR 8,50,000 per annum', `Expected "INR 8,50,000 per annum", got "${res.budget}"`);
  assert(res.budgetCurrency === 'INR', `Expected INR, got ${res.budgetCurrency}`);
});

test('Budget', 'Regression 12: Irregular formatting "Bill Rate: DOE"', () => {
  const jd = `Job Title: Specialist\nBill Rate: DOE\nSkills: Spark, Kafka`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === 'DOE', `Expected "DOE", got "${res.budget}"`);
});

// ---------------------------------------------------------------------------
// 2. SKILLS EXTRACTION TESTS (Section 6 Requirements)
// ---------------------------------------------------------------------------

test('Skills', 'Case 1: Dedicated Required Skills section', () => {
  const jd = `Job Title: Web Developer\nRequired Skills: React, TypeScript, GraphQL, CSS`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 4, `Expected >= 4 skills, got ${res.skills?.length}`);
  assert(res.skills!.includes('React'), 'React missing');
  assert(res.skills!.includes('TypeScript'), 'TypeScript missing');
});

test('Skills', 'Case 2: Skills mentioned ONLY in responsibilities', () => {
  const jd = `Job Title: Backend Developer\nResponsibilities:\n- Build microservices using Python and FastAPI\n- Manage message streaming with Apache Kafka\n- Deploy to Docker containers`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 2, `Expected >= 2 skills from responsibilities, got ${res.skills?.length}`);
  const lowerSkills = res.skills!.map((s) => s.toLowerCase());
  assert(lowerSkills.some((s) => s.includes('python')), 'Python missing');
  assert(lowerSkills.some((s) => s.includes('fastapi')), 'FastAPI missing');
});

test('Skills', 'Case 3: Both Mandatory and Preferred skills present', () => {
  const jd = `Job Title: Fullstack Dev\nMandatory Skills: Java, Spring Boot\nPreferred Skills: AWS, Docker, Kubernetes`;
  const res = parseJdToFormFields(jd);
  assert(res.technologies !== undefined && res.technologies.length >= 2, 'Core technologies should have mandatory');
  assert(res.skills !== undefined && res.skills.length >= 4, `Combined skills should have all, got ${res.skills?.length}`);
  assert(res.skills!.includes('Java'), 'Java missing');
  assert(res.skills!.includes('Kubernetes'), 'Kubernetes missing');
});

test('Skills', 'Case 4: Long JD containing more than 10 technical skills (no arbitrary cutoff)', () => {
  const jd = `Job Title: Full Stack Platform Architect\nMandatory Skills: Python, Java, Go, React, Angular, PostgreSQL, MongoDB, Redis, Docker, Kubernetes, Terraform, Jenkins, Kafka, Airflow, GraphQL`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 12, `Expected >= 12 skills without cutoff, got ${res.skills?.length}`);
});

test('Skills', 'Case 5: Uncommon or domain-specific technologies', () => {
  const jd = `Job Title: ML Systems Engineer\nRequired Skills: Triton Inference Server, LangGraph, OpenTelemetry, MLflow, Celery, Playwright`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 4, `Expected >= 4 domain skills, got ${res.skills?.length}`);
  const lower = res.skills!.map((s) => s.toLowerCase());
  assert(lower.some((s) => s.includes('langgraph') || s.includes('triton') || s.includes('opentelemetry')), 'Domain skills missing');
});

test('Skills', 'Case 6: Duplicate skills and common aliases normalized (Postgres -> PostgreSQL, K8s -> Kubernetes)', () => {
  const jd = `Job Title: DevOps Engineer\nSkills: Postgres, PostgreSQL, k8s, Kubernetes, React.js, React`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined, 'Skills missing');
  const counts = (target: string) => res.skills!.filter((s) => s.toLowerCase() === target.toLowerCase()).length;
  assert(counts('PostgreSQL') === 1, `PostgreSQL should appear exactly once, appeared ${counts('PostgreSQL')}`);
  assert(counts('Kubernetes') === 1, `Kubernetes should appear exactly once, appeared ${counts('Kubernetes')}`);
  assert(counts('React') === 1, `React should appear exactly once, appeared ${counts('React')}`);
});

test('Skills', 'Case 7: Soft skills excluded and technical skills retained', () => {
  const jd = `Job Title: Software Engineer\nRequired Skills: Excellent communication, teamwork, problem solving, leadership, Python, Docker, PostgreSQL`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined, 'Skills missing');
  const lower = res.skills!.map((s) => s.toLowerCase());
  assert(!lower.includes('communication') && !lower.includes('excellent communication'), 'Communication should be filtered');
  assert(!lower.includes('teamwork'), 'Teamwork should be filtered');
  assert(!lower.includes('problem solving'), 'Problem solving should be filtered');
  assert(res.skills!.includes('Python'), 'Python must be present');
  assert(res.skills!.includes('Docker'), 'Docker must be present');
});

test('Skills', 'Case 8: JD with no explicit technical skills', () => {
  const jd = `Job Title: Administrative Assistant\nLocation: Chicago\nExperience: 2 years\nHandle office supplies and meeting schedules.`;
  const res = parseJdToFormFields(jd);
  assert(res.skills === undefined || res.skills.length === 0, `Expected empty or undefined skills, got ${res.skills?.length}`);
});

test('Skills', 'Case 9: Skills in bullet points and mixed formatting', () => {
  const jd = `Job Title: Cloud Developer\nKey Competencies:\n* AWS\n- Docker\n• Terraform\n* Jenkins`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 3, `Expected >= 3 bullet skills, got ${res.skills?.length}`);
  assert(res.skills!.includes('AWS'), 'AWS missing');
});

test('Skills', 'Case 10: Multi-domain tech stack (languages, frameworks, DB, cloud, AI/ML)', () => {
  const jd = `Job Title: AI Solutions Architect\nTechnical Stack: Python, TypeScript, FastAPI, Next.js, PostgreSQL, Pinecone, AWS, Docker, PyTorch, LLMs, RAG`;
  const res = parseJdToFormFields(jd);
  assert(res.skills !== undefined && res.skills.length >= 8, `Expected >= 8 skills across domains, got ${res.skills?.length}`);
  assert(res.skills!.includes('PyTorch'), 'PyTorch missing');
  assert(res.skills!.includes('FastAPI'), 'FastAPI missing');
});

test('Skills', 'Regression 11: V&V Engineer JD with explicit primary and secondary classification', () => {
  const jd = `
Job Title: V&V Engineer
Location: Bangalore

Mandatory Skills:
- DO-178B/C compliance standards
- C++ and Python
- LLT (Low Level Testing)
- V&V (Verification & Validation)
- Level A/B verification

Secondary / Preferred Skills:
- FMS (Flight Management System)
- Avionics SDLC processes
- Tools: JIRA, JAMA, GIT, Rapita, py ATE, Coverity
`;
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.secondarySkills !== undefined, 'secondarySkills defined');
  assert(res.skills !== undefined, 'skills defined');

  const prim = res.primarySkills!;
  const sec = res.secondarySkills!;
  const all = res.skills!;

  // Primary checks
  assert(prim.includes('DO-178B/C'), 'DO-178B/C in primary');
  assert(prim.includes('C++'), 'C++ in primary');
  assert(prim.includes('Python'), 'Python in primary');
  assert(prim.includes('LLT (Low Level Testing)'), 'LLT in primary');
  assert(prim.includes('V&V (Verification & Validation)'), 'V&V in primary');
  assert(prim.includes('Level A/B verification'), 'Level A/B verification in primary');

  // Secondary checks
  assert(sec.includes('FMS (Flight Management System)'), 'FMS in secondary');
  assert(sec.includes('Avionics SDLC'), 'Avionics SDLC in secondary');
  assert(sec.includes('JIRA'), 'JIRA in secondary');
  assert(sec.includes('JAMA'), 'JAMA in secondary');
  assert(sec.includes('GIT'), 'GIT in secondary');
  assert(sec.includes('Rapita'), 'Rapita in secondary');
  assert(sec.includes('py ATE'), 'py ATE in secondary');
  assert(sec.includes('Coverity'), 'Coverity in secondary');

  // All 14 skills should be in res.skills
  assert(all.length >= 14, `Expected >= 14 total skills, got ${all.length}`);
});

test('Skills', 'Regression 12: Unstructured V&V Engineer JD in prose paragraphs with action verbs', () => {
  const jd = `
We are looking for a V&V Engineer. The candidate must have extensive experience in DO-178B/C, C++, and Python for Level A/B verification.
Must possess deep expertise to perform LLT (Low Level Testing) and execute V&V (Verification & Validation).
Exposure to FMS (Flight Management System) and Avionics SDLC is preferred.
Tools used in this role include JIRA, JAMA, GIT, Rapita, py ATE, and Coverity.
`;
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.secondarySkills !== undefined, 'secondarySkills defined');

  const prim = res.primarySkills!;
  const sec = res.secondarySkills!;

  // Mandatory sentences -> primary
  assert(prim.includes('DO-178B/C'), 'DO-178B/C in primary');
  assert(prim.includes('C++'), 'C++ in primary');
  assert(prim.includes('Python'), 'Python in primary');
  assert(prim.includes('Level A/B verification'), 'Level A/B verification in primary');
  assert(prim.includes('LLT (Low Level Testing)'), 'LLT in primary');
  assert(prim.includes('V&V (Verification & Validation)'), 'V&V in primary');

  // Preferred and tools -> secondary
  assert(sec.includes('FMS (Flight Management System)'), 'FMS in secondary');
  assert(sec.includes('Avionics SDLC'), 'Avionics SDLC in secondary');
  assert(sec.includes('JIRA'), 'JIRA in secondary');
  assert(sec.includes('JAMA'), 'JAMA in secondary');
  assert(sec.includes('GIT'), 'GIT in secondary');
  assert(sec.includes('Rapita'), 'Rapita in secondary');
  assert(sec.includes('py ATE'), 'py ATE in secondary');
  assert(sec.includes('Coverity'), 'Coverity in secondary');
});

test('Skills', 'Regression 13: Blank lines and subcategories inside skills section do not abort parsing', () => {
  const jd = `
Job Title: Avionics Software Engineer
Mandatory Skills:
- C++

- Python

- DO-178B/C

Preferred Skills:
- JIRA
- GIT
`;
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.primarySkills!.includes('C++'), 'C++ retained across blank line');
  assert(res.primarySkills!.includes('Python'), 'Python retained across blank line');
  assert(res.primarySkills!.includes('DO-178B/C'), 'DO-178B/C retained across blank line');
  assert(res.secondarySkills!.includes('JIRA'), 'JIRA in secondary');
  assert(res.secondarySkills!.includes('GIT'), 'GIT in secondary');
});

// ---------------------------------------------------------------------------
// 3. UNRELATED FIELDS VERIFICATION
// ---------------------------------------------------------------------------

test('Unrelated Fields', 'Job Title, Location, Experience, Positions, Notice Period remain accurate', () => {
  const jd = `Job Title: Senior Data Engineer\nClient: FinCorp Solutions\nLocation: Pune (Hybrid)\nOverall Experience: 7-10 years\nOpen Positions: 3\nEmployment Type: Contract\nNotice Period: 15 days\nBudget: 24 LPA\nMandatory Skills: Spark, Python, Kafka`;
  const res = parseJdToFormFields(jd);
  assert(res.jobTitle === 'Senior Data Engineer', `Job title: ${res.jobTitle}`);
  assert(res.submittingTo === 'fincorp', `Client slug: ${res.submittingTo}`);
  assert(res.location?.includes('Pune'), `Location: ${res.location}`);
  assert(res.experience === '7-10 years', `Experience: ${res.experience}`);
  assert(res.positions === 3, `Positions: ${res.positions}`);
  assert(res.employmentType === 'Contract', `Employment type: ${res.employmentType}`);
  assert(res.noticePeriod === '15 days', `Notice period: ${res.noticePeriod}`);
  assert(res.budgetAmountInr === 2400000, `Budget: ${res.budgetAmountInr}`);
  assert(res.priority !== undefined, `Priority: ${res.priority}`);
  assert(res.demandType === 'Multiple', `Demand type: ${res.demandType}`);
});

// ---------------------------------------------------------------------------
// 4. PIPELINE MAPPING & UTILITY FUNCTIONS
// ---------------------------------------------------------------------------

test('Integration', 'normalizeSkills cleans, normalizes aliases, and removes soft skills', () => {
  const input = ['postgres', 'K8s', 'React.js', 'strong communication', 'leadership', 'python'];
  const cleaned = normalizeSkills(input);
  assert(cleaned.includes('PostgreSQL'), 'PostgreSQL normalized');
  assert(cleaned.includes('Kubernetes'), 'Kubernetes normalized');
  assert(cleaned.includes('React'), 'React normalized');
  assert(cleaned.includes('Python'), 'Python normalized');
  assert(!cleaned.some((s) => s.toLowerCase().includes('communication')), 'Communication filtered');
  assert(!cleaned.some((s) => s.toLowerCase().includes('leadership')), 'Leadership filtered');
});

test('Integration', 'toRequirementData produces complete union of skills without dropping mandatory', () => {
  const req = toRequirementData({
    jobTitle: 'Fullstack Dev',
    mandatorySkills: ['Java', 'Spring Boot'],
    secondarySkills: ['AWS', 'Docker'],
  });
  assert(req.mandatorySkills.includes('Java'), 'Mandatory has Java');
  assert(req.skills.includes('Java'), 'Skills has Java');
  assert(req.skills.includes('Spring Boot'), 'Skills has Spring Boot');
  assert(req.skills.includes('AWS'), 'Skills has AWS');
  assert(req.skills.includes('Docker'), 'Skills has Docker');
  assert(req.skills.length === 4, `Expected 4 skills, got ${req.skills.length}`);
});

test('Integration', 'parseBudgetAmount correctly parses commas, LPA, Lakhs, Cr, and hourly', () => {
  assert(parseBudgetAmount('12 LPA') === 1200000, '12 LPA');
  assert(parseBudgetAmount('₹6,00,000') === 600000, '6,00,000');
  assert(parseBudgetAmount('USD 85/hour') === 85, 'USD 85/hour');
  assert(parseBudgetAmount('₹1,200 per day') === 1200, '₹1,200 per day');
  assert(parseBudgetAmount('1.5 Cr') === 15000000, '1.5 Cr');
  assert(parseBudgetAmount('Negotiable') === undefined, 'Negotiable');
});

// ---------------------------------------------------------------------------
// 5. STRICT PRIMARY & SECONDARY ACCURACY TESTS (User Prompt Regressions)
// ---------------------------------------------------------------------------

test('Skills', 'Strict Accuracy 1: "Mandatory Skills: Python, Java, SQL" extracts only primary skills', () => {
  const jd = 'Mandatory Skills: Python, Java, SQL';
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.primarySkills!.length === 3, `Expected 3 primary skills, got ${res.primarySkills?.length}`);
  assert(res.primarySkills!.includes('Python'), 'Python in primary');
  assert(res.primarySkills!.includes('Java'), 'Java in primary');
  assert(res.primarySkills!.includes('SQL'), 'SQL in primary');
  assert(res.secondarySkills === undefined || res.secondarySkills.length === 0, 'secondarySkills must be empty');
});

test('Skills', 'Strict Accuracy 2: "Must have strong experience with React, TypeScript and REST APIs."', () => {
  const jd = 'Must have strong experience with React, TypeScript and REST APIs.';
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.primarySkills!.length === 3, `Expected 3 primary skills, got ${res.primarySkills?.length}`);
  assert(res.primarySkills!.includes('React'), 'React in primary');
  assert(res.primarySkills!.includes('TypeScript'), 'TypeScript in primary');
  assert(res.primarySkills!.includes('REST APIs'), 'REST APIs in primary');
  assert(res.secondarySkills === undefined || res.secondarySkills.length === 0, 'secondarySkills must be empty');
});

test('Skills', 'Strict Accuracy 3: "Good to have AWS, Docker and Kubernetes." extracts only secondary skills', () => {
  const jd = 'Good to have AWS, Docker and Kubernetes.';
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills === undefined || res.primarySkills.length === 0, 'primarySkills must be empty when no mandatory section');
  assert(res.secondarySkills !== undefined, 'secondarySkills defined');
  assert(res.secondarySkills!.length === 3, `Expected 3 secondary skills, got ${res.secondarySkills?.length}`);
  assert(res.secondarySkills!.includes('AWS'), 'AWS in secondary');
  assert(res.secondarySkills!.includes('Docker'), 'Docker in secondary');
  assert(res.secondarySkills!.includes('Kubernetes'), 'Kubernetes in secondary');
});

test('Skills', 'Strict Accuracy 4: "Preferred: exposure to SAP Migration Cockpit and LSMW."', () => {
  const jd = 'Preferred: exposure to SAP Migration Cockpit and LSMW.';
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills === undefined || res.primarySkills.length === 0, 'primarySkills must be empty');
  assert(res.secondarySkills !== undefined, 'secondarySkills defined');
  assert(res.secondarySkills!.length === 2, `Expected 2 secondary skills, got ${res.secondarySkills?.length}`);
  assert(res.secondarySkills!.includes('SAP Migration Cockpit'), 'SAP Migration Cockpit in secondary');
  assert(res.secondarySkills!.includes('LSMW'), 'LSMW in secondary');
});

test('Skills', 'Strict Accuracy 5: "Bachelor\'s degree in Computer Science with 5+ years of experience." yields empty skills', () => {
  const jd = "Bachelor's degree in Computer Science with 5+ years of experience.";
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills === undefined || res.primarySkills.length === 0, 'primarySkills must be empty');
  assert(res.secondarySkills === undefined || res.secondarySkills.length === 0, 'secondarySkills must be empty');
  assert(res.skills === undefined || res.skills.length === 0, 'skills must be empty (degrees and experience are not skills)');
});

test('Skills', 'Strict Accuracy 6: Cross-category deduplication and Markdown numbered heading support', () => {
  const jd = `
## 1. Mandatory Technical Skills:
- Python
- Docker

## 2. Good-to-Have:
- Docker
- Kubernetes
`;
  const res = parseJdToFormFields(jd);
  assert(res.primarySkills !== undefined, 'primarySkills defined');
  assert(res.primarySkills!.includes('Python'), 'Python in primary');
  assert(res.primarySkills!.includes('Docker'), 'Docker in primary');
  assert(res.secondarySkills !== undefined, 'secondarySkills defined');
  assert(res.secondarySkills!.includes('Kubernetes'), 'Kubernetes in secondary');
  assert(!res.secondarySkills!.includes('Docker'), 'Docker duplicate removed from secondary');
});

test('Job Title & Skills', 'JD-Position tittle- Cloud Developer + Golang (Backend) extracts title and excludes it from skills', () => {
  const jd = `
JD-Position tittle- Cloud Developer + Golang (Backend)
Experience: 5 years
`;
  const res = parseJdToFormFields(jd);
  assert(res.jobTitle === 'Cloud Developer + Golang (Backend)', `Expected 'Cloud Developer + Golang (Backend)', got '${res.jobTitle}'`);
  assert(!res.skills || res.skills.length === 0, `Expected skills to be empty, got ${JSON.stringify(res.skills)}`);
  assert(!res.primarySkills || res.primarySkills.length === 0, `Expected primarySkills to be empty, got ${JSON.stringify(res.primarySkills)}`);
});

test('Budget', 'JD-Rate- 1,40,000 per month for TPC-Rs parses accurately without truncation or commas issue', () => {
  const jd = `
JD-Position tittle- Cloud Developer + Golang (Backend)
JD-Rate- 1,40,000 per month for TPC-Rs
`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === '1,40,000 per month for TPC-Rs', `Expected '1,40,000 per month for TPC-Rs', got '${res.budget}'`);
  assert(res.budgetAmountInr === 140000, `Expected 140000, got ${res.budgetAmountInr}`);
  assert(res.budgetCurrency === 'INR', `Expected 'INR', got '${res.budgetCurrency}'`);
});

test('Budget', 'Garbage budget without numbers like "Rate- er month for TPC-Rs" returns null/Not specified', () => {
  const jd = `
JD-Position tittle- Cloud Developer + Golang (Backend)
JD-Rate- er month for TPC-Rs
`;
  const res = parseJdToFormFields(jd);
  assert(res.budget === null || res.budget === undefined, `Expected null/undefined budget, got '${res.budget}'`);
  assert(res.budgetAmountInr === null || res.budgetAmountInr === undefined, `Expected null/undefined budgetAmountInr, got '${res.budgetAmountInr}'`);
});

test('Skills', 'Rule 1: Primary skills from Key skills, Technical skills, and Responsibilities (tech stack)', () => {
  const jd = `Job Title: Cloud Architect
Key skills: Go, Kubernetes
Responsibilities (tech stack): Microservices, REST APIs
Bonus: Terraform`;
  const res = parseJdToFormFields(jd);
  assert(res.primary_skills!.includes('Go'), 'Go in primary_skills');
  assert(res.primary_skills!.includes('Kubernetes'), 'Kubernetes in primary_skills');
  assert(res.primary_skills!.includes('Microservices'), 'Microservices in primary_skills');
  assert(res.primary_skills!.includes('REST APIs'), 'REST APIs in primary_skills');
  assert(JSON.stringify(res.secondary_skills) === JSON.stringify(['Terraform']), `Expected ['Terraform'], got ${JSON.stringify(res.secondary_skills)}`);
});

test('Skills', 'Rule 1: Unlabelled role with main repeated/emphasized technologies in primary', () => {
  const jd = `We are seeking a senior Python and Golang Developer to design scalable services.
Extensive background in Python and PostgreSQL.
Knowledge of Docker and Git is helpful.`;
  const res = parseJdToFormFields(jd);
  assert(res.primary_skills!.includes('Python'), 'Python in primary_skills');
  assert(res.primary_skills!.includes('Go'), 'Go in primary_skills');
  assert(res.secondary_skills!.includes('Docker'), 'Docker in secondary_skills');
  assert(res.secondary_skills!.includes('GIT'), 'GIT in secondary_skills');
  assert(!res.secondary_skills!.includes('Python'), 'Python not duplicated in secondary');
});

test('Skills', 'Rule 2: Related tools, frameworks and adjacent technologies placed in secondary', () => {
  const jd = `Mandatory: Java, Spring Boot
Responsibilities:
- Write clean code, push commits via Git, and track sprints using JIRA.
- Deploy microservices to AWS with Docker and test APIs using Postman.`;
  const res = parseJdToFormFields(jd);
  assert(JSON.stringify(res.primary_skills) === JSON.stringify(['Java', 'Spring Boot']), `Expected ['Java', 'Spring Boot'], got ${JSON.stringify(res.primary_skills)}`);
  assert(res.secondary_skills!.includes('GIT'), 'GIT in secondary_skills');
  assert(res.secondary_skills!.includes('JIRA'), 'JIRA in secondary_skills');
  assert(res.secondary_skills!.includes('AWS'), 'AWS in secondary_skills');
  assert(res.secondary_skills!.includes('Docker'), 'Docker in secondary_skills');
  assert(res.secondary_skills!.includes('Postman'), 'Postman in secondary_skills');
  assert(!res.secondary_skills!.includes('Java'), 'Java not duplicated in secondary');
  assert(!res.secondary_skills!.includes('Spring Boot'), 'Spring Boot not duplicated in secondary');
});

test('Skills', 'Rule 3: Synonym unification and zero duplicates across primary and secondary', () => {
  const jd = `Must have: ReactJS, Node, Postgres, K8s, Docker
Preferred: React, Node.js, PostgreSQL, Kubernetes, Docker, AWS`;
  const res = parseJdToFormFields(jd);
  assert(res.primary_skills!.includes('React'), 'React in primary_skills');
  assert(res.primary_skills!.includes('Node.js'), 'Node.js in primary_skills');
  assert(res.primary_skills!.includes('PostgreSQL'), 'PostgreSQL in primary_skills');
  assert(res.primary_skills!.includes('Kubernetes'), 'Kubernetes in primary_skills');
  assert(res.primary_skills!.includes('Docker'), 'Docker in primary_skills');
  assert(JSON.stringify(res.secondary_skills) === JSON.stringify(['AWS']), `Expected ['AWS'], got ${JSON.stringify(res.secondary_skills)}`);
});

test('Skills', 'Rule 4: Empty case preserves empty array [] for secondary without copying primary', () => {
  const jd = `Job Title: Database Administrator
Requirements:
- Oracle
- MySQL
- PostgreSQL`;
  const res = parseJdToFormFields(jd);
  assert(JSON.stringify(res.primary_skills) === JSON.stringify(['Oracle', 'MySQL', 'PostgreSQL']), `Expected ['Oracle', 'MySQL', 'PostgreSQL'], got ${JSON.stringify(res.primary_skills)}`);
  assert(JSON.stringify(res.secondary_skills) === JSON.stringify([]), `Expected [], got ${JSON.stringify(res.secondary_skills)}`);
  assert(JSON.stringify(res.secondarySkills) === JSON.stringify([]), `Expected [], got ${JSON.stringify(res.secondarySkills)}`);
});

test('Skills', 'Rule 5: Cleaning short names and JSON format validation', () => {
  const jd = `Mandatory Skills:
- Strong experience in Python
- Deep hands-on knowledge with Django
Nice to have:
- Familiarity with Postman
- Exposure to AWS`;
  const res = parseJdToFormFields(jd);
  assert(JSON.stringify(res.primary_skills) === JSON.stringify(['Python', 'Django']), `Expected ['Python', 'Django'], got ${JSON.stringify(res.primary_skills)}`);
  assert(JSON.stringify(res.secondary_skills) === JSON.stringify(['Postman', 'AWS']), `Expected ['Postman', 'AWS'], got ${JSON.stringify(res.secondary_skills)}`);
  const jsonOutput = {
    primary_skills: res.primary_skills,
    secondary_skills: res.secondary_skills,
  };
  assert(new Set(jsonOutput.primary_skills).size === jsonOutput.primary_skills!.length, 'No duplicates in primary_skills');
  assert(new Set(jsonOutput.secondary_skills).size === jsonOutput.secondary_skills!.length, 'No duplicates in secondary_skills');
});

test('Skills', 'Rule 5: Location, unmatched fragments, and generic activities are excluded from skills', () => {
  const jd = `Job Title: V&V Engineer
Primary Skills:
- DO-178B/C
- C++
- Python
- LLT(Low Level Testing)
- FMS (Flight Management System)
- V&V (Verification & Validation)
(This

Secondary Skills:
- JIRA
- JAMA
- GIT
- Rapita
- py ATE
- Coverity
- Location : Bangalore /Hyderabad
- Coverity……
- Level A/B verification
- validation activities
- tools such as JIRA
- Avionics SDLC`;
  const res = parseJdToFormFields(jd);
  assert(!res.primary_skills!.includes('(This'), '(This not in primary_skills');
  assert(!res.secondary_skills!.includes('Location : Bangalore /Hyderabad'), 'Location not in secondary_skills');
  assert(!res.secondary_skills!.includes('Bangalore'), 'Bangalore not in secondary_skills');
  assert(!res.secondary_skills!.includes('validation activities'), 'validation activities not in secondary_skills');
  assert(!res.secondary_skills!.includes('tools such as JIRA'), 'tools such as JIRA normalized');
  assert(res.secondary_skills!.includes('JIRA'), 'JIRA in secondary_skills');
  assert(res.secondary_skills!.includes('Coverity'), 'Coverity in secondary_skills');
  assert(res.secondary_skills!.filter(s => s === 'Coverity').length === 1, 'Coverity not duplicated');
});

test('Skills', 'Creo/NX JD mechanical skills extraction and classification', () => {
  const jd = `Job Title: Mechanical Design Engineer
Requirements:
- Creo Parametric, Siemens NX
- assembly design, drafting, detailing, GD&T, manufacturing processes

Preferred Skills:
- SolidWorks, Solid Edge, Windchill, Teamcenter, CAD migration/conversion`;
  const res = parseJdToFormFields(jd);
  for (const expected of ['Creo Parametric', 'Siemens NX', 'assembly design', 'drafting', 'detailing', 'GD&T', 'manufacturing processes']) {
    assert(res.primary_skills!.includes(expected), `${expected} in primary_skills`);
    assert(!res.secondary_skills!.includes(expected), `${expected} NOT in secondary_skills`);
  }
  for (const expected of ['SolidWorks', 'Solid Edge', 'Windchill', 'Teamcenter', 'CAD migration/conversion']) {
    assert(res.secondary_skills!.includes(expected), `${expected} in secondary_skills`);
    assert(!res.primary_skills!.includes(expected), `${expected} NOT in primary_skills`);
  }
  for (const bad of ['Design', 'Standards', 'Standard', 'Mechanical Engineering', 'Requirements']) {
    assert(!res.primary_skills!.includes(bad), `${bad} not in primary_skills`);
    assert(!res.secondary_skills!.includes(bad), `${bad} not in secondary_skills`);
  }
});

test('Skills', 'Conflicting mandatory and preferred keeps primary only', () => {
  const jd = `Mandatory Skills:
- Python
- Docker
- PostgreSQL

Good to Have:
- Docker
- Kubernetes
- AWS`;
  const res = parseJdToFormFields(jd);
  assert(res.primary_skills!.includes('Docker'), 'Docker in primary_skills');
  assert(!res.secondary_skills!.includes('Docker'), 'Docker NOT in secondary_skills');
  assert(res.secondary_skills!.includes('Kubernetes'), 'Kubernetes in secondary_skills');
  assert(res.secondary_skills!.includes('AWS'), 'AWS in secondary_skills');
});

test('Skills', 'Unstructured JD heading synonyms and qualification exclusion', () => {
  const jd = `Position: Senior Backend Engineer
Education: B.Tech in Computer Science or equivalent
Essential Skills:
- Golang, Microservices, REST APIs
Nice to Have:
- Redis, Kafka
Location: Bangalore, India`;
  const res = parseJdToFormFields(jd);
  assert(res.primary_skills!.includes('Go'), 'Go in primary_skills');
  assert(res.primary_skills!.includes('Microservices'), 'Microservices in primary_skills');
  assert(res.primary_skills!.includes('REST APIs'), 'REST APIs in primary_skills');
  assert(res.secondary_skills!.includes('Redis'), 'Redis in secondary_skills');
  assert(res.secondary_skills!.includes('Kafka'), 'Kafka in secondary_skills');
  for (const excluded of ['B.Tech', 'Computer Science', 'Bangalore', 'Education']) {
    assert(!res.primary_skills!.includes(excluded), `${excluded} not in primary_skills`);
    assert(!res.secondary_skills!.includes(excluded), `${excluded} not in secondary_skills`);
  }
});

test('Skills', 'Control & Monitoring regression with strict skill validation and field separation', () => {
  const jd = `Subject: Urgent Demand: Req #98432 - Control & Monitoring Specialist - Bangalore
Location: Bangalore
Current Organization: ABC Corp
Total Exp: 5-8 years
Relevant Exp: 4+ years
Notice Period: 30 days
Monthly Billing Rates: 2.5L

Job Title: Control & Monitoring Specialist

Mandatory Skills:
- Investment compliance guideline rule coding
- Investment guideline interpretation is a must
- Compliance rule testing
- Rule development
- Writing and testing reusable, readable code

Good to Have:
- UCITS regulatory framework knowledge
- SFC regulatory requirements
- FCA regulatory requirements
- SEC regulatory requirements
- CFA or Bachelor of Commerce preferred

Regards,
Priya Sharma
Senior Technical Recruiter`;

  const res = parseJdToFormFields(jd);

  // 1. Job Title
  assert(res.jobTitle === 'Control & Monitoring Specialist', `Expected "Control & Monitoring Specialist", got "${res.jobTitle}"`);

  // 2. Primary Skills
  const expectedPrimary = [
    'Investment compliance guideline rule coding',
    'Investment guideline interpretation',
    'Compliance rule testing',
    'Rule development',
    'Writing and testing reusable, readable code',
  ];
  for (const skill of expectedPrimary) {
    assert(res.primarySkills!.includes(skill), `Primary skills missing: ${skill}`);
    assert(!res.secondarySkills!.includes(skill), `Secondary skills should NOT include: ${skill}`);
  }

  // 3. Secondary Skills
  const expectedSecondary = [
    'UCITS regulatory framework knowledge',
    'SFC regulatory requirements',
    'FCA regulatory requirements',
    'SEC regulatory requirements',
  ];
  for (const skill of expectedSecondary) {
    assert(res.secondarySkills!.includes(skill), `Secondary skills missing: ${skill}`);
    assert(!res.primarySkills!.includes(skill), `Primary skills should NOT include: ${skill}`);
  }

  // 4. Strict Skill Validation (Rejections)
  const forbiddenInSkills = [
    'CFA', 'Commerce', 'Bachelor of Commerce', 'Bachelor', 'Commerce preferred',
    'interpretation is a must', 'readable', 'reusable', 'testable codes',
    'Priya Sharma', 'Senior Technical Recruiter', 'Technical Recruiter',
    'Bangalore', '30 days', '2.5L', '5-8 years', '4+ years',
    'Current Organization', 'Total Exp', 'Relevant Exp', 'Notice Period', 'Monthly Billing Rates',
  ];
  for (const bad of forbiddenInSkills) {
    assert(!res.primarySkills!.includes(bad), `Primary skills should not contain "${bad}"`);
    assert(!res.secondarySkills!.includes(bad), `Secondary skills should not contain "${bad}"`);
  }

  // 5. Field Separation
  assert(res.location === 'Bangalore', `Expected location Bangalore, got ${res.location}`);
  assert(res.noticePeriod === '30 days', `Expected noticePeriod 30 days, got ${res.noticePeriod}`);
  assert(res.budget === '2.5L', `Expected budget 2.5L, got ${res.budget}`);
});

test('Integration', 'Job Title from subject strips requirement ID and location when no explicit field', () => {
  const jd = `Subject: Urgent Demand: Req #98432 - Control & Monitoring Specialist - Bangalore
Location: Bangalore
Notice Period: 30 days

Mandatory Skills:
- Python, PostgreSQL

Regards,
Priya Sharma
Senior Technical Recruiter`;

  const res = parseJdToFormFields(jd);
  assert(res.jobTitle === 'Control & Monitoring Specialist', `Expected "Control & Monitoring Specialist", got "${res.jobTitle}"`);
});

test('Integration', 'Job Title not invented and recruiter designation rejected when no evidence', () => {
  const jd = `Location: Bangalore
Notice Period: 30 days

Mandatory Skills:
- Python, SQL

Regards,
Priya Sharma
Designation: Senior Technical Recruiter`;

  const res = parseJdToFormFields(jd);
  assert(res.jobTitle === undefined, `Expected undefined jobTitle, got "${res.jobTitle}"`);
  assert(!res.primarySkills!.includes('Senior Technical Recruiter'), 'Recruiter title not in primary');
  assert(!res.secondarySkills!.includes('Senior Technical Recruiter'), 'Recruiter title not in secondary');
});


// ---------------------------------------------------------------------------
// EXECUTION HARNESS
// ---------------------------------------------------------------------------

async function runAll() {
  console.log(`\n======================================================`);
  console.log(`🚀 RUNNING JD PARSER VERIFICATION SUITE (${tests.length} tests)`);
  console.log(`======================================================\n`);

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✅ [${t.category.padEnd(16)}] ${t.name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [${t.category.padEnd(16)}] ${t.name}`);
      console.error(`     Error: ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${tests.length})`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAll();
