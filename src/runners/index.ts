// src/runners/MatchScraper.ts
import { fetchTodayMatches, fetchLiveMatches } from './sportybet';
import { broadcastLog } from '../wsServer';
import { BasicMatchCleaner } from '../cleaners/BasicMatchCleaner';


export class MatchScraper {
  private dailyTimeout?: NodeJS.Timeout;
  private liveInterval?: NodeJS.Timeout;
  private todayMatches: any[] = [];
  private liveMatches: any[] = [];
  private cleaner: BasicMatchCleaner;
  private onDataCleaned?: (data: any, type: 'today' | 'live') => void;

  constructor(onDataCleaned?: (data: any, type: 'today' | 'live') => void) {
    this.cleaner = new BasicMatchCleaner();
    this.onDataCleaned = onDataCleaned;
    this.startScrapers();
    broadcastLog('🔧 MatchScraper initialized with built-in cleaner');
  }

  private startScrapers() {
    broadcastLog('🚀 Starting scrapers...');
    this.scheduleDailyScrape();
    this.scheduleLiveScrape();
  }

  private async processMatches(rawData: any[], type: 'today' | 'live'): Promise<any[]> {
    try {
      const cleanedData = await this.cleaner.cleanAndSave(rawData);
      broadcastLog(`🧼 Cleaned ${type} matches (${cleanedData.length} items)`);
      
      // Store cleaned data internally
      if (type === 'today') this.todayMatches = cleanedData;
      if (type === 'live') this.liveMatches = cleanedData;
      
      // Notify MasterBot if callback exists
      if (this.onDataCleaned) {
        this.onDataCleaned(cleanedData, type);
      }
      
      return cleanedData;
    } catch (err) {
      broadcastLog(`⚠️ Cleaning error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }

  private scheduleDailyScrape() {
    const task = async () => {
      try {
        broadcastLog('⏳ Fetching today matches...');
        const rawData = await fetchTodayMatches();
        await this.processMatches(rawData, 'today');
        broadcastLog(`✅ Today matches processed: ${this.todayMatches.length} events`);
      } catch (err) {
        this.todayMatches = [];
        broadcastLog(`⚠️ Today matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    // Immediate first run
    task();

    // Schedule recurring midnight runs
    const scheduleNext = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const delay = midnight.getTime() - now.getTime();

      this.dailyTimeout = setTimeout(async () => {
        await task();
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    broadcastLog('📅 Today matches scraper scheduled for daily midnight runs');
  }

  private scheduleLiveScrape() {
    const task = async () => {
      try {
        broadcastLog('🔴 Fetching live matches...');
        const rawData = await fetchLiveMatches();
        await this.processMatches(rawData, 'live');
        broadcastLog(`⚡ Live matches processed: ${this.liveMatches.length} events`);
      } catch (err) {
        this.liveMatches = [];
        broadcastLog(`⚠️ Live matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    // Immediate first run
    task();

    // Schedule recurring every 5 minutes
    this.liveInterval = setInterval(task, 5 * 60 * 1000);
    broadcastLog('🔁 Live matches scraper running every 5 minutes');
  }

  // Data access methods
  public getTodayMatches(): any[] {
    return this.todayMatches;
  }

  public getLiveMatches(): any[] {
    return this.liveMatches;
  }

  public async cleanup() {
    if (this.dailyTimeout) {
      clearTimeout(this.dailyTimeout);
      broadcastLog('🛑 Stopped daily scraper');
    }

    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      broadcastLog('🛑 Stopped live scraper');
    }
  }
}