import { Request, Response } from 'express';
import { authService } from '../services/auth.js';
import { AppError } from '../errors/index.js';

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

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  const result = await authService.refresh(refreshToken);
  res.json(result);
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  await authService.logout(refreshToken);
  res.status(204).send();
};