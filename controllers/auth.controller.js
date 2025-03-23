import bcrypt from 'bcrypt';
import prisma from '../middleware/prisma.intercepter.js';
import jwtService from '../services/jwtService.js';

export const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin', success: false });
        }

        const existingAccount = await prisma.user.findFirst({
            where: {
                username,
            },
        });


        if (existingAccount) {
            return res.status(400).json({
                message: 'Tài khoản đã tồn tại',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                email: username,
                role: role || "STUDENT",
                full_name: '',
                gender: 0,
                avatar: '',
                original_address: '',
                current_address: '',
                phone_number: '',
                created_by: '',
                updated_by: '',
                deleted_by: '',
            },
        });

        if (user) {
            return res.status(201).json({
                message: 'Đăng ký thành công',
                success: true,
            });
        }

        return res.status(400).json({ message: 'Đăng ký thất bại', success: 'false' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin', success: false });
        }

        const user = await prisma.user.findFirst({
            where: { username, role },
        });

        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập không chính xác', success: false });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Mật khẩu không chính xác', success: false });
        }

        const access_token = await jwtService.createAccessToken({
            id: user.id,
            role: user.role,
        });
        const refresh_token = await jwtService.createRefreshToken({
            id: user.id,
            role: user.role,
        });
        


        return res.status(200).json({
            message: 'Đăng nhập thành công',
            success: true,
            access_token,
            refresh_token,
        });
    } catch (error) {
        res.status(500).json({ message: error.message, success: false });
    }
};

export const authMe = async (req, res) => {
    try {
        const access_token = req.headers?.Authorization?.split(' ')[1] || req.headers?.authorization?.split(' ')[1];
        if (!access_token) {
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }

        const decoded = jwtService.verifyAccessToken(access_token);
        
        
        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id,
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            },
            // include: {
            //     user: {
            //         select: {
            //             full_name: true,
            //             avatar: true,
            //         },
            //     },
            // }
        });


        if (!user) {
            return res.status(401).json({ message: 'Account not found', success: false });
        }

        return res.status(200).json({ success: true, user});
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Unauthorized', success: false });
        }
        return res.status(500).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const refresh_token = req.headers.refresh_token;
        if (!refresh_token) {
            return res.status(401).json({ message: 'No refresh token provided', success: false });
        }

        const user = jwtService.verifyRefreshToken(refresh_token);
        
        const new_access_token = await jwtService.createAccessToken({
            id: user.id,
            role: user.role,
        });
        const new_refresh_token = await jwtService.createRefreshToken({
            id: user.id,
            role: user.role,
        });

        res.cookie('refresh_token', new_refresh_token, {
            expires: new Date(Date.now() + 60 * 60 * 24 * 1000 * 14),
            path: '/',
            // httpOnly: true,
            // secure: process.env.NODE_ENV === 'production'
        });
        res.cookie('access_token', new_access_token, {
            expires: new Date(Date.now() + 60 * 60 * 24 * 1000 * 365), 
            path: '/',
            // httpOnly: true,
            // secure: process.env.NODE_ENV === 'production'
        });

        return res.status(200).json({
            success: true,
            access_token: new_access_token,
            refresh_token: new_refresh_token
        });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Invalid refresh token', success: false });
        }
        return res.status(500).json({ message: error.message, success: false });
    }
};
