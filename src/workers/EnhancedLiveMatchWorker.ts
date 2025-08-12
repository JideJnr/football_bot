import { MongoClient } from 'mongodb';
import { broadcastLog } from '../wsServer';


export class LiveMatchWorker {
  private dbClient: MongoClient;
  private readonly LIVE_MATCHES_COLLECTION = 'live_matches';
  private readonly COMPLETED_MATCHES_COLLECTION = 'completed_matches';
  private readonly CHECK_INTERVAL_MS = 60000; // 1 minute

  constructor(mongoUri: string) {
    this.dbClient = new MongoClient(mongoUri);
    broadcastLog('⚙️ LiveMatchWorker initialized');
  }

  public async start() {
    try {
      await this.dbClient.connect();
      broadcastLog('✅ Connected to MongoDB');

      // Run initial check
      await this.checkCompletedMatches();

      // Set up periodic checking
      setInterval(async () => {
        await this.checkCompletedMatches();
      }, this.CHECK_INTERVAL_MS);

    } catch (error) {
      broadcastLog(`❌ Error starting LiveMatchWorker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkCompletedMatches() {
    try {
      const db = this.dbClient.db();
      const liveMatches = db.collection(this.LIVE_MATCHES_COLLECTION);
      const completedMatches = db.collection(this.COMPLETED_MATCHES_COLLECTION);

      // Find matches that are finished (status = 3 or matchStatus indicates completion)
      const finishedMatches = await liveMatches.find({
        $or: [
          { status: 3 }, // Status 3 typically means completed
          { matchStatus: { $in: ['FT', 'AET', 'FT_PEN'] } }, // Full-time, after extra time, or penalties
          { $expr: { $gt: ['$estimateStartTime', new Date().getTime() - 24 * 60 * 60 * 1000] } } // Older than 24 hours
        ]
      }).toArray();

      if (finishedMatches.length === 0) {
        broadcastLog('🔍 No completed matches found to move');
        return;
      }

      // Move matches to completed collection
      const result = await completedMatches.insertMany(finishedMatches);
      
      // Remove from live collection
      const idsToRemove = finishedMatches.map(match => match._id);
      await liveMatches.deleteMany({ _id: { $in: idsToRemove } });

      broadcastLog(`✅ Moved ${result.insertedCount} completed matches to archive`);

    } catch (error) {
      broadcastLog(`❌ Error processing completed matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async stop() {
    try {
      await this.dbClient.close();
      broadcastLog('🛑 LiveMatchWorker stopped');
    } catch (error) {
      broadcastLog(`❌ Error stopping LiveMatchWorker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}