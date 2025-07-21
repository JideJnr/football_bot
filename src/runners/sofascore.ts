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

    const data = response.data;

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

    const data = response.data;
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

    const data = response.data;
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


