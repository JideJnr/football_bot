import axios from 'axios';
import { getTodayDate } from '../util/timeUtils';

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Accept': 'application/json',
  'Referer': 'https://www.sofascore.com/',
  'Origin': 'https://www.sofascore.com'
};

export const fetchTodayMatches = async () => {
  const today = getTodayDate(); // Dynamically set
  try {
    const { data } = await axios.get(
      `https://www.sofascore.com/api/v1/sport/football/scheduled-events/${today}`,
      { headers: BASE_HEADERS }
    );
    return data;
  } catch (err) {
    console.error(`Error fetching matches for ${today}:`, err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

export const fetchLiveMatches = async () => {
  try {
    const { data } = await axios.get(
      'https://www.sofascore.com/api/v1/sport/football/events/live',
      { headers: BASE_HEADERS }
    );
    return data;
  } catch (err) {
    console.error('Error fetching live matches:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

export const fetchMatchDetails = async () => {
  try {
    const { data } = await axios.get(
      'https://www.sofascore.com/api/v1/sport/football/events/live',
      { headers: BASE_HEADERS }
    );
    return data;
  } catch (err) {
    console.error('Error fetching live matches:', err instanceof Error ? err.message : 'Unknown error');
    return [];
  }
};

