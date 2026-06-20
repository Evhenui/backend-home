import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/index.js';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note';

export const notesService = {
  async getAll(userId: string) {
    return prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string, userId: string) {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note || note.userId !== userId) {
      throw new NotFoundError('Note not found');
    }

    return note;
  },

  async create(data: CreateNoteInput, userId: string) {
    return prisma.note.create({
      data: { ...data, userId },
    });
  },

  async update(id: string, data: UpdateNoteInput, userId: string) {
    await notesService.getById(id, userId);

    return prisma.note.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, userId: string) {
    await notesService.getById(id, userId);

    await prisma.note.delete({ where: { id } });
  },
};