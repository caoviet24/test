import jwt from 'jsonwebtoken';


class jwtService {
    async createAccessToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_KEY, {
            expiresIn: process.env.ACCESS_EXPIRATION,
        });
    }

    async createRefreshToken(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET_REFRESH_KEY, {
            expiresIn: process.env.REFRESH_EXPIRATION,
        });
    }

    verifyAccessToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
    }

    verifyRefreshToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET_REFRESH_KEY);
    }
}
    


export default new jwtService();