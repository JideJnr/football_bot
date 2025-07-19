import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { getStatus, startBot, stopBot } from './botController';
import setupWebSocket from './wsServer';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Setup WebSocket
setupWebSocket(wss);

// REST endpoints
app.post('/start', startBot);
app.post('/stop', stopBot);
app.post('/getStatus', getStatus);

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Bot Service running on port ${PORT}`);
});