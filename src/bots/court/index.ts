import cron, { ScheduledTask } from 'node-cron';

import { addLog } from '../../util/logger';
import { live } from './jobs/live';
import { today } from './jobs/today';

let cronJobs: { [key: string]: ScheduledTask } = {};
let isRunning = false;
let uptime: number | null = null;

export const startSportybetFootballBot = async () => {
  if (isRunning) return;
  uptime  = Date.now();
  addLog(' SportyBet Football: Waking Up');
  await live();
  await today();

  cronJobs['live'] = cron.schedule('*/3 * * * *', async () => {
    addLog('[CRON] SportyBet Football: Live match job triggered');
    await live();
  });

  cronJobs['today'] = cron.schedule('0 0 * * *', async () => {
    addLog('[CRON] SportyBet Football: Today match job triggered');
    await today();
  });

  isRunning = true;
  addLog('[SPORTYBET_FOOTBALL] Bot started');
};

export const stopSportybetFootballBot = () => {
  if (!isRunning) return;


  Object.values(cronJobs).forEach(job => job.stop());
  cronJobs = {};
  uptime  = null;
  isRunning = false;
  addLog('[SPORTYBET_FOOTBALL] Bot stopped');
};

export const getSportybetFootballStatus = () => isRunning;
