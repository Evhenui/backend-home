import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV:     z.enum(['development', 'test', 'production']).default('development'),
  PORT:         z.coerce.number().default(3000),
  DATABASE_URL: z.url(),
  JWT_SECRET:   z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
  LOG_LEVEL:    z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGIN:  z.url().default('http://localhost:5173'),
});

export const config = envSchema.parse(process.env);