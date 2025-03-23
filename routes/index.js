import express from 'express';
import authRoutes from './auth.route.js';
import userRoutes from './users.route.js';
import courseRoutes from './courses.route.js';
import videoRoutes from './videos.route.js';
import youtubeRoutes from './youtube.route.js';
import departmentRoutes from './faculties.route.js';
import majorRoutes from './majors.route.js';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// API routes
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/videos', videoRoutes);
router.use('/youtube', youtubeRoutes);
router.use('/faculties', departmentRoutes);
router.use('/majors', majorRoutes);

export default router;
