import { broadcastLog } from "../../../wsServer";



export class ComprehensiveMatchCleaner {
  constructor() {
    broadcastLog('🧹 ComprehensiveMatchCleaner initialized');
  }

  public async cleanAndSave(rawMatches: RawMatch[]): Promise<CleanedMatch[]> {
    const cleanedMatches = rawMatches.map(match => this.clean(match));
    broadcastLog(`✅ Cleaned ${cleanedMatches.length} matches`);
    return cleanedMatches;
  }

  public clean(raw: RawMatch): CleanedMatch {
    // Preserve all top-level match data
    const cleaned: CleanedMatch = {
      ...raw,
      markets: {}
    };

    // Process markets
    raw.markets.forEach(market => {
      const marketType = market.desc;
      const specifier = market.specifier || 'main';
      
      if (!cleaned.markets[marketType]) {
        cleaned.markets[marketType] = {};
      }

      // Create outcomes map for active outcomes
      const outcomesMap: { [desc: string]: Outcome } = {};
      market.outcomes.forEach(outcome => {
        if (outcome.isActive === 1) {
          outcomesMap[outcome.desc] = outcome;
        }
      });

      // Preserve all market data + add outcomes map
      cleaned.markets[marketType][specifier] = {
        ...market,
        outcomesMap
      };
    });

    broadcastLog(`✅ Cleaned match: ${raw.homeTeamName} vs ${raw.awayTeamName}`);
    return cleaned;
  }
}