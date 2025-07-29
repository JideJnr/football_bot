import { fetchLiveMatches } from '../../runners/sportybet';

export async function live() {
  // 1. Scrape
  const rawMatches= await fetchLiveMatches();

  console.log('Pipeline complete.');
}

