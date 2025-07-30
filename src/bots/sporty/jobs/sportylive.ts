import { fetchLiveMatches } from '../../../runners/sportybet';
import { ComprehensiveMatchCleaner } from '../cleaners/Cleaner';

export async function live() {
  // 1. Scrape
  const rawMatches= await fetchLiveMatches();

  const cleaner = new ComprehensiveMatchCleaner();
  const cleanedMatches = await cleaner.cleanAndSave(rawMatches);


  console.log(cleanedMatches)

  console.log('Pipeline complete.');
}

