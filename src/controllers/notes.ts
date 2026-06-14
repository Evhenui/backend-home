import { Request, Response } from 'express';
import { notesService } from '../services/notes';

export const getAllNotes = async (req: Request, res: Response) => {
  const notes = await notesService.getAll();
  res.json(notes);
};

export const getNoteById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const note = await notesService.getById(req.params.id);
  res.json(note);
};

export const createNote = async (req: Request, res: Response) => {
  const note = await notesService.create(req.body);
  res.status(201).json(note);
};

export const updateNote = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const note = await notesService.update(req.params.id, req.body);
  res.json(note);
};

export const deleteNote = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await notesService.delete(req.params.id);
  res.status(204).send();
};