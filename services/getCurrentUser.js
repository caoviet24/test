import jwtService from './jwtService.js';

export default function getCurrentUser(req) {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer')) {
        throw new Error('No authorization token found');
    }

    const token = req.headers.authorization.split(' ')[1];
    const user = jwtService.verifyAccessToken(token);
    const { id } = user;
    return id;
}
