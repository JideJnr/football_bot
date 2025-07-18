import { fetchLiveMatches, fetchTodayMatches } from '../runners/sportybet';
import { broadcastLog } from '../wsServer';

// Bot State Core
let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;
const SCRAPE_INTERVAL = 15000; // 15 seconds

// Main Bot Engine
const runScrapingCycle = async (isLive: boolean = true) => {
  if (!isRunning) return;
  
  try {
    broadcastLog(`🔄 Scraping ${isLive ? 'LIVE' : 'PREMATCH'} matches...`);
    
    const matches = isLive ? await fetchLiveMatches() : await fetchTodayMatches();
    
    // Process data (add your business logic here)
    broadcastLog(`✅ Got ${matches.length} matches`);
    console.log('Sample match:', matches[0]); // Debug
    
    // Forward to your DB/API if needed
    // await sendToDatabase(matches);
    
  } catch (err) {
    broadcastLog(`⚠️ Scrape failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
};

// Control Functions
export const startBot = async (scrapeLive: boolean = true) => {
  if (isRunning) {
    broadcastLog('⚠️ Bot already running');
    return false;
  }

  isRunning = true;
  broadcastLog('🚀 Starting GodScraper bot...');
  
  // Immediate first run
  await runScrapingCycle(scrapeLive); 
  
  // Set up interval
  intervalId = setInterval(() => runScrapingCycle(scrapeLive), SCRAPE_INTERVAL);
  return true;
};

export const stopBot = () => {
  if (!isRunning || !intervalId) {
    broadcastLog('⚠️ Bot not running');
    return false;
  }

  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
  broadcastLog('🛑 Bot stopped');
  return true;
};

// Health Check
export const botStatus = () => ({
  isRunning,
  lastActivity: new Date().toISOString()
});