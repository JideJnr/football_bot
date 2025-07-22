import { Request, Response } from 'express';
import {
  startSportybetFootballBot,
  stopSportybetFootballBot,
  getSportybetFootballStatus,
} from './bots/sporty/index';
import { getTestStatus, startTestBot, stopTestBot } from './bots/test';

// Bot and controller types
interface Bot {
  id: string;
  name: keyof typeof botControllerMap;
  status: boolean;
}

interface BotController {
  start: () => Promise<void>;
  stop: () => void;
  status: () => boolean;
}

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
  { id: 'bot_test', name: 'bot_test', status: false },
];

let engineStatus = false;

const findBotById = (id: string) => bots.find(bot => bot.id === id);

export const startEngine = async (res: Response) => {
  if (engineStatus) {
    return res.status(200).json({
      success: false,
      status: 'ENGINE_ALREADY_RUNNING',
      message: 'Engine is already running.',
    });
  }
  engineStatus = true;
  for (const bot of bots) {
    const controller = botControllerMap[bot.name];
    if (controller?.start) {
      await controller.start();
      bot.status = true;
    }
  }
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STARTED',
    message: 'Engine has started and all bots are running.',
    bots,
  });
};

export const stopEngine = async (res: Response) => {
  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      error: 'ENGINE_NOT_RUNNING',
      message: 'Engine is not running.',
    });
  }
  for (const bot of bots) {
    const controller = botControllerMap[bot.name];
    if (controller?.stop) {
      await controller.stop();
      bot.status = false;
    }
  }
  engineStatus = false;
  return res.status(200).json({
    success: true,
    status: 'ENGINE_STOPPED',
    message: 'Engine has stopped and all bots are shut down.',
    bots,
  });
};

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
  if (!bot) {
    return res.status(404).json({ success: false, message: 'Bot not found.' });
  }
  if (bot.status) {
    return res.status(200).json({ success: false, message: 'Bot is already running.' });
  }
  const controller = botControllerMap[bot.name];
  if (controller?.start) {
    await controller.start();
    bot.status = true;
  }
  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} has been started.`,
    data: bot,
  });
};

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
  if (!bot) {
    return res.status(404).json({ success: false, message: 'Bot not found.' });
  }
  if (!bot.status) {
    return res.status(200).json({ success: false, message: 'Bot is already stopped.' });
  }
  const controller = botControllerMap[bot.name];
  if (controller?.stop) {
    await controller.stop();
    bot.status = false;
  }
  return res.status(200).json({
    success: true,
    message: `Bot ${bot.name} has been stopped.`,
    data: bot,
  });
};

export const getAllBot = async ( res: Response) => {
  
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      status: 'ENGINE_NOT_RUNNING',
      message: 'Engine must be running to start a bot.',
    });
  }

 
  return res.status(200).json({
    success: true,
    message: `Bot list fetched has been started.`,
    data: bots,
  });
};

export const getStatusById = (req: Request, res: Response) => {
  const { id } = req.body;
  const bot = findBotById(id);
  if (!bot) {
    return res.status(404).json({ success: false, message: 'Bot not found.' });
  }
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

export const runBetBuilder = (req: Request, res: Response) => {
  const { type } = req.body;
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }
  // TODO: Implement bet builder logic
  console.log(`Bet builder type: ${type}`);
  return res.status(200).json({
    success: true,
    message: 'Bet slip generated.',
  });
};

export const postPrediction = (req: Request, res: Response) => {
  const { data } = req.body;
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }
  // TODO: Implement prediction logic
  console.log('Received prediction:', data);
  return res.status(200).json({
    success: true,
    message: 'Prediction received.',
  });
};

export const getPredictionById = (req: Request, res: Response) => {
  const { id } = req.body;
  if (!engineStatus) {
    return res.status(400).json({
      success: false,
      message: 'Engine is not running.',
    });
  }
  // TODO: Fetch prediction by ID
  console.log(`Fetching prediction for bot: ${id}`);
  return res.status(200).json({
    success: true,
    message: 'Prediction fetched.',
    data: { id }, // Replace with real prediction data
  });
};
