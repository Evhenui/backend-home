import express from 'express';
import notesRouter from './routes/notes.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

app.use(express.json());

app.use('/api/auth', authRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.use('/api/notes', notesRouter);

app.use(errorHandler);