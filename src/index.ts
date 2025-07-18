import express from 'express';
import cors from 'cors';
import routes from './routes';
import { setupSwagger } from './swagger';
import { createServer } from 'http';
import { Server } from 'ws';
import setupWebSocket from './wsServer';

const app = express();
const server = createServer(app);

// Create WebSocket server
const wss = new Server({ server });
setupWebSocket(wss);

app.use(cors());
app.use(express.json());

// Routes
app.use('/', routes);

// Swagger setup
setupSwagger(app);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
  console.log(`WebSocket server running on ws://localhost:${PORT}`);
});s