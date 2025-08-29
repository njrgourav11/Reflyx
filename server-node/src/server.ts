import 'dotenv/config';
import http from 'http';
import { WebSocketServer } from 'ws';
import pino from 'pino';
import { app } from './app';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

// Config
const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 8000);

// Create server and WebSocket
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/chat' });

wss.on('connection', (ws) => {
  logger.info('WebSocket client connected');
  ws.send('WebSocket connected. Streaming not implemented yet.');
  ws.on('message', (data) => {
    ws.send(`Echo: ${data}`);
  });
  ws.on('close', () => logger.info('WebSocket client disconnected'));
});

server.listen(PORT, HOST, () => {
  logger.info(`Node server listening at http://${HOST}:${PORT}`);
});

