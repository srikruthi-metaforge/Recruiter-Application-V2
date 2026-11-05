import { NextRequest, NextResponse } from 'next/server'

const HSTS = 'max-age=31536000; includeSubDomains; preload'

/** HTTPS redirect and HSTS stay off unless an operator sets FORCE_HTTPS=true. */
function httpsRequired(): boolean {
  return process.env.FORCE_HTTPS === 'true'
}

function isHttpsRequest(request: NextRequest): boolean {
  if (request.nextUrl.protocol === 'https:') return true
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase()
  if (proto === 'https') return true
  if (request.headers.get('x-forwarded-ssl')?.toLowerCase() === 'on') return true
  return false
}

/**
 * Content-Security-Policy with per-request nonces.
 * HTTP stays on HTTP for internal LAN access (server IP and app port).
 * Drops script-src 'unsafe-inline' (Next attaches the nonce to its scripts).
 * style-src keeps 'unsafe-inline' for React style={{}} attributes / Tailwind runtime needs.
 */
export function middleware(request: NextRequest) {
  const forceHttps = httpsRequired()

  // Optional HTTPS redirect. Unset FORCE_HTTPS must not upgrade http://<server-ip>:<port>.
  if (forceHttps && !isHttpsRequest(request)) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    const redirect = NextResponse.redirect(url, 308)
    redirect.headers.set('Strict-Transport-Security', HSTS)
    return redirect
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDev = process.env.NODE_ENV === 'development'

  // Nonce + strict-dynamic replaces script 'unsafe-inline'.
  // 'unsafe-eval' retained for Plotly chart bundles (not the same as unsafe-inline).
  const scriptSrc = ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'", "'unsafe-eval'"].join(' ')

  const connectSrc = [
    "'self'",
    // Local API only in development; production uses the same-origin /api proxy.
    isDev ? 'http://localhost:3001' : null,
    isDev ? 'http://127.0.0.1:3001' : null,
    isDev ? 'https://localhost:3001' : null,
    isDev ? 'ws://localhost:3000' : null,
    isDev ? 'ws://127.0.0.1:3000' : null,
    isDev ? 'wss://localhost:3000' : null,
  ]
    .filter(Boolean)
    .join(' ')

  const csp = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    // Dropped 'unsafe-inline' from stylesheets where possible; keep for React style attrs.
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob: https:",
    `connect-src ${connectSrc}`,
    // Allow same-origin / about:srcdoc email preview iframes; block remote frames.
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    // Upgrade residual http: subresources when serving over HTTPS.
    forceHttps ? 'upgrade-insecure-requests' : null,
  ]
    .filter(Boolean)
    .join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (forceHttps) {
    response.headers.set('Strict-Transport-Security', HSTS)
  }
  return response
}

export const config = {
  matcher: [
    /*
     * Apply CSP / HSTS to all routes except Next internals / static assets that break with CSP noise.
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
