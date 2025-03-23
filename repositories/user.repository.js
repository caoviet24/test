import prisma from '../middleware/prisma.intercepter.js';

class UserRepository {
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id: parseInt(id),
            },
        });
    }

    async create(userData) {
        return prisma.user.create({
            data: userData,
        });
    }

    async update(id, userData) {
        return prisma.user.update({
            where: {
                id: parseInt(id),
            },
            data: userData,
        });
    }

    async delete(id) {
        return prisma.user.delete({
            where: {
                id: parseInt(id),
            },
        });
    }
}

export default new UserRepository();
