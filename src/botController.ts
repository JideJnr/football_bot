import { Request, Response } from 'express';
import { broadcastLog, hasClients } from './wsServer';

let botRunning = false;

const mockBotProcess = async () => {
  while (botRunning && hasClients()) {
    const logMessage = `⚽ Bot is working... ${new Date().toISOString()}`;
    console.log(logMessage); // Log to server console
    broadcastLog(logMessage); // Send to frontend
    await new Promise((res) => setTimeout(res, 1000));
  }
};

export const startBot = (req: Request, res: Response) => {
  if (botRunning) {
    const message = 'Bot already running';
    broadcastLog(message);
    return res.status(400).json({
      success: false,
      data: null,
      message,
    });
  }

  botRunning = true;
  mockBotProcess();
  const message = 'Bot started';
  broadcastLog(message);

  return res.status(200).json({
    success: true,
    data: { status: 'running' },
    message,
  });
};

export const stopBot = (req: Request, res: Response) => {
  if (!botRunning) {
    const message = 'Bot not running';
    broadcastLog(message);
    return res.status(400).json({
      success: false,
      data: null,
      message,
    });
  }

  botRunning = false;
  const message = 'Bot stopped';
  broadcastLog(message);

  return res.status(200).json({
    success: true,
    data: { status: 'stopped' },
    message,
  });
};
