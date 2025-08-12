export const formatDuration = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getCurrentTimestamp = () => Date.now();

export const getTodayDate = () => new Date().toISOString().split('T')[0];

export const getTodayTimeRange = () => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  end.setMilliseconds(-1);

  return {
    startTime: start.getTime(),
    endTime: end.getTime()
  };
};
