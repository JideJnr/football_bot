// src/bots/archive-bot.ts
import { MongoClient } from 'mongodb';
import cron from 'node-cron';
import { addLog } from '../../../../util/logger';
import { CleanedMatch } from '../../../../type/types';


const MONGO_URI = process.env.MONGO_URI!;
const ARCHIVE_THRESHOLD = 15; // Minutes after match ends

class ArchiveBot {
  private liveCollection: any;
  private archiveCollection: any;
  private client: MongoClient;

  constructor() {
    this.client = new MongoClient(MONGO_URI);
  }

  public async init(): Promise<void> {
    await this.client.connect();
    const db = this.client.db('sportsData');
    this.liveCollection = db.collection('liveMatches');
    this.archiveCollection = db.collection('completedMatches');
    await this.createArchiveIndexes();
  
  }

  private async createArchiveIndexes(): Promise<void> {
    await this.archiveCollection.createIndex({ eventId: 1 }, { unique: true });
    await this.archiveCollection.createIndex({ "sport.category.id": 1 });
    await this.archiveCollection.createIndex({ startTime: -1 });
    addLog('✅ Archive indexes created');
  }

  public async migrateFinishedMatches(): Promise<void> {
    try {
      // 1. Identify finished matches
      const finishedMatches = await this.liveCollection.find({
        status: 2,
        lastUpdated: { 
          $lt: new Date(Date.now() - ARCHIVE_THRESHOLD * 60 * 1000)
        }
      }).toArray();

      if (finishedMatches.length === 0) {
        addLog('🏁 No matches ready for archiving');
        return;
      }

      // 2. Atomic migration
      const bulkArchiveOps = finishedMatches.map((match: CleanedMatch) => ({
        deleteOne: { filter: { _id: match._id } }
      }));

      await this.archiveCollection.insertMany(finishedMatches);
      await this.liveCollection.bulkWrite(bulkArchiveOps);

      addLog(`🚚 Migrated ${finishedMatches.length} matches to archive`);
    } catch (error) {
      addLog(`💥 Archive failure: ${error?.message}`);
    }
  }

  public async close(): Promise<void> {
    await this.client.close();
  }
}

// Execution flow
const archiveBot = new ArchiveBot();

cron.schedule('*/10 * * * *', async () => { // Every 10 minutes
  await archiveBot.init();
  await archiveBot.migrateFinishedMatches();
  await archiveBot.close();
});