import express from 'express';
import departmentController from '../controllers/faculty.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/get-all', departmentController.getAll);

// Get department by ID
router.get('/:id', departmentController.getById);

// Protected routes - require authentication and admin role
router.post('/create', protect, restrictTo('ADMIN'), departmentController.create);

router.put('/:id/update', protect, restrictTo('ADMIN'), departmentController.update);

router.delete('/:id/delete', protect, restrictTo('ADMIN'), departmentController.delete);

export default router;