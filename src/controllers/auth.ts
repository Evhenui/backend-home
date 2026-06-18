import { Request, Response } from 'express';
import { authService } from '../services/auth.js';

export const register = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.register(email, password);
  res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
};