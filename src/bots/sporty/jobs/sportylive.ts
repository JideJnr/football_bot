import { fetchLiveMatches } from "../../../runners/sportybet";
import { ComprehensiveMatchCleaner } from "../cleaners/Cleaner";
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";

export async function live() {
  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);
  
  try {
    await dbService.connect();
    
    // 1. Scrape
    const rawMatches = await fetchLiveMatches();
    
    // 2. Clean
    const cleaner = new ComprehensiveMatchCleaner();
    const cleanedMatches = await cleaner.cleanAndSave(rawMatches);
    
    // 3. Save to DB
    await dbService.saveMatches(cleanedMatches);
    
    console.log('Pipeline complete.');
  } catch (error) {
    console.error('Live pipeline failed:', error);
  } finally {
    await dbService.close();
  }
}