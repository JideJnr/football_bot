import { fetchLiveMatches } from "../../../../runners/sport";
import { addLog } from "../../../../util/logger";
import { ComprehensiveMatchCleaner } from "../cleaners/Cleaner";
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";

export async function live() {
  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    await dbService.connect();
    
    // 1. Scrape
    const rawMatches = await fetchLiveMatches();
    
    // 2. Cleana
    const cleaner = new ComprehensiveMatchCleaner();
    const cleanedMatches = await cleaner.cleanAndSave(rawMatches);    
    await dbService.saveLiveMatches(cleanedMatches);

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