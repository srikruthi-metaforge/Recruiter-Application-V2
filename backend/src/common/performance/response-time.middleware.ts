import { performanceMetrics, normalizePath } from './performance-metrics';

/**
 * Records handler time and sets X-Response-Time before the status line is sent.
 * The header is additive. Response bodies are unchanged.
 */
export function responseTimeMiddleware(req: any, res: any, next: () => void) {
  const start = process.hrtime.bigint();
  const writeHead = res.writeHead;
  res.writeHead = function (...args: unknown[]) {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    if (!res.headersSent) {
      try {
        res.setHeader('X-Response-Time', `${ms.toFixed(1)}ms`);
      } catch {
        // A finished response is still recorded below.
      }
    }
    return writeHead.apply(this, args);
  };
  res.on('finish', () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    const route = req.route?.path ? `${req.baseUrl || ''}${req.route.path}` : req.originalUrl || req.url || '/';
    performanceMetrics.recordHttp({
      method: String(req.method || 'GET'),
      path: normalizePath(route),
      status: Number(res.statusCode) || 0,
      ms,
    });
    if (ms >= 300) {
      // Path only. Query strings can carry emails and search text.
      console.warn(`[slow-http] ${req.method} ${normalizePath(route)} ${res.statusCode} ${ms.toFixed(1)}ms`);
    }
  });
  next();
}
