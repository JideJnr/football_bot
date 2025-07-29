import { fetchTodayMatches } from '../../runners/sportybet';

export async function today() {
  const rawMatches = await fetchTodayMatches();
  console.log('Pipeline complete.');
}

