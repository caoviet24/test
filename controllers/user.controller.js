import userRepository from '../repositories/user.repository.js';

class UserController {
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await userRepository.findAll();
            res.json(users);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error fetching users',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    // Get user by ID
    async getUserById(req, res) {
        try {
            const user = await userRepository.findById(req.params.id);
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found',
                });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error fetching user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    // Create new user
    async createUser(req, res) {
        try {
            const { email, name, role } = req.body;
            const userData = { email, name, role };

            const user = await userRepository.create(userData);
            res.status(201).json({
                status: 'success',
                data: user,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error creating user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    // Update user
    async updateUser(req, res) {
        try {
            const { email, name, role } = req.body;
            const userData = { email, name, role };

            const user = await userRepository.update(req.params.id, userData);
            res.json({
                status: 'success',
                data: user,
            });
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error updating user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }

    // Delete user
    async deleteUser(req, res) {
        try {
            await userRepository.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({
                status: 'error',
                message: 'Error deleting user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            });
        }
    }
}

export default new UserController();
