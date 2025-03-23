import majorRepository from '../repositories/major.repository.js';

class MajorController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '', departmentId = null } = req.query;
      
      const result = await majorRepository.getAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        departmentId
      });

      res.json({
        success: true,
        data: result.majors,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách ngành',
        error: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const major = await majorRepository.getById(id);

      if (!major) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy ngành',
        });
      }

      res.json({
        success: true,
        data: major,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin ngành',
        error: error.message,
      });
    }
  }

  async getByDepartment(req, res) {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const result = await majorRepository.getByDepartment(departmentId, {
        page: parseInt(page),
        limit: parseInt(limit),
        search
      });

      res.json({
        success: true,
        data: result.majors,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách ngành theo khoa',
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const { name, code, description, departmentId } = req.body;

      if (!name || !code || !departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Tên ngành, mã ngành và mã khoa không được để trống',
        });
      }

      const major = await majorRepository.create({
        name,
        code,
        description,
        departmentId,
      });

      res.status(201).json({
        success: true,
        message: 'Tạo ngành thành công',
        data: major,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi tạo ngành',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, code, description, departmentId } = req.body;

      if (!name || !code) {
        return res.status(400).json({
          success: false,
          message: 'Tên ngành và mã ngành không được để trống',
        });
      }

      const major = await majorRepository.update(id, {
        name,
        code,
        description,
        departmentId,
      });

      res.json({
        success: true,
        message: 'Cập nhật ngành thành công',
        data: major,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật ngành',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await majorRepository.delete(id);

      res.json({
        success: true,
        message: 'Xóa ngành thành công',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa ngành',
        error: error.message,
      });
    }
  }
}

export default new MajorController();