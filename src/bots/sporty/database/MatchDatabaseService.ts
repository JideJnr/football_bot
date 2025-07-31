import { MongoClient, UpdateFilter, Document } from 'mongodb';

interface CleanedMatch {
  eventId: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
  sport: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
      tournament?: {
        id?: string;
        name?: string;
      };
    };
  };
  fixtureVenue?: { name: string };
  estimateStartTime: string;
  markets: Record<string, { outcomes: Array<{ desc: string; odds: string; probability: string; isActive: number }> }>;
  setScore: string;
  matchStatus: string;
  status: string;
  period: number;
  playedSeconds: number;
}

export class LiveMatchDatabaseService {
  private client: MongoClient;
  private dbName = 'sportybet';
  private collectionName = 'matches';

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async saveMatches(cleanedMatches: CleanedMatch[]): Promise<void> {
    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);

    const bulkOps = cleanedMatches.map(match => {
      const staticData = {
        homeTeamId: match.homeTeamId,
        homeTeamName: match.homeTeamName,
        awayTeamId: match.awayTeamId,
        awayTeamName: match.awayTeamName,
        tournament: {
          sportId: match.sport.id,
          sportName: match.sport.name,
          categoryId: match.sport.category.id,
          categoryName: match.sport.category.name,
          tournamentId: match.sport.category.tournament?.id,
          tournamentName: match.sport.category.tournament?.name
        },
        venue: match.fixtureVenue?.name,
        initialEstimateStartTime: new Date(match.estimateStartTime)
      };

      const currentOddsSnapshot = {
        timestamp: new Date(),
        markets: Object.entries(match.markets).map(([marketType, marketData]) => ({
          marketType,
          outcomes: marketData.outcomes.map(outcome => ({
            desc: outcome.desc,
            odds: parseFloat(outcome.odds),
            probability: parseFloat(outcome.probability),
            isActive: outcome.isActive === 1
          }))
        })),
        scoreAtTime: match.setScore,
        matchStatusAtTime: match.matchStatus
      };

      const updateDoc: UpdateFilter<Document> = {
        $setOnInsert: { staticData, createdAt: new Date() },
        $set: {
          'dynamicData.currentStatus': match.status,
          'dynamicData.currentScore': match.setScore,
          'dynamicData.period': match.period,
          'dynamicData.playedSeconds': match.playedSeconds,
          'dynamicData.lastUpdated': new Date(),
          updatedAt: new Date()
        },
        $push: {
          oddsHistory: {
            $each: [currentOddsSnapshot],
            $slice: -1000
          }
        }
      };

      return {
        updateOne: {
          filter: { eventId: match.eventId },
          update: updateDoc,
          upsert: true
        }
      };
    });

    if (bulkOps.length > 0) {
      await collection.bulkWrite(bulkOps);
    }
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}