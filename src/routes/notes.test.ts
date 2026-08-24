import request from 'supertest';
import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../realtime/io.js', () => ({ 
  notifyUser: vi.fn(),
}));

import { app } from '../app.js';
import { prisma } from '../lib/prisma.js';

vi.mock('../queue/email.queue.js', () => ({
  emailQueue: { add: vi.fn() },
}));

describe('/api/notes', () => {
  let token: string;

  beforeEach(async () => {
    await prisma.note.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    token = login.body.accessToken;
  });

  it('401 без токена', async () => {
    const res = await request(app).get('/api/notes');

    expect(res.status).toBe(401);
  });

  it('створює нотатку і повертає її у списку', async () => {
    const created = await request(app)
      .post('/api/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Перша', content: 'Текст нотатки', tags: ['test'] });

    expect(created.status).toBe(201);

    const res = await request(app)
      .get('/api/notes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Перша');
  });
});