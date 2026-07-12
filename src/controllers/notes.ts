import { Response } from 'express';
import { notesService } from '../services/notes.js';
import { AuthRequest } from '../middleware/authenticate.js';
import { listQuerySchema } from '../schemas/note-query.js';

export const getAllNotes = async (req: AuthRequest, res: Response) => {
  const q = listQuerySchema.parse(req.query);
  const result = await notesService.list(req.userId as string, q);
  res.json(result);
};

export const getNoteById = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
) => {
  const note = await notesService.getById(req.params.id, req.userId as string);
  res.json(note);
};

export const createNote = async (req: AuthRequest, res: Response) => {
  const note = await notesService.create(req.body, req.userId as string);
  res.status(201).json(note);
};

export const updateNote = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
) => {
  const note = await notesService.update(
    req.params.id,
    req.body,
    req.userId as string,
  );
  res.json(note);
};

export const deleteNote = async (
  req: AuthRequest<{ id: string }>,
  res: Response,
) => {
  await notesService.delete(req.params.id, req.userId as string);
  res.status(204).send();
};