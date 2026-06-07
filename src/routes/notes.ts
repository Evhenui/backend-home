import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes.js';
import { validateBody } from '../middleware/validate.js';
import { createNoteSchema, updateNoteSchema } from '../schemas/note.js';

const router = Router();

router.get('/', getAllNotes);
router.get('/:id', getNoteById);
router.post('/', validateBody(createNoteSchema), createNote);
router.patch('/:id', validateBody(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;