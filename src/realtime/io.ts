import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import jwt from 'jsonwebtoken';
import Redis from 'ioredis';
import { createAdapter } from '@socket.io/redis-adapter';
import { config } from '../config.js';
import { logger } from '../lib/logger.js';

export let io: Server;   

export function initRealtime(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: config.CORS_ORIGIN }, 
  });

  const pub = new Redis({ host: config.REDIS_HOST, port: config.REDIS_PORT });
  const sub = pub.duplicate();
  io.adapter(createAdapter(pub, sub));

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    try {
      const payload = jwt.verify(token, config.JWT_SECRET) as { userId: string };
      socket.data.userId = payload.userId;  
      next();              
    } catch {
      next(new Error('unauthorized'));   
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    socket.join(`user:${userId}`);   
    logger.info({ userId }, 'socket connected');
  });
}

export function notifyUser(userId: string, event: string, payload: unknown) {
  if (!io) return;  
  io.to(`user:${userId}`).emit(event, payload);
}