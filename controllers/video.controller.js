import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as videoRepository from '../repositories/video.repository.js';
import * as courseRepository from '../repositories/course.repository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/videos';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only MP4, WebM, and OGG video files are allowed.'));
        }
    },
}).single('file');

export const uploadVideo = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: 'No video file uploaded' });
            }

            const { title, course_id } = req.body;

            if (!title || !course_id) {
                return res.status(400).json({ message: 'Title and course_id are required' });
            }

            const course = await courseRepository.getCourseById(course_id);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            if (course.created_by.id !== req.user.id) {
                return res.status(403).json({ message: 'Not authorized to upload videos to this course' });
            }

            const videoData = {
                title,
                url: `/uploads/videos/${req.file.filename}`,
                size: req.file.size,
                course_id,
                status: 'Đã xử lý',
            };

            // const video = await videoRepository.createVideo(videoData);
            return res.status(201).json(videoData);
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({ message: 'Error uploading video' });
    }
};

export const updateVideo = async (req, res) => {
    z;
    try {
        const { id } = req.params;
        const video = await videoRepository.getVideoById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this video' });
        }

        const updatedVideo = await videoRepository.updateVideo(id, req.body);
        res.json(updatedVideo);
    } catch (error) {
        console.error('Update video error:', error);
        res.status(500).json({ message: 'Error updating video' });
    }
};

export const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await videoRepository.getVideoById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        // Delete the video file
        const videoPath = path.join(__dirname, '..', video.url);
        if (fs.existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
        }

        await videoRepository.deleteVideo(id);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete video error:', error);
        res.status(500).json({ message: 'Error deleting video' });
    }
};

export const getVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const video = await videoRepository.getVideoById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json(video);
    } catch (error) {
        console.error('Get video error:', error);
        res.status(500).json({ message: 'Error retrieving video' });
    }
};

export const getVideosByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const videos = await videoRepository.getVideosByCourseId(courseId, req.query);
        res.json(videos);
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ message: 'Error retrieving videos' });
    }
};

export const reorderVideo = async (req, res) => {
    try {
        const { id } = req.params;
        const { newOrder } = req.body;

        if (typeof newOrder !== 'number' || newOrder < 0) {
            return res.status(400).json({ message: 'Invalid order value' });
        }

        const video = await videoRepository.getVideoById(id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to reorder this video' });
        }

        const updatedVideo = await videoRepository.reorderVideo(id, newOrder);
        res.json(updatedVideo);
    } catch (error) {
        console.error('Reorder video error:', error);
        res.status(500).json({ message: 'Error reordering video' });
    }
};
