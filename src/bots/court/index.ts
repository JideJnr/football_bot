import cron, { ScheduledTask } from 'node-cron';

import { addLog } from '../../util/logger';
import { live } from './jobs/live';
import { today } from './jobs/today';

let cronJobs: { [key: string]: ScheduledTask } = {};
let isRunning = false;
let uptime: number | null = null;

export const startCourtBot = async () => {
  if (isRunning) return;
  uptime = Date.now();
  addLog('[COURT_BOT] Initializing...');

  await live();
  await today();

  cronJobs['live'] = cron.schedule('*/3 * * * *', async () => {
    addLog('[CRON] Court Bot: Live case job triggered');
    await live();
  });

  cronJobs['today'] = cron.schedule('0 0 * * *', async () => {
    addLog('[CRON] Court Bot: Today’s schedule job triggered');
    await today();
  });

  isRunning = true;
  addLog('[COURT_BOT] Bot started');
};

export const stopCourtBot = () => {
  if (!isRunning) return;

  Object.values(cronJobs).forEach(job => job.stop());
  cronJobs = {};
  uptime = null;
  isRunning = false;
  addLog('[COURT_BOT] Bot stopped');
};

export const getCourtBotStatus = () => ({
  isRunning,
  uptime
});
