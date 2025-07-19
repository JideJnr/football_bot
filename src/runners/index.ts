import { fetchTodayMatches, fetchLiveMatches } from './sportybet';
import { broadcastLog } from '../wsServer';

export class MatchScraper {
  private dailyTimeout?: NodeJS.Timeout;
  private liveInterval?: NodeJS.Timeout;

  constructor() {
    this.startScrapers();
  }

  private startScrapers() {
    broadcastLog('🚀 Bot started. Initializing scrapers...');

    // Scrape today matches now + schedule for midnight daily
    this.scheduleDailyScrape();

    // Scrape live matches now + every 5 minutes
    this.scheduleLiveScrape();
  }

  private scheduleDailyScrape() {
    const task = async () => {
      try {
        broadcastLog('⏳ Fetching today matches...');
        const todayData = await fetchTodayMatches();
        broadcastLog(`✅ Today matches: ${todayData.length} events`);
      } catch (err) {
        broadcastLog(`⚠️ Today matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    task(); // Immediate run

    const scheduleNext = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const delay = midnight.getTime() - now.getTime();

      this.dailyTimeout = setTimeout(async () => {
        await task();
        scheduleNext(); // Schedule next midnight
      }, delay);
    };

    scheduleNext();
    broadcastLog('📅 Today matches scraper scheduled for midnight');
  }

  private scheduleLiveScrape() {
    const task = async () => {
      try {
        broadcastLog('🔴 Fetching live matches...');
        const liveData = await fetchLiveMatches();
        broadcastLog(`⚡ Live matches: ${liveData.length} events`);
      } catch (err) {
        broadcastLog(`⚠️ Live matches error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    task(); // Immediate run

    this.liveInterval = setInterval(task, 5 * 60 * 1000); // Every 5 minutes
    broadcastLog('🔁 Live matches scraper set to run every 5 minutes');
  }

  public async cleanup() {
    if (this.dailyTimeout) {
      clearTimeout(this.dailyTimeout);
      broadcastLog('🛑 Daily scraper stopped');
    }

    if (this.liveInterval) {
      clearInterval(this.liveInterval);
      broadcastLog('🛑 Live scraper stopped');
    }
  }
}
