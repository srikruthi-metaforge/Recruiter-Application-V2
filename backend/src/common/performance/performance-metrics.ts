const MAX_SAMPLES = 400;
const MAX_SLOW = 20;

export interface HttpSample {
  method: string;
  path: string;
  status: number;
  ms: number;
}

export interface QuerySample {
  command: string;
  collection: string;
  ms: number;
  failed: boolean;
}

export interface TimingSummary {
  count: number;
  avgMs: number;
  p50Ms: number;
  p95Ms: number;
  maxMs: number;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function percentile(sorted: number[], p: number): number {
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[index];
}

export function summarize(values: number[]): TimingSummary {
  if (!values.length) return { count: 0, avgMs: 0, p50Ms: 0, p95Ms: 0, maxMs: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((total, value) => total + value, 0);
  return {
    count: sorted.length,
    avgMs: round(sum / sorted.length),
    p50Ms: round(percentile(sorted, 50)),
    p95Ms: round(percentile(sorted, 95)),
    maxMs: round(sorted[sorted.length - 1]),
  };
}

/** Replace ids so one user cannot create a new metric series per document. */
export function normalizePath(path: string): string {
  const bare = String(path || '/').split('?')[0];
  return bare
    .replace(/[a-f0-9]{24}/gi, ':id')
    .replace(/\/\d+(?=\/|$)/g, '/:n')
    .slice(0, 160);
}

export class PerformanceMetrics {
  private readonly http: HttpSample[] = [];
  private readonly queries: QuerySample[] = [];
  private readonly slowHttp: HttpSample[] = [];
  private readonly slowQueries: QuerySample[] = [];

  recordHttp(sample: HttpSample, slowMs = 300) {
    this.push(this.http, sample);
    if (sample.ms >= slowMs) this.push(this.slowHttp, sample, MAX_SLOW);
  }

  recordQuery(sample: QuerySample, slowMs = 100) {
    this.push(this.queries, sample);
    if (sample.failed || sample.ms >= slowMs) this.push(this.slowQueries, sample, MAX_SLOW);
  }

  snapshot() {
    return {
      http: summarize(this.http.map((sample) => sample.ms)),
      mongodb: summarize(this.queries.map((sample) => sample.ms)),
      recentSlowHttp: this.slowHttp.slice(),
      recentSlowQueries: this.slowQueries.slice(),
    };
  }

  private push<T>(list: T[], item: T, limit = MAX_SAMPLES) {
    list.push(item);
    if (list.length > limit) list.splice(0, list.length - limit);
  }
}

export const performanceMetrics = new PerformanceMetrics();
