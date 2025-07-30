import cron, { ScheduledTask } from 'node-cron';
import { finished } from './jobs/sportyendofday';
import { live } from './jobs/sportylive';
import { today } from './jobs/sportytoday';

let cronJobs: { [key: string]: ScheduledTask } = {};
let isRunning = false;

export const startSportybetFootballBot = async () => {
  if (isRunning) return;

  cronJobs['live'] = cron.schedule('*/5 * * * *', async () => {
    console.log('[CRON] SportyBet Football: Live match job triggered');
    await live();
  });

  cronJobs['today'] = cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] SportyBet Football: Today match job triggered');
    await today();
  });

  cronJobs['finished'] = cron.schedule('0 12 * * *', async () => {
    console.log('[CRON] SportyBet Football: End-of-day job triggered');
    await finished();
  });

  isRunning = true;
  console.log('[SPORTYBET_FOOTBALL] Bot started');
};

export const stopSportybetFootballBot = () => {
  if (!isRunning) return;

  Object.values(cronJobs).forEach(job => job.stop());
  cronJobs = {};
  isRunning = false;
  console.log('[SPORTYBET_FOOTBALL] Bot stopped');
};

export const getSportybetFootballStatus = () => isRunning;
