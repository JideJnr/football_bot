import { MongoClient, Db, Collection, BulkWriteOptions } from 'mongodb';
import { CleanedMatch } from '../../../../type/types';
import { addLog } from '../../../../util/logger';
import { CleanedMatchDetails } from '../cleaners/MatchDetailsCleaner'; // Import the detail type

export class LiveMatchDatabaseService {
  private client: MongoClient;
  private db: Db | null = null;
  private matchesCollection: Collection<CleanedMatch> | null = null;
  private detailsCollection: Collection<CleanedMatchDetails> | null = null;

  constructor(private readonly mongoUri: string) {
    this.client = new MongoClient(this.mongoUri);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db('sportsData');
      
      // Initialize both collections
      this.matchesCollection = this.db.collection<CleanedMatch>('liveMatches');
      this.detailsCollection = this.db.collection<CleanedMatchDetails>('match_details');
      
      await this.createIndexes();
      addLog('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    try {
      // Indexes for matches collection
      if (this.matchesCollection) {
        await this.matchesCollection.createIndexes([
          { key: { eventId: 1 }, unique: true },
          { key: { 'sport.id': 1 } },
          { key: { 'sport.category.id': 1 } },
          { key: { 'sport.category.tournament.id': 1 } },
          { key: { homeTeamId: 1 } },
          { key: { awayTeamId: 1 } },
          { key: { estimateStartTime: 1 } },
          { key: { status: 1 } },
          { key: { 'markets': 1 } },
          { key: { 'bookingStatus': 1 } }
        ]);
      }

      // Indexes for details collection
      if (this.detailsCollection) {
        await this.detailsCollection.createIndex({ eventId: 1 });
        await this.detailsCollection.createIndex({ "dynamic.timestamp": 1 });
        await this.detailsCollection.createIndex({ "static.homeTeamId": 1 });
        await this.detailsCollection.createIndex({ "static.awayTeamId": 1 });
      }
      
      addLog('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
    }
  }

  // Existing method for saving basic matches
  public async saveLiveMatches(matches: CleanedMatch[]): Promise<number> {
    if (!this.matchesCollection) {
      throw new Error('Database not connected');
    }

    try {
      const bulkOps = matches.map(match => ({
        updateOne: {
          filter: { eventId: match.eventId },
          update: { $set: match },
          upsert: true
        }
      }));

      if (bulkOps.length === 0) {
        addLog('⚠️ No matches to save');
        return 0;
      }

      const result = await this.matchesCollection.bulkWrite(bulkOps);
      addLog(`✅ Saved ${result.upsertedCount + result.modifiedCount} matches`);
      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      console.error('❌ Failed to save matches:', error);
      throw error;
    }
  }

  // NEW METHOD: Save detailed match snapshots
  public async saveMatchDetails(cleanedDetails: CleanedMatchDetails[]): Promise<void> {
    if (!this.detailsCollection) {
      throw new Error('Database not connected');
    }

    try {
      const bulkOps = cleanedDetails.map(detail => {
        const filter = { eventId: detail.eventId };
        const update = {
          $setOnInsert: { static: detail.static },
          $push: { 
            dynamic: { 
              $each: detail.dynamic,
              $slice: -1000 // Keep last 1000 snapshots
            } 
          }
        };
        return { updateOne: { filter, update, upsert: true } };
      });

      await this.detailsCollection.bulkWrite(bulkOps);
      addLog(`💾 Saved ${cleanedDetails.length} match details snapshots`);
    } catch (error) {
      console.error('❌ Failed to save match details:', error);
      throw error;
    }
  }

  // Existing methods
  public async getMatchById(eventId: string): Promise<CleanedMatch | null> {
    if (!this.matchesCollection) throw new Error('Database not connected');
    return this.matchesCollection.findOne({ eventId });
  }

  public async getActiveMatches(): Promise<CleanedMatch[]> {
    if (!this.matchesCollection) throw new Error('Database not connected');
    return this.matchesCollection.find({ status: { $in: [1, 2] } }).toArray();
  }

  // NEW METHOD: Get match details history
  public async getMatchDetailsHistory(eventId: string): Promise<CleanedMatchDetails | null> {
    if (!this.detailsCollection) throw new Error('Database not connected');
    return this.detailsCollection.findOne({ eventId });
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      this.db = null;
      this.matchesCollection = null;
      this.detailsCollection = null;
      addLog('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Failed to close connection:', error);
      throw error;
    }
  }
}