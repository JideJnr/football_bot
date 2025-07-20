import { Request, Response } from 'express';

let botRunning = false;


export const startEngine = async (req: Request, res: Response) => {
  if (botRunning) {
    return res.status(200).json({
      success: false,
      status: 'BOT_ALREADY_RUNNING',
      message: 'Scraper is already running.'
    });
  }
};

export const stopEngine = async (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'MasterBot is already stopped.'
    });
  }
};

export const getAllBot = async (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'MasterBot is already stopped.'
    });
  }
};

export const startBotById = async (req: Request, res: Response) => {
  if (botRunning) {
    return res.status(200).json({
      success: false,
      status: 'BOT_ALREADY_RUNNING',
      message: 'Scraper is already running.'
    });
  }
};

export const stopBotById = async (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'MasterBot is already stopped.'
    });
  }
};

export const getStatusById = (_req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: botRunning ? 'Bot is running' : 'Bot is stopped',
    data: { running: botRunning }
  });
};

export const runBetBuilder = (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(400).json({
      success: false,
      message: 'Bot not running or predictions unavailable.',
    });
  }
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  
  });
};

export const postPrediction  = (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(400).json({
      success: false,
      message: 'Bot not running or predictions unavailable.',
    });
  }
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  
  });
};

export const getPredictionById  = (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(400).json({
      success: false,
      message: 'Bot not running or predictions unavailable.',
    });
  }
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  
  });
};
