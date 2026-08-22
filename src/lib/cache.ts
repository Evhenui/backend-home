import Redis from 'ioredis';
import { config } from '../config.js';

export const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
});


export async function remember<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
): Promise<T> {
  const cached = await redis.get(key); 
  if (cached !== null) {
    return JSON.parse(cached) as T;
  }

  const fresh = await loader();            
  await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);  
  return fresh;
}

export async function invalidate(key: string) {
  await redis.del(key);
}