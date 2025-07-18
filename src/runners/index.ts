import { fetchTodayMatches, fetchLiveMatches } from './sportybet';
import { broadcastLog } from '../wsServer';

export class MatchScraper {
    private dailyInterval?: NodeJS.Timeout;
    private liveInterval?: NodeJS.Timeout;

    constructor() {
        this.startAllScrapers();
    }

    // Core Runner Logic
    private startAllScrapers() {
        broadcastLog('🚀 Starting all scrapers...');
        
        // 1. Daily Matches Pipeline
        this.scheduleDailyTask(async () => {
            try {
                broadcastLog('⏳ Fetching today matches...');
                const todayData = await fetchTodayMatches();
                broadcastLog(`✅ Today matches: ${todayData.length} events`);
            } catch (err) {
                broadcastLog(`⚠️ Today matches error: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
        });

        // 2. Live Matches Pipeline
        this.scheduleLiveTask(async () => {
            try {
                broadcastLog('🔴 Fetching live matches...');
                const liveData = await fetchLiveMatches();
                broadcastLog(`⚡ Live matches: ${liveData.length} events`);
            } catch (err) {
                broadcastLog(`⚠️ Live matches error: ${err instanceof Error ? err.message : 'Unknown'}`);
            }
        });
    }

    // Scheduler Utilities
    private scheduleDailyTask(task: () => Promise<void>) {
        // Immediate first run
        task();
        
        // Then schedule for midnight daily
        const scheduleNext = () => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const msUntilMidnight = midnight.getTime() - now.getTime();

            this.dailyInterval = setTimeout(() => {
                task();
                scheduleNext(); // Reschedule for next midnight
            }, msUntilMidnight);
        };

        scheduleNext();
        broadcastLog('⏰ Today matches scraper scheduled (daily at midnight)');
    }

    private scheduleLiveTask(task: () => Promise<void>) {
        // Immediate first run
        task();
        
        // Then every 3 minutes
        this.liveInterval = setInterval(task, 3 * 60 * 1000);
        broadcastLog('🔄 Live matches scraper started (every 3 minutes)');
    }

    public cleanup() {
        if (this.dailyInterval) {
            clearTimeout(this.dailyInterval);
            broadcastLog('🛑 Stopped daily matches scraper');
        }
        if (this.liveInterval) {
            clearInterval(this.liveInterval);
            broadcastLog('🛑 Stopped live matches scraper');
        }
    }
}

// Usage
const scraper = new MatchScraper();

// For graceful shutdown
process.on('SIGTERM', () => {
    scraper.cleanup();
    process.exit(0);
});