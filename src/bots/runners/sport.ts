import axios from 'axios';
import { getCurrentTimestamp, getTodayTimeRange } from '../../util/timeUtils';

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
    // Flatten all events from all tournaments
    const allEvents = response.data.data.flatMap((tournament: any) => tournament.events || []);
    return allEvents;
  } catch (err) {
    console.error('Live matches error:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

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