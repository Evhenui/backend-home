import { Worker } from 'bullmq';
import { sendWelcomeEmail } from '../lib/mailer.js';
import { logger } from '../lib/logger.js';
import { config } from '../config.js';

const worker = new Worker(
  'email',              
  async (job) => {
    if (job.name === 'welcome') {
      await sendWelcomeEmail(job.data.email);
    }
  },
  {
    connection: { host: config.REDIS_HOST, port: config.REDIS_PORT },
  },
);

worker.on('completed', (job) => {
  logger.info({ jobId: job.id, name: job.name }, 'job completed');
});

worker.on('failed', (job, err) => {
  logger.error({ jobId: job?.id, err }, 'job failed');
});