import { Request, Response } from 'express';
import { MasterBot } from './master/index'; // 

// State
let masterBot: MasterBot | null = null;
let botRunning = false;

// Bot lifecycle
export const startBot = async (req: Request, res: Response) => {
  if (botRunning) {
    return res.status(200).json({
      success: false,
      status: 'BOT_ALREADY_RUNNING',
      message: 'Scraper is already running.'
    });
  }

  try {
    masterBot = new MasterBot();
    await masterBot.start();
    
    botRunning = true;

    return res.status(200).json({
      success: true,
      status: 'BOT_STARTED',
      message: 'MasterBot started successfully.'
    });
  } catch (err) {
    botRunning = false;
    await masterBot?.stop();
    masterBot = null;

    const error = err instanceof Error ? err : new Error('Unknown startup failure');
    console.error('MASTERBOT_INIT_FAILURE:', error);

    return res.status(500).json({
      error: 'START_FAILURE',
      message: error.message
    });
  }
};

export const stopBot = async (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'MasterBot is already stopped.'
    });
  }

  try {
    await masterBot?.stop();
    masterBot = null;
    botRunning = false;

    return res.status(200).json({
      success: true,
      status: 'BOT_STOPPED',
      message: 'MasterBot stopped successfully.'
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Shutdown failure');
    console.error('MASTERBOT_STOP_FAILURE:', error);

    return res.status(500).json({
      error: 'STOP_FAILURE',
      message: error.message
    });
  }
};

export const getStatus = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: botRunning ? 'Bot is running' : 'Bot is stopped',
    data: { running: botRunning }
  });
};

export const betBuilder = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: botRunning ? 'Bot is running' : 'Bot is stopped',
    data: { running: botRunning }
  });
};

