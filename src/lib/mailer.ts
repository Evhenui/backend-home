import { logger } from './logger.js';

export async function sendWelcomeEmail(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logger.info({ email }, '(fake) welcome email delivered');
}