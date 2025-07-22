import cron, { ScheduledTask } from 'node-cron';
import { today } from './sportytoday';

let cronJobs: { [key: string]: ScheduledTask } = {};
let isRunning = false;

export const startTestBot = async () => {
  if (isRunning) return;

  cronJobs['today'] = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] SportyBet Football: Today match job triggered');
    await today();
  });

  isRunning = true;
  console.log('[SPORTYBET_FOOTBALL] Bot started');
};

export const stopTestBot = () => {
  if (!isRunning) return;

  Object.values(cronJobs).forEach(job => job.stop());
  cronJobs = {};
  isRunning = false;
  console.log('[SPORTYBET_FOOTBALL] Bot stopped');
};

export const getTestStatus = () => isRunning;
