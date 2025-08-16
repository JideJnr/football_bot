
import { fetchTodayMatches } from '../runners/sport';
import { addLog } from '../../../../util/logger';
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";

export async function today() {

  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    await dbService.connect();
    
    // 1. Scrape all matches for today from all pages 
    
    const rawMatches = await fetchTodayMatches();
   
    console.log(
      'Full today response:', 
      JSON.stringify(
        {
          bizCode: rawMatches.bizCode,
          message: rawMatches.message,
          tournaments_sample: rawMatches.data.tournaments.slice(0, 2) // First 2 tournaments
        }, 
        null, 
        2
      )
    );

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
