import express from 'express';
import pinoHttp from 'pino-http'; 
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';  
import { apiLimiter, authLimiter } from './middleware/rateLimit.js';
import helmet from 'helmet';                 
import cors from 'cors';                     
import { config } from './config.js';      
import { prisma } from './lib/prisma.js';

export const app = express();

app.set('trust proxy', 1);  

app.use(pinoHttp({ logger }));
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true, 
}));
app.use(express.json());

app.use('/api/auth/login', authLimiter);
app.use('/api', apiLimiter); 

app.use('/api/auth', authRouter);

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'db_unavailable' });
  }
});

app.use('/api/notes', notesRouter);

app.use(errorHandler);