import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/index.js';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note';

export const notesService = {
  async getAll(userId: string, tag?: string) {
    return prisma.note.findMany({
      where: {
        userId,
        ...(tag && { tags: { some: { name: tag } } }),
      },
      include: { tags: true },
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
    const { tags = [], ...noteData } = data;

    return prisma.note.create({
      data: {
        ...noteData,
        userId,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
      include: { tags: true },
    });
  },

  async update(id: string, data: UpdateNoteInput, userId: string) {
    await notesService.getById(id, userId);

    const { tags, ...noteData } = data;

    return prisma.note.update({
      where: { id },
      data: {
        ...noteData,
        ...(tags && {
          tags: {
            set: [],   
            connectOrCreate: tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
      include: { tags: true },
    });
  },

  async delete(id: string, userId: string) {
    await notesService.getById(id, userId);

    await prisma.note.delete({ where: { id } });
  },
};