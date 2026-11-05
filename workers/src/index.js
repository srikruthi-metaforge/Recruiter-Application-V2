/**
 * BullMQ worker launcher.
 * Starts the compiled backend worker when it is present. It does not consume
 * queues itself, so it cannot take a job away from the API when the bundle
 * has not been built. Without REDIS_URL the API keeps its in-process timers.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const REDIS_URL = process.env.REDIS_URL || '';

if (!REDIS_URL) {
  console.log('REDIS_URL not set — worker idle (API keeps in-process schedulers)');
  setInterval(() => {}, 60_000);
} else {
  const backendWorker = path.resolve(__dirname, '../../backend/dist/worker.js');
  if (!fs.existsSync(backendWorker)) {
    console.log('Backend worker bundle is not built — not consuming queues. The API executes jobs in-process unless WORKER_IN_API=false.');
    setInterval(() => {}, 60_000);
  } else {
    const child = spawn(process.execPath, [backendWorker], {
      stdio: 'inherit',
      env: { ...process.env, PROCESS_ROLE: 'worker' },
    });
    child.on('exit', (code) => process.exit(code == null ? 1 : code));
  }
}
