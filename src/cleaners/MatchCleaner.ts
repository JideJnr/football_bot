import { CleanedMatch, RawMatchDetailed, RawMatchSummary } from "../type/types";
import { broadcastLog } from "../wsServer";


export interface IMatchCleaner {
  cleanSummary(raw: RawMatchSummary): CleanedMatch;
  cleanDetailed(raw: RawMatchDetailed): CleanedMatch;
}

export class MatchCleaner implements IMatchCleaner {
  constructor() {
    broadcastLog('🧹 ComprehensiveMatchCleaner initialized');
  }

  /**
   * Cleans summary match data from the listing endpoint
   * @param raw - Raw match summary data
   * @returns Cleaned match object
   */
  public cleanSummary(raw: RawMatchSummary): CleanedMatch {
    return {
      id: raw.eventId,
      home: raw.homeTeamName,
      away: raw.awayTeamName,
      tournament: raw.sport.category.tournament.name,
      status: raw.status,
      score: raw.setScore,
      period: raw.period,
      playedSeconds: raw.playedSeconds,
      startTime: raw.estimateStartTime,
      markets: this.processMarkets(raw.markets),
      isDetailed: false
    };
  }

  /**
   * Cleans detailed match data from the event endpoint
   * @param raw - Raw detailed match data
   * @returns Cleaned match object
   */
  public cleanDetailed(raw: RawMatchDetailed): CleanedMatch {
    return {
      id: raw.eventId,
      home: raw.homeTeamName,
      away: raw.awayTeamName,
      tournament: raw.sport.category.tournament.name,
      status: raw.status,
      score: raw.setScore,
      period: raw.period,
      playedSeconds: raw.playedSeconds,
      startTime: raw.estimateStartTime,
      markets: this.processMarkets(raw.markets),
      isDetailed: true,
      additionalData: {
        gameId: raw.gameId,
        matchStatus: raw.matchStatus,
        remainingTime: raw.remainingTimeInPeriod,
        venue: raw.fixtureVenue?.name || ''
      }
    };
  }

  /**
   * Processes markets array into structured format
   * @param markets - Array of market objects
   * @returns Structured markets object
   */
  private processMarkets(markets: any[]): CleanedMatch['markets'] {
    const processed: CleanedMatch['markets'] = {};
    
    markets.forEach(market => {
      const marketType = market.desc;
      const specifier = market.specifier || "main";
      
      if (!processed[marketType]) {
        processed[marketType] = {};
      }
      
      const outcomes: { [key: string]: number } = {};
      market.outcomes.forEach((outcome: any) => {
        if (outcome.isActive === 1) {
          outcomes[outcome.desc] = parseFloat(outcome.odds);
        }
      });
      
      processed[marketType][specifier] = {
        outcomes,
        lastUpdated: market.lastOddsChangeTime,
        status: market.status
      };
    });
    
    return processed;
  }
}