import prisma from '../middleware/prisma.intercepter.js';

class MajorRepository {
  async getAll({ page = 1, limit = 10, search = '', departmentId = null }) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
        ...(departmentId ? { departmentId: parseInt(departmentId) } : {}),
      };

      const [majors, total] = await Promise.all([
        prisma.major.findMany({
          where: whereClause,
          include: {
            department: true,
            _count: {
              select: {
                students: true,
                classes: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: {
            id: 'desc',
          },
        }),
        prisma.major.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      
      return {
        majors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
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
      return await prisma.major.findUnique({
        where: { id: parseInt(id) },
        include: {
          department: true,
          students: {
            include: {
              user: true,
            },
          },
          classes: true,
          _count: {
            select: {
              students: true,
              classes: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getByDepartment(departmentId, { page = 1, limit = 10, search = '' }) {
    try {
      const skip = (page - 1) * limit;
      
      const whereClause = {
        departmentId: parseInt(departmentId),
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      };

      const [majors, total] = await Promise.all([
        prisma.major.findMany({
          where: whereClause,
          include: {
            _count: {
              select: {
                students: true,
                classes: true,
              },
            },
          },
          skip,
          take: parseInt(limit),
          orderBy: {
            id: 'desc',
          },
        }),
        prisma.major.count({
          where: whereClause,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      
      return {
        majors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalItems: total,
          totalPages,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async create(data) {
    try {
      const existingMajor = await prisma.major.findUnique({
        where: { code: data.code },
      });

      if (existingMajor) {
        throw new Error('Mã ngành đã tồn tại');
      }

      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id: parseInt(data.departmentId) },
      });

      if (!department) {
        throw new Error('Không tìm thấy khoa');
      }

      return await prisma.major.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          departmentId: parseInt(data.departmentId),
        },
        include: {
          department: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      const existingMajor = await prisma.major.findUnique({
        where: { id: parseInt(id) },
      });

      if (!existingMajor) {
        throw new Error('Không tìm thấy ngành');
      }

      if (data.code && data.code !== existingMajor.code) {
        const duplicateCode = await prisma.major.findUnique({
          where: { code: data.code },
        });

        if (duplicateCode) {
          throw new Error('Mã ngành đã tồn tại');
        }
      }

      if (data.departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: parseInt(data.departmentId) },
        });

        if (!department) {
          throw new Error('Không tìm thấy khoa');
        }
      }

      return await prisma.major.update({
        where: { id: parseInt(id) },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
        },
        include: {
          department: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const major = await prisma.major.findUnique({
        where: { id: parseInt(id) },
        include: {
          students: true,
          classes: true,
        },
      });

      if (!major) {
        throw new Error('Không tìm thấy ngành');
      }

      // Check if major has any related records
      if (major.students.length > 0 || major.classes.length > 0) {
        throw new Error('Không thể xóa ngành đang có sinh viên hoặc lớp học');
      }

      return await prisma.major.delete({
        where: { id: parseInt(id) },
      });
    } catch (error) {
      throw error;
    }
  }
}

export default new MajorRepository();