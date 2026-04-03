import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  getTaskStats,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

const updateValidation = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isLength({ max: 1000 }),
  body('status').optional().isIn(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

router.get('/stats', getTaskStats);
router.get('/', getTasks);
router.post('/', validate(createValidation), createTask);
router.get('/:id', getTask);
router.patch('/:id', validate(updateValidation), updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

export default router;