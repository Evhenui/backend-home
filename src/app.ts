import express from 'express';
import pinoHttp from 'pino-http'; 
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';  

export const app = express();

app.use(pinoHttp({ logger }));
app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.use('/api/notes', notesRouter);

app.use(errorHandler);