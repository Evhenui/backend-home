import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../errors/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    error: 'Internal server error',
  });
};