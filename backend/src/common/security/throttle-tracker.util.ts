/**
 * Rate-limit identity for a multi-recruiter office.
 *
 * Nest's default tracker is the client IP. Recruiters on one LAN share that IP,
 * so a limit of 5 login attempts per minute blocked everyone after the first few.
 * Credential routes are counted per account. Signed-in API traffic is counted per user.
 */

const CREDENTIAL_PATHS = [
  '/auth/login',
  '/auth/request-login-otp',
  '/auth/verify-login-otp',
  '/auth/register-request',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
];

export function requestPath(req: Record<string, any>): string {
  const raw = String(req?.originalUrl || req?.url || req?.path || '');
  return raw.split('?')[0];
}

export function isCredentialRequest(req: Record<string, any>): boolean {
  const method = String(req?.method || 'GET').toUpperCase();
  if (method !== 'POST') return false;
  const path = requestPath(req);
  return CREDENTIAL_PATHS.some((suffix) => path === suffix || path.endsWith(suffix));
}

/** Express req.ip already honors `trust proxy`. Do not prefer a raw X-Forwarded-For the client can spoof. */
export function clientIp(req: Record<string, any>): string {
  const ip = String(req?.ip || req?.socket?.remoteAddress || '').trim();
  return ip || 'unknown';
}

export function accountTracker(req: Record<string, any>): string {
  const email = String(req?.body?.email || '').trim().toLowerCase();
  if (email && email.length <= 320 && email.includes('@')) return `acct:${email}`;
  return `ip:${clientIp(req)}`;
}

function userIdFromAccessToken(token: string | null | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: unknown; sub?: unknown };
    const id = json.userId || json.sub;
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

function readAccessToken(req: Record<string, any>): string | null {
  const header = String(req?.headers?.authorization || '');
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  const cookie = String(req?.headers?.cookie || '');
  for (const part of cookie.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === 'access_token') return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function sessionTracker(req: Record<string, any>): string {
  const user = req?.user;
  const userId = user?.userId || user?.id || user?.sub;
  if (userId) return `user:${userId}`;
  if (isCredentialRequest(req)) return accountTracker(req);
  const fromJwt = userIdFromAccessToken(readAccessToken(req));
  if (fromJwt) return `user:${fromJwt}`;
  return `ip:${clientIp(req)}`;
}

/** Per-account cap. Each recruiter has their own bucket, so an office can sign in together. */
export function perAccountThrottle(limit: number) {
  return {
    default: {
      limit,
      ttl: 60_000,
      getTracker: (req: Record<string, any>) => accountTracker(req),
    },
  };
}
