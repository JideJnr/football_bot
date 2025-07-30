import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import {  getAllBots,getPredictionById,getStatusById,postPrediction, runBetBuilder, startBotById, startEngine, stopBotById, stopEngine } from './controller';
import setupWebSocket from './wsServer';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Setup WebSocket
setupWebSocket(wss);

// REST endpoints
app.post('/start', startEngine);
app.post('/stop', stopEngine);
app.get('/all', getAllBots);
app.get('/start/:id', startBotById)
app.get('/stop/:id', stopBotById)
app.post('/getStatus/id', getStatusById);
app.post('/betBuilder', runBetBuilder);
app.post('/prediction', postPrediction);
app.get('/prediction/id', getPredictionById);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Bot Service running on port ${PORT}`);
});