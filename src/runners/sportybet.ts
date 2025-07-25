import axios from 'axios';

export const fetchLiveMatches = async () => {
  try {
    const response = await axios.get(
      'https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );

    const data = response.data.data;

    return data;
  } 
   catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Error fetching today matches:', err.message);
  } else {
    console.error('Unknown error fetching today matches');
  }
  return [];
  }
};

export const fetchTodayMatches = async () => {
  try {
    const response = await axios.get(
      'https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );

    const data = response.data.data;
    return data;
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Error fetching today matches:', err.message);
  } else {
    console.error('Unknown error fetching today matches');
  }
  return [];
  }
};

export const fetchEndofDayMatches = async () => {
  try {
    const response = await axios.get(
      'https://www.sportybet.com/api/ng/factsCenter/liveOrPrematchEvents?sportId=sr:sport:1',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
          'Referer': 'https://www.sportybet.com/',
          'Origin': 'https://www.sportybet.com',
        },
      }
    );

    const data = response.data.data;
    return data;
  } catch (err: unknown) {
  if (err instanceof Error) {
    console.error('Error fetching today matches:', err.message);
  } else {
    console.error('Unknown error fetching today matches');
  }
  return [];
  }
};

export const fetchMatchDetails = async (eventId: string): Promise<any> => {
  try {
    const encodedEventId = encodeURIComponent(eventId);
    const timestamp = Date.now();
    const url = `https://www.sportybet.com/api/ng/factsCenter/event?eventId=${encodedEventId}&productId=1&_t=${timestamp}`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/json',
        'Referer': 'https://www.sportybet.com/',
        'Origin': 'https://www.sportybet.com',
      }
    });

    return response.data.data;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error fetching details for ${eventId}:`, err.message);
    } else {
      console.error(`Unknown error fetching details for ${eventId}`);
    }
    throw err;
  }
};

