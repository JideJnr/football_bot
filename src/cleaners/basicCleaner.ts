import { broadcastLog } from "../wsServer";

// Updated type definitions
export interface RawMatch {
  eventId: string;
  homeTeamName: string;
  awayTeamName: string;
  status: number;
  setScore: string;
  gameScore: string[];
  period: string;
  matchStatus: string;
  playedSeconds: string;
  estimateStartTime: number;
  markets: Market[];
  sport: {
    category: {
      tournament: {
        name: string;
      };
    };
  };
  // ... other fields from the endpoint
}

export interface Market {
  id: string;
  desc: string;
  specifier?: string;
  outcomes: Outcome[];
  lastOddsChangeTime: number;
  status: number;
}

export interface Outcome {
  id: string;
  desc: string;
  odds: string;
  isActive: number;
}

export interface CleanedMatch {
  id: string;
  home: string;
  away: string;
  tournament: string;
  status: number;
  score: string;
  period: string;
  playedSeconds: string;
  startTime: number;
  markets: {
    [marketType: string]: {
      [specifier: string]: {
        outcomes: { [outcome: string]: number };
        lastUpdated: number;
        status: number;
      };
    };
  };
}

export interface IMatchCleaner {
  cleanAndSave(rawMatches: RawMatch[]): Promise<CleanedMatch[]>;
  clean(raw: RawMatch): CleanedMatch;
}

export class BasicMatchCleaner implements IMatchCleaner {
  constructor() {
    broadcastLog('🧹 ComprehensiveMatchCleaner initialized');
  }

  public async cleanAndSave(rawMatches: RawMatch[]): Promise<CleanedMatch[]> {
    const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) => 
      this.clean(match)
    );

    broadcastLog(`✅ ComprehensiveMatchCleaner cleaned ${cleanedMatches.length} matches`);
    return cleanedMatches;
  }

  public clean(raw: RawMatch): CleanedMatch {
    const cleaned: CleanedMatch = {
      id: raw.eventId,
      home: raw.homeTeamName,
      away: raw.awayTeamName,
      tournament: raw.sport.category.tournament.name,
      status: raw.status,
      score: raw.setScore,
      period: raw.period,
      playedSeconds: raw.playedSeconds,
      startTime: raw.estimateStartTime,
      markets: {},
      
    };

    // Process all markets
    raw.markets.forEach(market => {
      const marketType = market.desc;
      const specifier = market.specifier || "main";
      
      if (!cleaned.markets[marketType]) {
        cleaned.markets[marketType] = {};
      }
      
      const outcomes: { [key: string]: number } = {};
      market.outcomes.forEach(outcome => {
        if (outcome.isActive === 1) {
          outcomes[outcome.desc] = parseFloat(outcome.odds);
        }
      });
      
      cleaned.markets[marketType][specifier] = {
        outcomes,
        lastUpdated: market.lastOddsChangeTime,
        status: market.status
      };
    });

    broadcastLog(`✅ Cleaned match: ${cleaned.home} vs ${cleaned.away}`);
    return cleaned;
  }
}