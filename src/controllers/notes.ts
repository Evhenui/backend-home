import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { NotFoundError } from '../errors/index.js';

export const getAllNotes = async (req: Request, res: Response) => {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: 'desc' },
  });

  res.json(notes);
};

export const getNoteById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const note = await prisma.note.findUnique({
    where: { id },
  });

  if (!note) {
    throw new NotFoundError('Note not found');
  }

  res.json(note);
};

export const createNote = async (req: Request, res: Response) => {
  const { title, content } = req.body;

  const newNote = await prisma.note.create({
    data: { title, content },
  });

  res.status(201).json(newNote);
};

export const updateNote = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const existing = await prisma.note.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Note not found');
  }

  const updatedNote = await prisma.note.update({
    where: { id },
    data: req.body,
  });

  res.json(updatedNote);
};

export const deleteNote = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;

  const existing = await prisma.note.findUnique({ where: { id } });

  if (!existing) {
    throw new NotFoundError('Note not found');
  }

  await prisma.note.delete({ where: { id } });

  res.status(204).send();
};