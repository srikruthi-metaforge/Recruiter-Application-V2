import { Role } from '../types'

/** Seeded login hints matching backend SEED_ON_START users — not used for local auth. */
export const SEED_ACCOUNTS: Record<Role, { email: string; name: string; password: string; title: string }> = {
  superadmin: { email: 'r.haines@talentflow.io', name: 'Robert Haines', password: 'Admin@2026', title: 'Platform Managing Director' },
  admin: { email: 'd.park@talentflow.io', name: 'David Park', password: 'Admin@2026', title: 'VP of Recruiting Operations' },
  lead: { email: 'harish.g@metaforgeit.com', name: 'Harish Gadipally', password: 'Lead@2026', title: 'Senior Recruiting Lead' },
  recruiter: { email: 'm.chen@talentflow.io', name: 'Marcus Chen', password: 'Rec@2026', title: 'Lead Technical Recruiter' },
  devteam: { email: 'dev.team@talentflow.io', name: 'Dev Team Engineer', password: 'Dev@2026', title: 'Senior Systems Engineer / Core Platform' },
  client: { email: 'client@accenture.com', name: 'Client Account Lead', password: 'Client@2026', title: 'Hiring Manager / Client Portal' },
}

export function seedAccountByEmail(email: string) {
  const needle = email.trim().toLowerCase()
  const match = (Object.entries(SEED_ACCOUNTS) as [Role, (typeof SEED_ACCOUNTS)[Role]][])
    .find(([, acc]) => acc.email.toLowerCase() === needle)
  if (!match) return null
  const [role, acc] = match
  return { role, ...acc }
}

export function titleForRole(role: Role): string {
  return SEED_ACCOUNTS[role]?.title || role
}
