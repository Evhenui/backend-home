import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../errors/index.js';

export interface AuthRequest extends Request {
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
      process.env.JWT_SECRET as string,
    ) as { userId: string };

    req.userId = payload.userId;
    next();
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
};