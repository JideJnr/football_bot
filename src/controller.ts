import { Request, Response } from 'express';
import {
  startSportybetFootballBot,
  stopSportybetFootballBot,
  getSportybetFootballStatus,
} from './bots/sporty/index';
import { getTestStatus, startTestBot, stopTestBot } from './bots/test';
import { Bot, BotController } from './type/types';

const botControllerMap: Record<string, BotController> = {
  sportybet_football: {
    start: startSportybetFootballBot,
    stop: stopSportybetFootballBot,
    status: getSportybetFootballStatus,
  },
  test_bot: {
    start: startTestBot,
    stop: stopTestBot,
    status: getTestStatus,
  },
};

const bots: Bot[] = [
  { id: 'sportybet_football', name: 'sportybet_football', status: false },
  { id: 'test_bot', name: 'test_bot', status: false },
];

let engineStatus = false;

const findBotById = (id: string) => bots.find(bot => bot.id === id);

// START ENGINE
export const startEngine = async (req: Request, res: Response) => {
  if (engineStatus) {
    return res.status(200).json({
      success: false,
      status: 'ENGINE_ALREADY_RUNNING',
      message: 'Engine is already running.',
    });
  }

  const botResults = [];
  for (const bot of bots) {
    const controller = botControllerMap[bot.name];
    if (controller?.start) {
      try {
        const result = await controller.start();
        bot.status = result?.success ?? true;
        botResults.push({ id: bot.id, name: bot.name, ...result });
      } catch (err) {
        bot.status = false;
        botResults.push({ id: bot.id, name: bot.name, success: false, message: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
  }

  engineStatus = true;
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STARTED',
    message: 'Engine has started and bots launched.',
    bots: botResults,
  });
};

// STOP ENGINE
export const stopEngine = async (req: Request, res: Response) => {
  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine is not running.',
    });
  }

  const botResults = [];
  for (const bot of bots) {
    const controller = botControllerMap[bot.name];
    if (controller?.stop) {
      try {
        const result = await controller.stop();
        bot.status = result?.success === false ? true : false;
        botResults.push({ id: bot.id, name: bot.name, ...result });
      } catch (err) {
        botResults.push({ id: bot.id, name: bot.name, success: false, message: err instanceof Error ? err.message : 'Unknown error' });
      }
    }
  }

  engineStatus = false;
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STOPPED',
    message: 'Engine stopped and all bots shut down.',
    bots: botResults,
  });
};

// START BOT BY ID
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

  const controller = botControllerMap[bot.name];
  if (controller?.start) {
    const result = await controller.start();
    bot.status = result?.success ?? true;
  }

  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} started.`,
    data: bot,
  });
};

// STOP BOT BY ID
export const stopBotById = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      error: 'ENGINE_NOT_RUNNING',
      message: 'Engine must be running to stop a bot.',
    });
  }

  const bot = findBotById(id);
  if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
  if (!bot.status) return res.status(200).json({ success: false, message: 'Bot already stopped.' });

  const controller = botControllerMap[bot.name];
  if (controller?.stop) {
    const result = await controller.stop();
    bot.status = result?.success === false ? true : false;
  }

  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} stopped.`,
    data: bot,
  });
};

// GET ALL RUNNING BOTS
export const getAllBot = async (req: Request, res: Response) => {
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
    data: bots,
  });
};

// GET STATUS BY ID
export const getStatusById = (req: Request, res: Response) => {
  const { id } = req.body;

  const bot = findBotById(id);
  if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });

  const controller = botControllerMap[bot.name];
  if (controller?.status) {
    bot.status = controller.status();
  }

  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} is ${bot.status ? 'running' : 'not running'}.`,
    data: bot,
  });
};

// POST PREDICTION
export const postPrediction = (req: Request, res: Response) => {
  const { data } = req.body;

  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  console.log('Prediction received:', data);
  return res.status(200).json({
    success: true,
    message: 'Prediction received.',
  });
};

// GET PREDICTION BY BOT ID
export const getPredictionById = (req: Request, res: Response) => {
  const { id } = req.body;

  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  console.log(`Fetching prediction for bot: ${id}`);
  return res.status(200).json({
    success: true,
    message: 'Prediction fetched.',
    data: { id },
  });
};

// RUN BET BUILDER
export const runBetBuilder = (req: Request, res: Response) => {
  const { type } = req.body;

  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }

  console.log(`Bet builder type: ${type}`);
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  });
};
