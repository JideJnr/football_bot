import { Request, Response } from 'express';
import { broadcastLog, hasClients } from './wsServer';

let botRunning = false;

const mockBotProcess = async () => {
  while (botRunning && hasClients()) {
    broadcastLog(`⚽ Bot is working... ${new Date().toISOString()}`);
    await new Promise((res) => setTimeout(res, 1000));
  }
};

export const startBot = (req: Request, res: Response) => {
  if (botRunning) {
    return res.status(400).json({ message: 'Bot already running' });
  }
  botRunning = true;
  mockBotProcess();
  res.json({ message: 'Bot started' });
};

export const stopBot = (req: Request, res: Response) => {
  if (!botRunning) {
    return res.status(400).json({ message: 'Bot not running' });
  }
  botRunning = false;
  res.json({ message: 'Bot stopped' });
};
