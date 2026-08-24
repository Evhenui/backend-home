import { prisma } from '../lib/prisma';
import { NotFoundError } from '../errors/index.js';
import { CreateNoteInput, UpdateNoteInput } from '../schemas/note';
import { ListQuery } from '../schemas/note-query';
import { remember, invalidate } from '../lib/cache.js'; 
import { notifyUser } from '../realtime/io.js';

const noteKey = (userId: string, id: string) => `note:${userId}:${id}`;

export const notesService = {
  async getById(id: string, userId: string) {
    return remember(noteKey(userId, id), 60, async () => {
      const note = await prisma.note.findUnique({
        where: { id },
      });

      if (!note || note.userId !== userId) {
        throw new NotFoundError('Note not found');
      }

      return note;
    });
  },

  async create(data: CreateNoteInput, userId: string) {
    const { tags = [], ...noteData } = data;

    const note = await prisma.note.create({
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

    notifyUser(userId, 'note:created', note); 

    return note;
  },

  async update(id: string, data: UpdateNoteInput, userId: string) {
    await notesService.getById(id, userId);

    const { tags, ...noteData } = data;

    const updated = await prisma.note.update({
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

    await invalidate(noteKey(userId, id));

    return updated;
  },

  async delete(id: string, userId: string) {
    await notesService.getById(id, userId);

    await prisma.note.delete({ where: { id } });

    await invalidate(noteKey(userId, id));
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