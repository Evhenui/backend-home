import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';
import { ValidationError } from '../errors/index.js';

export const validateBody = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      throw new ValidationError(details);
    }

    req.body = result.data;
    next();
  };
};