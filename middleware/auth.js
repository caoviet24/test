import prisma from './prisma.intercepter.js';
import jwtService from '../services/jwtService.js';
import requestContext from '../context/request.js';

export const protect = async (req, res, next) => {
    // Set request context for prisma middleware
    requestContext.set(req);
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục' });
        }

        const decoded = jwtService.verifyAccessToken(token);

        const user = await prisma.user.findFirst({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ message: 'Token không hợp lệ 1' });
        }

        req.user = user;
        next();

        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ 2' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        return res.status(500).json({ message: `Đã có lỗi xảy ra ${error.message}`, success: false });
    }
};

export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Bạn không có quyền thực hiện hành động này',
            });
        }
        next();
    };
};
