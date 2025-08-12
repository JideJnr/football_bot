import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import {
  checkEngineStatus,
  getAllBots,
  getStatusById,
  startBotById,
  startEngine,
  stopBotById,
  stopEngine
} from './controller';
import setupWebSocket from './wsServer';
import { LiveMatchWorker } from './workers/EnhancedLiveMatchWorker';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { addLog } from './util/logger';

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const worker = new LiveMatchWorker(process.env.MONGO_URI!);

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bot Service API',
      version: '1.0.0',
      description: 'API for managing betting bots and engine operations',
    },
    components: {
      schemas: {
        Bot: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'sportybet_football',
            },
            name: {
              type: 'string',
              example: 'sportybet_football',
            },
            status: {
              type: 'boolean',
              example: true,
            },
          },
        },
        ActivityEvent: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            time: {
              type: 'string',
              example: '2 min ago',
            },
            event: {
              type: 'string',
              example: 'Bet placed on Match X',
            },
            odds: {
              type: 'number',
              nullable: true,
              example: 3.5,
            },
            status: {
              type: 'string',
              example: 'pending',
            },
          },
        },
        EngineOperationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            status: {
              type: 'string',
              example: 'ENGINE_STARTED',
            },
            message: {
              type: 'string',
              example: 'Engine has started and bots launched',
            },
            bots: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/BotOperationResult',
              },
            },
          },
        },
        BotOperationResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
              example: 'Bot started',
            },
            data: {
              $ref: '#/components/schemas/Bot',
            },
          },
        },
        BotStatusResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
              example: 'Bot sportybet_football is running',
            },
            data: {
              $ref: '#/components/schemas/Bot',
            },
          },
        },
        BotListResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
              example: 'Running bots fetched',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Bot',
              },
            },
          },
        },
        EngineStatusResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            status: {
              type: 'string',
              example: 'ENGINE_RUNNING',
            },
            message: {
              type: 'string',
              example: 'Engine is running',
            },
            data: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: 'FOOTBALL_ENGINE',
                },
                name: {
                  type: 'string',
                  example: 'Football Engine',
                },
                status: {
                  type: 'string',
                  example: 'running',
                },
                totalBots: {
                  type: 'integer',
                  example: 1,
                },
                activeBots: {
                  type: 'integer',
                  example: 1,
                },
                winRate: {
                  type: 'number',
                  example: 75,
                },
                profit: {
                  type: 'number',
                  example: 24.5,
                },
                roi: {
                  type: 'number',
                  example: 17,
                },
                uptime: {
                  type: 'string',
                  example: '2h 15m',
                },
                cpuUsage: {
                  type: 'number',
                  example: 32,
                },
                memoryUsage: {
                  type: 'number',
                  example: 1.2,
                },
                memoryTotal: {
                  type: 'number',
                  example: 4,
                },
                bots: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Bot',
                  },
                },
                activity: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/ActivityEvent',
                  },
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Engine not running',
            },
            status: {
              type: 'string',
              example: 'ENGINE_NOT_RUNNING',
            },
          },
        },
        BotOperationResult: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'sportybet_football',
            },
            name: {
              type: 'string',
              example: 'sportybet_football',
            },
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
              example: 'Bot started successfully',
            },
          },
        },
      },
      responses: {
        ServerError: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
            },
          },
        },
      },
    },
    paths: {
      '/start': {
        post: {
          summary: 'Start the engine and all bots',
          operationId: 'startEngine',
          responses: {
            '200': {
              description: 'Engine start response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EngineOperationResponse',
                  },
                },
              },
            },
            '500': {
              description: 'Server error',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/stop': {
        post: {
          summary: 'Stop the engine and all bots',
          operationId: 'stopEngine',
          responses: {
            '200': {
              description: 'Engine stop response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EngineOperationResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
      '/all': {
        get: {
          summary: 'Get all bots information',
          operationId: 'getAllBots',
          responses: {
            '200': {
              description: 'List of all bots',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BotListResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
      '/status': {
        get: {
          summary: 'Check engine status',
          operationId: 'checkEngineStatus',
          responses: {
            '200': {
              description: 'Engine status information',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/EngineStatusResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
      '/start/{id}': {
        post: {
          summary: 'Start a specific bot by ID',
          operationId: 'startBotById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              example: 'sportybet_football',
            },
          ],
          responses: {
            '200': {
              description: 'Bot start response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BotOperationResponse',
                  },
                },
              },
            },
            '404': {
              description: 'Bot not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
      '/stop/{id}': {
        post: {
          summary: 'Stop a specific bot by ID',
          operationId: 'stopBotById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              example: 'sportybet_football',
            },
          ],
          responses: {
            '200': {
              description: 'Bot stop response',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BotOperationResponse',
                  },
                },
              },
            },
            '404': {
              description: 'Bot not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
      '/status/{id}': {
        get: {
          summary: 'Get status of a specific bot',
          operationId: 'getStatusById',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              example: 'sportybet_football',
            },
          ],
          responses: {
            '200': {
              description: 'Bot status information',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BotStatusResponse',
                  },
                },
              },
            },
            '404': {
              description: 'Bot not found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ErrorResponse',
                  },
                },
              },
            },
            '500': {
              $ref: '#/components/responses/ServerError',
            },
          },
        },
      },
    },
  },
  apis: [], // We're defining everything inline so this can be empty
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Setup WebSocket
setupWebSocket(wss);

// REST endpoints
app.post('/start', startEngine);
app.post('/stop', stopEngine);
app.get('/all', getAllBots);
app.get('/status', checkEngineStatus);
app.post('/start/:id', startBotById);
app.post('/stop/:id', stopBotById);
app.get('/status/:id', getStatusById);

// Start worker
worker.start();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  addLog(`✅ Bot Service running on port ${PORT}`);
  addLog(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.stop();
  process.exit(0);
});