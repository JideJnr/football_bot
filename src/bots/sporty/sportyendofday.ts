import { fetchEndofDayMatches } from '../../runners/sportybet';


export async function finished() {
  // 1. Scrape
  const rawMatches = await fetchEndofDayMatches();
  console.log('End of day pipeline complete complete.');
}
