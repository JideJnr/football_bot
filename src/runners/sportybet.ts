import axios from 'axios';

// Helper: Generate current timestamp for _t parameters
const getCurrentTimestamp = () => Date.now();

// Helper: Get today's time range in SportyBet's format (00:00:00 to 23:59:59)
const getTodayTimeRange = () => {
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

// 1. LIVE MATCHES (now with dynamic _t)
export const fetchLiveMatches = async () => {
  try {
    const response = await axios.get(
      `https://www.sportybet.com/api/ng/factsCenter/configurableLiveOrPrematchEvents?sportId=sr%3Asport%3A1&withTwoUpMarket=true&withOneUpMarket=true&_t=${getCurrentTimestamp()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );
    console.log(JSON.stringify(response.data.data[0].events[0], null, 2));
    return response;
  } catch (err) {
    console.error('Live matches error:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

// 2. END OF DAY RESULTS (dynamic time range + timestamp)
export const fetchEndofDayMatches = async (count = 20) => {
  try {
    const { startTime, endTime } = getTodayTimeRange();
    const response = await axios.get(
      `https://www.sportybet.com/api/ng/factsCenter/eventResultList?count=${count}&lastId=&sportId=sr%3Asport%3A1&startTime=${startTime}&endTime=${endTime}&_t=${getCurrentTimestamp()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );
    
    return response.data.data;
  } catch (err) {
    console.error('EOD matches error:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

// 3. TODAY MATCHES (unchanged as requested)
export const fetchTodayMatches = async () => {
  try {
    const response = await axios.get(
      'https://www.sportybet.com/api/ng/factsCenter/wapConfigurableEventsByOrder',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );
    return response.data.data;
  } catch (err) {
    console.error('Today matches error:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

// 4. MATCH DETAILS (unchanged as requested)
export const fetchMatchDetails = async (eventId: string) => {
  try {
    const response = await axios.get(
      `https://www.sportybet.com/api/ng/factsCenter/event?productId=3&eventId=${encodeURIComponent(eventId)}&_t=${getCurrentTimestamp()}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );
    return response.data.data;
  } catch (err) {
    console.error('Match details error:', err instanceof Error ? err.message : 'Unknown error');
    throw err;
  }
};