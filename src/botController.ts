import { Request, Response } from 'express';
import { broadcastLog } from './wsServer';
import { MatchScraper } from './runners/index';  


let scraper: MatchScraper | null = null;
let botRunning = false;

export const startBot = async (req: Request, res: Response) => {
  if (botRunning) {
    const message = 'Bot already running';
    broadcastLog(message);
    return res.status(400).json({ success: false, message });
  }

  try {
    const scrapeLive = req.body.mode === 'live';
    botRunning = true;
    
    broadcastLog(`🚀 Starting ${scrapeLive ? 'LIVE' : 'PREMATCH'} scraping...`);
    
    scraper = new MatchScraper();
    
    return res.status(200).json({
      success: true,
      data: { 
        status: 'running',
        mode: scrapeLive ? 'live' : 'prematch',
        // Add any initial scrape metrics here
      },
      message: 'Scraper started'
    });
    
  } catch (err) {
    botRunning = false;
    scraper?.cleanup();
    scraper = null;
    broadcastLog(`💥 Failed to start: ${err instanceof Error ? err.message : 'Unknown error'}`);
    return res.status(500).json({ success: false, message: 'Startup failed' });
  }
};

export const stopBot = (req: Request, res: Response) => {
  if (!botRunning || !scraper) {
    const message = 'Bot not running';
    broadcastLog(message);
    return res.status(400).json({ success: false, message });
  }

  try {
    scraper.cleanup();
    scraper = null;
    botRunning = false;
    broadcastLog('🛑 Scraper stopped');
    
    return res.status(200).json({
      success: true,
      data: { status: 'stopped' },
      message: 'Scraper stopped'
    });
    
  } catch (err) {
    broadcastLog(`⚠️ Stop error: ${err instanceof Error ? err.message : 'Unknown'}`);
    return res.status(500).json({ success: false, message: 'Stop failed' });
  }
};

// Add this to your server shutdown logic
process.on('SIGTERM', () => {
  if (scraper) {
    scraper.cleanup();
    broadcastLog('🔌 Graceful shutdown complete');
  }
});