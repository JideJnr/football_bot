import pLimit from "p-limit";
import { fetchLiveMatches, fetchMatchDetails } from "../runners/sport";
import { addLog } from "../../../../util/logger";
import { ComprehensiveMatchCleaner } from "../cleaners/Cleaner";
import { LiveMatchDatabaseService } from "../database/MatchDatabaseService";
import { RawMatch } from "../../../../type/types";


export async function live(): Promise<void> {
  const dbService = new LiveMatchDatabaseService(process.env.MONGO_URI!);

  try {
    await dbService.connect();

    addLog(`------- Live Job Started -------`);

    // 1. Scrape raw matches
    const rawMatches: RawMatch[] = await fetchLiveMatches();

    if (rawMatches.length === 0) {
      addLog("No live matches found.");
      return;
    }
    
    addLog(`Fetched ${rawMatches.length} live matches.`);

    // 2. Clean and save basic matches
    const cleaner = new ComprehensiveMatchCleaner();
    const cleanedMatches = await cleaner.cleanAndSave(rawMatches);
    await dbService.saveLiveMatches(cleanedMatches);
    addLog("Saved basic match data.");

    // 3. Extract eventIds
    const matchIds = rawMatches.map(m => m.eventId).filter(Boolean);
    addLog(`Fetching details for ${matchIds.length} matches.`);

    // 4. Fetch match details (limit concurrency)
    const limit = pLimit(5);
    const detailedData: any[] = await Promise.all(
      matchIds.map(id => limit(() => fetchMatchDetails(id)))
    );

    // 5. Log the first match details for cleaner building
    if (detailedData.length > 0) {
      console.log("------------------------------------ First match details sample:", detailedData[0],'------------------------------------');
    }

    // TODO: clean details & save to DB
    // const detailsCleaner = new MatchDetailsCleaner();
    // const cleanedDetails = await detailsCleaner.clean(detailedData);
    // await dbService.saveMatchDetails(cleanedDetails);

    addLog("live job Pipeline complete with match details.");
  } catch (error) {
    console.error("Live pipeline failed:", error);
  } finally {
    await dbService.close();
  }
}
