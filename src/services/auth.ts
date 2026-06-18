import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../errors/index.js';

const SALT_ROUNDS = 10;

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

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' },
    );

    return { token };
  },
};