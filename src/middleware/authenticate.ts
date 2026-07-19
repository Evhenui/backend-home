import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/index.js';
import { config } from '../config.js';

export interface AuthRequest<P = {}> extends Request<P> {
  userId?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('No token provided', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(
      token,
      config.JWT_SECRET,
    ) as { userId: string };

    req.userId = payload.userId;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};