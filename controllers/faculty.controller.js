import facultyRepository from '../repositories/faculty.repository.js';

class FacultyController {
    async getAll(req, res) {
        try {
            const { page_number = 1, page_size = 10, search = '' } = req.query;

            const result = await facultyRepository.getAll({
                page_number,
                page_size,
                search,
            });

            res.json({
                data: result.faculties,
                pagination: result.pagination,
                page_number,
                page_size,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách khoa',
                error: error.message,
            });
        }
    }

    async getById(req, res) {
        try {
            const { id } = req.params;
            const faculty = await facultyRepository.getById(id);

            if (!faculty) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy khoa',
                });
            }

            res.json({
                success: true,
                data: faculty,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy thông tin khoa',
                error: error.message,
            });
        }
    }

    async create(req, res) {
        try {
            const { name, code } = req.body;

            if (!name || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên khoa và mã khoa không được để trống',
                });
            }

            const faculty = await facultyRepository.create({
                name,
                code,
            });

            res.status(201).json({
                success: true,
                message: 'Tạo khoa thành công',
                data: faculty,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tạo khoa',
                error: error.message,
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, code } = req.body;

            if (!name || !code) {
                return res.status(400).json({
                    success: false,
                    message: 'Tên khoa và mã khoa không được để trống',
                });
            }

            const faculty = await facultyRepository.update(id, {
                name,
                code,
            });

            res.json({
                success: true,
                message: 'Cập nhật khoa thành công',
                data: faculty,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật khoa',
                error: error.message,
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await facultyRepository.delete(id);

            res.json({
                success: true,
                message: 'Xóa khoa thành công',
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa khoa',
                error: error.message,
            });
        }
    }
}

export default new FacultyController();
