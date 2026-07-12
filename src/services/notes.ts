import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/index.js';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note';
import { ListQuery } from '../schemas/note-query';

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

  async list(userId: string, q: ListQuery) {
    const where = {
      userId,
      ...(q.search && { title: { contains: q.search, mode: 'insensitive' as const } }),
      ...(q.tag && { tags: { some: { name: q.tag } } }),
    };

    const [data, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: { tags: true },
        orderBy: { [q.sort]: q.order },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
      prisma.note.count({ where }),
    ]);

    return {
      data,
      meta: {
        page: q.page,
        limit: q.limit,
        total,
        totalPages: Math.ceil(total / q.limit),
      },
    };
  },
};