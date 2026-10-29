/**
 * Maps ROLE_NAV / ModulePage keys ↔ browser paths for the SPA shell.
 * Paths are lowercase, no spaces (e.g. /addcandidates, /requirements).
 */

const NAV_KEY_TO_PATH: Record<string, string> = {
  Dashboard: '/dashboard',
  Requirements: '/requirements',
  Candidates: '/addcandidates',
  'Candidate Search': '/addcandidates',
  Users: '/usermanagement',
  'User Management': '/usermanagement',
  Clients: '/clients',
  'Client Management': '/clients',
  Reports: '/reports',
  'Reports & Analytics': '/reports',
  'Audit Logs': '/auditlogs',
  'Activity Logs': '/auditlogs',
  History: '/history',
  'Recruiter History': '/history',
  'Performance History': '/history',
  'My Profile': '/myprofile',
  Profile: '/myprofile',
  Notifications: '/notifications',
  'My Team': '/myteam',
  Recruiters: '/recruiters',
  Teams: '/teams',
  'Teams & Recruiters': '/teams',
  Roles: '/roles',
  'Roles & Permissions': '/roles',
  Organization: '/organization',
  Offers: '/offers',
  'AI Center': '/aicenter',
  Integrations: '/integrations',
  Settings: '/settings',
  Submissions: '/reports',
  Interviews: '/reports',
  'Submission to Client': '/reports',
  'Submissions to Client': '/reports',
  'Interview Tracking': '/reports',
}

/** Reverse map: path → primary nav key */
const PATH_TO_NAV_KEY: Record<string, string> = {}
for (const [key, path] of Object.entries(NAV_KEY_TO_PATH)) {
  if (!PATH_TO_NAV_KEY[path]) PATH_TO_NAV_KEY[path] = key
}
// Prefer canonical keys for shared paths
PATH_TO_NAV_KEY['/addcandidates'] = 'Candidates'
PATH_TO_NAV_KEY['/usermanagement'] = 'Users'
PATH_TO_NAV_KEY['/clients'] = 'Clients'
PATH_TO_NAV_KEY['/reports'] = 'Reports'
PATH_TO_NAV_KEY['/auditlogs'] = 'Audit Logs'
PATH_TO_NAV_KEY['/history'] = 'History'
PATH_TO_NAV_KEY['/myprofile'] = 'My Profile'
PATH_TO_NAV_KEY['/teams'] = 'Teams'
PATH_TO_NAV_KEY['/roles'] = 'Roles'

export function pathForNavKey(navKey: string): string {
  if (NAV_KEY_TO_PATH[navKey]) return NAV_KEY_TO_PATH[navKey]
  const slug = navKey
    .toLowerCase()
    .replace(/&/g, '')
    .replace(/[^a-z0-9]+/g, '')
  return slug ? `/${slug}` : '/'
}

export function navKeyFromPathname(pathname: string | null | undefined): string | null {
  if (!pathname) return null
  let clean = pathname.split('?')[0].split('#')[0]
  if (!clean.startsWith('/')) clean = `/${clean}`
  clean = clean.replace(/\/+$/, '') || '/'
  if (clean === '/') return null
  return PATH_TO_NAV_KEY[clean] || PATH_TO_NAV_KEY[clean.toLowerCase()] || null
}

export function syncBrowserPath(navKey: string, mode: 'push' | 'replace' = 'push') {
  if (typeof window === 'undefined') return
  const path = pathForNavKey(navKey)
  if (window.location.pathname === path) return
  if (mode === 'replace') {
    window.history.replaceState({ nav: navKey }, '', path)
  } else {
    window.history.pushState({ nav: navKey }, '', path)
  }
}

export function resetBrowserPathToRoot() {
  if (typeof window === 'undefined') return
  if (window.location.pathname !== '/') {
    window.history.replaceState({}, '', '/')
  }
}
