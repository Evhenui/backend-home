import { app } from './app.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';

app.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`);
});