import { MongoClient } from "mongodb";
import { broadcastLog } from "../../../wsServer";

const CHECK_INTERVAL_MS = 60_000; // 1 min
let intervalId: NodeJS.Timeout | null = null;
let isRunning = false;
let uptime: number | null = null;

async function checkCompletedMatches(db: any): Promise<void> {
  try {
    const liveMatches = db.collection("live_matches");
    const completedMatches = db.collection("completed_matches");

    const finishedMatches = await liveMatches.find({
      $or: [
        { status: 3 },
        { matchStatus: { $in: ["FT", "AET", "FT_PEN"] } },
        {
          $expr: {
            $gt: [
              "$estimateStartTime",
              new Date().getTime() - 24 * 60 * 60 * 1000
            ]
          }
        }
      ]
    }).toArray();

    if (finishedMatches.length === 0) {
      broadcastLog("🔍 No completed matches found to move");
      return;
    }

    const result = await completedMatches.insertMany(finishedMatches);
    const idsToRemove: (string | number | import("mongodb").ObjectId)[] = finishedMatches.map((match: any) => match._id);
    await liveMatches.deleteMany({ _id: { $in: idsToRemove } });

    broadcastLog(`✅ Moved ${result.insertedCount} completed matches to archive`);
  } catch (error) {
    broadcastLog(`❌ Error processing completed matches: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

async function checkMatchesAboutToStart(db: any): Promise<void> {
  try {
    // For now, reusing the same logic as checkCompletedMatches
    await checkCompletedMatches(db);
  } catch (error) {
    broadcastLog(`❌ Error processing matches about to start: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export const liveMatchWorker = {
  async start() {
    if (isRunning) return;
    isRunning = true;
    uptime = Date.now();

    const client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
    const db = client.db();

    broadcastLog("✅ Connected to MongoDB (Live Match Worker)");

    // Run once immediately
    await checkCompletedMatches(db);
    await checkMatchesAboutToStart(db);

    // Schedule periodic checks
    intervalId = setInterval(async () => {
      await checkCompletedMatches(db);
      await checkMatchesAboutToStart(db);
    }, CHECK_INTERVAL_MS);

    broadcastLog("⚙️ Live match worker started");
  },

  stop() {
    if (!isRunning) return;
    clearInterval(intervalId!);
    intervalId = null;
    isRunning = false;
    uptime = null;
    broadcastLog("🛑 Live match worker stopped");
  },

  status() {
    return {
      name: "liveMatchWorker",
      running: isRunning,
      uptime,
    };
  }
};
