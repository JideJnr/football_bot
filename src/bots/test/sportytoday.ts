
import { saveToDB } from '../../db/save';
import { MatchCleaner } from '../../cleaners/MatchCleaner';
import { RawMatchSummary, RawMatchDetailed, CleanedMatch } from '../../type/types';
import { fetchMatchDetails, fetchTodayMatches } from '../../runners/sportybet';

export async function today() {
  try {
    // 1. Fetch summary data
    const rawSummaries: RawMatchSummary[] = await fetchTodayMatches();
    console.log(`Fetched ${rawSummaries.length} match summaries`);
    if (rawSummaries.length === 0) {
      console.log('No matches found for today');
      return;
    }
    const rawMatches: RawMatchDetailed[] = [];
    
    for (const summary of rawSummaries) {
      try {
        const detailed = await fetchMatchDetails(summary.eventId);
        rawMatches.push(detailed);
        console.log(`Fetched details for ${summary.eventId}`);
        
        // Add delay to avoid rate limiting (200ms between requests)
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Skipping ${summary.eventId} due to error`);
      }
    }

    // 3. Clean detailed data
    const cleaner = new MatchCleaner();
    const cleanedMatches: CleanedMatch[] = rawMatches.map(match => 
      cleaner.clean(match)
    );

    // 4. Save to database
    await saveToDB(cleanedMatches);
    console.log(`Saved ${cleanedMatches.length} detailed matches`);

  } catch (error) {
    console.error('Pipeline failed:', error);
  }
}