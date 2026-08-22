import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma.js', () => ({
  prisma: { note: { findUnique: vi.fn() } },
}));

vi.mock('../lib/cache.js', () => ({                          // ← нове
  remember: (key: string, ttl: number, loader: () => Promise<any>) => loader(),
  invalidate: vi.fn(),
}));

import { notesService } from './notes.js';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';

describe('notesService.getById', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('повертає нотатку, якщо вона належить користувачу', async () => {
    const note = { id: '1', title: 'test', userId: 'me' };
    (prisma.note.findUnique as any).mockResolvedValue(note);

    const result = await notesService.getById('1', 'me');

    expect(result).toEqual(note);
  });

  it('кидає NotFoundError, якщо нотатки не існує', async () => {
    (prisma.note.findUnique as any).mockResolvedValue(null);

    await expect(notesService.getById('1', 'me'))
      .rejects.toBeInstanceOf(NotFoundError);
  });

  it('кидає NotFoundError на чужу нотатку', async () => {
    (prisma.note.findUnique as any).mockResolvedValue({ id: '1', userId: 'other' });

    await expect(notesService.getById('1', 'me'))
      .rejects.toBeInstanceOf(NotFoundError);
  });
});