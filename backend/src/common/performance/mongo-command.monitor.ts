import { Connection } from 'mongoose';
import { performanceMetrics } from './performance-metrics';

const SKIPPED = new Set(['hello', 'ismaster', 'ping', 'saslStart', 'saslContinue', 'endSessions']);
const MAX_INFLIGHT = 1000;

function collectionFrom(event: { commandName?: string; ns?: string; command?: Record<string, unknown> }): string {
  const ns = String(event.ns || '');
  const dot = ns.indexOf('.');
  if (dot >= 0 && dot < ns.length - 1) return ns.slice(dot + 1);
  const command = event.command || {};
  if (typeof command.collection === 'string') return command.collection;
  const name = event.commandName || '';
  const value = command[name];
  return typeof value === 'string' ? value : name || 'unknown';
}

/**
 * Times driver commands. The command document is never stored.
 * Requires the connection to be opened with monitorCommands.
 */
export function attachMongoCommandMonitor(connection: Connection) {
  const client = connection.getClient?.();
  if (!client || (client as any).__mrapCommandMonitor) return;
  (client as any).__mrapCommandMonitor = true;

  const started = new Map<number, { at: bigint; collection: string }>();
  client.on('commandStarted', (event: { requestId: number; commandName?: string; ns?: string; command?: Record<string, unknown> }) => {
    if (!event?.commandName || SKIPPED.has(event.commandName)) return;
    if (started.size > MAX_INFLIGHT) {
      const oldest = started.keys().next().value;
      if (oldest !== undefined) started.delete(oldest);
    }
    started.set(event.requestId, {
      at: process.hrtime.bigint(),
      collection: collectionFrom(event),
    });
  });

  const finish = (event: { requestId: number; commandName?: string }, failed: boolean) => {
    if (!event?.commandName || SKIPPED.has(event.commandName)) return;
    const row = started.get(event.requestId);
    started.delete(event.requestId);
    if (!row) return;
    performanceMetrics.recordQuery({
      command: event.commandName,
      collection: row.collection,
      ms: Number(process.hrtime.bigint() - row.at) / 1e6,
      failed,
    });
  };

  client.on('commandSucceeded', (event: any) => finish(event, false));
  client.on('commandFailed', (event: any) => finish(event, true));
}
