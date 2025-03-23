import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const createVideo = async (videoData) => {
    // Get max order for the course
    const maxOrder = await prisma.video.findFirst({
        where: {
            course_id: videoData.course_id,
            is_deleted: false,
        },
        orderBy: {
            order: 'desc',
        },
        select: {
            order: true,
        },
    });

    return await prisma.video.create({
        data: {
            ...videoData,
            order: maxOrder ? maxOrder.order + 1 : 0,
        },
        include: {
            course: {
                select: {
                    title: true,
                    created_by: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};

const updateVideo = async (id, videoData) => {
    return await prisma.video.update({
        where: { id },
        data: videoData,
        include: {
            course: {
                select: {
                    title: true,
                    created_by: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};

const deleteVideo = async (id) => {
    return await prisma.video.update({
        where: { id },
        data: { is_deleted: true },
    });
};

const getVideoById = async (id) => {
    return await prisma.video.findFirst({
        where: {
            id,
            is_deleted: false,
        },
        include: {
            course: {
                select: {
                    title: true,
                    created_by: {
                        select: {
                            id: true,
                            username: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });
};

const getVideosByCourseId = async (courseId, query = {}) => {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
        course_id: courseId,
        is_deleted: false,
    };

    const [videos, total] = await Promise.all([
        prisma.video.findMany({
            where,
            include: {
                course: {
                    select: {
                        title: true,
                        created_by: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            skip,
            take: parseInt(limit),
            orderBy: { order: 'asc' },
        }),
        prisma.video.count({ where }),
    ]);

    return {
        videos,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
        },
    };
};

const reorderVideo = async (id, newOrder) => {
    const video = await prisma.video.findUnique({
        where: { id },
        select: { course_id: true, order: true },
    });

    if (!video) {
        throw new Error('Video not found');
    }

    // Update orders of other videos
    if (newOrder > video.order) {
        await prisma.video.updateMany({
            where: {
                course_id: video.course_id,
                order: {
                    gt: video.order,
                    lte: newOrder,
                },
            },
            data: {
                order: {
                    decrement: 1,
                },
            },
        });
    } else {
        await prisma.video.updateMany({
            where: {
                course_id: video.course_id,
                order: {
                    gte: newOrder,
                    lt: video.order,
                },
            },
            data: {
                order: {
                    increment: 1,
                },
            },
        });
    }

    // Update target video's order
    return await prisma.video.update({
        where: { id },
        data: { order: newOrder },
    });
};

export default {
    createVideo,
    updateVideo,
    deleteVideo,
    getVideoById,
    getVideosByCourseId,
    reorderVideo,
};
