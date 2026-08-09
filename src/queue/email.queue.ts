import { Queue } from 'bullmq';
import { config } from '../config.js';

export const emailQueue = new Queue('email', {
  connection: { host: config.REDIS_HOST, port: config.REDIS_PORT },
});