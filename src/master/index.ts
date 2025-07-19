import { broadcastLog } from '../wsServer';
import { MatchScraper } from '../runners/index';
import { CleanedMatch, AnalyzedMatch } from '../type/types';

export class MasterBot {
  private scraper?: MatchScraper;
  private isRunning: boolean = false;

  constructor() {
    broadcastLog('⚙️ MasterBot initialized (Data Receiver Mode)');
  }

  public async start() {
    if (this.isRunning) throw new Error('Already running');
    this.scraper = new MatchScraper((cleanedData, type) => {
      this.handleCleanedData(cleanedData, type);
    });
    this.isRunning = true;
    broadcastLog('🟢 MasterBot started (Receiving cleaned data)');
  }

  public async analyze(cleanedMatches: CleanedMatch[]): Promise<AnalyzedMatch[]> {
    broadcastLog(`🔍 MasterBot analyzing ${cleanedMatches.length} matches`);
    return cleanedMatches.map(match => ({
      home: match.home,
      away: match.away,
      strengthRating: 0,
      id: 'A',
      odds: 3.45
    }));
  }

  private handleCleanedData(cleanedData: any, type: 'today' | 'live') {
    broadcastLog(`📥 Received ${type} data (${cleanedData.length} items)`);
    // Additional processing can be added here.
  }

  public async stop() {
    await this.scraper?.cleanup();
    this.isRunning = false;
    broadcastLog('🔴 MasterBot stopped');
  }
}
