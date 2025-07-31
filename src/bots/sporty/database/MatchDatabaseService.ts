import { MongoClient } from 'mongodb';

export class LiveMatchDatabaseService {
  private client: MongoClient;
  private dbName = 'sportybet';
  private collectionName = 'matches';

  constructor(connectionString: string) {
    this.client = new MongoClient(connectionString);
  }

  async connect() {
    await this.client.connect();
  }

  async saveMatches(cleanedMatches: CleanedMatch[]) {
    const db = this.client.db(this.dbName);
    const collection = db.collection(this.collectionName);

    const bulkOps = cleanedMatches.map(match => {
      // Extract static data
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

      // Prepare current odds snapshot
      const currentOddsSnapshot = {
        timestamp: new Date(),
        markets: Object.entries(match.markets).map(([marketType, marketData]) => ({
          marketType,
          outcomes: Object.values(marketData).flatMap(market => 
            market.outcomes.map(outcome => ({
              desc: outcome.desc,
              odds: parseFloat(outcome.odds),
              probability: parseFloat(outcome.probability),
              isActive: outcome.isActive === 1
            }))
          )
        })),
        scoreAtTime: match.setScore,
        matchStatusAtTime: match.matchStatus
      };

      return {
        updateOne: {
          filter: { eventId: match.eventId },
          update: {
            $setOnInsert: { 
              staticData,
              createdAt: new Date() 
            },
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
                $slice: -1000 // Keep last 1000 snapshots (adjust as needed)
              }
            }
          },
          upsert: true
        }
      };
    });

    await collection.bulkWrite(bulkOps);
  }

  async close() {
    await this.client.close();
  }
}