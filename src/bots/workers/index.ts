import { liveMatchWorker } from "./updater/matchupdater";

const workers = {
    worker :   liveMatchWorker,
};

export const startWorker = async (name: keyof typeof workers) => {
  if (workers[name]) {
    await workers[name].start();
  } else {
    throw new Error(`Worker '${name}' not found`);
  }
};

export const stopWorker = (name: keyof typeof workers) => {
  if (workers[name]) {
    workers[name].stop();
  } else {
    throw new Error(`Worker '${name}' not found`);
  }
};

export const getWorkerStatus = (name: keyof typeof workers) => {
  if (workers[name]) {
    return workers[name].status();
  }
  throw new Error(`Worker '${name}' not found`);
};

export const getAllWorkerStatuses = () =>
  Object.keys(workers).map((name) => workers[name as keyof typeof workers].status());
