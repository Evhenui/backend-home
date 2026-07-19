import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto'; 
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/index.js';
import { config } from '../config.js';

const SALT_ROUNDS  = 10;
const ACCESS_TTL   = '15m';
const REFRESH_DAYS = 7; 

function signAccessToken(userId: string) {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

async function issueRefreshToken(userId: string) {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });

  return token;
}

export const authService = {
  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return { id: user.id, email: user.email };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken  = signAccessToken(user.id);
    const refreshToken = await issueRefreshToken(user.id);

    return { accessToken, refreshToken };
  },

  async refresh(token: string) {
    const stored = await prisma.refreshToken.findUnique({ where: { token } });

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { token } });

    const accessToken  = signAccessToken(stored.userId);
    const refreshToken = await issueRefreshToken(stored.userId);

    return { accessToken, refreshToken };
  },

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  },
};