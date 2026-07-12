import { Router } from 'express';
import {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/notes.js';
import { validateBody, validateQuery } from '../middleware/validate.js';
import { createNoteSchema, updateNoteSchema } from '../schemas/note.js';
import { authenticate } from '../middleware/authenticate.js';
import { listQuerySchema } from '../schemas/note-query.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listQuerySchema), getAllNotes);
router.get('/:id', getNoteById);
router.post('/', validateBody(createNoteSchema), createNote);
router.patch('/:id', validateBody(updateNoteSchema), updateNote);
router.delete('/:id', deleteNote);

export default router;