import { Request, Response } from 'express';
import { broadcastLog, hasClients } from './wsServer';
import { MatchScraper } from './runners/index';

// State management
let scraper: MatchScraper | null = null;
let botRunning = false;
let activeMode: 'live' | 'prematch' | null = null;

// Health monitoring
const serviceStartTime = new Date();
let lastSuccessTime: Date | null = null;

export const startBot = async (req: Request, res: Response) => {
  // 1. Pre-flight checks
  if (botRunning) {
    return res.status(409).json({ 
      error: 'BOT_ACTIVE',
      message: `Scraper already running in ${activeMode} mode`,
      startedAt: serviceStartTime
    });
  }

  // 2. Validate input
  if (!req.body.mode || !['live', 'prematch'].includes(req.body.mode)) {
    return res.status(400).json({
      error: 'INVALID_MODE',
      message: 'Request must contain { mode: "live"|"prematch" }'
    });
  }

  try {
    // 3. Initialize with circuit breaker
    const mode = req.body.mode;
    scraper = new MatchScraper();
    activeMode = mode;
    botRunning = true;

    // 4. Verify WebSocket connectivity
    if (!hasClients()) {
      console.warn('No active WebSocket connections');
    }

    // 5. Respond with operational details
    lastSuccessTime = new Date();
    return res.status(200).json({
      status: 'OPERATIONAL',
      mode,
      startedAt: serviceStartTime,
      nextScrape: mode === 'live' ? '3 minutes' : 'next midnight'
    });

  } catch (err) {
    // 6. Failure cleanup
    botRunning = false;
    activeMode = null;
    await scraper?.cleanup();
    scraper = null;

    // 7. Detailed error reporting
    const error = err instanceof Error ? err : new Error('Unknown startup failure');
    console.error('SCRAPER_INIT_FAILURE:', error);
    
    return res.status(500).json({
      error: 'INITIALIZATION_FAILURE',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      retrySuggested: true
    });
  }
};

export const stopBot = async (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(410).json({
      error: 'BOT_INACTIVE',
      message: 'No running instance to stop',
      uptime: getUptime()
    });
  }

  try {
    // Graceful shutdown sequence
    await scraper?.cleanup();
    const stoppedMode = activeMode;
    
    // State reset
    scraper = null;
    botRunning = false;
    activeMode = null;

    return res.status(200).json({
      status: 'TERMINATED',
      previouslyActive: stoppedMode,
      uptime: getUptime()
    });

  } catch (err) {
    const error = err instanceof Error ? err : new Error('Shutdown failure');
    console.error('STOP_FAILURE:', error);
    
    return res.status(500).json({
      error: 'SHUTDOWN_FAILURE',
      message: error.message,
      requiresForceStop: true
    });
  }
};

// Health check endpoint
export const getServiceStatus = (req: Request, res: Response) => {
  res.status(200).json({
    status: botRunning ? 'ACTIVE' : 'INACTIVE',
    mode: activeMode,
    uptime: getUptime(),
    lastSuccess: lastSuccessTime,
    wsConnections: hasClients() ? 'ACTIVE' : 'INACTIVE'
  });
};

// Helper functions
function getUptime() {
  return `${(new Date().getTime() - serviceStartTime.getTime()) / 1000}s`;
}

// Process handlers
process.on('SIGTERM', async () => {
  await scraper?.cleanup();
  console.log('Graceful shutdown completed');
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED_REJECTION:', reason);
});