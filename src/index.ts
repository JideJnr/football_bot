import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import {
  checkEngineStatus,
  getAllBots,
  getPredictionById,
  getStatusById,
  postPrediction,
  runBetBuilder,
  startBotById,
  startEngine,
  stopBotById,
  stopEngine
} from './controller';
import setupWebSocket from './wsServer';
import { LiveMatchWorker } from './bots/sporty/workers/EnhancedLiveMatchWorker';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const worker = new LiveMatchWorker(process.env.MONGO_URI!);

// Setup WebSocket
setupWebSocket(wss);

// REST endpoints

// Engine-level start/stop - POST for actions
app.post('/start', startEngine);
app.post('/stop', stopEngine);

// Get all bots - GET
app.get('/all', getAllBots);

// Bot status - GET (use one route only)
app.get('/status', checkEngineStatus);

// Starting and stopping bots - POST (state changes)
app.post('/start/:id', startBotById);
app.post('/stop/:id', stopBotById);

app.get('/status/:id', getStatusById);

// Run bet builder - POST (action)
app.post('/betBuilder', runBetBuilder);

// Prediction - POST to create, GET with param to retrieve
app.post('/prediction', postPrediction);
app.get('/prediction/:id', getPredictionById);

// Start worker
worker.start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Bot Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.stop();
  process.exit(0);
});
