import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/index.js';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note';

export const notesService = {
  async getAll() {
    return prisma.note.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },
  
  async getById(id: string) {
    const note = await prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundError('Note not found');
    }

    return note;
  },

  async create(data: CreateNoteInput) {
    return prisma.note.create({ data });
  },

  async update(id: string, data: UpdateNoteInput) {
    await notesService.getById(id);

    return prisma.note.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    await notesService.getById(id);

    await prisma.note.delete({ where: { id } });
  },
};