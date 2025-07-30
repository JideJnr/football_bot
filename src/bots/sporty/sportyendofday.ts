import { fetchEndofDayMatches } from '../../runners/sportybet';


export async function finished() {
  const rawMatches = await fetchEndofDayMatches();
  console.log('End of day pipeline complete complete.');
}
