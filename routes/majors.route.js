import express from 'express';
import majorController from '../controllers/major.controller.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Get all majors with pagination and search
router.get('/', majorController.getAll);

// Get major by ID
router.get('/:id', majorController.getById);

// Get majors by department with pagination and search
router.get('/department/:departmentId', majorController.getByDepartment);

// Protected routes - require authentication and admin role
router.post('/', protect, restrictTo('ADMIN'), majorController.create);

router.put('/:id', protect, restrictTo('ADMIN'), majorController.update);

router.delete('/:id', protect, restrictTo('ADMIN'), majorController.delete);

export default router;