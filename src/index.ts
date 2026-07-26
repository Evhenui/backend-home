import { app } from './app.js';
import { prisma } from './lib/prisma.js';
import { logger } from './lib/logger.js';
import { config } from './config.js';

const server = app.listen(config.PORT, () => {
  logger.info(`Server running on http://localhost:${config.PORT}`);
});

async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`);

  server.close(async () => {  
    await prisma.$disconnect();  
    logger.info('All connections closed, bye');
    process.exit(0);   
  });


  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));