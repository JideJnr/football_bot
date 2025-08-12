import { fetchEndofDayMatches } from '../../../../runners/sport';
import { addLog } from '../../../../util/logger';
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";



export async function finished() {

    const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);

      
  try {
    await dbService.connect();
    
    // 1. Scrape
    
    const rawMatches = await fetchEndofDayMatches();
    console.log(rawMatches)

    // const cleaner = new ComprehensiveMatchCleaner();
    // const cleanedMatches = await cleaner.cleanAndSave(rawMatches);    
    // await dbService.saveMatches(cleanedMatches);

    /// get all id of all raw matches and pass them to fetch match details
    /// console.log the first match response so we can build cleaner of it
    /// clean data and add more data to db
    
    addLog('Pipeline complete.');
  } catch (error) {
    console.error('Live pipeline failed:', error);
  } finally {
    await dbService.close();
  }

}
