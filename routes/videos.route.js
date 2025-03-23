import express from 'express';
import * as videoController from '../controllers/video.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Upload video
router.post('/upload', videoController.uploadVideo);

// Get videos for a course
router.get('/course/:courseId', videoController.getVideosByCourse);

// Get specific video
router.get('/:id', videoController.getVideo);

// Update video
router.patch('/:id', videoController.updateVideo);

// Delete video
router.delete('/:id', videoController.deleteVideo);

// Reorder video
router.patch('/:id/reorder', videoController.reorderVideo);

export default router;