import { Request, Response } from 'express';
import {
  startSportybetFootballBot,
  stopSportybetFootballBot,
  getSportybetFootballStatus,
} from './bots/sporty/index';

// ================ Configuration ================
const BOT_CONTROLLERS: Record<string, BotController> = {
  sportybet_football: {
    start: startSportybetFootballBot,
    stop: stopSportybetFootballBot,
    status: getSportybetFootballStatus,
  }
};

const BOTS: Bot[] = [
  { id: 'sportybet_football', name: 'sportybet_football', status: false },
  { id: 'test_bot', name: 'test_bot', status: false },
];

// ================ State Management ================
let engineStatus = false;

// ================ Helper Functions ================
const findBotById = (id: string) => BOTS.find(bot => bot.id === id);

const handleBotOperation = async (
  bot: Bot,
  operation: 'start' | 'stop' | 'status'
) => {
  const controller = BOT_CONTROLLERS[bot.name];
  if (!controller?.[operation]) return null;

  try {
    const result = await (controller[operation] as Function)();
    return result;
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

const updateBotStatus = (bot: Bot, result: any, operation: 'start' | 'stop') => {
  if (operation === 'start') {
    bot.status = result?.success ?? true;
  } else if (operation === 'stop') {
    bot.status = !(result?.success ?? true);
  }
};

// ================ Engine Operations ================
export const startEngine = async (req: Request, res: Response) => {
  if (engineStatus) {
    return res.status(200).json({
      success: false,
      status: 'ENGINE_ALREADY_RUNNING',
      message: 'Engine is already running.',
    });
  }

  const botResults = [];
  for (const bot of BOTS) {
    const result = await handleBotOperation(bot, 'start');
    updateBotStatus(bot, result, 'start');
    botResults.push({ id: bot.id, name: bot.name, ...result });
  }

  engineStatus = true;
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STARTED',
    message: 'Engine has started and bots launched.',
    bots: botResults,
  });
};

export const stopEngine = async (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine is not running.',
    });
  }

  const botResults = [];
  for (const bot of BOTS) {
    const result = await handleBotOperation(bot, 'stop');
    updateBotStatus(bot, result, 'stop');
    botResults.push({ id: bot.id, name: bot.name, ...result });
  }

  engineStatus = false;
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STOPPED',
    message: 'Engine stopped and all bots shut down.',
    bots: botResults,
  });
};

// ================ Bot Operations ================
export const startBotById = async (req: Request, res: Response) => {
  const { id } = req.body;
  
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine must be running to start a bot.',
    });
  }

  const bot = findBotById(id);
  if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
  if (bot.status) return res.status(200).json({ success: false, message: 'Bot is already running.' });

  const result = await handleBotOperation(bot, 'start');
  updateBotStatus(bot, result, 'start');

  return res.status(200).json({
    success: result?.success ?? true,
    message: result?.message || `Bot  started.`,
    data: bot,
  });
};

export const stopBotById = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine must be running to stop a bot.',
    });
  }

  const bot = findBotById(id);
  if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
  if (!bot.status) return res.status(200).json({ success: false, message: 'Bot already stopped.' });

  const result = await handleBotOperation(bot, 'stop');
  updateBotStatus(bot, result, 'stop');

  return res.status(200).json({
    success: result?.success ?? true,
    message: result?.message || `Bot stopped.`,
    data: bot,
  });
};

// ================ Status Operations ================
export const getAllBots = async (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine must be running to view bots.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Running bots fetched.',
    data: BOTS,
  });
};

export const getStatusById = async (req: Request, res: Response) => {
  const { id } = req.body;

  const bot = findBotById(id);
  if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });

  const result = await handleBotOperation(bot, 'status');
  const isRunning = result?.success ?? bot.status;
  
  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} is ${isRunning ? 'running' : 'not running'}.`,
    data: { ...bot, status: isRunning },
  });
};

// ================ Prediction Operations ================
export const postPrediction = (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  const { data } = req.body;
  console.log('Prediction received:', data);
  
  return res.status(200).json({
    success: true,
    message: 'Prediction received.',
  });
};

export const getPredictionById = (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  const { id } = req.body;
  console.log(`Fetching prediction for bot: ${id}`);
  
  return res.status(200).json({
    success: true,
    message: 'Prediction fetched.',
    data: { id },
  });
};

export const runBetBuilder = (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  const { type } = req.body;
  console.log(`Bet builder type: ${type}`);
  
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  });
};