import { Request, Response } from 'express';

let engineStatus = false;

let bots = [
  {id: '001', name:'sportybet_football' , status : false},
  {id: '002', name:'sportybet_basketball' , status : false},
  {id: '003', name:'sportybet_tennis' , status : false},
]

export const startEngine = async (res: Response) => {

    if (engineStatus) {
      return res.status(200).json({
        success: false,
        status: 'ENGINE_ALREADY_RUNNING',
        message: 'Engine is already running.'
      });
    }

    return res.status(200).json({
      success: false,
      status: 'ENGINE_STARTED',
      message: 'Engine has started.'
    });

};

export const stopEngine = async ( res: Response) => {
  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'Engine is not running.'
    });
  }

  // stop all bot actions then return message to frontend 

      return res.status(200).json({
      success: false,
      status: 'ENGINE_STOPPED',
      message: 'Engine has stopped.'
    });
};

export const getAllBot = async (res: Response) => {
    return res.status(200).json({
      success: false,
      message: 'bot list fetched successfully.',
      data: bots
    });

};

export const startBotById = async (req: Request, res: Response) => {
  const {id} = req.body

  if (engineStatus ) {
    return res.status(200).json({
      success: false,
      status: 'BOT_NOT_RUNNING',
      message: 'engine is not running.'
    });
  }

    return res.status(200).json({
      success: true,
      status: 'BOT_LAUNCHED',
      message: 'Bot has started...'
    });


};

export const stopBotById = async (req: Request, res: Response) => {
  const {id} = req.body



  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'Engine is not running.'
    });
  }

    return res.status(200).json({
      success: true,
      status: 'BOT_SHUTDOWN',
      message: 'Bot has stop running...'
    });

};

export const getStatusById = (req: Request, res: Response) => {
  const {id} = req.body
  if (!engineStatus) {
    return res.status(200).json({
      success: false,
      error: 'BOT_NOT_RUNNING',
      message: 'Engine is not running.'
    });
  }

  return res.status(200).json({
    success: true,
    message: engineStatus ? 'Bot is active': 'bot is not active',
    data: { running: engineStatus }
  });


};

export const runBetBuilder = (req: Request, res: Response) => {
  const {type} = req.body
  if (!engineStatus) {
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
  const {data} = req.body
  if (!engineStatus) {
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
  const {id} = req.body

  if (!engineStatus) {
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
