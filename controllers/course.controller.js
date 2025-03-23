import courseRepository from '../repositories/course.repository.js';
import videoRepository from '../repositories/video.repository.js';

const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            author_id: req.user.id,
        };

        const course = await courseRepository.createCourse(courseData);
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error creating course' });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseRepository.getCourseById(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }

        const updatedCourse = await courseRepository.updateCourse(id, req.body);
        res.json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: 'Error updating course' });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseRepository.getCourseById(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this course' });
        }

        await courseRepository.deleteCourse(id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course' });
    }
};

const getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await courseRepository.getCourseById(id);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ message: 'Error retrieving course' });
    }
};

const getAllCourses = async (req, res) => {
    try {
        const result = await courseRepository.getAllCourses(req.query);
        res.json(result);
    } catch (error) {
        console.error('Get all courses error:', error);
        res.status(500).json({ message: 'Error retrieving courses' });
    }
};

const addVideo = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await courseRepository.getCourseById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.created_by.id !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add videos to this course' });
        }

        const videoData = {
            ...req.body,
            course_id: courseId,
        };

        const video = await videoRepository.createVideo(videoData);
        res.status(201).json(video);
    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({ message: 'Error adding video to course' });
    }
};

const getCourseVideos = async (req, res) => {
    try {
        const { courseId } = req.params;
        const course = await courseRepository.getCourseById(courseId);

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const result = await videoRepository.getVideosByCourseId(courseId, req.query);
        res.json(result);
    } catch (error) {
        console.error('Get course videos error:', error);
        res.status(500).json({ message: 'Error retrieving course videos' });
    }
};

export default {
    createCourse,
    updateCourse,
    deleteCourse,
    getCourse,
    getAllCourses,
    addVideo,
    getCourseVideos,
};
