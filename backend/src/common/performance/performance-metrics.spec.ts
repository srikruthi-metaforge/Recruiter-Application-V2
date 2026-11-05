import { normalizePath, percentile, PerformanceMetrics, summarize } from './performance-metrics';

describe('performance metrics', () => {
  it('summarizes latency percentiles', () => {
    const summary = summarize([10, 20, 30, 40, 100]);
    expect(summary.count).toBe(5);
    expect(summary.p50Ms).toBe(percentile([10, 20, 30, 40, 100], 50));
    expect(summary.maxMs).toBe(100);
    expect(summary.avgMs).toBe(40);
  });

  it('collapses document ids so metrics stay bounded', () => {
    expect(normalizePath('/api/v1/candidates/6ab4f38ff2e0e1823c038948?search=ada@example.com')).toBe(
      '/api/v1/candidates/:id',
    );
  });

  it('keeps slow queries without storing the query document', () => {
    const metrics = new PerformanceMetrics();
    metrics.recordQuery({ command: 'find', collection: 'submissions', ms: 180, failed: false });
    metrics.recordQuery({ command: 'find', collection: 'users', ms: 4, failed: false });
    const snap = metrics.snapshot();
    expect(snap.mongodb.count).toBe(2);
    expect(snap.recentSlowQueries).toEqual([
      { command: 'find', collection: 'submissions', ms: 180, failed: false },
    ]);
    expect(JSON.stringify(snap.recentSlowQueries)).not.toContain('email');
  });
});
