import { Response } from 'express';
import { notesService } from '../services/notes.js';
import { AuthRequest } from '../middleware/authenticate.js';

export const getAllNotes = async (req: AuthRequest, res: Response) => {
  const notes = await notesService.getAll(req.userId as string);
  res.json(notes);
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