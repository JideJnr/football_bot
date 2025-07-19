import { Request, Response } from 'express';
import { broadcastLog } from './wsServer';
import { MatchScraper } from './runners/index';

// State
let scraper: MatchScraper | null = null;
let botRunning = false;

// Bot lifecycle
export const startBot = async (req: Request, res: Response) => {
  if (botRunning) {
    return res.status(409).json({
      error: 'BOT_ALREADY_RUNNING',
      message: 'Scraper is already running.'
    });
  }

  try {
    scraper = new MatchScraper(); // this kicks off all scraping logic
    botRunning = true;

    return res.status(200).json({
      status: 'BOT_STARTED',
      message: 'Scraper bot is running.'
    });
  } catch (err) {
    botRunning = false;
    await scraper?.cleanup();
    scraper = null;

    const error = err instanceof Error ? err : new Error('Unknown startup failure');
    console.error('SCRAPER_INIT_FAILURE:', error);

    return res.status(500).json({
      error: 'START_FAILURE',
      message: error.message
    });
  }
};

export const stopBot = async (req: Request, res: Response) => {
  if (!botRunning || !scraper) {
    return res.status(410).json({
      error: 'BOT_NOT_RUNNING',
      message: 'Scraper bot is already stopped.'
    });
  }

  try {
    await scraper.cleanup();
    scraper = null;
    botRunning = false;

    return res.status(200).json({
      status: 'BOT_STOPPED',
      message: 'Scraper bot has been stopped.'
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Shutdown failure');
    console.error('STOP_FAILURE:', error);

    return res.status(500).json({
      error: 'STOP_FAILURE',
      message: error.message
    });
  }
};

export const getStatus = async (req: Request, res: Response) => {
  try {
    if (!botRunning) {
      return res.status(200).json({
        success: true,
        message: 'Bot is stopped',
        data: {
          running: false
        }
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Bot is running',
      data: {
        running: true
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get bot status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};