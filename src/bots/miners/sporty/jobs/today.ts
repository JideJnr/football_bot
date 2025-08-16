
import { fetchTodayMatches } from '../runners/sport';
import { addLog } from '../../../../util/logger';
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";

export async function today() {

  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    await dbService.connect();
    
    // 1. Scrape all matches for today from all pages 
    
    const rawMatches = await fetchTodayMatches();
   
    // In your today() function, replace the console.log with:
console.log('=== FULL DATA STRUCTURE ===');
console.log(JSON.stringify({
  metadata: {
    bizCode: rawMatches.bizCode,
    message: rawMatches.message,
    tournamentCount: rawMatches.data.tournaments.length
  },
  sampleTournament: {
    ...rawMatches.data.tournaments[0],
    events: rawMatches.data.tournaments[0].events.slice(0, 1) // Just first match
  },
  firstMatchMarkets: rawMatches.data.tournaments[0]?.events?.[0]?.markets?.slice(0, 3)
}, null, 2));

// Additional structural checks
const firstEvent = rawMatches.data.tournaments[0]?.events?.[0];
if (firstEvent) {
  console.log('=== CRITICAL MATCH FIELDS ===');
  console.log(JSON.stringify({
    eventId: firstEvent.eventId,
    startTime: new Date(firstEvent.estimateStartTime).toISOString(),
    teams: `${firstEvent.homeTeamName} vs ${firstEvent.awayTeamName}`,
    status: firstEvent.status,
    hasMarkets: Boolean(firstEvent.markets?.length),
    marketCount: firstEvent.markets?.length || 0
  }, null, 2));
}

    // const cleaner = new ComprehensiveMatchCleaner();
    // const cleanedMatches = await cleaner.cleanAndSave(rawMatches);    
    // await dbService.saveMatches(cleanedMatches);

    /// get all id of all raw matches and pass them to fetch match details
    /// console.log the first match response so we can build cleaner of it
    /// clean data and add more data to db
    
    //addLog('Pipeline complete.');
  } catch (error) {
    console.error('Live pipeline failed:', error);
  } finally {
    await dbService.close();
  }

}
