import express from 'express';
import notesRouter from './routes/notes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.use('/api/notes', notesRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});