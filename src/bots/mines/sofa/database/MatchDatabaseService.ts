import { MongoClient, Db, Collection } from 'mongodb';
import { CleanedMatch } from '../../../../type/types';
import { addLog } from '../../../../util/logger';


export class LiveMatchDatabaseService {
  private client: MongoClient;
  private db: Db | null = null;
  private collection: Collection<CleanedMatch> | null = null;

  constructor(private readonly mongoUri: string) {
    this.client = new MongoClient(this.mongoUri);
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.db = this.client.db('sportsData');
      this.collection = this.db.collection<CleanedMatch>('liveMatches');
      await this.createIndexes();
      addLog('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      throw error;
    }
  }

  private async createIndexes(): Promise<void> {
    if (!this.collection) return;
    
    try {
      await this.collection.createIndexes([
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
      addLog('✅ Database indexes created');
    } catch (error) {
      console.error('❌ Failed to create indexes:', error);
    }
  }

  public async saveLiveMatches(matches: CleanedMatch[]): Promise<number> {
    if (!this.collection) {
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

      const result = await this.collection.bulkWrite(bulkOps);
      addLog(`✅ Saved ${result.upsertedCount + result.modifiedCount} matches`);
      return result.upsertedCount + result.modifiedCount;
    } catch (error) {
      console.error('❌ Failed to save matches:', error);
      throw error;
    }
  }

  public async getMatchById(eventId: string): Promise<CleanedMatch | null> {
    if (!this.collection) throw new Error('Database not connected');
    return this.collection.findOne({ eventId });
  }

  public async getActiveMatches(): Promise<CleanedMatch[]> {
    if (!this.collection) throw new Error('Database not connected');
    return this.collection.find({ status: { $in: [1, 2] } }).toArray();
  }

  public async close(): Promise<void> {
    try {
      await this.client.close();
      this.db = null;
      this.collection = null;
      addLog('✅ MongoDB connection closed');
    } catch (error) {
      console.error('❌ Failed to close connection:', error);
      throw error;
    }
  }
}