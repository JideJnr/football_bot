import cron, { ScheduledTask } from 'node-cron';
import { finished } from './jobs/endofday';
import { live } from './jobs/live';
import { today } from './jobs/today';
import { addLog } from '../../../util/logger';

let cronJobs: { [key: string]: ScheduledTask } = {};
let isRunning = false;
let uptime: number | null = null;

const runSafely = async (jobName: string, jobFn: () => Promise<void>) => {
  try {
    addLog(`[CRON] SportyBet Football: ${jobName} job triggered`);
    await jobFn();
    addLog(`[CRON] SportyBet Football: ${jobName} job completed`);
  } catch (err: any) {
    addLog(`[CRON] SportyBet Football: ${jobName} job failed - ${err.message || err}`);
  }
};

export const startSportybetFootballBot = async () => {
  if (isRunning) return;

  uptime = Date.now();
  addLog('[SPORTYBET_FOOTBALL] Bot starting...');

  // Run immediately before scheduling
  await runSafely('Live', live);
  await runSafely('Today', today);
  await runSafely('Finished', finished);

  // Schedule jobs
  cronJobs['live'] = cron.schedule('*/3 * * * *', () => runSafely('Live', live));
  cronJobs['today'] = cron.schedule('0 0 * * *', () => runSafely('Today', today));
  cronJobs['finished'] = cron.schedule('0 12 * * *', () => runSafely('Finished', finished));

  isRunning = true;
  addLog('[SPORTYBET_FOOTBALL] Bot started');
};

export const stopSportybetFootballBot = () => {
  if (!isRunning) return;

  Object.values(cronJobs).forEach(job => job.stop());
  cronJobs = {};
  uptime = null;
  isRunning = false;
  addLog('[SPORTYBET_FOOTBALL] Bot stopped');
};

export const getSportybetFootballStatus = () => ({
  running: isRunning,
  uptime: uptime ? Date.now() - uptime : null,
  startedAt: uptime ? new Date(uptime).toISOString() : null,
  jobs: Object.keys(cronJobs)
});

// Graceful shutdown
process.on('SIGINT', () => {
  addLog('[SPORTYBET_FOOTBALL] Received SIGINT, shutting down...');
  stopSportybetFootballBot();
  process.exit(0);
});

process.on('SIGTERM', () => {
  addLog('[SPORTYBET_FOOTBALL] Received SIGTERM, shutting down...');
  stopSportybetFootballBot();
  process.exit(0);
});
