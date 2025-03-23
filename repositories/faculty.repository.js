import prisma from '../middleware/prisma.intercepter.js';

class FacultyRepository {
    async getAll({ page_number = 1, page_size = 10, search = '' }) {
        try {
            const skip = (page_number - 1) * page_size;

            const [faculties, total] = await Promise.all([
                prisma.faculty.findMany({
                    where: {
                        OR: [{ name: { contains: search } }, { code: { contains: search } }],
                    },
                    include: {
                        _count: {
                            select: {
                                students: true,
                                lecturers: true,
                                classes: true,
                            },
                        },
                    },
                    skip,
                    take: parseInt(page_size),
                    orderBy: {
                        id: 'desc',
                    },
                }),
                prisma.faculty.count({
                    where: {
                        OR: [{ name: { contains: search } }, { code: { contains: search } }],
                    },
                }),
            ]);

            const totalPages = Math.ceil(total / page_size);

            return {
                faculties,
                pagination: {
                    page_number: parseInt(page_number),
                    page_size: parseInt(page_size),
                    totalItems: total,
                    totalPages,
                },
            };
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            return await prisma.faculty.findUnique({
                where: { id: parseInt(id) },
                include: {
                    students: {
                        include: {
                            user: true,
                        },
                    },
                    lecturers: {
                        include: {
                            user: true,
                        },
                    },
                    classes: true,
                    _count: {
                        select: {
                            students: true,
                            lecturers: true,
                            classes: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            const existingFaculty = await prisma.faculty.findFirst({
                where: {
                    code: data.code,
                    name: data.name,
                },
            });

            if (existingFaculty) {
                throw new Error('Khoa đã tồn tại');
            }

            return await prisma.faculty.create({
                data: {
                    name: data.name,
                    code: data.code,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            const existingFaculty = await prisma.faculty.findUnique({
                where: { id: parseInt(id) },
            });

            if (!existingFaculty) {
                throw new Error('Không tìm thấy khoa');
            }

            if (data.code && data.code !== existingFaculty.code) {
                const duplicateCode = await prisma.faculty.findUnique({
                    where: { code: data.code },
                });

                if (duplicateCode) {
                    throw new Error('Mã khoa đã tồn tại');
                }
            }

            return await prisma.faculty.update({
                where: { id: parseInt(id) },
                data: {
                    name: data.name,
                    code: data.code,
                },
            });
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const faculty = await prisma.faculty.findUnique({
                where: { id: parseInt(id) },
                include: {
                    students: true,
                    lecturers: true,
                    classes: true,
                },
            });

            if (!faculty) {
                throw new Error('Không tìm thấy khoa');
            }

            // Check if faculty has any related records
            if (faculty.students.length > 0 || faculty.lecturers.length > 0 || faculty.classes.length > 0) {
                throw new Error('Không thể xóa khoa đang có sinh viên, giảng viên hoặc lớp học');
            }

            return await prisma.faculty.delete({
                where: { id: parseInt(id) },
            });
        } catch (error) {
            throw error;
        }
    }
}

export default new FacultyRepository();
