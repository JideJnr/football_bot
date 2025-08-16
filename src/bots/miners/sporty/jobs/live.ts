import pLimit from "p-limit";
import { fetchLiveMatches, fetchMatchDetails } from "../runners/sport";
import { addLog } from "../../../../util/logger";
import { ComprehensiveMatchCleaner } from "../cleaners/Cleaner";
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";
import { RawMatch } from "../../../../type/types";
import { MatchDetailsCleaner } from "../cleaners/MatchDetailsCleaner";


export async function live(): Promise<void> {
  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);

  try {
    await dbService.connect();

    addLog(`*** Live Job Started ***`);

    // 1. Scrape raw matches
    const rawMatches: RawMatch[] = await fetchLiveMatches();

    if (rawMatches.length === 0) {
      addLog("No live matches found.");
      return;
    }
    
    addLog(`*** Fetched ${rawMatches.length} live matches.***`);

    // 2. Clean and save basic matches
    const cleaner = new ComprehensiveMatchCleaner();
    const cleanedMatches = await cleaner.cleanAndSave(rawMatches);
    await dbService.saveLiveMatches(cleanedMatches);
    addLog("*** Saved basic match data.***");

    // 3. Extract eventIds
    const matchIds = rawMatches.map(m => m.eventId).filter(Boolean);
    addLog(`*** Fetching details for ${matchIds.length} matches. ***`);

    // 4. Fetch match details (limit concurrency)
    const limit = pLimit(5);
    const detailedData: any[] = await Promise.all(
      matchIds.map(id => limit(() => fetchMatchDetails(id)))
    );



  // 5. Clean and save details
    const detailsCleaner = new MatchDetailsCleaner();
    const cleanedDetails = detailedData.map(detail => 
      detailsCleaner.clean(detail)
    );
    
    await dbService.saveMatchDetails(cleanedDetails);

    addLog("✅ Live job complete with details");

  } catch (error) {
    console.error("Live pipeline failed:", error);
  } finally {
    await dbService.close();
  }
}
