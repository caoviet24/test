import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createCourse = async (courseData) => {
    return await prisma.course.create({
        data: courseData,
        include: {
            created_by: {
                select: {
                    username: true,
                    email: true,
                    user: {
                        select: {
                            full_name: true,
                        },
                    },
                },
            },
        },
    });
};

const updateCourse = async (id, courseData) => {
    return await prisma.course.update({
        where: { id },
        data: courseData,
        include: {
            created_by: {
                select: {
                    username: true,
                    email: true,
                    user: {
                        select: {
                            full_name: true,
                        },
                    },
                },
            },
        },
    });
};

const deleteCourse = async (id) => {
    return await prisma.course.update({
        where: { id },
        data: { is_deleted: true },
    });
};

const getCourseById = async (id) => {
    return await prisma.course.findFirst({
        where: {
            id,
            is_deleted: false,
        },
        include: {
            created_by: {
                select: {
                    username: true,
                    email: true,
                    user: {
                        select: {
                            full_name: true,
                        },
                    },
                },
            },
            videos: {
                where: { is_deleted: false },
                orderBy: { order: 'asc' },
            },
        },
    });
};

const getAllCourses = async (query = {}) => {
    const { page = 1, limit = 10, search = '', status } = query;
    const skip = (page - 1) * limit;

    const where = {
        is_deleted: false,
        title: { contains: search },
        ...(status !== undefined && { status: parseInt(status) }),
    };

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                created_by: {
                    select: {
                        username: true,
                        email: true,
                        user: {
                            select: {
                                full_name: true,
                            },
                        },
                    },
                },
                videos: {
                    where: { is_deleted: false },
                    select: { id: true },
                },
            },
            skip,
            take: parseInt(limit),
            orderBy: { created_at: 'desc' },
        }),
        prisma.course.count({ where }),
    ]);

    return {
        courses,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
        },
    };
};

export default {
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseById,
    getAllCourses,
};
