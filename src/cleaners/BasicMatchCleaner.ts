import { broadcastLog } from '../wsServer';
import { RawMatch, CleanedMatch, MatchData } from '../type/types';
import { IMatchCleaner } from '../type/types';  

export class BasicMatchCleaner implements IMatchCleaner {
  constructor() {
    broadcastLog('🧹 BasicMatchCleaner initialized');
  }

  public async cleanAndSave(rawMatches: RawMatch[]): Promise<CleanedMatch[]> {
    const cleanedMatches: CleanedMatch[] = rawMatches.map((match: RawMatch) => 
      this.clean(match)
    );

    broadcastLog(`✅ BasicMatchCleaner cleaned ${cleanedMatches.length} matches`);

    return cleanedMatches;
  }

  /**
   * Clean a single RawMatch into a CleanedMatch
   */
  public clean(raw: RawMatch): CleanedMatch {
    const cleanMatch: CleanedMatch = {
      id: raw.id,
      home: raw.homeTeam,
      away: raw.awayTeam,
      odds: [raw.odds.home, raw.odds.draw, raw.odds.away],
    };
    broadcastLog(`✅ Cleaned match: ${cleanMatch.home} vs ${cleanMatch.away}`);
    return cleanMatch;
  }
}
