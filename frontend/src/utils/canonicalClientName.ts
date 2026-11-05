/**
 * Roll up raw client / requirement.clientName values (often emails or person names
 * from mail ingest) into V1-style company labels for Client Performance + Clients list.
 * Display-only — does not mutate stored DB data.
 */

const DOMAIN_TO_COMPANY: Record<string, string> = {
  'ltts.com': 'LTTS',
  'lnttsgroup.onmicrosoft.com': 'LTTS',
  'itcinfotech.com': 'ITC',
  'kpmg.com': 'KPMG',
  'iexcel.co.in': 'Accenture',
  'accenture.com': 'Accenture',
  'deloitte.com': 'Deloitte',
  'eximietas.com': 'PwC',
  'eximietas.design': 'PwC',
  'metaforgeit.com': 'METAFORGE',
  'metaforge.com': 'METAFORGE',
  'idexcel.com': 'OTHER COMPANY / SOURCE',
}

/** Exact (lowercased trimmed) name → company. */
const NAME_ALIASES: Record<string, string> = {
  ltts: 'LTTS',
  'l&t technology': 'LTTS',
  'l and t technology': 'LTTS',
  itc: 'ITC',
  'itc infotech': 'ITC',
  'itc limited': 'ITC',
  'itc ltd': 'ITC',
  kpmg: 'KPMG',
  accenture: 'Accenture',
  deloitte: 'Deloitte',
  'd.client': 'Deloitte',
  'd-client': 'Deloitte',
  'd client': 'Deloitte',
  pwc: 'PwC',
  pricewaterhouse: 'PwC',
  pricewaterhousecoopers: 'PwC',
  metaforge: 'METAFORGE',
  'metaforge (internal)': 'METAFORGE',
  'meta forge': 'METAFORGE',
  other: 'OTHER',
  'other company / source': 'OTHER COMPANY / SOURCE',
  'other company/source': 'OTHER COMPANY / SOURCE',
  arctic: 'ARCTIC',
  rolvatech: 'ROLVATECH',
}

const KNOWN_COMPANIES = new Set(Object.values({ ...DOMAIN_TO_COMPANY, ...NAME_ALIASES }))

const OTHER_COMPANY = 'OTHER COMPANY / SOURCE'

function extractEmail(raw: string): string | null {
  const angle = raw.match(/<([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})>/i)
  if (angle) return angle[1].toLowerCase()
  const plain = raw.match(/\b([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/i)
  return plain ? plain[1].toLowerCase() : null
}

function companyFromDomain(domain: string): string | null {
  const d = domain.toLowerCase().trim()
  if (!d) return null
  if (DOMAIN_TO_COMPANY[d]) return DOMAIN_TO_COMPANY[d]
  const parts = d.split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    const suffix = parts.slice(i).join('.')
    if (DOMAIN_TO_COMPANY[suffix]) return DOMAIN_TO_COMPANY[suffix]
  }
  return null
}

function looksLikePersonOrJunk(name: string): boolean {
  const s = name.trim()
  if (!s || s === '—' || s === '-') return true
  if (s.includes('@')) return true
  // Single token first-name style / short POC labels
  if (!/\s/.test(s) && s.length <= 20 && !KNOWN_COMPANIES.has(s) && !NAME_ALIASES[s.toLowerCase()]) {
    // Allow all-caps short brands already handled by aliases; treat Title Case person names as other
    if (/^[A-Za-z]+$/.test(s) && s !== s.toUpperCase()) return true
  }
  return false
}

/**
 * Map a stored client label to a canonical company name (reports / Clients UI).
 */
export function canonicalizeClientName(raw?: string | null): string {
  const s = String(raw || '').trim()
  if (!s || s === '—') return OTHER_COMPANY

  const email = extractEmail(s)
  if (email) {
    const domain = email.split('@')[1] || ''
    const fromDomain = companyFromDomain(domain)
    if (fromDomain) return fromDomain
    return OTHER_COMPANY
  }

  const lower = s.toLowerCase()
  if (NAME_ALIASES[lower]) return NAME_ALIASES[lower]

  // Substring / starts-with for compound labels
  for (const [alias, company] of Object.entries(NAME_ALIASES)) {
    if (alias.length >= 4 && (lower.includes(alias) || lower.startsWith(alias))) {
      return company
    }
  }

  if (looksLikePersonOrJunk(s)) return OTHER_COMPANY

  // Preserve known-style company strings; normalize casing for majors already mapped
  if (KNOWN_COMPANIES.has(s)) return s

  return OTHER_COMPANY
}
