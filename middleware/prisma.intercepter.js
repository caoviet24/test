import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import requestContext from '../context/request.js';
import getCurrentUser from '../services/getCurrentUser.js';

const prisma = new PrismaClient();

// Middleware for adding UUID, timestamps, and user fields
prisma.$use(async (params, next) => {
    // Tạo đối tượng Date hiện tại
    const now = new Date();

    // Chuyển đổi sang múi giờ UTC+7 (Việt Nam) và định dạng ISO
    const vietnamTime = new Date(now.getTime() + 7 * 60 * 60 * 1000).toISOString();

    try {
        const req = requestContext.get();
        let userId = null;

        if (req) {
            try {
                userId = getCurrentUser(req);
                console.log('User context available:', userId);
            } catch (error) {
                console.log('No user context available:', error.message);
            }
        }

        if (params.action === 'create') {
            params.args.data = {
                ...params.args.data,
                id: uuidv4(),
                created_at: vietnamTime,
                created_by: userId || null,
                updated_at: null,
                updated_by: null,
                is_deleted: false,
                deleted_by: null,
                deleted_at: null,
            };
        }

        if (params.action === 'createMany') {
            if (Array.isArray(params.args.data)) {
                params.args.data = params.args.data.map((item) => ({
                    ...item,
                    id: uuidv4(),
                    created_at: vietnamTime,
                    created_by: userId || null,
                    updated_at: null,
                    updated_by: null,
                    is_deleted: false,
                    deleted_by: null,
                    deleted_at: null,
                }));
            }
        }

        if (params.action === 'update' || params.action === 'updateMany') {
            if (userId) {
                if (!params.args.data) {
                    params.args.data = {};
                }
                params.args.data.updated_by = userId;
                params.args.data.updated_at = vietnamTime;
            }
        }

        if (params.action === 'delete' || params.action === 'deleteMany') {
            if (userId) {
                params.args.data = {
                    is_deleted: true,
                    deleted_by: userId,
                    deleted_at: vietnamTime,
                };
            }
        }
    } catch (error) {
        console.error('Error in Prisma middleware:', error);
    }

    return next(params);
});


// Middleware example for logging
prisma.$use(async (params, next) => {
    const before = Date.now();

    const result = await next(params);

    const after = Date.now();
    console.log(`Query ${params.model}.${params.action} took ${after - before}ms`);

    return result;
});


export default prisma;
