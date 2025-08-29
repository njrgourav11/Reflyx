import express from 'express';
import cors from 'cors';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

export const app = express();
app.use(cors({ origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : true }));
app.use(express.json({ limit: '2mb' }));

// attach correlation id
app.use((req, _res, next) => {
  const headerId = req.header('x-correlation-id');
  const id = headerId || Math.random().toString(36).slice(2);
  (req as any).correlationId = id;
  next();
});

// basic request logging
app.use((req, _res, next) => {
  logger.info({ method: req.method, url: req.url, correlationId: (req as any).correlationId }, 'incoming');
  next();
});

// Agents routes
import agentsRouter from './routes/agents';
app.use('/api/v1/agents', agentsRouter);

// Health endpoints
app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/v1/health/detailed', (_req, res) => {
  res.json({
    success: true,
    services: {
      server: { status: 'ok' }
    },
    models: [],
    timestamp: new Date().toISOString()
  });
});

// Query endpoint (stub)
app.post('/api/v1/query', (req, res) => {
  const { query, max_results = 10 } = req.body || {};
  res.json({ response: `Echo: ${query}`, results: [], max_results });
});

// Explain endpoint (stub)
app.post('/api/v1/explain', (req, res) => {
  const { code, language } = req.body || {};
  res.json({ explanation: `This is a placeholder explanation for ${language || 'code'}.`, code });
});

// Generate endpoint (stub)
app.post('/api/v1/generate', (req, res) => {
  const { prompt, language = 'text' } = req.body || {};
  res.json({ generated_code: `// Generated (${language})\n// Prompt: ${prompt}\n` });
});

// Index endpoints (stubs)
app.post('/api/v1/index', (_req, res) => { res.json({ success: true }); });
app.post('/api/v1/index/file', (_req, res) => { res.json({ success: true }); });

// Similar, Refactor, Stats (stubs)
app.post('/api/v1/similar', (_req, res) => res.json({ results: [] }));
app.post('/api/v1/refactor', (_req, res) => res.json({ changes: [] }));
app.get('/api/v1/stats', (_req, res) => res.json({ status: 'ok' }));

// Root
app.get('/', (_req, res) => {
  res.json({ name: 'AI Coding Assistant API (Node)', version: '1.0.0', health_url: '/api/v1/health', websocket_url: '/ws/chat' });
});

// Error handling
import { errorHandler, notFoundHandler } from './middleware/error';
app.use(notFoundHandler);
app.use(errorHandler);

